#!/bin/bash

# Renkler
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}Vite Config Guncelleniyor...${NC}"

# Hedef dosya
FILE="frontend/vite.config.js"

# Yedek al
cp "$FILE" "$FILE.bak"

# server bloğuna allowedHosts ekle
# 'host: true,' satırından sonra 'allowedHosts: true,' ekliyoruz (Tüm hostlara izin verir)
# Veya spesifik domain için: allowedHosts: ['hastane.fikirbizden.com']

if grep -q "allowedHosts" "$FILE"; then
    echo "allowedHosts zaten ekli."
else
    # sed kullanarak host: true satırının altına allowedHosts ekle
    # Windows/Linux uyumlulugu icin basit replace stratejisi
    
    # 1. 'host: true' metnini bulup altına ekle
    sed -i "s/host: true/host: true,\n    allowedHosts: ['hastane.fikirbizden.com', 'all']/" "$FILE"
    
    echo -e "${GREEN}vite.config.js guncellendi: hastane.fikirbizden.com izni eklendi.${NC}"
fi

echo -e "${GREEN}Docker konteynerleri yeniden baslatiliyor...${NC}"
docker-compose restart frontend

echo -e "${GREEN}Islem Tamamlandi!${NC}"
