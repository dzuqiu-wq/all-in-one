# Deployment Guide — GitHub Actions → VPS

This repository ships two GitHub Actions workflows:

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | every push & PR | `npm run build` + `tsc --noEmit` + `python -m compileall` + `docker compose config` |
| `deploy.yml` | push to `main` (after CI passes) or manual dispatch | SSH to VPS, `git reset --hard`, rebuild `docker-compose.prod.yml`, health-check |

CI works out of the box. **Deploy requires four GitHub Secrets** to be configured first.

---

## One-time setup checklist

### 1. Prepare the VPS

On the production server (as the user that will run Docker):

```bash
# Pick a deploy directory — must NOT need sudo to update.
sudo mkdir -p /opt/all-in-one-toolbox
sudo chown $USER:$USER /opt/all-in-one-toolbox

# Clone once. Subsequent updates will `git fetch && git reset --hard`.
git clone https://github.com/dzuqiu-wq/all-in-one.git /opt/all-in-one-toolbox
cd /opt/all-in-one-toolbox

# Sanity-check Docker is available without sudo.
docker compose -f docker-compose.prod.yml config --quiet

# First boot (the workflow will repeat this on each deploy).
docker compose -f docker-compose.prod.yml up -d --build
```

The deploy user should be in the `docker` group:

```bash
sudo usermod -aG docker $USER
# log out, log back in
```

### 2. Generate a deploy SSH key

On your laptop (NOT on the VPS):

```bash
# Ed25519 — small, fast, modern.
ssh-keygen -t ed25519 -C "github-actions@all-in-one" -f ~/.ssh/all_in_one_deploy -N ""

# Append the public key to the VPS authorized_keys for the deploy user.
ssh-copy-id -i ~/.ssh/all_in_one_deploy.pub deploy_user@vps_host

# Verify it works passwordlessly.
ssh -i ~/.ssh/all_in_one_deploy deploy_user@vps_host 'echo OK from VPS'
```

The PRIVATE key (`~/.ssh/all_in_one_deploy`, NO `.pub`) is what goes into the
GitHub secret. Treat this key as sensitive — it grants production access.

### 3. Add the four required secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Example value | Notes |
|---|---|---|
| `VPS_HOST` | `198.51.100.42` or `vps.example.com` | Public IP or DNS name |
| `VPS_USER` | `deploy` | SSH user with docker group membership |
| `VPS_SSH_KEY` | *(paste the full private-key file content)* | OpenSSH format, must start with `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `VPS_PROJECT_PATH` | `/opt/all-in-one-toolbox` | Absolute path of the git clone on the VPS |

Optional secrets:

| Secret | Default | When to set |
|---|---|---|
| `VPS_PORT` | `22` | Set if your SSH listens on a non-standard port |
| `HEALTH_CHECK_URL` | `http://${VPS_HOST}/health` | Override if you serve HTTPS or use a different health endpoint |

### 4. Trigger the first deploy

After secrets are in place:

- **Automatic**: push any commit to `main` and the deploy workflow will run after CI.
- **Manual**: GitHub → Actions → "Deploy to VPS" → **Run workflow** dropdown.

---

## What the deploy actually does

1. **Gate:** waits for `ci.yml` to pass on the same SHA.
2. **Validate secrets:** fails loudly if any required secret is missing.
3. **SSH into VPS** using `appleboy/ssh-action@v1.2.0`.
4. **Sync code:** `git fetch --prune origin && git reset --hard origin/main` — the VPS clone is a deploy target, not a working tree.
5. **Roll stack:** `docker compose -f docker-compose.prod.yml build --pull && up -d --remove-orphans`.
6. **Health-poll** the nginx container for up to 90 s.
7. **External probe** from the GitHub runner against `HEALTH_CHECK_URL` to confirm the rollout is visible from the public internet.
8. **Prune dangling images** to keep disk usage flat.

The workflow runs with `concurrency.group: deploy-production` so two pushes
in quick succession will serialize at the SSH boundary instead of racing.

---

## Manual rollback

If a bad commit makes it through CI:

```bash
ssh deploy@vps_host
cd /opt/all-in-one-toolbox
git log --oneline -10                # find the last good SHA
git reset --hard <good-sha>
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans
```

Or, from GitHub UI: open the previous good commit on `main`, click
**Revert** to produce a revert PR, merge it. The deploy workflow handles
the rest.

---

## "Skip build" rollouts

For config-only or static-asset-only changes that do not need a Docker
image rebuild, use the manual dispatch with **Skip image rebuild** ticked.
The remote step then runs `docker compose up -d --remove-orphans` without
the `build --pull` prefix, which is several minutes faster.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ssh: handshake failed` | `VPS_SSH_KEY` not the full key, or wrong passphrase format | Re-generate the key with `-N ""` to remove the passphrase and re-paste |
| `Permission denied (publickey)` | Public key not in VPS `~/.ssh/authorized_keys` | Re-run `ssh-copy-id` |
| `docker: command not found` on remote | Docker not installed for the deploy user | `curl -fsSL https://get.docker.com \| sh && sudo usermod -aG docker $USER` |
| External health probe fails but service is up locally | Firewall or DNS misconfig | Set `HEALTH_CHECK_URL` to a working endpoint, or check Cloudflare/Let's Encrypt status |
| Deploy stuck in `concurrency` queue | A previous run is still in flight | Cancel the older run from the Actions tab |

For ad-hoc debugging on the VPS:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f --tail 200
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

---

## Security notes

- The `VPS_SSH_KEY` secret is shown in the workflow YAML as `${{ secrets.VPS_SSH_KEY }}` and is **never** echoed to logs. Treat the key as production-credential grade.
- `script_stop: true` makes the remote script exit on first failure so a botched `git reset` cannot cascade into a broken rollout.
- The deploy environment is named `production` in GitHub — you can add required reviewers in **Settings → Environments → production** if you want a human approval gate before each rollout.
- The compose file does not bake any secrets into the image; runtime env (e.g. `CORS_ORIGINS`) is injected from the compose file itself. If you ever need to inject a true secret (API token, DB password), use a `.env` file on the VPS and reference it from `docker-compose.prod.yml` — never put it in this repo.
