# All-in-One Toolbox

> A comprehensive Monorepo for modern development workflows, featuring Next.js frontend and FastAPI backend.

## Architecture

```
all-in-one-toolbox/
├── frontend/              # Next.js 15 (App Router, TypeScript, Tailwind CSS)
├── backend/              # FastAPI (Python 3.11+)
├── nginx/                # Nginx configurations (HTTP & HTTPS)
├── docker-compose.yml    # Container orchestration
├── deploy.sh            # VPS one-click deployment script
└── README.md
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3.4 with cyberpunk dark mode
- **Icons**: Lucide React
- **Fonts**: Inter (sans), Roboto Mono (code)
- **AdSense**: Google AdSense integration ready

### Backend
- **Framework**: FastAPI 0.115
- **Language**: Python 3.11
- **Server**: Uvicorn
- **HTTP Client**: httpx
- **Validation**: Pydantic 2.9

### Infrastructure
- **Containers**: Docker & Docker Compose
- **Reverse Proxy**: Nginx Alpine
- **PDF Service**: Gotenberg 8
- **Rate Limiting**: In-memory sliding window (5 req/min/IP)
- **Circuit Breaker**: 5-second hard timeout

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Domain name (for production HTTPS)
- Google AdSense Publisher ID

### Production Deployment

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/all-in-one-toolbox.git
cd all-in-one-toolbox

# 2. Run deployment script
chmod +x deploy.sh
./deploy.sh

# 3. Check status
docker-compose ps
```

### Service URLs (after deployment)

| Service | URL |
|---------|-----|
| Main Site | http://localhost (or https://yourdomain.com) |
| API Health | http://localhost/health |
| API Docs | http://localhost/docs |

## Project Structure

```
all-in-one-toolbox/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout with AdSense
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── globals.css     # Cyberpunk theme
│   │   │   └── tools/
│   │   │       ├── image-optimizer/
│   │   │       ├── pdf-merge-split/
│   │   │       ├── qrcode-generator/
│   │   │       └── word-to-pdf/
│   │   └── components/
│   │       ├── AdBanner.tsx         # AdSense component
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       └── PseudoProcessor.tsx
│   └── public/
│       └── ads.txt                 # AdSense verification
│
├── backend/
│   ├── app/
│   │   ├── main.py    # FastAPI with rate limiting
│   │   └── config.py  # Sliding window limiter
│   └── Dockerfile
│
├── nginx/
│   ├── default.conf    # HTTP config
│   └── default-ssl.conf # HTTPS template
│
├── docker-compose.yml
├── deploy.sh
└── README.md
```

## Features

- [x] Next.js 15 with App Router
- [x] TypeScript strict mode
- [x] Tailwind CSS with cyberpunk dark mode
- [x] FastAPI with rate limiting (5 req/min/IP)
- [x] 5-second hard circuit breaker
- [x] Gotenberg PDF service integration
- [x] Docker Compose orchestration
- [x] Nginx reverse proxy
- [x] Google AdSense integration
- [x] VPS one-click deployment
- [x] Image optimizer (client-side)
- [x] PDF merge/split (client-side)
- [x] QR code generator (client-side)
- [x] Word to PDF converter (server-side)

---

# VPS Production Deployment Guide

## Step 1: VPS Initial Setup

```bash
# Connect to your VPS
ssh root@yourdomain.com

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Enable Docker
systemctl enable docker
systemctl start docker

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/yourusername/all-in-one-toolbox.git
cd all-in-one-toolbox

# Create .env file
cat > backend/.env << 'EOF'
APP_NAME=All-in-One Toolbox
APP_VERSION=1.0.0
DEBUG=false
HOST=0.0.0.0
PORT=8000
GOTENBERG_URL=http://gotenberg:7000
CORS_ORIGINS=["http://yourdomain.com"]
EOF

# Make deploy script executable
chmod +x deploy.sh
```

## Step 3: Deploy with HTTP (Initial Test)

