# Imom Hasan FK — Mobile App

React Native ilovasi (Trener va Futbolchi uchun).

---

## Loyiha tuzilmasi

```
Imom Hasan Football/
├── backend/          # Node.js + Express API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
└── frontend/         # React Native (CLI)
    ├── src/
    │   ├── components/
    │   ├── i18n/
    │   ├── navigation/
    │   ├── screens/
    │   └── utils/
    └── App.js
```

---

## Talablar

- Node.js 18+
- Android Studio + SDK
- JDK 17
- React Native 0.73 CLI
- MongoDB Atlas akkaunt

---

## 1. Backend ishga tushirish

```bash
cd backend
npm install
```

`backend/.env` faylini tahrirlang:

```env
PORT=5000
MONGO_URI=mongodb+srv://...   # MongoDB Atlas URL
JWT_SECRET=...                # xavfsiz kalit
JWT_EXPIRE=30d
ADMIN_SECRET_KEY=IMOMHASANADMIN2024

# Firebase (ixtiyoriy — push notification uchun)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

```bash
npm start        # yoki: node server.js
# yoki ishlab chiqish uchun:
npx nodemon server.js
```

Server: `http://localhost:5000`

---

## 2. Frontend ishga tushirish

```bash
cd frontend
npm install
```

### Android (real qurilma yoki emulator)

```bash
# Metro bundler
npx react-native start

# Yangi terminal:
npx react-native run-android
```

> **Eslatma:** Real qurilmada USB debugging yoqilgan bo'lishi kerak.  
> `frontend/src/utils/api.js` da `BASE_URL` ni o'zgartiring:
> - Emulator: `http://10.0.2.2:5000/api`
> - Real qurilma (USB): `http://192.168.x.x:5000/api` (kompyuter IP manzili)

---

## 3. Birinchi trener yaratish (Admin panel)

Admin panelga kirish uchun:

1. Ilovada **Admin** tugmasi bo'lmaydi — admin panel faqat developer uchun.
2. Navigatsiyada `AdminDashboard` screeniga o'ting yoki:
   ```
   navigation.navigate('AdminDashboard')
   ```
3. Admin kaliti: `IMOMHASANADMIN2024` (`.env` dagi `ADMIN_SECRET_KEY`)
4. **Trener qo'shish** → forma to'ldiring → trener yaratiladi.
5. Trener email va parolini unga yuboring.

---

## 4. Futbolchi qo'shish

1. Trener sifatida kiring.
2. Dashboard → **Futbolchi qo'shish** (+).
3. Ma'lumotlarni to'ldiring.
4. Yaratilgandan keyin **6 xonali kod** ko'rsatiladi.
5. Kodni futbolchiga bering — u ilova orqali kiradi.

---

## 5. AdMob sozlash (ixtiyoriy)

`frontend/src/screens/coach/DashboardScreen.js` da:
```js
const ANDROID_INTERSTITIAL_ID = 'ca-app-pub-XXXXX/XXXXX';
```

`frontend/src/components/AdBanner.js` da banner ID ni almashtiring.

Test rejimida `TestIds.INTERSTITIAL` va `TestIds.BANNER` ishlatiladi.

---

## 6. Firebase FCM sozlash (push notification)

1. [Firebase Console](https://console.firebase.google.com) → yangi loyiha yarating.
2. Android ilovangizni qo'shing (`com.imomhasanfootball` yoki boshqa package name).
3. `google-services.json` ni `frontend/android/app/` ga qo'ying.
4. Firebase Admin SDK → Service Account kalitini yuklab oling.
5. `backend/.env` ga `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL` kiriting.

---

## API Endpointlar

| Method | URL | Tavsif |
|--------|-----|--------|
| POST | `/api/auth/coach/login` | Trener kirish |
| POST | `/api/auth/player/login` | Futbolchi kirish (kod) |
| POST | `/api/auth/fcm-token` | FCM token saqlash |
| GET | `/api/players` | Barcha futbolchilar |
| POST | `/api/players` | Futbolchi qo'shish |
| GET | `/api/trainings` | Trenirovkalar |
| POST | `/api/trainings` | Trenirovka qo'shish |
| GET | `/api/payments` | To'lovlar |
| GET | `/api/stats/dashboard` | Dashboard statistika |
| GET | `/api/stats/team` | Jamoa statistika |
| GET | `/api/admin/stats` | Admin statistika |
| POST | `/api/admin/coaches` | Trener yaratish |

---

## Foydalanuvchi rollari

| Rol | Kirish usuli | Imkoniyatlar |
|-----|-------------|-------------|
| **Trener** | Email + parol | Futbolchi, trenirovka, to'lov boshqaruvi |
| **Futbolchi** | 6 xonali kod | O'z statistikasi, jadval, to'lov ko'rish |
| **Admin** | Admin kalit | Trener yaratish, premium berish |

---

## Subscriptsiya rejalari

| Plan | Narx | Limit |
|------|------|-------|
| Free | $0 | 10 futbolchi, reklama bor |
| Premium $10 | $10/oy | Cheksiz futbolchi, reklamasiz |
| Premium $20 | $20/oy | Barcha imkoniyatlar |

---

## Muammolar

**Metro bundler xatosi:**
```bash
npx react-native start --reset-cache
```

**Android build xatosi:**
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

**Backend ulanmayapti (real qurilma):**
- `api.js` da `BASE_URL` ni kompyuterning lokal IP manziliga o'zgartiring
- Xavfsizlik devori (firewall) 5000-portga ruxsat berganini tekshiring
