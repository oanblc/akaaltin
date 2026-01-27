# Aka Kuyumculuk - Altın Fiyat Takip Sistemi

## Kurulum

### 1. MySQL Veritabanı Oluştur
```sql
CREATE DATABASE aka_kuyumculuk;
```

### 2. Backend Kurulum
```bash
cd backend
npm install

# Prisma client oluştur
npm run db:generate

# Veritabanı tablolarını oluştur
npm run db:push

# Backend'i başlat
npm run dev
```

### 3. Frontend Kurulum
```bash
cd frontend
npm install
npm run dev
```

### 4. Admin Kullanıcısı Oluştur
Backend çalışırken şu POST isteği yapın:
```bash
curl -X POST http://localhost:5001/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123456"}'
```

## URL'ler
- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin/login
- **TV Görünümü**: http://localhost:3000/tv
- **Backend API**: http://localhost:5001

## Fiyat Kaynakları

### Ana Kaynak (VPS WebSocket)
`.env` dosyasında `VPS_WS_URL` değişkenini ayarlayın.

### Yedek Kaynak
saglamoglualtin.com API'si otomatik olarak yapılandırılmıştır.

## Admin Panel Özellikleri
- Fiyat yönetimi (CRUD)
- Fiyat kaynağı yönetimi (Manuel/Otomatik geçiş)
- Site ayarları (Logo, iletişim bilgileri)
- SEO ayarları
- Makale yönetimi
- Şube yönetimi

## Firma Bilgileri
- **Telefon**: 0322 233 55 55
- **Adres**: Turgut Özal Bulvarı Güzelyalı Mahallesi QNB Finansbank Yanı Recep Gergin Apt. Zemin Kat No:124/A Çukurova / ADANA
