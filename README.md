# Aka Kuyumculuk - Altın Fiyat Takip Uygulaması

Altın ve döviz fiyatlarını anlık takip edebileceğiniz, puan kazanabileceğiniz ve QR kod ile işlem yapabileceğiniz full-stack uygulama.

## Proje Yapısı

```
AkaKuyumculuk/
├── backend/          # Node.js + Express API
├── frontend/         # Next.js Web Uygulaması
├── mobile/           # React Native + Expo Mobil Uygulama
└── deploy/           # Sunucu kurulum scriptleri
```

## Teknolojiler

### Backend
- Node.js + Express
- Prisma ORM + MySQL
- Socket.io (Gerçek zamanlı fiyat güncellemeleri)
- JWT Authentication

### Frontend (Web)
- Next.js 14
- TypeScript
- Tailwind CSS
- Socket.io Client

### Mobile
- React Native + Expo
- TypeScript
- Zustand (State Management)
- Socket.io Client

---

# 🍎 MacBook Kurulum Rehberi (Sıfırdan)

Bu bölüm MacBook'ta projeyi sıfırdan çalıştırmak için adım adım talimatlar içerir.

## Adım 1: Homebrew Kurulumu

Homebrew macOS için paket yöneticisidir. Terminal'i açın ve çalıştırın:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Kurulum bittikten sonra Terminal'i kapatıp yeniden açın.

## Adım 2: Gerekli Yazılımları Kur

```bash
# Node.js (v20 LTS önerilir)
brew install node@20

# Node.js'i PATH'e ekle (zsh için)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Versiyonu kontrol et
node --version  # v20.x.x olmalı
npm --version   # 10.x.x olmalı

# Git (genellikle macOS'ta zaten yüklü)
brew install git

# Watchman (Expo için gerekli - dosya değişikliklerini izler)
brew install watchman

# MySQL (sadece lokal geliştirme için gerekli)
brew install mysql
brew services start mysql
```

## Adım 3: Expo CLI Kurulumu

```bash
# Global Expo CLI
npm install -g expo-cli

# EAS CLI (production build için)
npm install -g eas-cli
```

## Adım 4: Projeyi Klonla

```bash
# Ana klasöre git
cd ~/Desktop

# Projeyi klonla
git clone https://github.com/oanblc/akaaltin.git

# Proje klasörüne gir
cd akaaltin
```

## Adım 5: Mobil Uygulamayı Başlat

Mobil uygulama production sunucusuna (37.148.214.162) bağlanır, bu yüzden backend kurmanıza gerek yok.

```bash
# Mobile klasörüne git
cd mobile

# Bağımlılıkları yükle
npm install

# Expo'yu başlat (önerilen yöntem)
npx expo start --tunnel --clear
```

### QR Kod ile Test

1. iPhone'unuza **Expo Go** uygulamasını App Store'dan indirin
2. Terminal'de QR kod göründüğünde iPhone kamerasıyla okutun
3. Expo Go uygulaması otomatik açılacak

### iOS Simülatörde Test (Xcode gerekli)

```bash
# Xcode yüklüyse
npx expo start --ios
```

---

# 🔧 Lokal Geliştirme (Backend + Frontend)

Eğer backend ve frontend'i de lokalde çalıştırmak istiyorsanız:

## Backend Kurulumu

```bash
# Backend klasörüne git
cd backend

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cat > .env << 'EOF'
DATABASE_URL=mysql://root:@localhost:3306/aka_kuyumculuk
JWT_SECRET=your-super-secret-jwt-key-here-change-this
PORT=5001
NODE_ENV=development
VPS_API_URL=http://37.148.208.13/api.php
FALLBACK_API_URL=https://saglamoglualtin.com/component/tab-group/1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
EOF

# MySQL veritabanı oluştur
mysql -u root -e "CREATE DATABASE IF NOT EXISTS aka_kuyumculuk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Prisma şemasını uygula
npx prisma db push
npx prisma generate

# Backend'i başlat
npm run dev
```

Backend http://localhost:5001 adresinde çalışacak.

## Frontend Kurulumu

```bash
# Frontend klasörüne git
cd frontend

# Bağımlılıkları yükle
npm install

# .env.local dosyası oluştur
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=ws://localhost:5001
EOF

# Frontend'i başlat
npm run dev
```

Frontend http://localhost:3000 adresinde çalışacak.

## Mobile'ı Lokal Backend'e Bağla

Lokal backend kullanmak için mobile/src/services/ dosyalarını düzenleyin:

1. IP adresinizi bulun:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# Örnek çıktı: inet 192.168.1.42
```

2. `mobile/src/services/api.ts` dosyasını düzenleyin:
```typescript
const API_BASE_URL = 'http://192.168.1.42:5001';  // Kendi IP'nizi yazın
```

3. `mobile/src/services/socket.ts` dosyasını düzenleyin:
```typescript
const SOCKET_URL = 'http://192.168.1.42:5001';  // Kendi IP'nizi yazın
```

---

# ⚠️ Sık Karşılaşılan Hatalar ve Çözümleri

## "Failed to download remote update" Hatası

Bu hata genellikle ağ bağlantısı sorunlarından kaynaklanır.

**Çözüm:**
```bash
# Tunnel modu kullan
npx expo start --tunnel --clear
```

## "Network request failed" Hatası

Telefon ve bilgisayar aynı ağda değil veya firewall engelliyor.

**Çözüm:**
1. Her iki cihazın da aynı WiFi'ye bağlı olduğundan emin olun
2. Tunnel modu kullanın: `npx expo start --tunnel`

## Metro Bundler Bağlantı Sorunu

**Çözüm:**
```bash
# Tüm cache'leri temizle
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

