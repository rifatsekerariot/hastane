#!/bin/bash
echo "=== 1. DOCKER DURUMU ==="
docker ps -a

echo ""
echo "=== 2. PORT KONTROLU (3005) ==="
# Host uzerinde 3005 portunu dinleyen var mi?
netstat -tulpn | grep 3005

echo ""
echo "=== 3. CURL TEST (Backend) ==="
# Backend'e basit bir istek atmayi dene
curl -v http://127.0.0.1:3005/api/setup/status
if [ $? -eq 0 ]; then
    echo "Backend ERISILEBILIR."
else
    echo "Backend ERISILEMEZ (Connection Refused veya Timeout)."
fi

echo ""
echo "=== 4. LOGLAR ==="
docker-compose logs --tail=50 backend
