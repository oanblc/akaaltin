#!/bin/bash

# Aka Kuyumculuk - Sunucu Kurulum Scripti
# Bu scripti root kullanıcısı ile çalıştırın

set -e

echo "========================================"
echo "Aka Kuyumculuk Sunucu Kurulumu"
echo "========================================"

# Sistem güncelleme
echo "[1/10] Sistem güncelleniyor..."
apt update && apt upgrade -y

# Temel paketler
echo "[2/10] Temel paketler kuruluyor..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw

# Node.js 20 LTS kurulumu
echo "[3/10] Node.js kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 kurulumu
echo "[4/10] PM2 kuruluyor..."
npm install -g pm2

# MySQL kurulumu
echo "[5/10] MySQL kuruluyor..."
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# MySQL güvenlik ayarları ve veritabanı oluşturma
echo "[6/10] Veritabanı oluşturuluyor..."
MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)
MYSQL_APP_PASSWORD=$(openssl rand -base64 16)

mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';"
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS akakuyumculuk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "CREATE USER IF NOT EXISTS 'akakuyumculuk'@'localhost' IDENTIFIED BY '${MYSQL_APP_PASSWORD}';"
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "GRANT ALL PRIVILEGES ON akakuyumculuk.* TO 'akakuyumculuk'@'localhost';"
mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -e "FLUSH PRIVILEGES;"

# Proje dizini oluştur
echo "[7/10] Proje dizini hazırlanıyor..."
mkdir -p /var/www/akakuyumculuk
cd /var/www/akakuyumculuk

# Firewall ayarları
echo "[8/10] Firewall ayarlanıyor..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Nginx konfigürasyonu (domain olmadan IP ile çalışacak şekilde)
echo "[9/10] Nginx yapılandırılıyor..."
cat > /etc/nginx/sites-available/akakuyumculuk << 'NGINXCONF'
# Frontend
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/akakuyumculuk /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Bilgileri kaydet
echo "[10/10] Kurulum bilgileri kaydediliyor..."
cat > /root/akakuyumculuk-credentials.txt << CREDS
======================================
AKA KUYUMCULUK SUNUCU BİLGİLERİ
======================================
Tarih: $(date)

MySQL Root Şifresi: ${MYSQL_ROOT_PASSWORD}
MySQL App Kullanıcısı: akakuyumculuk
MySQL App Şifresi: ${MYSQL_APP_PASSWORD}
Veritabanı Adı: akakuyumculuk

DATABASE_URL: mysql://akakuyumculuk:${MYSQL_APP_PASSWORD}@localhost:3306/akakuyumculuk

Proje Dizini: /var/www/akakuyumculuk
======================================
CREDS

chmod 600 /root/akakuyumculuk-credentials.txt

echo ""
echo "========================================"
echo "KURULUM TAMAMLANDI!"
echo "========================================"
echo ""
echo "Önemli bilgiler /root/akakuyumculuk-credentials.txt dosyasına kaydedildi."
echo ""
echo "Şimdi projeyi yüklemek için şu adımları izleyin:"
echo ""
echo "1. Yerel bilgisayarınızdan proje dosyalarını yükleyin:"
echo "   scp -r /path/to/AkaKuyumculuk/* root@37.148.214.162:/var/www/akakuyumculuk/"
echo ""
echo "2. Sunucuda proje kurulumunu tamamlayın:"
echo "   cd /var/www/akakuyumculuk"
echo "   ./deploy/install-app.sh"
echo ""
cat /root/akakuyumculuk-credentials.txt
