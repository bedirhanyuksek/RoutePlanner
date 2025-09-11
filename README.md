# RoutePlanner

CSV/XLS(X) dosyalarından konumları ve koordinatları alarak PostgreSQL veritabanına kaydeden, ardından **OSRM (Docker)** ve **Farthest Insertion** algoritması ile en uygun rotayı hesaplayan bir full-stack rota planlama uygulamasıdır.

---
## Uygulama Görselleri
- Ana Ekran
<img src="https://i.imgur.com/aLoRz1P.png" alt="Ana Ekran 1" width="350"/>
<img src="https://i.imgur.com/YA2OaLJ.png" alt="Ana Ekran 2" width="350"/>

- Harita Ekranı
<img src="https://i.imgur.com/4COU552.png" alt="Harita Ekranı" width="350"/>

---

## Özellikler
- CSV/XLS(X) dosyalarından konum ve koordinatları içe aktarma
- Konum verilerini PostgreSQL veritabanına kaydetme
- Konumları liste halinde görüntüleme
- Seçilen konumları backend’e gönderme
- Farthest Insertion algoritması ile rota optimizasyonu yapma
- OSRM (Docker) ile gerçek yol mesafelerini kullanma
- Rotaları React Native üzerinde görselleştirme

---

## Teknolojiler
- **Frontend:** React Native  
- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL
- **Servisler:** OSRM (Docker)  
- **Algoritma:** Farthest Insertion  

---

## Kurulum

### Gereksinimler
- Node.js
- PostgreSQL
- Docker (OSRM için)

---

### 1. Reponun Klonlanması
```bash
git clone https://github.com/bedirhanyuksek/RoutePlanner.git
cd RoutePlanner
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
```
.env.example dosyasını kopyalayarak .env oluşturun ve kendi PostgreSQL bilgilerinizi girin

macOS:
```bash
cp examples/.env.example backend/.env
```
Windows:
```bash
copy ..\examples\.env.example .env
```

.env içeriği örnek:

- DB_HOST=localhost
- DB_PORT=5432
- DB_USER=postgres
- DB_PASSWORD=yourpassword
- DB_NAME=routeplanner

Ardından backend'i başlatın:
```bash
node index.js
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
npm start
```
React Native uygulaması cihazda veya emülatörde çalıştırılacaktır.

### 4. OSRM Kurulumu ve Çalıştırma

Rotaların gerçek yol verilerine göre hesaplanabilmesi için OSRM kullanılmaktadır.

Adımlar
1. Veri Dosyasını İndirme
İstediğiniz bölgenin .osm.pbf dosyasını [Geofabrik](https://download.geofabrik.de/) üzerinden indirin.
Örn: netherlands-latest.osm.pbf

2. Veri Hazırlama
```bash
mkdir osrm-data && cd osrm-data
```
### - .osm.pbf dosyanızı buraya koyun
```bash
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/netherlands-latest.osm.pbf
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/netherlands-latest.osrm
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/netherlands-latest.osrm
```

3. OSRM Sunucusunu Çalıştırma
```bash
docker run -d -p 5001:5000 -v "${PWD}:/data" osrm/osrm-backend osrm-routed /data/netherlands-latest.osrm
```

---

## Örnek Dosyalar
/examples klasöründen örnek dosyalara erişebilirsiniz:
- locations.csv -> Konumlar ve koordinatları
- locations.xlsx -> Aynı verinin Excel sürümü
- .env.example -> Backend için gerekli ortam değişkenlerinin örnek yapısı

Bu dosyaları kullanarak uygulamayı hızlıca test edebilirsiniz. `.env.example` dosyasını örnek alarak bir `.env` dosyası oluşturup PostgreSQL bağlantı bilgilerini ayarlayabilirsiniz. 

---

## Notlar
- PostgreSQL bağlantı bilgilerini .env üzerinden ayarlamayı unutmayınız.
- OSRM kurulumu sırasında farklı bölge verilerini kullanabilirsiniz.
- Örnek CSV/XLSX dosyaları sadece test amaçlıdır, kendi verilerinizle değiştirebilirsiniz.
