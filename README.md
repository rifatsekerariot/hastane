# Akıllı Hastane Oda Bilgi Ekranı Sistemi (Smart Hospital Room Info Screen)

Bu proje, Hastane Bilgi Yönetim Sistemi (HBYS) ile entegre çalışan, HL7 mesajlarını dinleyen ve hasta odası kapı ekranlarını (Tabletler) anlık olarak güncelleyen bir PWA (Progressive Web App) çözümüdür.

## 🚀 Özellikler

- **HL7 Entegrasyonu:** MLLP üzerinden gelen ADT (Hasta Kabul/Taburcu) ve ORM (İstem) mesajlarını işler.
- **Gerçek Zamanlı Güncelleme:** Socket.io ile anlık veri aktarımı.
- **Dinamik UI:** "Mavi Kod", "Temizlik", "Ameliyatta", "Bebek" gibi durumlara göre ekran teması değişir.
- **KVKK Uyumlu:** Hasta isimleri otomatik maskelenir (Örn: A**** Y****).
- **Yönetim Paneli:** Tablet cihaz eşleştirmesi ve oda tanımlamaları.

## 🛠️ Teknoloji Yığını

- **Backend:** Node.js, Express, Socket.io, node-hl7-server
- **Veritabanı:** PostgreSQL
- **Frontend:** React (Vite), PWA, TailwindCSS (Planlanan)

## 📂 Kurulum

### Gereksinimler
- Node.js (v16+)
- PostgreSQL

### 1. Backend Kurulumu

```bash
cd backend
npm install
```

`.env` dosyasını oluşturun ve veritabanı bilgilerinizi girin:

```env
DB_USER=postgres
DB_PASSWORD=sifreniz
DB_NAME=hospital_db
HL7_PORT=2575
```

Veritabanını hazırlamak için:

```bash
node scripts/createDb.js
node scripts/setupDb.js
```

Sunucuyu başlatın:

```bash
npm run dev
```

### 2. Frontend Kurulumu (Henüz Hazırlanıyor)

```bash
cd frontend
npm install
npm run dev
```

### 3. Docker ile Çalıştırma (Önerilen)

Tüm sistemi (Veritabanı + Backend) tek komutla ayağa kaldırmak için:

```bash
docker-compose up --build
```

```bash
docker-compose up --build
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3005
- **DB:** 5434 portu (Host), 5432 (Container)
- **HL7 Dinleyici:** 2575 portu

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır.
