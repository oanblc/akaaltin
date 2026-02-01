#!/bin/bash

# Aka Kuyumculuk - Uygulama Kurulum Scripti
# Bu scripti sunucuda /var/www/akakuyumculuk dizininde çalıştırın

set -e

echo "========================================"
echo "Aka Kuyumculuk Uygulama Kurulumu"
echo "========================================"

cd /var/www/akakuyumculuk

# Credential dosyasından DATABASE_URL'i al
if [ -f /root/akakuyumculuk-credentials.txt ]; then
    DATABASE_URL=$(grep "DATABASE_URL:" /root/akakuyumculuk-credentials.txt | cut -d' ' -f2)
else
    echo "HATA: /root/akakuyumculuk-credentials.txt bulunamadı!"
    echo "Önce setup-server.sh scriptini çalıştırın."
    exit 1
fi

# Backend kurulumu
echo "[1/6] Backend kuruluyor..."
cd /var/www/akakuyumculuk/backend

# .env dosyası oluştur
cat > .env << ENVFILE
DATABASE_URL="${DATABASE_URL}"
JWT_SECRET=$(openssl rand -base64 32)
PORT=5001
NODE_ENV=production
ENVFILE

npm install
npx prisma generate
npx prisma db push

# Seed data
echo "[2/6] Veritabanı başlangıç verileri yükleniyor..."
node prisma/seed-campaigns.js 2>/dev/null || true
node prisma/seed-article.js 2>/dev/null || true
node prisma/seed-legal.js 2>/dev/null || true

# Frontend kurulumu
echo "[3/6] Frontend kuruluyor..."
cd /var/www/akakuyumculuk/frontend

# .env.local dosyası oluştur
cat > .env.local << ENVFILE
NEXT_PUBLIC_API_URL=http://37.148.214.162
NEXT_PUBLIC_WS_URL=ws://37.148.214.162
ENVFILE

npm install
npm run build

# PM2 ile başlat
echo "[4/6] Uygulamalar başlatılıyor..."
cd /var/www/akakuyumculuk

# PM2 ecosystem dosyası
cat > ecosystem.config.js << 'PM2CONFIG'
module.exports = {
  apps: [
    {
      name: 'aka-backend',
      cwd: '/var/www/akakuyumculuk/backend',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    },
    {
      name: 'aka-frontend',
      cwd: '/var/www/akakuyumculuk/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        NODE_ENV: 'production'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
PM2CONFIG

pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "[5/6] Nginx yeniden başlatılıyor..."
systemctl restart nginx

echo "[6/6] Durum kontrolü..."
pm2 status

echo ""
echo "========================================"
echo "KURULUM TAMAMLANDI!"
echo "========================================"
echo ""
echo "Site şu adreste çalışıyor: http://37.148.214.162"
echo ""
echo "Yararlı komutlar:"
echo "  pm2 status      - Uygulama durumu"
echo "  pm2 logs        - Logları görüntüle"
echo "  pm2 restart all - Uygulamaları yeniden başlat"
echo ""
