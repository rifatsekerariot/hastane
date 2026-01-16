#!/bin/bash
echo "=== DOCKER KONTIYNER DURUMLARI ==="
docker ps -a

echo ""
echo "=== BACKEND LOGLARI (SON 50 SATIR) ==="
# Konteyner ismini otomatik bul (genellikle klasoradi-backend-1 formundadir)
CONTAINER_ID=$(docker ps -qf "name=backend")
if [ -z "$CONTAINER_ID" ]; then
    echo "HATA: Backend konteyneri calismiyor!"
else
    docker logs --tail 50 $CONTAINER_ID
fi

echo ""
echo "=== DATABASE LOGLARI (SON 20 SATIR) ==="
DB_ID=$(docker ps -qf "name=db")
if [ -z "$DB_ID" ]; then
    echo "HATA: DB konteyneri calismiyor!"
else
    docker logs --tail 20 $DB_ID
fi
