#!/bin/bash
echo "=== 502 HATASI TESPIT SCRIPTI ==="

echo "1. Konteyner Durumlari:"
docker compose ps

echo -e "\n2. Port 3005 Dinleniyor mu? (Host):"
sudo netstat -plnt | grep 3005

echo -e "\n3. Backend Testi (127.0.0.1:3005):"
curl -v http://127.0.0.1:3005/health

echo -e "\n4. Backend Testi (0.0.0.0:3005):"
curl -v http://0.0.0.0:3005/health

echo -e "\n5. Backend Loglari (Son 50):"
docker compose logs --tail=50 backend

echo -e "\n6. Nginx Hata Loglari (Son 20):"
if [ -f /var/log/nginx/error.log ]; then
    sudo tail -n 20 /var/log/nginx/error.log
else
    echo "Nginx hata logu bulunamadi."
fi
