#!/bin/bash
# =============================================================================
# All-in-One Toolbox · Production Rollout Runner
# =============================================================================
# Why this script lives in the repo and not inside deploy.yml:
#
# appleboy/ssh-action streams the workflow `script:` block over the SSH
# session line by line and (on some versions) injects implicit exit-status
# checks between lines. Multi-line `if/then/fi` constructs and even
# single-line ones like `[ false = true ]` get misinterpreted as "command
# failed → kill the session" by that mechanism, producing silent exit 1.
#
# We sidestep it entirely by keeping the workflow `script:` minimal — just
# `cd`, `git reset --hard`, `bash .github/scripts/deploy-vps.sh` — and
# letting a real, on-disk bash script handle the whole rollout in a clean
# process tree, untouched by the SSH-action wire protocol.
#
# This script is committed to the repository, so every push that lands on
# `main` ships its own deploy recipe. If you ever need to debug the
# rollout locally on the VPS, just run:
#
#   cd /opt/all-in-one-toolbox && bash .github/scripts/deploy-vps.sh
# =============================================================================

set -euxo pipefail

# -----------------------------------------------------------------------------
# Error reporting — print line number + the command that failed + exit code
# so silent rollout failures cannot hide behind `set -e`.
# -----------------------------------------------------------------------------
trap 'rc=$?; echo "::error::deploy-vps.sh failed at line ${LINENO}: command \"${BASH_COMMAND}\" exited with code ${rc}"; exit $rc' ERR

# -----------------------------------------------------------------------------
# PATH repair — non-interactive shells inherit a stripped PATH that omits
# /usr/local/bin (the docker-compose v1 home) and /snap/bin (Snap Docker).
# -----------------------------------------------------------------------------
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:$PATH"

# -----------------------------------------------------------------------------
# Resolve compose binary
# -----------------------------------------------------------------------------
DC=""
if docker compose version >/dev/null 2>&1; then DC="docker compose"; fi
if [ -z "$DC" ] && command -v docker-compose >/dev/null 2>&1; then DC="docker-compose"; fi
if [ -z "$DC" ] && [ -x /usr/local/bin/docker-compose ]; then DC="/usr/local/bin/docker-compose"; fi
if [ -z "$DC" ] && [ -x /usr/bin/docker-compose ]; then DC="/usr/bin/docker-compose"; fi
if [ -z "$DC" ]; then
  echo "::error::No docker compose binary found. PATH=$PATH"
  exit 1
fi

echo "==> Compose binary: $DC"
$DC version 2>&1 | head -5 || true

docker info --format '    server version: {{.ServerVersion}} · containers: {{.Containers}} · images: {{.Images}}' 2>&1 || {
  echo "::error::'docker info' failed — daemon unreachable or current user not in 'docker' group."
  echo "Hint: sudo usermod -aG docker \$USER  (then re-login)"
  exit 1
}

# -----------------------------------------------------------------------------
# Verify we are in the deploy root and the prod compose file exists
# -----------------------------------------------------------------------------
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Pre-validate context"
echo "    pwd:          $(pwd)"
echo "    compose file: $COMPOSE_FILE"
ls -la "$COMPOSE_FILE" 2>&1 || true

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "::error::$COMPOSE_FILE not found at $(pwd) — did the workflow forget to cd into VPS_PROJECT_PATH?"
  ls -la
  exit 1
fi

# -----------------------------------------------------------------------------
# Validate compose config BEFORE any destructive action
# -----------------------------------------------------------------------------
echo "==> Validate compose config"
set +e
trap - ERR
CONFIG_STDERR=$(mktemp)
$DC -f "$COMPOSE_FILE" config --quiet 2>"$CONFIG_STDERR"
CONFIG_RC=$?
set -e
trap 'rc=$?; echo "::error::deploy-vps.sh failed at line ${LINENO}: command \"${BASH_COMMAND}\" exited with code ${rc}"; exit $rc' ERR

if [ "$CONFIG_RC" -ne 0 ]; then
  echo "::error::compose config failed (exit $CONFIG_RC)"
  echo "----- stderr (verbatim) -----"
  cat "$CONFIG_STDERR"
  echo "----- config dump (head 80 lines) -----"
  $DC -f "$COMPOSE_FILE" config 2>&1 | head -80 || true
  rm -f "$CONFIG_STDERR"
  exit "$CONFIG_RC"
