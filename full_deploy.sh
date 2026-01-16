#!/bin/bash
# full_deploy.sh
# Bu script mevcut kurulumu tamamen temizler ve sifirdan baslatir.
# Kullanimi: sudo ./full_deploy.sh

echo "=== 1. EN GUNCEL KODLARI CEK ==="
git pull

echo "=== 2. EKSI KONTEYNERLERI TEMIZLE ==="
# Konteynerleri durdur ve sil
docker-compose down

# Opsiyonel: Veritabani hacmini (volume) temizlemek isterseniz asagidaki satirin basindaki # isaretini kaldirin.
# DIKKAT: BU ISLEM TUM VERITABANINI SILER!
# docker volume rm hastane_postgres_data

echo "=== 3. TEMIZ KURULUM VE BASLATMA ==="
# --build: degisiklikleri uygula
# -d: arka planda calistir
docker-compose up -d --build

echo "=== 4. SAGLIK KONTROLU (HEALTH CHECK) ==="
echo "Backend'in hazir olmasi icin 10 saniye bekleniyor..."
sleep 10

# Backend Health Endpoint Kontrolü (Nginx uzerinden degil, direkt Docker portundan)
# Eger curl yoksa hata vermemesi icin || true
curl -v http://127.0.0.1:3005/health || echo "Backend henuz hazir degil veya curl yok."

echo ""
echo "=== LOGLAR (Backend Son 50 Satir) ==="
docker-compose logs --tail=50 backend

echo ""
echo "=== KURULUM TAMAMLANDI ==="
echo "Lutfen tarayicidan https://hastane.fikirbizden.com adresini kontrol edin."