## "Unable to resolve module" Hatası

**Çözüm:**
```bash
# node_modules'u sil ve yeniden yükle
rm -rf node_modules
rm -rf package-lock.json
npm install
npx expo start --clear
```

## Watchman Hatası

**Çözüm:**
```bash
# Watchman'ı yeniden başlat
watchman watch-del-all
watchman shutdown-server
```

## Port Çakışması

**Çözüm:**
```bash
# Farklı port kullan
npx expo start --port 19001
```

---

# 📱 Expo Komutları Referansı

```bash
# Geliştirme sunucusu başlat
npx expo start

# Cache temizleyerek başlat (sorun çözümü için)
npx expo start --clear

# Tunnel modu (ağ sorunlarında)
npx expo start --tunnel

# Tunnel + cache temizle (en güvenli)
npx expo start --tunnel --clear

# iOS simülatörde aç
npx expo start --ios

# Android emülatörde aç
npx expo start --android

# Web tarayıcıda aç
npx expo start --web

# Farklı port kullan
npx expo start --port 19001
```

---

# 🏗️ Production Build

## Android APK

```bash
# EAS'a giriş yap
eas login

# APK build başlat
eas build --platform android --profile preview

# Play Store için AAB
eas build --platform android --profile production
```

## iOS IPA

```bash
# Apple Developer hesabı gerekli
eas build --platform ios --profile preview

# App Store için
eas build --platform ios --profile production
```

---

# 📡 API Yapılandırması

## Production Sunucusu (Varsayılan)

Uygulama şu anda production sunucusuna bağlı:

- **API:** http://37.148.214.162/api
- **WebSocket:** ws://37.148.214.162
- **Web:** http://37.148.214.162

## API Endpoints

### Public Endpoints
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/prices/cached` | Güncel fiyatlar |
| GET | `/api/prices/detail/:code` | Fiyat detayı |
| GET | `/api/prices/status` | Fiyat kaynağı durumu |
| GET | `/api/settings` | Site ayarları |
| GET | `/api/campaigns` | Kampanyalar |
| GET | `/api/branches` | Şubeler |
| GET | `/api/articles` | Makaleler |
| GET | `/api/legal/:slug` | Yasal sayfalar |

### Auth Endpoints
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Yeni kayıt |
| POST | `/api/auth/login` | Giriş |
| GET | `/api/auth/verify` | Token doğrula |

### Protected Endpoints (JWT Gerekli)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/customers/me` | Profil bilgileri |
| PUT | `/api/customers/me` | Profil güncelle |
| GET | `/api/transactions/my` | İşlem geçmişi |
| GET | `/api/alerts` | Fiyat alarmları |
| POST | `/api/alerts` | Alarm oluştur |
| DELETE | `/api/alerts/:id` | Alarm sil |
| POST | `/api/qrcodes/use` | QR kod kullan |

---

# 🗄️ Veritabanı

## Prisma Komutları

```bash
# Şemayı veritabanına uygula
npx prisma db push

# Prisma Client oluştur
npx prisma generate

# Veritabanını görüntüle (GUI)
npx prisma studio

# Migration oluştur
npx prisma migrate dev --name migration_name
```

## Ana Tablolar
- `User` - Admin kullanıcıları
- `Customer` - Mobil uygulama müşterileri
- `Settings` - Site ayarları (key-value)
- `CustomPrice` - Fiyat tanımları
- `CachedPrice` - Anlık fiyat cache
- `SourcePrice` - Kaynak fiyatları
- `PriceSourceConfig` - Fiyat kaynağı ayarları
- `Transaction` - Puan işlemleri
- `PriceAlert` - Fiyat alarmları
- `Campaign` - Kampanyalar
- `Article` - Makaleler
- `Branch` - Şubeler
- `LegalPage` - Yasal sayfalar
- `Category` - Puan kategorileri
- `QRCode` - QR kodlar
- `FamilyCard` - Aile kartları

---

# 🚀 Production Deployment (Sunucu)

## Sunucu Gereksinimleri
- Ubuntu 20.04+
- 2GB RAM minimum
- Node.js 20+
- MySQL 8+
- Nginx
- PM2

## Otomatik Kurulum

```bash
# Sunucuya bağlan
ssh root@your-server-ip

# Repo'yu klonla
git clone https://github.com/oanblc/akaaltin.git
cd akaaltin

# Setup script'i çalıştır
cd deploy
bash setup-server.sh
bash install-app.sh
```

---

# 🔗 Canlı Linkler

- **Web:** http://37.148.214.162
- **API:** http://37.148.214.162/api
- **WebSocket:** ws://37.148.214.162
- **GitHub:** https://github.com/oanblc/akaaltin

---

# 📋 Hızlı Başlangıç Özeti (MacBook)

```bash
# 1. Homebrew kur (yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js ve Watchman kur
brew install node@20 watchman

# 3. Projeyi klonla
git clone https://github.com/oanblc/akaaltin.git
cd akaaltin/mobile

# 4. Bağımlılıkları yükle
npm install

# 5. Expo'yu başlat
npx expo start --tunnel --clear

# 6. Telefondan QR kodu okut (Expo Go ile)
```

---

## Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır.

## İletişim

**Aka Kuyumculuk** - Adana, Türkiye
- Tel: 0322 233 55 55
- Instagram: [@akakuyumcu](https://instagram.com/akakuyumcu)
