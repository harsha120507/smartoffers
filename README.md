# SmartOffer 🎯
**Premium Time-Slot Booking & Flash-Deal Platform**

SmartOffer lets local businesses (gyms, salons, restaurants, turfs, clinics) publish time-limited flash deals with bookable slots. Customers can browse, filter, and instantly reserve a seat — or join a live waitlist if the slot is full. The admin panel handles offer management, slot scheduling, check-in via QR, and booking analytics.

---

## ✨ Features

### Customer Portal
- Firebase Authentication (Sign Up / Login / Forgot Password)
-  Browse & filter live deals (by category, price, date, availability)
-  Offer image gallery with animated carousel slideshow
-  Real-time countdown timers on every offer card
-  Time-slot selection grouped by Morning / Afternoon / Evening
-  Instant booking with simulated SMS confirmation
-  Skeuomorphic booking ticket with QR code for check-in
-  Print-to-PDF booking pass
-  Automated waitlist — auto-promoted when a confirmed booking cancels
-  Booking history with self-serve cancellation

### Admin Console
-  Live dashboard — KPI cards, booking velocity chart, capacity ring
-  Create / edit / cancel offers with multi-photo management
-  Set a banner image per offer (shown on public portal cards)
-  Add / cancel time slots per offer
-  Bookings manager — search, filter by status, view details
-  Confirm / Complete / Cancel any booking
-  QR check-in scanner (ref-code lookup)
-  Export all bookings to CSV
-  Business profile management
-  Full dark / light mode toggle

---

##  Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + Framer Motion |
| Auth | Firebase Authentication |
| Backend | ASP.NET Core 8 Web API |
| Database | PostgreSQL + Entity Framework Core |
| Icons | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- PostgreSQL 14+
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))

---

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/smartoffer.git
cd smartoffer
```

### 2. Backend Setup (`SmartOffer.API`)

**Copy and fill in the config:**
```bash
cp SmartOffer.API/appsettings.example.json SmartOffer.API/appsettings.json
```
Edit `appsettings.json`:
- `ConnectionStrings.DefaultConnection` → your PostgreSQL connection string
- `Jwt.Key` → any random string ≥ 32 characters
- `Firebase.ProjectId` → your Firebase project ID

**Run migrations & start:**
```bash
cd SmartOffer.API
dotnet ef database update
dotnet run
# API runs at http://localhost:5181
```

### 3. Frontend Setup (`SmartOffer.Web`)

**Copy and fill in Firebase keys:**
```bash
cp SmartOffer.Web/.env.example SmartOffer.Web/.env
```
Edit `.env` with your Firebase web app credentials (found in Firebase Console → Project Settings → Your Apps).

**Install & run:**
```bash
cd SmartOffer.Web
npm install
npm run dev
# App runs at http://localhost:5174
```

### 4. Create the first Admin user

After signing up through the portal, manually update the user role in your database:
```sql
UPDATE "Users" SET "Role" = 'Admin' WHERE "Email" = 'your@email.com';
```

---

## Project Structure

```
hack/
├── SmartOffer.API/          # ASP.NET Core backend
│   ├── Controllers/         # REST API endpoints
│   ├── Models/              # EF Core entity models
│   ├── Data/                # DbContext + migrations
│   └── appsettings.example.json
│
└── SmartOffer.Web/          # React + Vite frontend
    ├── src/
    │   ├── pages/
    │   │   ├── admin/       # Admin Console pages
    │   │   └── public/      # Customer-facing pages
    │   ├── api/             # Axios API client
    │   └── firebase.ts      # Firebase SDK init
    └── .env.example
```

---


