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

## Step 1: VPS Initial Setup (Ubuntu 22.04/20.04)

### 1.1 连接到 VPS

```bash
# 使用 SSH 连接到你的 VPS
ssh root@yourdomain.com

# 或者使用 IP 地址
ssh root@192.168.1.100
```

### 1.2 创建 sudo 用户 (推荐)

```bash
# 创建新用户
adduser deploy

# 添加到 sudo 组
usermod -aG sudo deploy

# 切换到新用户
su - deploy
```

### 1.3 系统基础配置

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装基础工具
sudo apt install -y curl wget git vim unzip ufw fail2ban
```

### 1.4 配置防火墙 (UFW)

```bash
# 设置默认规则
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 允许 SSH (重要! 先允许,否则会断开连接!)
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 检查状态
sudo ufw status verbose
```

### 1.5 安装 Docker

```bash
# 安装依赖
sudo apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker GPG 密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加 Docker 仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装 Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动并启用 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 将用户添加到 docker 组 (免 sudo)
sudo usermod -aG docker $USER

# 验证安装
docker --version
docker compose version
```

### 1.6 配置 SSH 安全 (可选但推荐)

```bash
# 编辑 SSH 配置
sudo vim /etc/ssh/sshd_config

# 修改以下配置:
# Port 2222                  # 更改默认端口
# PermitRootLogin no          # 禁止 root 登录
# PasswordAuthentication no    # 禁用密码登录
# PubkeyAuthentication yes    # 启用密钥登录

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 1.7 配置 Swap (防止内存不足)

```bash
# 检查当前 swap
sudo swapon --show

# 创建 2GB swap 文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 添加到 fstab
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 配置 swappiness
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
```

### 1.8 安装 Certbot (SSL 证书)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 验证 Certbot
certbot --version
```

### 1.9 一键自动化脚本

创建 `setup-vps.sh` 脚本:

```bash
#!/bin/bash
# VPS 初始化一键脚本

set -e

echo "=========================================="
echo "  VPS Initial Setup Script"
echo "=========================================="

# 变量
USERNAME="deploy"
DOMAIN="yourdomain.com"

# 1. 更新系统
echo "[1/7] Updating system..."
apt update && apt upgrade -y

# 2. 安装基础工具
echo "[2/7] Installing base tools..."
apt install -y curl wget git vim unzip ufw fail2ban software-properties-common

# 3. 配置防火墙
echo "[3/7] Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

# 4. 安装 Docker
echo "[4/7] Installing Docker..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker
systemctl enable docker

# 5. 创建部署用户
echo "[5/7] Creating deploy user..."
if ! id "$USERNAME" &>/dev/null; then
    useradd -m -s /bin/bash $USERNAME
    usermod -aG sudo $USERNAME
    usermod -aG docker $USERNAME
fi

# 6. 配置 Swap
echo "[6/7] Configuring swap..."
if ! swapon --show | grep -q "/swapfile"; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# 7. 安装 Certbot
echo "[7/7] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo "Next steps:"
echo "  1. Login as deploy user: su - $USERNAME"
echo "  2. Clone your repository"
echo "  3. Run ./deploy.sh"
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