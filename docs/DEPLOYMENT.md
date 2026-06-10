# Deployment Guide

Deploy GoPilot using **Render** for the backend API and **Vercel** for the frontend and admin panel.

## Prerequisites

- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

## Environment Variables

### Backend (`server/`) — set in Render dashboard

```env
NODE_ENV=production
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your-32-char-minimum-secret
JWT_REFRESH_SECRET=another-32-char-minimum-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@gopilot.app
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
ADMIN_SECRET=your-admin-seed-secret
```

### Frontend & Admin — set in Vercel dashboard

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Backend Deployment (Render)

### Option 1: Render Blueprint (recommended)

1. Push your code to GitHub
2. In Render Dashboard → **New +** → **Blueprint**
3. Connect your GitHub repo — Render detects `server/render.yaml`
4. Fill in the `sync: false` environment variables
5. Click **Create Blueprint**

### Option 2: Manual Docker

1. Render Dashboard → **New +** → **Web Service**
2. Connect GitHub repo, set **Root Directory** to `server`
3. Build: `Dockerfile` handles it
4. Port: `4000`
5. Add all environment variables above

### Health Check

`GET https://your-backend.onrender.com/api/health` → `200 OK`

---

## Frontend Deployment (Vercel)

1. Vercel Dashboard → **Add New Project**
2. Import GitHub repo
3. **Root Directory**: `frontend`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
5. **Deploy**

---

## Admin Deployment (Vercel)

> The admin panel must be a **separate Vercel project** — it is a separate app.

1. Vercel Dashboard → **Add New Project**
2. Import same GitHub repo
3. **Root Directory**: `admin`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
5. **Deploy**

---

## Post-Deployment Checklist

1. Update `FRONTEND_URL` and `ADMIN_URL` in Render with the live Vercel URLs, then redeploy
2. `GET https://your-backend.onrender.com/api/health` returns `200`
3. Register a user on the frontend, then promote to admin in Atlas:
   ```javascript
   db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
   ```
4. Log in to the admin panel and verify dashboard loads

---

## Deployment Summary

| Service | Platform | Config |
|---------|----------|--------|
| Backend API | Render | `server/Dockerfile`, `server/render.yaml` |
| Frontend | Vercel | `frontend/vercel.json` |
| Admin | Vercel | `admin/vercel.json` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS errors | Ensure `FRONTEND_URL` / `ADMIN_URL` match Vercel URLs exactly (include `https://`, no trailing slash) |
| 404 on page refresh | `vercel.json` rewrites handle SPA routing — ensure it is present |
| MongoDB connection fails | Whitelist Render's IPs in Atlas, or allow `0.0.0.0/0` for testing |
| JWT auth fails | Ensure `JWT_SECRET` is at least 32 chars and `NODE_ENV=production` on Render |
| Image upload fails | Verify all `IMAGEKIT_*` vars; `IMAGEKIT_URL_ENDPOINT` must end with `/` |
