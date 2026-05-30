# ============================================================================
# deploy-vps.ps1
# 一键部署脚本：修复 Nginx + 部署新 UI
# 使用方式: powershell -File deploy-vps.ps1
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  All-in-One VPS 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$VPS_HOST = "333654.xyz"
$NGINX_CONTAINER = "all-in-one-toolbox-nginx"

function Step { param($m) Write-Host "[*] $m" -ForegroundColor Yellow }
function Ok { param($m) Write-Host "[OK] $m" -ForegroundColor Green }
function Err { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red; exit 1 }

# ============================================================================
# 第一部分: Nginx 修复
# ============================================================================

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Part 1: 修复 Nginx BOM 问题" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# 1. Stop Nginx
Step "停止 Nginx 容器..."
ssh root@$VPS_HOST "docker stop $NGINX_CONTAINER 2>/dev/null || echo 'stopped'"
Ok "Nginx 已停止"
Write-Host ""

# 2. Fix BOM & Cert
Step "修复 BOM 并更新证书路径..."
$fixResult = ssh root@$VPS_HOST @"
cd /root/all-in-one
git fetch origin main 2>/dev/null || true

# Check BOM
FIRST_BYTES=$(head -c 3 nginx/default.conf | xxd -p)
if [[ `"$FIRST_BYTES`" == `"efbbbf`" ]]; then
    echo 'BOM found, removing...'
    python3 << 'ENDPY'
data = open('nginx/default.conf', 'rb').read()
if data.startswith(b'\xef\xbb\xbf'):
    data = data[3:]
    open('nginx/default.conf', 'wb').write(data)
    print('BOM removed')
ENDPY
fi

# Verify
xxd -l 3 nginx/default.conf

# Update cert path
sed -i 's|live/333654\.xyz/|live/333654.xyz-0001/|' nginx/default.conf
echo 'Cert path updated'
"@
Write-Host $fixResult
Write-Host ""

# 3. Start Nginx
Step "启动 Nginx..."
ssh root@$VPS_HOST "docker start $NGINX_CONTAINER"
Start-Sleep -Seconds 3

# Check
$status = ssh root@$VPS_HOST "docker ps --filter 'name=$NGINX_CONTAINER' --format '{{.Status}}'"
if ($status -match "Up") {
    Ok "Nginx 已启动"
} else {
    Err "Nginx 启动失败: $status"
}
Write-Host ""

# ============================================================================
# 第二部分: 构建并部署
# ============================================================================

Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  Part 2: 构建并部署新 UI" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# 1. Build Docker
Step "构建 Docker 镜像..."
Set-Location "D:\All-in-One"
docker build -t all-in-one-toolbox-frontend:latest ./frontend 2>&1 | Tee-Object -Variable buildLog

if ($LASTEXITCODE -ne 0) {
    Write-Host $buildLog
    Err "Docker 构建失败"
}
Ok "Docker 镜像构建成功"
Write-Host ""

# 2. Push to VPS
Step "上传镜像到 VPS..."

# Save to tar
Step "保存镜像到 tar..."
docker save all-in-one-toolbox-frontend:latest -o frontend.tar
Ok "镜像已保存"

Step "上传到 VPS..."
scp frontend.tar root@$VPS_HOST:/tmp/frontend.tar

Step "加载镜像..."
ssh root@$VPS_HOST "docker load -i /tmp/frontend.tar && rm /tmp/frontend.tar"
Ok "镜像已加载"

# Cleanup local tar
Remove-Item frontend.tar -ErrorAction SilentlyContinue

# 3. Restart containers
Step "重启容器..."
ssh root@$VPS_HOST "cd /root/all-in-one && docker-compose -f docker-compose.prod.yml up -d"
Ok "容器已重启"
Write-Host ""

# 4. Health check
Step "健康检查..."
Start-Sleep -Seconds 10

try {
    $r = Invoke-WebRequest -Uri "https://$VPS_HOST/health" -SkipCertificateCheck -TimeoutSec 15 -UseBasicParsing
    Ok "HTTPS 健康检查通过! ($($r.StatusCode))"
} catch {
    Write-Host "[!] HTTPS 失败，尝试 HTTP..." -ForegroundColor Yellow
    try {
        $r2 = Invoke-WebRequest -Uri "http://$VPS_HOST/health" -TimeoutSec 15 -UseBasicParsing
        Ok "HTTP 健康检查通过! ($($r2.StatusCode))"
    } catch {
        Write-Host "[WARNING] 健康检查可能有问题" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  部署完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "访问 https://333654.xyz 检查新 UI" -ForegroundColor Cyan
Write-Host ""