fi
rm -f "$CONFIG_STDERR"
echo "    compose config OK"

# -----------------------------------------------------------------------------
# Sweep stale containers from prior runs (idempotent)
# -----------------------------------------------------------------------------
# Symptom we are guarding against: a previous deploy half-rolled and left
# `all-in-one-toolbox-nginx` (or the other named containers) hanging around.
# A subsequent `up -d` then fails with "Conflict. The container name X is
# already in use" — which surfaces as a bare exit 1 from compose.
echo "==> Sweep stale containers (idempotent)"
for name in all-in-one-toolbox-nginx all-in-one-toolbox-frontend all-in-one-toolbox-backend all-in-one-toolbox-gotenberg; do
  if docker ps -a --format '{{.Names}}' | grep -Fxq "$name"; then
    echo "    removing stale container: $name"
    docker rm -f "$name" 2>&1 || true
  fi
done

# -----------------------------------------------------------------------------
# Compose-project tear-down (best effort)
# -----------------------------------------------------------------------------
echo "==> Tear down previous compose project (down --remove-orphans)"
set +e
$DC -f "$COMPOSE_FILE" down --remove-orphans 2>&1
DOWN_RC=$?
set -e
if [ "$DOWN_RC" -ne 0 ]; then
  echo "::warning::'$DC down' exited $DOWN_RC — continuing (best-effort cleanup)"
fi

# -----------------------------------------------------------------------------
# Build vs no-build branch — SKIP_BUILD comes from the workflow `envs:` field
# -----------------------------------------------------------------------------
SKIP="${SKIP_BUILD:-false}"

if [ "$SKIP" = "true" ]; then
  echo "==> SKIP_BUILD=true · rolling without rebuild"
else
  echo "==> Rebuilding production images"
  set +e
  $DC -f "$COMPOSE_FILE" build --pull --progress=plain 2>&1
  BUILD_RC=$?
  set -e
  if [ "$BUILD_RC" -ne 0 ]; then
    echo "::error::build failed (exit $BUILD_RC) — printing diagnostic context"
    echo "----- df -h -----"
    df -h 2>&1 || true
    echo "----- free -h -----"
    free -h 2>&1 || true
    echo "----- docker image ls (top 20) -----"
    docker image ls 2>&1 | head -20 || true
    exit "$BUILD_RC"
  fi
fi

# -----------------------------------------------------------------------------
# Roll the stack
# -----------------------------------------------------------------------------
echo "==> Rolling stack (up -d --remove-orphans)"
set +e
$DC -f "$COMPOSE_FILE" up -d --remove-orphans 2>&1
UP_RC=$?
set -e
if [ "$UP_RC" -ne 0 ]; then
  echo "::error::'up -d' failed (exit $UP_RC) — printing container state"
  $DC -f "$COMPOSE_FILE" ps --all 2>&1 || true
  docker ps -a --filter "name=all-in-one-toolbox" 2>&1 || true
  echo "----- recent logs (last 50 lines, all services) -----"
  $DC -f "$COMPOSE_FILE" logs --tail 50 2>&1 || true
  exit "$UP_RC"
fi

# -----------------------------------------------------------------------------
# Wait for nginx healthcheck (up to 90 s)
# -----------------------------------------------------------------------------
echo "==> Wait for nginx healthcheck"
HEALTHY=0
for i in $(seq 1 45); do
  S=$($DC -f "$COMPOSE_FILE" ps --format json 2>/dev/null | grep -o '"Name":"all-in-one-toolbox-nginx"[^}]*' | grep -o '"Health":"[^"]*"' | head -n1 || true)
  if echo "$S" | grep -q '"Health":"healthy"'; then
    HEALTHY=1
    echo "    nginx healthy after ${i} probe(s)"
    break
  fi
  sleep 2
done
if [ "$HEALTHY" -eq 0 ]; then
  echo "::warning::nginx not healthy within 90 s — continuing for external probe to make the final call"
fi

# -----------------------------------------------------------------------------
# Final state + housekeeping
# -----------------------------------------------------------------------------
echo "==> Final service table"
$DC -f "$COMPOSE_FILE" ps

echo "==> Prune dangling images (free disk)"
docker image prune -f >/dev/null 2>&1 || true

echo "==> Rollout complete at $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
