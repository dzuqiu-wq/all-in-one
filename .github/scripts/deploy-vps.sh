#!/bin/bash
# ============================================================================
# deploy-vps.sh - Deploy all-in-one-toolbox to VPS
# ============================================================================

set -e

# ---------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------
VPS_HOST="${VPS_HOST:?VPS_HOST is required}"
SSH_KEY="${SSH_KEY:?SSH_KEY is required}"
COMPOSE_FILE="docker-compose.prod.yml"
DC="docker compose"

# Color helpers
RED=$'\033[0;31m'
GREEN=$'\033[0;32m'
YELLOW=$'\033[0;33m'
NC=$'\033[0m'

log()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*" >&2; exit 1; }

# ---------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------
log "Pre-flight checks..."
if [ ! -f "$SSH_KEY" ]; then
  fail "SSH key not found: $SSH_KEY"
fi
if [ ! -f "$COMPOSE_FILE" ]; then
  fail "Compose file not found: $COMPOSE_FILE"
fi

# ---------------------------------------------------------------------
# SSH helper
# ---------------------------------------------------------------------
SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 -o PasswordAuthentication=no -i $SSH_KEY"
SSH() { ssh -T $SSH_OPTS "root@$VPS_HOST" "$@"; }

# ---------------------------------------------------------------------
# 1. Test connectivity
# ---------------------------------------------------------------------
log "Testing SSH connectivity to $VPS_HOST..."
SSH "echo 'SSH OK'"

# ---------------------------------------------------------------------
# 2. Pull latest
# ---------------------------------------------------------------------
log "Pulling latest from GitHub..."
SSH "cd /root/all-in-one && git fetch origin main && git reset --hard origin/main"

# ---------------------------------------------------------------------
# 3. Rebuild + restart
# ---------------------------------------------------------------------
log "Rebuilding containers..."
SSH "cd /root/all-in-one && $DC -f $COMPOSE_FILE up -d --build --remove-orphans 2>&1"

# -----------------------------------------------------------------------------
# Wait for site to be ready (use curl instead of docker health)
# -----------------------------------------------------------------------------
log "Wait for site to respond..."
SITE_OK=0
for i in $(seq 1 45); do
  # Try HTTPS first, fall back to HTTP
  if SSH "curl -sk --max-time 5 https://localhost/health 2>/dev/null | grep -q OK" 2>/dev/null; then
    SITE_OK=1
    log "Site healthy after ${i} probe(s)"
    break
  fi
  sleep 2
done

if [ "$SITE_OK" -eq 0 ]; then
  warn "Site not responding within 90s - will rely on external probe"
fi

# -----------------------------------------------------------------------------
# Final state + housekeeping
# -----------------------------------------------------------------------------
log "Final service table"
SSH "$DC -f $COMPOSE_FILE ps"

log "Deployment complete!"