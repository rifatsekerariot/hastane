#!/bin/bash

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Root kontrolu
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Lutfen bu scripti root yetkisiyle calistirin (sudo su).${NC}"
  exit
fi

echo -e "${GREEN}### AKILLI HASTANE - NGINX & SSL KURULUM SIHIRBAZI ###${NC}"
echo "Bu script Nginx'i kuracak, domain ayarlarini yapacak ve ucretsiz SSL sertifikasi alacaktir."
echo ""

# 1. Domain ve Email Isteme
read -p "Domain Adresiniz (Ornek: hastane.com veya app.hastane.com): " DOMAIN
read -p "SSL icin E-posta Adresiniz (Let's Encrypt bildirimleri icin): " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
  echo -e "${RED}Hata: Domain ve Email alanlari bos birakilamaz!${NC}"
  exit 1
fi

# 2. Gerekli Paketlerin Kurulumu
echo -e "${YELLOW}[1/4] Gerekli paketler kuruluyor (Nginx, Certbot)...${NC}"
apt-get update
apt-get install -y nginx certbot python3-certbot-nginx

# 3. Nginx Konfigurasyonunun Olusturulmasi
echo -e "${YELLOW}[2/4] Nginx ayarlari yapiliyor...${NC}"

CONFIG_FILE="/etc/nginx/sites-available/$DOMAIN"

cat > "$CONFIG_FILE" <<EOF
server {
    server_name $DOMAIN;

    # Frontend (React PWA)
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Socket.io (Websockets)
    location /socket.io/ {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF

# Sembolik link olustur
ln -sf "$CONFIG_FILE" "/etc/nginx/sites-enabled/"

# Default config varsa silebiliriz veya birakabiliriz (cakisabilir)
# rm -f /etc/nginx/sites-enabled/default

# Config testi
nginx -t
if [ $? -eq 0 ]; then
  systemctl reload nginx
  echo -e "${GREEN}Nginx ayarlari basariyla uygulandi.${NC}"
else
  echo -e "${RED}Nginx konfigurasyon hatasi! Lutfen ayarlari kontrol edin.${NC}"
  exit 1
fi

# 4. SSL Sertifikasi (Certbot)
echo -e "${YELLOW}[3/4] SSL Sertifikasi aliniyor (Certbot)...${NC}"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

if [ $? -eq 0 ]; then
  echo -e "${GREEN}### KURULUM TAMAMLANDI! ###${NC}"
  echo -e "Web Siteniz: ${YELLOW}https://$DOMAIN${NC}"
  echo -e "Backend API: ${YELLOW}https://$DOMAIN/api${NC}"
  echo ""
  echo -e "${RED}ONEMLI NOT:${NC} Frontend kodunuzda (frontend/.env veya docker-compose.yml) API adresini guncellemeniz gerekebilir:"
  echo -e "VITE_API_URL=https://$DOMAIN"
else
  echo -e "${RED}SSL sertifikasi alinirken bir hata olustu. Domain DNS ayarlarinin bu sunucuya yonlendiginden emin olun.${NC}"
fi
