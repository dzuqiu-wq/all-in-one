# deploy-fix-nginx.ps1 - Fix Nginx BOM issue

$VPS_HOST = "333654.xyz"
$NGINX_CONTAINER = "all-in-one-toolbox-nginx"

Write-Host "[*] 停止 Nginx..." -ForegroundColor Yellow
ssh root@$VPS_HOST "docker stop $NGINX_CONTAINER 2>/dev/null; echo done"

Write-Host "[*] 检查并去除 BOM..." -ForegroundColor Yellow
$bomCheck = ssh root@$VPS_HOST "head -c 3 /root/all-in-one/nginx/default.conf | xxd -p"
Write-Host "BOM check: $bomCheck"

if ($bomCheck -eq "efbbbf") {
    Write-Host "[*] 发现 BOM，正在移除..." -ForegroundColor Yellow
    ssh root@$VPS_HOST "python3 -c `"data = open('/root/all-in-one/nginx/default.conf','rb').read()
if data.startswith(b'\xef\xbb\xbf'):
    data = data[3:]
    open('/root/all-in-one/nginx/default.conf','wb').write(data)
    print('BOM removed')`""
} else {
    Write-Host "[*] 无 BOM" -ForegroundColor Gray
}

Write-Host "[*] 更新证书路径..." -ForegroundColor Yellow
ssh root@$VPS_HOST "sed -i 's|live/333654\.xyz/|live/333654.xyz-0001/|' /root/all-in-one/nginx/default.conf; echo done"

Write-Host "[*] 验证文件头..." -ForegroundColor Yellow
$header = ssh root@$VPS_HOST "xxd -l 3 /root/all-in-one/nginx/default.conf"
Write-Host "Header: $header"

Write-Host "[*] 启动 Nginx..." -ForegroundColor Yellow
ssh root@$VPS_HOST "docker start $NGINX_CONTAINER"
Start-Sleep -Seconds 3

$status = ssh root@$VPS_HOST "docker ps --filter 'name=$NGINX_CONTAINER' --format '{{.Status}}'"
Write-Host "[*] Status: $status" -ForegroundColor Gray

Write-Host "[*] 验证配置语法..." -ForegroundColor Yellow
$test = ssh root@$VPS_HOST "docker exec $NGINX_CONTAINER nginx -t 2>&1"
Write-Host $test

Write-Host "[*] 健康检查..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "https://$VPS_HOST/health" -SkipCertificateCheck -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "[OK] HTTPS OK - $($r.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "[!] HTTPS failed, trying HTTP..." -ForegroundColor Yellow
    try {
        $r2 = Invoke-WebRequest -Uri "http://$VPS_HOST/health" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] HTTP OK - $($r2.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "[!] 也失败了: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " 完成! nginx 日志:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
ssh root@$VPS_HOST "docker logs $NGINX_CONTAINER --tail 5"