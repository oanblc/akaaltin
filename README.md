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

## Gerekli Bağımlılıklar

### Sistem Gereksinimleri

| Yazılım | Minimum Versiyon | İndirme Linki |
|---------|------------------|---------------|
| Node.js | 18.0+ | https://nodejs.org |
| npm | 9.0+ | Node.js ile birlikte gelir |
| MySQL | 8.0+ | https://dev.mysql.com/downloads/ |
| Git | 2.30+ | https://git-scm.com |

### Mobile Geliştirme İçin Ek Gereksinimler

| Yazılım | Açıklama | İndirme Linki |
|---------|----------|---------------|
| Expo CLI | React Native geliştirme | `npm install -g expo-cli` |
| Expo Go (iOS) | Test için mobil uygulama | [App Store](https://apps.apple.com/app/expo-go/id982107779) |
| Expo Go (Android) | Test için mobil uygulama | [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| EAS CLI | Production build için | `npm install -g eas-cli` |
| Watchman (macOS) | Dosya izleme | `brew install watchman` |

### Production Build İçin (Opsiyonel)

| Yazılım | Platform | Açıklama |
|---------|----------|----------|
| Android Studio | Android | APK build için SDK gerekli |
| Xcode | macOS | iOS build için (sadece Mac) |
| Java JDK | Android | Android build için |

---

## Hızlı Başlangıç

### 1. Projeyi Klonla
```bash
git clone https://github.com/oanblc/akaaltin.git
cd akaaltin
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```

**Gerekli npm paketleri (otomatik yüklenir):**
- express
- prisma / @prisma/client
- socket.io
- jsonwebtoken
- bcryptjs
- cors
- helmet
- express-rate-limit
- axios
- cheerio
- dotenv

**.env dosyası oluştur:**
```bash
cp .env.example .env
```

**.env içeriği:**
```env
DATABASE_URL=mysql://root:password@localhost:3306/aka_kuyumculuk
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5001
NODE_ENV=development
VPS_API_URL=http://37.148.208.13/api.php
FALLBACK_API_URL=https://saglamoglualtin.com/component/tab-group/1
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Veritabanını oluştur:**
```bash
# MySQL'de veritabanı oluştur
mysql -u root -p -e "CREATE DATABASE aka_kuyumculuk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Prisma şemasını uygula
npx prisma db push
npx prisma generate

# Seed verilerini yükle (opsiyonel)
node prisma/seed-campaigns.js
node prisma/seed-article.js
node prisma/seed-legal.js
```

**Backend'i başlat:**
```bash
npm run dev
# veya
node src/index.js
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
```

**Gerekli npm paketleri (otomatik yüklenir):**
- next
- react / react-dom
- typescript
- tailwindcss
- socket.io-client
- axios
- lucide-react
- clsx
- tailwind-merge

**.env.local dosyası oluştur:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:5001" > .env.local
echo "NEXT_PUBLIC_WS_URL=ws://localhost:5001" >> .env.local
```

**Frontend'i başlat:**
```bash
npm run dev
```

### 4. Mobile Kurulumu
```bash
cd mobile
npm install
```

**Gerekli npm paketleri (otomatik yüklenir):**
- expo (~52.0.0)
- react-native
- react / react-dom
- typescript
- @react-navigation/native
- @react-navigation/native-stack
- @react-navigation/bottom-tabs
- expo-font
- expo-splash-screen
- expo-status-bar
- expo-camera
- expo-barcode-scanner
- react-native-safe-area-context
- react-native-screens
- react-native-gesture-handler
- react-native-reanimated
- socket.io-client
- axios
- zustand
- @react-native-async-storage/async-storage

**Expo'yu başlat:**
```bash
npx expo start --clear
```

---

## Mobile Uygulama Çalıştırma

### Expo Komutları

```bash
# Geliştirme sunucusu başlat
npx expo start

# Cache temizleyerek başlat (önerilen)
npx expo start --clear

# Tunnel modu (ağ sorunlarında kullan)
npx expo start --tunnel

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

1. Telefonunuza **Expo Go** uygulamasını yükleyin
2. Terminal'de `npx expo start --clear` çalıştırın
3. QR kodu telefonunuzla okutun
4. Uygulama açılacaktır

### Sık Karşılaşılan Sorunlar

#### "Failed to download remote update" hatası
```bash
# Tunnel modu kullan
npx expo start --tunnel --clear
```

#### Metro bundler bağlantı sorunu
```bash
# Cache temizle
rm -rf node_modules/.cache
npx expo start --clear
```

#### Telefon ve bilgisayar aynı ağda olmalı
- Her ikisi de aynı WiFi'ye bağlı olmalı
- Firewall Expo'ya izin vermeli

---

## API Yapılandırması

### Production (Varsayılan)

Mobile uygulama production sunucusuna bağlanır:

**`mobile/src/services/api.ts`**
```typescript
const API_BASE_URL = 'http://37.148.214.162';
```

**`mobile/src/services/socket.ts`**
```typescript
const SOCKET_URL = 'http://37.148.214.162';
```

### Lokal Geliştirme

Lokal backend'e bağlanmak için IP adresini güncelleyin:

```typescript
// Bilgisayarınızın yerel IP'sini kullanın (localhost çalışmaz)
const API_BASE_URL = 'http://192.168.1.XXX:5001';
const SOCKET_URL = 'http://192.168.1.XXX:5001';
```

IP adresinizi bulmak için:
```bash
# macOS / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr /i "IPv4"
```

---

## Production Build

### Android APK

```bash
# EAS CLI kur
npm install -g eas-cli

# Expo hesabına giriş
eas login

# Build başlat
eas build --platform android --profile preview
```

### iOS IPA

```bash
# Sadece macOS'ta çalışır
eas build --platform ios --profile preview
```

### Her İki Platform

```bash
eas build --platform all --profile preview
```

---

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

## WebSocket Events

```javascript
import { io } from 'socket.io-client';

const socket = io('http://37.148.214.162');

// Bağlantı
socket.on('connect', () => {
  console.log('Bağlandı');
});

// Tüm fiyatlar (ilk bağlantıda)
socket.on('prices', (prices) => {
  console.log('Fiyatlar:', prices);
});

// Tek fiyat güncellemesi
socket.on('priceUpdate', (price) => {
  console.log('Güncelleme:', price);
});

// Bağlantı koptu
socket.on('disconnect', () => {
  console.log('Bağlantı koptu');
});
```

---

## Veritabanı Şeması

### Ana Tablolar
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

## Production Deployment

### Sunucu Gereksinimleri
- Ubuntu 20.04+
- 2GB RAM minimum
- Node.js 20+
- MySQL 8+
- Nginx
- PM2

### Otomatik Kurulum

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

## Proje Durumu

- **Web:** http://37.148.214.162
- **API:** http://37.148.214.162/api
- **WebSocket:** ws://37.148.214.162

---

## Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır.

## İletişim

**Aka Kuyumculuk** - Adana, Türkiye
- Tel: 0322 233 55 55
- Instagram: [@akakuyumcu](https://instagram.com/akakuyumcu)