```bash
# Run deployment
./deploy.sh

# Check services
docker-compose ps

# Test locally
curl http://localhost/health
```

## Step 4: SSL Certificate with Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Stop containers temporarily
docker-compose stop nginx

# Issue certificate (replace with your domain)
certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Verify certificates
ls -la /etc/letsencrypt/live/yourdomain.com/

# Restart services
docker-compose start nginx
```

## Step 5: Configure HTTPS Nginx

After Certbot, your `/etc/nginx/sites-available/default` will be auto-configured.
For manual configuration:

```bash
# Copy SSL config
cp nginx/default-ssl.conf /tmp/nginx-ssl.conf

# Edit with your domain
nano /tmp/nginx-ssl.conf
# Replace: /etc/letsencrypt/live/yourdomain.com/

# Copy to container (or mount directly in docker-compose)
docker cp /tmp/nginx-ssl.conf all-in-one-toolbox-nginx:/etc/nginx/nginx.conf

# Reload Nginx
docker exec all-in-one-toolbox-nginx nginx -s reload
```

## Step 6: Verify HTTPS

```bash
# Test HTTPS
curl -I https://yourdomain.com

# Test ads.txt
curl https://yourdomain.com/ads.txt

# Check SSL grade
# Visit: https://www.ssllabs.com/ssltest/
```

## HTTPS Nginx Configuration Template

Full template available at: `nginx/default-ssl.conf`

Key features:
- HTTP → HTTPS redirect (301)
- TLS 1.2/1.3 only
- Modern cipher suite
- HSTS header
- OCSP stapling
- Content Security Policy
- Real IP forwarding

## Step 7: Auto-Renew SSL

```bash
# Test auto-renewal
certbot renew --dry-run

# Add to crontab
crontab -e

# Add line:
0 0 * * * certbot renew --quiet --deploy-hook "docker exec all-in-one-toolbox-nginx nginx -s reload"
```

---

# Google AdSense Setup

## Step 1: Get Publisher ID

1. Go to https://www.google.com/adsense
2. Complete account setup
3. Copy your Publisher ID: `pub-0000000000000000`

## Step 2: Update Configuration

```bash
# Update ads.txt
nano frontend/public/ads.txt
# Replace: google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0

# Update layout.tsx
nano frontend/src/app/layout.tsx
# Replace: ca-pub-0000000000000000

# Update AdBanner component
nano frontend/src/components/AdBanner.tsx
# Replace: data-ad-client="ca-pub-0000000000000000"
```

## Step 3: Verify AdSense

1. Deploy updated code
2. Wait 24-48 hours for Google crawl
3. Check status in AdSense dashboard
4. Verify at: https://yourdomain.com/ads.txt

## AdSense Publisher ID Checklist

| Location | Placeholder | Replace With |
|----------|-------------|--------------|
| `frontend/public/ads.txt` | `pub-0000000000000000` | Your actual ID |
| `frontend/src/app/layout.tsx` | `ca-pub-0000000000000000` | Your actual ID |
| `frontend/src/components/AdBanner.tsx` | `data-ad-client` | Your actual ID |

---

# Security Checklist

- [ ] Change all placeholder IDs
- [ ] Enable HSTS after testing (uncomment in nginx config)
- [ ] Set up firewall (only 80, 443 open)
- [ ] Configure fail2ban
- [ ] Enable auto-renew for SSL
- [ ] Review CSP headers for your needs
- [ ] Set up monitoring/logging

## Recommended Firewall Rules

```bash
# UFW (Ubuntu)
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

---

# Troubleshooting

## Services not starting

```bash
# Check logs
docker-compose logs

# Common issues:
# - Port 80 already in use: stop other services
# - Memory limit: increase Docker memory
```

## SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Force renewal
certbot renew --force-renewal
```

## AdSense not showing

1. Verify ads.txt is accessible: `curl https://yourdomain.com/ads.txt`
2. Check browser console for errors
3. Wait 24-48 hours for approval
4. Ensure ads.txt matches AdSense dashboard

---

## License

MIT