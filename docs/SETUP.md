# Local Development Setup

This guide covers setting up GoPilot for local development.

## Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local or Atlas)
- **Git**

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Car-Drivers
```

## 2. Install Dependencies

Open three separate terminals and run:

### Terminal 1 — Backend

```bash
cd backend
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
# Set VITE_API_URL=http://localhost:4000/api
npm run dev
```

### Terminal 3 — Admin

```bash
cd admin
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:4000/api
npm run dev
```

## 3. Configure Environment Variables

### Backend `.env`

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/gopilot
JWT_SECRET=dev_secret_change_in_production
JWT_REFRESH_SECRET=dev_refresh_change_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_secret
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
BREVO_API_KEY=your_key
BREVO_FROM_EMAIL=noreply@yourdomain.com
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:4000/api
```

### Admin `.env`

```env
VITE_API_URL=http://localhost:4000/api
```

## 4. MongoDB Setup

### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start the MongoDB service
3. The default URI is: `mongodb://localhost:27017/gopilot`

### Option B: MongoDB Atlas (Cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist your IP address
4. Copy the connection string to `MONGO_URI`

## 5. Verify Everything Works

| Service | URL | Expected |
|---------|-----|----------|
| Frontend | `http://localhost:5173` | Home page loads |
| Admin | `http://localhost:5174` | Admin login page |
| API | `http://localhost:4000/api/health` | `{"status":"ok"}` |

## 6. Create an Admin User

1. Register a user at `http://localhost:5173/register`
2. In MongoDB, update the user's role to `admin`:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

3. Log in to the admin panel at `http://localhost:5174`

## Available Scripts

### Backend
- `npm run dev` — Start with nodemon
- `npm start` — Start in production mode
- `npm run build` — (if applicable)

### Frontend
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run preview` — Preview production build

### Admin
- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Troubleshooting

### Port Already in Use
Change the port in the respective `.env` file:
```env
PORT=4001  # for backend
```

### CORS Errors
Ensure `FRONTEND_URL` and `ADMIN_URL` in backend `.env` exactly match your dev server URLs.

### MongoDB Connection Refused
- Check MongoDB is running: `mongod --version`
- Verify the connection string in `.env`
- Check firewall rules

