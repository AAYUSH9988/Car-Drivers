# GoPilot — Backend Audit & Production Deployment Guide

> **Status:** Functionally complete after fixes — needs production hardening  
> **Stack:** Node.js 18+ · Express 4 · MongoDB/Mongoose 7 · ES Modules  
> **Deploy Target:** Render (Docker container)  
> **Date:** 2026-06-06

---

## Table of Contents

1. [Current State Summary](#1-current-state-summary)
2. [Security Audit](#2-security-audit)
3. [Performance Audit](#3-performance-audit)
4. [MongoDB Optimization](#4-mongodb-optimization)
5. [API Design Gaps](#5-api-design-gaps)
6. [Docker Setup](#6-docker-setup)
7. [Render Deployment Guide](#7-render-deployment-guide)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Production Checklist](#9-production-checklist)

---

## 1. Current State Summary

### What Was Fixed (Previous Session)

All 37 issues from the original audit were resolved:

- ✅ Helmet, mongoSanitize, express-rate-limit added to `server.js`
- ✅ CORS reads from `.env` (`FRONTEND_URL`, `ADMIN_URL`)
- ✅ Auth controller rewrote — bcrypt rounds=12, `isDev` error gating, role hardcoded
- ✅ All 12 driver controller stub functions implemented
- ✅ Mock driver system removed from booking controller
- ✅ Admin controller date mutation bug fixed, injection vectors patched
- ✅ User routes properly authenticated and ordered
- ✅ Token generation centralized in `utils/generateToken.js`
- ✅ `Driver.js` pre-save hook fixed (was throwing instead of calling `next(err)`)
- ✅ Booking model — bookingReference added, driver field made required
- ✅ Admin `AuthContext.jsx` now calls real API
- ✅ Admin `api.js` all endpoints corrected

### Remaining Production Gaps (Not Yet Fixed)

| Gap | Risk | Priority |
|---|---|---|
| File uploads use local disk (`Multer diskStorage`) | Files wiped on every Render deploy (ephemeral filesystem) | 🔴 Critical |
| No refresh token — JWT expires and user is silently logged out | Poor UX + security gap | 🟠 High |
| No email verification on registration | Fake accounts, spam | 🟠 High |
| No admin account creation mechanism | Can only create admin via direct MongoDB edit | 🟠 High |
| No response compression (`compression` middleware) | Slow API responses on slow networks | 🟡 Medium |
| No request logging (`morgan`) | Can't debug production issues | 🟡 Medium |
| No health check endpoint includes DB latency | Render health checks may miss DB failures | 🟡 Medium |
| `express.json({ limit: '10kb' })` — too small for file metadata requests | Could break legitimate requests | 🟡 Medium |
| No graceful shutdown handler | Active requests killed abruptly on Render restart | 🟡 Medium |
| No API versioning (`/api/v1/`) | Breaking changes affect all clients simultaneously | 🔵 Low |

---

## 2. Security Audit

### Applied Security (Good)

```
✅ helmet()                    — 15 HTTP security headers set
✅ express-mongo-sanitize()    — strips $operator keys from req.body/params
✅ express-rate-limit          — global 100 req/15min, auth 5 req/15min
✅ bcrypt rounds = 12          — strong password hashing
✅ JWT in Authorization header — not in cookies (avoids CSRF)
✅ Role-based auth middleware   — protect() + authorize('admin')
✅ Mass assignment prevented   — updateData fields deleted before DB write
✅ isDev error gating          — stack traces never sent in production
✅ CORS whitelist              — only FRONTEND_URL and ADMIN_URL allowed
✅ body limit 10kb             — protects against large payload attacks
```

### Remaining Security Issues

**S1 — No Rate Limiting on Password Updates**  
`PUT /api/users/:id/password` is only rate-limited by the global limiter (100 req/15min). A targeted brute-force on password updates is still possible.  
Fix: Apply `authLimiter` to that route.

**S2 — JWT Secret Minimum Length Not Enforced**  
`JWT_SECRET` from `.env` is used directly without length validation. A weak secret (e.g., `"secret123"`) would make tokens forgeable.  
Fix: Add startup check:
```js
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters');
  process.exit(1);
}
```

**S3 — File Upload — No File Type Validation**  
`fileUpload.js` saves files from `req.file.path` (Multer). No MIME type checking — a user could upload a `.js` file renamed as `.jpg`.  
Fix: Add `fileFilter` to Multer config to validate MIME type with `file-type` package.

**S4 — bankDetails Stored in Plain Text**  
`Driver.js` stores `accountNumber`, `ifscCode` in plain text in MongoDB.  
Fix: Encrypt sensitive bank fields at rest, or better: use a payment provider (Razorpay/Stripe) and never store raw bank details.

**S5 — No HTTPS Enforcement**  
In production, all traffic should be HTTPS-only. Render provides this automatically, but the app should set:
```js
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});
```

**S6 — Missing `SameSite` on Cookies**  
`cookie-parser` is used but cookies (if any) don't set `SameSite=Strict`.

---

## 3. Performance Audit

### Missing Middleware

**Compression** — All API responses are sent uncompressed. For a list of 50 drivers, that's 3-5x more data than necessary.
```js
// Add to server.js (before routes)
import compression from 'compression';
app.use(compression());
// npm install compression
```

**Morgan Request Logging** — No way to see slow requests in production.
```js
import morgan from 'morgan';
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Apache format — good for log aggregators
} else {
  app.use(morgan('dev'));
}
// npm install morgan
```

### N+1 Query Problems

| Endpoint | Issue | Fix |
|---|---|---|
| `GET /api/bookings` | Populates `driver.user` individually for each booking | Use `populate` with field selection to limit data |
| `GET /api/admin/bookings` | Same populate issue at scale | Add pagination early, limit to 20/page max |
| `GET /api/drivers` + ratings | Rating calculated from Booking aggregate for each driver | Pre-compute and cache in Driver document |

### Caching Opportunities (No Cache Currently)

| Data | Suggested Cache | TTL |
|---|---|---|
| Dashboard stats (`/admin/dashboard/stats`) | Redis or in-memory | 5 minutes |
| Available drivers list | In-memory (small data) | 30 seconds |
| Driver profile (public) | Redis | 10 minutes |

For Render free tier, in-memory caching with `node-cache` is good enough:
```bash
npm install node-cache
```

```js
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 300 }); // 5 min default

// In adminController getDashboardStats:
const cacheKey = 'dashboard_stats';
const cached = cache.get(cacheKey);
if (cached) return res.json({ success: true, data: cached });
// ... fetch data ...
cache.set(cacheKey, data);
```

---

## 4. MongoDB Optimization

### Current Indexes (from models)

```js
// Driver.js — Good
driverSchema.index({ location: '2dsphere' });
driverSchema.index({ user: 1 });
driverSchema.index({ licenseNumber: 1 });
driverSchema.index({ isAvailable: 1 });
driverSchema.index({ status: 1 });

// Booking.js — Good (added in previous session)
bookingSchema.index({ user: 1 });
bookingSchema.index({ driver: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });
```

### Missing Indexes

**User.js — Add these:**
```js
userSchema.index({ email: 1 }, { unique: true }); // for login lookup
userSchema.index({ role: 1 });                     // for admin filtering
userSchema.index({ createdAt: -1 });               // for admin user list sorting
```

**Booking.js — Compound indexes for common queries:**
```js
bookingSchema.index({ user: 1, status: 1 });      // getUserBookings filtered by status
bookingSchema.index({ driver: 1, status: 1 });    // getDriverBookings filtered
bookingSchema.index({ driver: 1, startTime: 1 }); // time-slot conflict check
bookingSchema.index({ status: 1, createdAt: -1 }); // admin bookings dashboard
```

### Query Optimization Issues

**Issue 1 — `getAllUsers` uses regex search without index**  
```js
// Current — full collection scan on name/email/phone
{ $or: [
  { name: { $regex: search, $options: 'i' } },
  { email: { $regex: search, $options: 'i' } },
]}
```
Fix: For now, add a text index: `userSchema.index({ name: 'text', email: 'text' })`  
Long-term: MongoDB Atlas Search with fuzzy matching.

**Issue 2 — `getUserStats` aggregate runs without time filter**  
The monthly trends aggregate scans ALL bookings for a user with no date filter.  
Fix: Add `{ $match: { createdAt: { $gte: oneYearAgo } } }` to the aggregate pipeline.

**Issue 3 — `exportData` in adminController loads entire collection**  
```js
// This is a memory bomb with large datasets
const data = await Model.find({}).lean();
```
Fix: Use cursor-based streaming:
```js
const cursor = Model.find({}).lean().cursor();
res.setHeader('Content-Type', 'application/json');
res.write('[');
let first = true;
for await (const doc of cursor) {
  if (!first) res.write(',');
  res.write(JSON.stringify(doc));
  first = false;
}
res.write(']');
res.end();
```

### Schema Improvements

**Driver.js — `bankDetails` should not be returned by default**
```js
bankDetails: {
  accountHolder: { type: String, select: false },
  accountNumber: { type: String, select: false },
  bankName: { type: String, select: false },
  ifscCode: { type: String, select: false }
}
```

**Booking.js — Add `totalAmount` default validation**
```js
totalAmount: {
  type: Number,
  required: true,
  min: [0, 'Total amount cannot be negative']
}
```

---

## 5. API Design Gaps

### Missing Endpoints

| Endpoint | Description | Priority |
|---|---|---|
| `GET /api/drivers/available` | Filter available drivers by location/date/vehicle type | 🔴 Critical — core product |
| `POST /api/bookings/:id/review` | Submit rating + review after trip completion | 🔴 Critical |
| `GET /api/auth/refresh` | Refresh JWT using a refresh token | 🟠 High |
| `POST /api/auth/forgot-password` | Trigger password reset email | 🟠 High |
| `PUT /api/auth/reset-password/:token` | Complete password reset | 🟠 High |
| `POST /api/auth/verify-email/:token` | Email verification after registration | 🟠 High |
| `GET /api/drivers/:id/availability` | Check driver's availability for a time range | 🟠 High |
| `GET /api/bookings/track/:id` | Real-time booking status tracking | 🟡 Medium |
| `GET /api/users/:id/notifications` | User notifications list | 🟡 Medium |

### Response Inconsistencies

Most endpoints now follow `{ success, data, message }` but some edge cases leak extra keys. Standardize:
```js
// Always use this shape:
{
  "success": true,
  "data": {},          // or null
  "message": "...",    // optional on success
  "pagination": {}     // only on list endpoints
}

// Error shape:
{
  "success": false,
  "message": "Human-readable error",
  "errors": []         // only on validation errors
}
```

### API Versioning

Add versioning prefix now before public launch. Change:
```
/api/auth/login      →  /api/v1/auth/login
/api/drivers         →  /api/v1/drivers
```

In `server.js`:
```js
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
// etc.
```

---

## 6. Docker Setup

### `Dockerfile` (create at `backend/Dockerfile`)

```dockerfile
# Build stage
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies first (separate layer for caching)
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY . .

# Remove dev files
RUN rm -rf .env.example *.md

# Runtime stage
FROM node:20-alpine AS runtime

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

WORKDIR /app

# Copy from build stage
COPY --from=base --chown=nodeuser:nodejs /app .

USER nodeuser

EXPOSE 4000

ENV NODE_ENV=production

# Health check for Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
```

### `.dockerignore` (create at `backend/.dockerignore`)

```
node_modules
.env
.env.*
*.md
.git
.gitignore
assets/drivers
assets/vehicles
```

### Test Docker Locally

```bash
cd backend
docker build -t gopilot-backend .
docker run -p 4000:4000 \
  -e MONGO_URI="your_atlas_uri" \
  -e JWT_SECRET="your_secret" \
  -e NODE_ENV="production" \
  -e FRONTEND_URL="http://localhost:5175" \
  -e ADMIN_URL="http://localhost:5174" \
  gopilot-backend
```

---

## 7. Render Deployment Guide

### Step 1 — Push Code to GitHub

Make sure your backend code is in a GitHub repository with the `Dockerfile` in the `backend/` directory.

### Step 2 — Create New Web Service on Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory**: `backend`
4. Set **Environment**: Docker
5. Set **Dockerfile Path**: `./Dockerfile`
6. Set **Instance Type**: Free (or Starter for always-on)

### Step 3 — Set Environment Variables on Render

In Render dashboard → Environment → Add these variables:

```
NODE_ENV          = production
PORT              = 4000
MONGO_URI         = mongodb+srv://user:pass@cluster.mongodb.net/carDriver-1
JWT_SECRET        = <minimum 32 char random string>
JWT_EXPIRE        = 7d
FRONTEND_URL      = https://your-frontend.vercel.app
ADMIN_URL         = https://your-admin.vercel.app
```

### Step 4 — render.yaml (Infrastructure as Code)

Create `backend/render.yaml` for reproducible deployments:

```yaml
services:
  - type: web
    name: gopilot-backend
    env: docker
    rootDir: backend
    dockerfilePath: ./Dockerfile
    plan: free
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: MONGO_URI
        sync: false   # Set manually in dashboard (sensitive)
      - key: JWT_SECRET
        sync: false   # Set manually in dashboard (sensitive)
      - key: JWT_EXPIRE
        value: 7d
      - key: FRONTEND_URL
        sync: false
      - key: ADMIN_URL
        sync: false
    autoDeploy: true
```

### Step 5 — Fix File Uploads for Render

Render's filesystem is **ephemeral** — files stored locally are lost on restart/redeploy. Move file storage to Cloudinary (free tier):

```bash
npm install cloudinary multer-storage-cloudinary
```

```js
// utils/fileUpload.js — replace diskStorage with Cloudinary
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const driverDocStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'gopilot/driver-docs', allowed_formats: ['jpg', 'png', 'pdf'] }
});

export const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'gopilot/profiles', allowed_formats: ['jpg', 'png'], transformation: [{ width: 400, crop: 'limit' }] }
});
```

Add Cloudinary environment variables:
```
CLOUDINARY_CLOUD_NAME = your_cloud_name
CLOUDINARY_API_KEY    = your_api_key
CLOUDINARY_API_SECRET = your_api_secret
```

### Render Free Tier Limitations

| Limitation | Impact | Workaround |
|---|---|---|
| Sleeps after 15 min inactivity | First request after sleep is slow (~30s) | Use a cron ping service (UptimeRobot free) or upgrade to Starter ($7/mo) |
| 512MB RAM | Fine for this app | Monitor in Render dashboard |
| Ephemeral disk | Files lost on restart | Use Cloudinary (critical fix above) |
| 100 GB bandwidth/month | Enough for early stage | Monitor |

---

## 8. Environment Variables Reference

### `backend/.env` — All Variables

```bash
# Server
NODE_ENV=development                    # development | production
PORT=4000

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/carDriver-1

# Auth
JWT_SECRET=your-super-secret-min-32-chars-random-string
JWT_EXPIRE=7d

# CORS Origins
FRONTEND_URL=http://localhost:5175
ADMIN_URL=http://localhost:5174

# File Storage (Cloudinary — for production)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (for future password reset / verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GoPilot <noreply@gopilot.app>

# Admin seed (for initial admin account creation)
ADMIN_SEED_EMAIL=admin@gopilot.app
ADMIN_SEED_PASSWORD=ChangeMe_Immediately_123!
```

---

## 9. Production Checklist

### Before First Deploy

- [ ] `JWT_SECRET` is at least 32 random characters (use `openssl rand -base64 32`)
- [ ] `NODE_ENV=production` set on Render
- [ ] `MONGO_URI` points to MongoDB Atlas (not localhost)
- [ ] MongoDB Atlas Network Access: Add Render IP or allow `0.0.0.0/0` for free tier
- [ ] Cloudinary account created, credentials added
- [ ] `FRONTEND_URL` and `ADMIN_URL` set to actual Vercel domains
- [ ] Dockerfile builds successfully locally (`docker build -t test .`)
- [ ] `/api/health` returns 200 with DB status
- [ ] `render.yaml` committed to repo

### After First Deploy

- [ ] Test register + login flow end-to-end
- [ ] Test driver list endpoint
- [ ] Test booking creation
- [ ] Test admin login and dashboard stats
- [ ] Check Render logs for any startup errors
- [ ] Set up UptimeRobot ping to prevent free tier sleep
- [ ] Set up MongoDB Atlas alerts for connection failures

### Security Before Going Public

- [ ] Run `npm audit` and fix critical vulnerabilities
- [ ] Review CORS origins — remove `localhost` from production `.env`
- [ ] Set up MongoDB Atlas IP allowlist (restrict to Render IPs if possible)
- [ ] Enable MongoDB Atlas monitoring and alerts
- [ ] Consider rate limit values — current 100/15min may need tuning based on expected traffic
