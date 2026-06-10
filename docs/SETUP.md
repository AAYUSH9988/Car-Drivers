# Local Development Setup

## Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Git**

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Car-Drivers
```

## 2. Install Dependencies

Open three separate terminals:

### Terminal 1 — Backend (TypeScript)

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

### Terminal 2 — Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Terminal 3 — Admin

```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

## 3. Environment Variables

### `server/.env`

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/gopilot
JWT_SECRET=your-32-char-minimum-jwt-secret-here-change-this
JWT_REFRESH_SECRET=another-32-char-minimum-secret-here-change-this
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_secret
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
BREVO_API_KEY=your_key
BREVO_FROM_EMAIL=noreply@gopilot.app
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
ADMIN_SECRET=a-secret-for-seeding-admin-accounts
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:4000/api
```

### `admin/.env`

```env
VITE_API_URL=http://localhost:4000/api
```

## 4. MongoDB Setup

### Option A: Local MongoDB

```bash
# macOS with Homebrew
brew services start mongodb-community
```

Default URI: `mongodb://localhost:27017/gopilot`

### Option B: MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP
3. Copy the connection string into `MONGO_URI`

## 5. Verify Everything Works

| Service | URL | Expected |
|---------|-----|----------|
| Backend | `http://localhost:4000/api/health` | `{"success":true}` |
| Frontend | `http://localhost:5173` | Home page loads |
| Admin | `http://localhost:5174` | Admin login page |

## 6. Create an Admin Account

1. Register a user at `http://localhost:5173/register`
2. Promote to admin in MongoDB:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

3. Log in at `http://localhost:5174`

## Available Scripts

### Backend (`server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with `ts-node-dev` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/server.js` |

### Frontend & Admin

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |

## Troubleshooting

### Port Already in Use
Change `PORT` in `server/.env`.

### CORS Errors
Ensure `FRONTEND_URL` and `ADMIN_URL` in `server/.env` exactly match your dev URLs (no trailing slash).

### MongoDB Connection Refused
- Local: check `mongod` is running
- Atlas: verify IP whitelist and connection string
