#!/bin/bash
# ============================================================================
# deploy-fix-nginx.sh
# 修复 Nginx BOM 问题并重启服务
# 使用方式: bash deploy-fix-nginx.sh
# ============================================================================

set -e

echo "========================================"
echo "  Nginx BOM 修复脚本"
echo "========================================"
echo ""

NGINX_CONTAINER="all-in-one-toolbox-nginx"
NGINX_CONFIG_PATH="/root/all-in-one/nginx/default.conf"

# 1. Stop Nginx
echo "[*] 停止 Nginx 容器..."
docker stop $NGINX_CONTAINER 2>/dev/null || true
echo "[OK] Nginx 已停止"
echo ""

# 2. Fix BOM
echo "[*] 检查并去除 UTF-8 BOM..."
ssh root@333654.xyz << 'ENDSSH'
CONFIG="/root/all-in-one/nginx/default.conf"

# Check BOM
FIRST_BYTES=$(head -c 3 "$CONFIG" | xxd -p)
if [[ "$FIRST_BYTES" == "efbbbf" ]]; then
    echo "BOM found, removing..."
    python3 << 'ENDPY'
data = open('/root/all-in-one/nginx/default.conf', 'rb').read()
if data.startswith(b'\xef\xbb\xbf'):
    data = data[3:]
    open('/root/all-in-one/nginx/default.conf', 'wb').write(data)
    print('BOM removed successfully')
else:
    print('No BOM found')
ENDPY
else
    echo "No BOM found"
fi

# Verify
echo "验证文件头:"
xxd -l 3 "$CONFIG"

# Update cert path if needed
CURRENT_CERT=$(grep -o 'live/[^/]*' "$CONFIG" | head -1)
if [[ "$CURRENT_CERT" != *0001* ]]; then
    echo "更新证书路径到 -0001..."
    sed -i 's|live/333654\.xyz/|live/333654.xyz-0001/|' "$CONFIG"
    echo "证书路径已更新"
else
    echo "证书路径已是最新: $CURRENT_CERT"
fi

echo "Done."
ENDSSH

echo ""

# 3. Start Nginx
echo "[*] 启动 Nginx 容器..."
docker start $NGINX_CONTAINER
sleep 3

# Check status
STATUS=$(docker ps --filter "name=$NGINX_CONTAINER" --format "{{.Status}}")
if [[ "$STATUS" == *"Up"* ]]; then
    echo "[OK] Nginx 已启动: $STATUS"
else
    echo "[ERROR] Nginx 启动失败"
    echo "日志:"
    docker logs $NGINX_CONTAINER --tail 10
    exit 1
fi
echo ""

# 4. Verify config
echo "[*] 验证配置..."
docker exec $NGINX_CONTAINER nginx -t

echo ""

# 5. Health check
echo "[*] 健康检查..."
sleep 2

# Test HTTPS
if curl -sk --max-time 10 https://333654.xyz/health 2>/dev/null; then
    echo "[OK] HTTPS 健康检查通过!"
else
    echo "[!] HTTPS 失败，尝试 HTTP..."
    if curl --max-time 10 http://333654.xyz/health 2>/dev/null; then
        echo "[OK] HTTP 健康检查通过!"
    else
        echo "[WARNING] 健康检查可能有问题，请手动检查"
        docker logs $NGINX_CONTAINER --tail 5
    fi
fi

echo ""
echo "========================================"
echo "  完成!"
echo "========================================"