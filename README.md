# 💇 Smart Salon Appointment System

Ek complete full-stack salon appointment booking website — **HTML, CSS, JavaScript (frontend)** + **Node.js, Express, MongoDB (backend)**.

Customers apne phone/laptop se service choose karke, apne pasand ke stylist ke saath, live available time-slot dekh kar appointment book kar sakte hain. Salon owner ke paas ek admin dashboard hai jahan se wo appointments confirm/complete/cancel kar sakta hai aur services/stylists manage kar sakta hai.

---

## ✨ Features

**Customer website**
- Services browse karo category-wise (Hair / Skin / Nails / Makeup / Spa)
- Stylists dekho unki specialty aur experience ke saath
- 4-step booking flow: Service → Stylist → Date & Time → Details
- **Real-time slot availability** — already booked slots automatically hide ho jaate hain (double-booking possible nahi hai)
- Phone number se apni booking dhoondo aur cancel karo
- Fully responsive (mobile/tablet/desktop)

**Admin dashboard** (`/admin.html`)
- Secure login (JWT-based authentication)
- Overview: aaj ke appointments, pending count, active services/stylists
- Appointments table — date/status se filter karo, status update karo (pending → confirmed → completed), delete karo
- Services CRUD — add/edit/delete services with price & duration
- Stylists CRUD — add/edit/delete stylists with working hours & weekly off day

**Backend**
- REST API (Node.js + Express)
- MongoDB database (Mongoose ODM)
- JWT authentication for admin routes
- Server-side double-booking prevention (overlap detection)
- Passwords bcrypt-hashed

---

## 🗂️ Folder Structure

```
smart-salon-appointment/
├── backend/
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # Mongoose schemas (Service, Stylist, Appointment, Admin)
│   ├── routes/                 # API routes
│   ├── middleware/auth.js      # JWT protect middleware
│   ├── seed.js                 # Starting data (admin + sample services/stylists)
│   ├── server.js               # Express app entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html              # Customer website
│   ├── admin.html              # Admin dashboard
│   ├── css/
│   │   ├── variables.css       # Design tokens (colors, fonts)
│   │   ├── style.css           # Customer site styles
│   │   └── admin.css           # Admin dashboard styles
│   └── js/
│       ├── main.js             # Customer site logic (API calls, booking flow)
│       └── admin.js            # Admin dashboard logic
└── README.md
```

---

## 🚀 Setup Guide (step by step)

### 1. Prerequisites
- [Node.js](https://nodejs.org) (v18 ya usse upar) installed hona chahiye
- MongoDB — do options hain:
  - **Local MongoDB**: [MongoDB Community Server](https://www.mongodb.com/try/download/community) install karo
  - **MongoDB Atlas** (free cloud database): [mongodb.com/atlas](https://www.mongodb.com/atlas) par free account banao aur connection string lo

### 2. Backend setup

```bash
cd backend
npm install
```

`.env.example` ko copy karke `.env` banao:

```bash
cp .env.example .env
```

`.env` file open karke apni MongoDB connection string daalo:

```
MONGO_URI=mongodb://127.0.0.1:27017/smart_salon
PORT=5000
JWT_SECRET=koi_bhi_lamba_random_secret_string
ADMIN_EMAIL=admin@smartsalon.com
ADMIN_PASSWORD=Admin@123
```

> Agar MongoDB Atlas use kar rahe ho, to `MONGO_URI` kuch aisa dikhega:
> `mongodb+srv://username:password@cluster0.mongodb.net/smart_salon`

### 3. Database seed karo (starting data)

Ye command ek admin account aur kuch sample services/stylists database me daal degi:

```bash
npm run seed
```

Terminal me tumhe admin email/password print hoga — ye admin dashboard login ke liye use hoga.

### 4. Server start karo

```bash
npm start
```

Ya development mode me (auto-restart on file change):

```bash
npm run dev
```

Terminal me ye dikhega:
```
✅ MongoDB Connected: ...
🚀 Smart Salon server chal raha hai: http://localhost:5000
```

### 5. Website kholo

- **Customer website**: [http://localhost:5000](http://localhost:5000)
- **Admin dashboard**: [http://localhost:5000/admin](http://localhost:5000/admin)
  (Login: `.env` me diya hua `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

Server backend aur frontend dono ek saath serve karta hai, isliye alag se kuch open karne ki zaroorat nahi.

---

## 🔌 API Endpoints (reference)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Admin login, returns JWT |
| GET | `/api/services` | — | Active services list |
| POST | `/api/services` | Admin | Naya service add |
| PUT | `/api/services/:id` | Admin | Service update |
| DELETE | `/api/services/:id` | Admin | Service delete |
| GET | `/api/stylists` | — | Active stylists list |
| POST | `/api/stylists` | Admin | Naya stylist add |
| PUT | `/api/stylists/:id` | Admin | Stylist update |
| DELETE | `/api/stylists/:id` | Admin | Stylist delete |
| GET | `/api/appointments/availability` | — | Given stylist+service+date → available time slots |
| POST | `/api/appointments` | — | Naya appointment book karo |
| GET | `/api/appointments/lookup?phone=` | — | Phone number se apni bookings dekho |
| PUT | `/api/appointments/:id/cancel` | — | Apni booking cancel karo |
| GET | `/api/appointments` | Admin | Sabhi appointments (filters: `?date=`, `?status=`) |
| PUT | `/api/appointments/:id/status` | Admin | Status update karo |
| DELETE | `/api/appointments/:id` | Admin | Appointment delete |

---

## 🎨 Customization

- **Salon name / branding**: `index.html` aur `admin.html` me "Glow & Co." replace karo apne salon ke naam se
- **Colors**: `frontend/css/variables.css` ke `:root` section me saare colors defined hain — bas hex values badal do
- **Contact info / address**: `index.html` ke footer section me
- **Services/stylists ki starting list**: `backend/seed.js` me edit karo

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (custom, no framework), Vanilla JavaScript (Fetch API)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs for password hashing

---

## ❓ Troubleshooting

- **"MongoDB Connection Error"** → Check karo ki MongoDB chal raha hai (local) ya connection string sahi hai (Atlas). Atlas use kar rahe ho to apna current IP address "Network Access" me whitelist karna na bhoolo.
- **Services/Stylists load nahi ho rahe** → Backend server chal raha hai ya nahi check karo (`npm start`), aur `npm run seed` chala liya hai ya nahi.
- **Admin login fail ho raha hai** → `npm run seed` dobara check karo, terminal me print hua email/password use karo.
