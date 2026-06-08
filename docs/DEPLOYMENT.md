# Deployment Guide

This guide covers deploying the GoPilot platform using **Render** for the backend and **Vercel** for the frontend and admin panel.

## Prerequisites

- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB for development)
- Domain name (optional, for custom domains)

---

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Admin Deployment (Vercel)](#admin-deployment-vercel)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Environment Variables

All services require environment variables. Create these before deploying:

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=4000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
BREVO_API_KEY=your_brevo_api_key
BREVO_FROM_EMAIL=noreply@yourdomain.com
RAZORPAY_KEY_ID=your_razorpay_test_or_live_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### Admin (`admin/.env`)

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

> **Security Note**: Never commit `.env` files to Git. Use `.env.example` for templates.

---

## Backend Deployment (Render)

### Option 1: Using Render Blueprint (render.yaml)

1. Push your code to a GitHub repository
2. In Render Dashboard, click **"New +"** > **"Blueprint"**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and auto-configure the service
5. Fill in the `sync: false` environment variables in the Render dashboard
6. Click **Create Blueprint**

### Option 2: Manual Docker Deployment

1. In Render Dashboard, click **"New +"** > **"Web Service"**
2. Connect your GitHub dispatch
3. Select the `backend/Dockerfile` as the build context
4. Set the following:
   - **Build Command**: (leave empty, Dockerfile handles it)
   - **Start Command**: (leave empty, Dockerfile handles it)
   - **Port**: `4000`
5. Add all environment variables from the backend `.env` list
6. Click **Create Web Service**

### Health Check

The backend Dockerfile includes a health check on `/api/health`. Ensure your backend responds to `GET /api/health` with `200 OK`.

### CORS Configuration

Ensure `FRONTEND_URL` and `ADMIN_URL` are set to your Vercel domains so the backend allows CORS from these origins.

---

## Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Set **Root Directory** to `frontend`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
6. Click **Deploy**

### Frontend `vercel.json`

The `frontend/vercel.json` handles SPA routing and security headers:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Admin Deployment (Vercel)

1. In Vercel Dashboard, click **"Add New Project"**
2. Import the same GitHub repository
3. Set **Root Directory** to `admin`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
5. Click **Deploy**

> **Note**: The admin panel must be a **separate Vercel project** because it is a separate React app in a different directory.

---

## Post-Deployment

### Verify Backend
- `GET https://your-backend.onrender.com/api/health` should return `200`
- Test login with a registered user

### Verify Frontend
- Visit `https://your-frontend.vercel.app`
- Browse drivers, attempt a booking

### Verify Admin
- Visit `https://your-admin.vercel.app`
- Log in with an admin account
- Check dashboard stats

### Update `FRONTEND_URL` and `ADMIN_URL`

Once your Vercel deployments have live URLs, go to your **Render Dashboard** > **Backend Service** > **Environment** and update:
- `FRONTEND_URL` to your frontend Vercel URL
- `ADMIN_URL` to your admin Vercel URL

Then redeploy the backend service.

---

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` and `ADMIN_URL` exactly match your Vercel domains (including `https://`)
- Check for trailing slashes

### 404 on Refresh (SPA)
- `vercel.json` handles this with the rewrite rule
- If missing, add the rewrite to route all paths to `index.html`

### MongoDB Connection Fails
- Ensure `MONGO_URI` uses your Atlas cluster (or a production MongoDB instance)
- Whitelist Render's IP or allow access from anywhere (0.0.0.0/0) for testing

### JWT / Auth Issues
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and at least 32 characters
- Check that `NODE_ENV=production` on Render

### Image Upload Fails
- Verify `IMAGEKIT_*` credentials in Render env vars
- Ensure the ImageKit URL endpoint ends with `/`

---

## Deployment Summary

| Service | Platform | File/Config |
|---------|----------|-------------|
| Backend API | Render | `backend/Dockerfile`, `backend/render.yaml` |
| Frontend | Vercel | `frontend/vercel.json` |
| Admin | Vercel | `admin/vercel.json` (create if missing) |

