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

## Kurulum

### Gereksinimler
- Node.js 18+
- MySQL 8+
- npm veya yarn

### 1. Backend Kurulumu

```bash
cd backend
npm install

# .env dosyası oluştur
cp .env.example .env
# DATABASE_URL, JWT_SECRET, VPS_API_URL değerlerini düzenle

# Veritabanını oluştur
npx prisma db push
npx prisma generate

# Seed verilerini yükle (opsiyonel)
node prisma/seed-campaigns.js
node prisma/seed-article.js
node prisma/seed-legal.js

# Başlat
npm run dev
```

### 2. Frontend Kurulumu

```bash
cd frontend
npm install

# .env.local dosyası oluştur
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:5001" >> .env.local

# Başlat
npm run dev
```

### 3. Mobile Kurulumu

```bash
cd mobile
npm install

# Expo başlat
npx expo start --clear
```

---

## Mobile Uygulama Detayları

### API Yapılandırması

Mobile uygulama varsayılan olarak production sunucusuna bağlanır:

**`mobile/src/services/api.ts`**
```typescript
const API_BASE_URL = 'http://37.148.214.162';
```

**`mobile/src/services/socket.ts`**
```typescript
const SOCKET_URL = 'http://37.148.214.162';
```

### Lokal Geliştirme İçin

Eğer lokal backend'e bağlanmak istiyorsanız, dosyaları şu şekilde güncelleyin:

```typescript
// api.ts
const API_BASE_URL = 'http://192.168.1.XXX:5001'; // Bilgisayarınızın IP adresi

// socket.ts
const SOCKET_URL = 'http://192.168.1.XXX:5001';
```

> **Not:** `localhost` veya `127.0.0.1` mobil cihazlarda çalışmaz. Bilgisayarınızın yerel ağ IP adresini kullanın.

### Expo Komutları

```bash
# Geliştirme sunucusu başlat
npx expo start

# Cache temizleyerek başlat
npx expo start --clear

# Farklı port kullan
npx expo start --port 19000

# Android emülatörde aç
npx expo start --android

# iOS simülatörde aç (sadece macOS)
npx expo start --ios

# Web tarayıcıda aç
npx expo start --web
```

### Expo Go ile Test

1. Telefonunuza [Expo Go](https://expo.dev/client) uygulamasını yükleyin
2. `npx expo start` komutunu çalıştırın
3. Terminalde görünen QR kodu okutun
4. Uygulama telefonunuzda açılacak

### Production Build

```bash
# EAS CLI kur
npm install -g eas-cli

# EAS'a giriş yap
eas login

# Android APK oluştur
eas build --platform android --profile preview

# iOS IPA oluştur
eas build --platform ios --profile preview

# Her iki platform için
eas build --platform all --profile preview
```

---

## API Endpoints

### Public
- `GET /api/prices/cached` - Güncel fiyatlar
- `GET /api/prices/detail/:code` - Fiyat detayı
- `GET /api/settings` - Site ayarları
- `GET /api/campaigns/active` - Aktif kampanyalar
- `GET /api/branches` - Şube listesi
- `GET /api/articles` - Makaleler
- `GET /api/legal/:slug` - Yasal sayfalar

### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `GET /api/auth/verify` - Token doğrulama

### Protected (JWT gerekli)
- `GET /api/customers/me` - Profil bilgileri
- `GET /api/transactions/my` - İşlem geçmişi
- `POST /api/alerts` - Fiyat alarmı oluştur
- `POST /api/qrcodes/use` - QR kod kullan

---

## WebSocket Events

```javascript
// Bağlantı
socket.on('connect', () => {});
socket.on('disconnect', () => {});

// Fiyat güncellemeleri
socket.on('prices', (prices) => {
  // Tüm fiyatlar array olarak gelir
});

socket.on('priceUpdate', (price) => {
  // Tek fiyat güncellemesi
});
```

---

## Ortam Değişkenleri

### Backend (.env)
```env
DATABASE_URL=mysql://user:pass@localhost:3306/dbname
JWT_SECRET=your-secret-key
PORT=5001
NODE_ENV=development
VPS_API_URL=http://fiyat-api-url/api.php
FALLBACK_API_URL=https://yedek-kaynak.com
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=ws://localhost:5001
```

---

## Production Deployment

Sunucu kurulumu için `deploy/` klasöründeki scriptleri kullanabilirsiniz:

```bash
# Sunucuya bağlan
ssh root@sunucu-ip

# Setup script'i çalıştır
bash setup-server.sh

# Uygulama kurulumu
bash install-app.sh
```

---

## Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır.

## İletişim

Aka Kuyumculuk - Adana, Türkiye
- Web: http://37.148.214.162
- Tel: 0322 233 55 55
