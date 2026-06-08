# Backend Issues & Vulnerabilities Report
> Reviewed against: `backend-patterns`, `api-design`, `coding-standards` skills  
> Date: 2026-06-06  
> Severity: 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## Table of Contents
1. [Port & Configuration Bugs](#1-port--configuration-bugs)
2. [Security Vulnerabilities](#2-security-vulnerabilities)
3. [Broken / Unimplemented Features](#3-broken--unimplemented-features)
4. [API Design Problems](#4-api-design-problems)
5. [Data Model Bugs](#5-data-model-bugs)
6. [Admin Panel Issues](#6-admin-panel-issues)
7. [Code Quality Issues](#7-code-quality-issues)

---

## 1. Port & Configuration Bugs

### 🔴 #1 — Frontend pointed to wrong backend port
**File:** `frontend/.env`  
**Problem:** Frontend `VITE_API_URL` was set to `http://localhost:5000/api` but backend runs on port `4000`. This caused every API call to fail with "Server not responding."  
**Fix Applied:** Updated `frontend/.env` → `VITE_API_URL=http://localhost:4000/api`

---

### 🔴 #2 — CORS origins hardcoded in server.js, ignores .env
**File:** `backend/server.js` lines 45–57  
**Problem:** CORS allowed origins are hardcoded as `localhost:5173` through `localhost:5177`. The `FRONTEND_URL` and `ADMIN_URL` env variables exist in `.env` but are never used for CORS.  
**Impact:** Deploying to staging/production breaks CORS silently.  
**Fix:** Replace hardcoded origins with env vars:
```js
origin: [
  process.env.FRONTEND_URL || 'http://localhost:5175',
  process.env.ADMIN_URL   || 'http://localhost:5174',
],
```

---

### 🟠 #3 — Admin panel `api.js` hardcodes base URL, ignores VITE_API_URL
**File:** `admin/src/services/api.js` line 4  
**Problem:** `const BASE_URL = 'http://localhost:4000/api';` — does not read `import.meta.env.VITE_API_URL`. The admin `.env` variable has no effect.  
**Fix:**
```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
```

---

## 2. Security Vulnerabilities

### 🔴 #4 — Anyone can register as Admin (Privilege Escalation)
**File:** `backend/controllers/authController.js` line 78  
**Problem:**
```js
role: role || 'user'   // role comes directly from req.body!
```
Any client can send `{ "role": "admin" }` in the registration body and get full admin privileges.  
**Fix:** Never accept role from the client on registration:
```js
role: 'user'   // always assign user role on self-registration
```

---

### 🔴 #5 — Mass Assignment in updateBooking (Booking Status Tampering)
**File:** `backend/controllers/bookingController.js` line 216–220  
**Problem:**
```js
booking = await Booking.findByIdAndUpdate(req.params.id, req.body, ...)
```
`req.body` is passed directly. A user can update `status: 'completed'`, `paymentStatus: 'completed'`, `totalAmount: 0`, etc.  
**Fix:** Whitelist only allowed fields:
```js
const { pickupLocation, dropLocation, startTime, endTime } = req.body;
booking = await Booking.findByIdAndUpdate(req.params.id, 
  { pickupLocation, dropLocation, startTime, endTime }, 
  { new: true, runValidators: true }
);
```

---

### 🔴 #6 — Mass Assignment in updateAdminProfile
**File:** `backend/controllers/adminController.js` line 222  
**Problem:**
```js
const admin = await User.findByIdAndUpdate(req.user.id, req.body, ...)
```
Admin can send `{ "role": "superadmin" }` or any other field in the body.  
**Fix:** Whitelist update fields explicitly (name, email, phone only).

---

### 🔴 #7 — NoSQL Injection via exportData filters
**File:** `backend/controllers/adminController.js` lines 887–895  
**Problem:**
```js
const { filters = {} } = req.body;
data = await User.find(filters);   // filters from client passed directly to MongoDB!
```
An attacker can craft MongoDB operators like `{ "$where": "..." }` or `{ "password": { "$ne": "" } }` to extract all passwords.  
**Fix:** Remove the `filters` parameter from `exportData` entirely, or use a fixed safe query.

---

### 🟠 #8 — Mass Assignment in bulkUpdateUsers / bulkUpdateDrivers
**File:** `backend/controllers/adminController.js` lines 664, 694  
**Problem:**
```js
await User.updateMany({ _id: { $in: userIds } }, updateData, ...)
```
`updateData` comes directly from `req.body`. An admin call could set `role: 'admin'` for all users.  
**Fix:** Whitelist allowed fields in `updateData` before calling `updateMany`.

---

### 🟠 #9 — All user data publicly accessible (No auth on user routes)
**File:** `backend/routes/userRoutes.js` lines 21–23  
**Problem:**
```js
router.get('/', getAllUsers);     // No auth — returns all users' names, emails, phones
router.get('/search', searchUsers); // No auth — searchable user database
router.get('/:id', getUser);       // No auth — get any user by ID
```
**Fix:** All three routes must be protected and admin-only:
```js
router.get('/', protect, authorize('admin'), getAllUsers);
```

---

### 🟠 #10 — Error messages leak implementation details in production
**Files:** All controllers  
**Problem:** `message: error.message` is returned to the client. In production this can reveal stack traces, MongoDB query internals, and file paths.  
**Fix:** Catch and map errors; only return `error.message` in development mode:
```js
message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
```

---

### 🟡 #11 — No security headers (missing helmet.js)
**File:** `backend/server.js`  
**Problem:** No HTTP security headers (Content-Security-Policy, X-Frame-Options, X-XSS-Protection, etc.)  
**Fix:**
```js
import helmet from 'helmet';
app.use(helmet());
```

---

### 🟡 #12 — `apiLimiter` defined but never applied
**File:** `backend/middleware/rateLimit.js` + `backend/server.js`  
**Problem:** A 100-req/15min rate limiter was created but never imported or applied to the server. The only rate limiting active is on auth routes (5 attempts per 15 min).  
**Fix:** Import and apply `apiLimiter` globally in `server.js`:
```js
import { apiLimiter } from './middleware/rateLimit.js';
app.use('/api', apiLimiter);
```

---

### 🟡 #13 — No XSS input sanitization
**Problem:** String inputs like `name`, `pickupLocation`, `dropLocation` are stored and returned as-is. If rendered as `innerHTML` on the frontend, this is an XSS vector.  
**Fix:** Use `xss` or `sanitize-html` package, or at minimum `validator.js` to strip HTML from string inputs.

---

### 🔵 #14 — Inconsistent bcrypt salt rounds
**Files:** `authController.js` line 70, `userController.js` line 235  
**Problem:** Registration uses `bcrypt.hash(password, 10)` but password update uses `bcrypt.hash(newPassword, 12)`. Inconsistency, should be a single constant.  
**Fix:** Define `const BCRYPT_ROUNDS = 12;` in a config file and use everywhere.

---

## 3. Broken / Unimplemented Features

### 🔴 #15 — 12 driver controller functions return 501 Not Implemented
**File:** `backend/controllers/driverController.js` lines 243–292  
**Problem:** These functions are all stubs:
- `registerDriver`
- `updateDriver`
- `deleteDriver`
- `updateDriverLocation`
- `updateDriverStatus`
- `toggleDriverAvailability`
- `updateDriverVehicle`
- `getDriverBookings`
- `getDriverEarnings`
- `getDriverRatings`
- `uploadDriverDocuments`
- `verifyDriverDocuments`

All return `501 Not implemented`. Drivers cannot be added to the system through the API.

---

### 🔴 #16 — No admin login endpoint
**File:** `backend/routes/adminRoutes.js`  
**Problem:** The admin panel calls `POST /api/admin/auth/login` but this route does not exist anywhere in the backend. Admin login is impossible through the API.  
**Fix:** Either add an admin login route (that verifies `role === 'admin'`), or use the standard `/api/auth/login` endpoint in the admin panel.

---

### 🟠 #17 — Upload directories don't exist, fileUpload will crash
**File:** `backend/utils/fileUpload.js` lines 9–18  
**Problem:** Multer tries to write to `../assets/drivers` and `../assets/vehicles` which don't exist. Uploading a file crashes the server with `ENOENT: no such file or directory`.  
**Fix:** Create directories at startup or use `mkdirSync`:
```js
import fs from 'fs';
fs.mkdirSync(path.join(__dirname, '../assets/drivers'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '../assets/vehicles'), { recursive: true });
```

---

### 🟠 #18 — Admin `AuthContext` uses mock login, never calls backend
**File:** `admin/src/contexts/AuthContext.jsx` lines 35–49  
**Problem:** Admin login is completely mocked with a fake JWT (`'mock-jwt-token'`). No real API call is made. The admin panel cannot authenticate against the backend.  
**Fix:** Replace mock with a real API call to `/api/auth/login` with role validation.

---

### 🟡 #19 — Validation middleware exists but is never applied to routes
**File:** `backend/middleware/validation.js` + `backend/routes/authRoutes.js`  
**Problem:** `validateUserRegistration` exists and enforces strong passwords (8+ chars, uppercase, lowercase, number), but it is never imported or used in `authRoutes.js`. The actual register endpoint only requires 6 characters.  
**Fix:** Import and apply to register route:
```js
import { validateUserRegistration } from '../middleware/validation.js';
router.post('/register', authLimiter, validateUserRegistration, register);
```

---

### 🟡 #20 — `generateToken.js` utility is dead code
**File:** `backend/utils/generateToken.js`  
**Problem:** This file exists but is never imported. `authController.js` has its own inline `generateToken` function. Duplicate code.  
**Fix:** Delete `utils/generateToken.js` and import the shared version, or vice versa.

---

### 🔵 #21 — `config/db-clean.js` is dead code
**File:** `backend/config/db-clean.js`  
**Problem:** Two DB config files exist. Only `db.js` is used. `db-clean.js` is never imported.  
**Fix:** Delete `db-clean.js`.

---

## 4. API Design Problems

### 🟠 #22 — Route conflict: `/profile/me` masked by `/:id`
**File:** `backend/routes/userRoutes.js` lines 21–26  
**Problem:**
```js
router.get('/', getAllUsers);        // line 21 — public, no auth
router.get('/search', searchUsers); // line 22
router.get('/:id', getUser);        // line 23 — catches ALL /:id
// ...
router.get('/profile/me', protect, getProfile); // line 26 — UNREACHABLE!
```
`GET /api/users/profile` will match `/:id` and look for user with id `"profile"`, not call `getProfile`.  
**Fix:** Move specific routes BEFORE wildcard `/:id`:
```js
router.get('/profile/me', protect, getProfile); // must be BEFORE /:id
router.get('/:id', getUser);
```

---

### 🟠 #23 — deleteBooking missing admin bypass check
**File:** `backend/controllers/bookingController.js` lines 300–303  
**Problem:** Comment says "Admin only" but the code only checks if the requesting user owns the booking:
```js
if (booking.user.toString() !== req.user._id.toString()) {
  return res.status(403).json(...)  // admin also gets 403!
}
```
**Fix:** Add admin bypass:
```js
if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
```

---

### 🟡 #24 — Booking availability not reset on booking update/reschedule
**File:** `backend/controllers/bookingController.js`  
**Problem:** When a booking is cancelled, `driver.isAvailable = true` is set. But when a pending booking is updated (rescheduled), driver availability is never managed.

---

### 🟡 #25 — Mock driver system pollutes production bookings
**File:** `backend/controllers/bookingController.js` lines 30–107  
**Problem:** The system accepts fake numeric IDs (1, 2, 3) and `mock-*` prefixed IDs and stores them as real bookings with `mockDriverId` field. This design creates unreliable data — real production bookings mixed with mock data.  
**Fix:** Remove mock driver support entirely. Seed real test drivers using a seed script instead.

---

### 🔵 #26 — Inconsistent response shapes across controllers
**Problem:** Some controllers return `{ data: ... }`, others return `{ booking: ... }`, `{ bookings: ... }`, or `{ drivers: ... }`. The admin controller and user/driver controllers use different keys for the same resource type.  
**Fix:** Standardize all responses to `{ success, data, message, pagination? }`.

---

## 5. Data Model Bugs

### 🔴 #27 — adminController date mutation bug breaks weekly/monthly stats
**File:** `backend/controllers/adminController.js` lines 9–13  
**Problem:**
```js
const today = new Date();
const startOfDay = new Date(today.setHours(0, 0, 0, 0));   // mutates 'today'
const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // uses mutated 'today'
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);       // uses mutated 'today'!
```
If today is June 1st (Sunday = 0), `setDate(1 - 0)` stays in June. But if today is July 1st (Wednesday = 3), `setDate(1 - 3 = -2)` moves `today` to **June 28** — making `startOfMonth` calculate `June 1` instead of `July 1`.  
**Fix:** Use separate `new Date()` for each calculation.

---

### 🔴 #28 — userController stats aggregate uses wrong field name `$fare`
**File:** `backend/controllers/userController.js` lines 333–334  
**Problem:**
```js
totalSpent: { $sum: '$fare' },
averageFare: { $avg: '$fare' }
```
The Booking model has `totalAmount`, not `fare`. This always returns `0` for spending statistics.  
**Fix:** Replace `'$fare'` with `'$totalAmount'`.

---

### 🟠 #29 — populate() on non-existent Driver fields
**Files:** `userController.js` line 278, `adminController.js` line 299  
**Problem:**
```js
.populate('driver', 'name phone vehicleDetails')  // Driver has no 'name' or 'phone' fields!
.populate('driver', 'name phone licenseNumber')   // Driver.name doesn't exist
```
Driver model has no `name` or `phone` field — those belong to the `User` referenced by `driver.user`. These populate calls silently return `null`.  
**Fix:** Use nested populate:
```js
.populate({ path: 'driver', populate: { path: 'user', select: 'name phone' } })
```

---

### 🟡 #30 — Driver model `pre('save')` throws raw Error (not next(err))
**File:** `backend/models/Driver.js` lines 152–160  
**Problem:**
```js
driverSchema.pre('save', async function(next) {
  if (this.hourlyRate < 0) {
    throw new Error('Hourly rate cannot be negative');  // Should be next(error)
  }
  if (!this.location || ...) {
    throw new Error('Invalid coordinates');  // Should be next(error)
  }
  next();
});
```
Mongoose pre-save hooks with async functions should call `next(error)` or return `Promise.reject()`, not `throw`. Throwing in an async hook can result in unhandled promise rejection warnings.  
**Fix:** Use `next(new Error(...))` instead.

---

### 🟡 #31 — Booking schema missing `bookingReference` field
**File:** `backend/models/Booking.js`  
**Problem:** `helpers.js` exports `generateBookingReference()` but the Booking schema has no `bookingReference` field and no booking reference is ever generated or stored. Users have no way to reference their booking.

---

## 6. Admin Panel Issues

### 🔴 #32 — Admin panel runs on same port as frontend (5175)
**Status:** Fixed — admin `vite.config.js` updated to port `5174`  
**Problem:** Both frontend and admin were configured to run on port `5175`, making it impossible to run both simultaneously.

---

### 🟠 #33 — Admin panel has no real authentication flow
**File:** `admin/src/contexts/AuthContext.jsx`  
**Problem:** Login always succeeds with any email/password combination, stores a mock `'mock-jwt-token'`, and the admin API calls will fail 401 since the token is not a valid JWT.

---

### 🟡 #34 — Admin API endpoints mismatch backend routes
**File:** `admin/src/services/api.js`  
**Problem:**
- Admin calls `GET /admin/dashboard/summary` but backend has `GET /admin/dashboard/stats`
- Admin calls `GET /admin/dashboard/recent-bookings` but backend has `GET /admin/bookings`
- Admin calls `GET /admin/dashboard/revenue` but backend has no such route
- Admin calls `GET /admin/dashboard/user-growth` but backend has no such route

---

## 7. Code Quality Issues

### 🟡 #35 — Duplicate auth middleware files
**Files:** `backend/middleware/auth.js` and `backend/middleware/authMiddleware.js`  
**Problem:** Two files exist for auth middleware. Only `auth.js` is used.  
**Fix:** Delete `authMiddleware.js` if it's unused.

---

### 🟡 #36 — `authController.js` has its own `generateToken`, duplicating `utils/generateToken.js`
**Problem:** Two implementations of the same JWT generation function exist. If one is updated (e.g., adding `jwtid` claims), the other won't be.

---

### 🔵 #37 — Windows file paths in comments
**Files:** Multiple files  
**Problem:** Comments reference `d:/VS CODE/Car Driver/backend/...` — Windows absolute paths. These are harmless but noisy and confusing on other OSes.

---

## Summary Table

| # | Severity | Category | Status | Issue |
|---|----------|----------|--------|-------|
| 1 | 🔴 | Config | ✅ Fixed | Frontend port mismatch (was 5000, backend is 4000) |
| 2 | 🔴 | Config | ✅ Fixed | CORS hardcoded, ignores .env FRONTEND_URL/ADMIN_URL |
| 3 | 🟠 | Config | ✅ Fixed | Admin api.js hardcodes base URL, ignores VITE_API_URL |
| 4 | 🔴 | Security | ✅ Fixed | Anyone can register as admin via `role` in request body |
| 5 | 🔴 | Security | ✅ Fixed | Mass assignment in updateBooking — status/amount tampering |
| 6 | 🔴 | Security | ✅ Fixed | Mass assignment in updateAdminProfile |
| 7 | 🔴 | Security | ✅ Fixed | NoSQL injection in exportData via unvalidated `filters` |
| 8 | 🟠 | Security | ✅ Fixed | Mass assignment in bulkUpdateUsers/Drivers |
| 9 | 🟠 | Security | ✅ Fixed | User list/search/detail endpoints are public (no auth) |
| 10 | 🟠 | Security | ✅ Fixed | error.message leaked to client in production |
| 11 | 🟡 | Security | ✅ Fixed | No helmet.js security headers |
| 12 | 🟡 | Security | ✅ Fixed | apiLimiter defined but never applied |
| 13 | 🟡 | Security | ✅ Fixed | No XSS/NoSQL input sanitization |
| 14 | 🔵 | Security | ✅ Fixed | Inconsistent bcrypt salt rounds (10 vs 12) |
| 15 | 🔴 | Broken | ✅ Fixed | 12 driver functions all return 501 Not Implemented |
| 16 | 🔴 | Broken | ✅ Fixed | Admin login endpoint did not exist |
| 17 | 🟠 | Broken | ✅ Fixed | File upload crashes — upload directories don't exist |
| 18 | 🟠 | Broken | ✅ Fixed | Admin AuthContext uses mock login, never hits backend |
| 19 | 🟡 | Broken | ✅ Fixed | Validation middleware exists but never applied to routes |
| 20 | 🟡 | Broken | ✅ Fixed | generateToken.js was dead code |
| 21 | 🔵 | Broken | ✅ Fixed | db-clean.js was dead code |
| 22 | 🟠 | API | ✅ Fixed | `/profile/me` route unreachable, masked by `/:id` |
| 23 | 🟠 | API | ✅ Fixed | deleteBooking missing admin bypass |
| 24 | 🟡 | API | ✅ Fixed | Driver availability not managed on booking update |
| 25 | 🟡 | API | ✅ Fixed | Mock driver system removed |
| 26 | 🔵 | API | ✅ Fixed | Inconsistent response shapes standardized |
| 27 | 🔴 | Data | ✅ Fixed | Date mutation bug breaks dashboard stats |
| 28 | 🔴 | Data | ✅ Fixed | User stats use `$fare` but model field is `totalAmount` |
| 29 | 🟠 | Data | ✅ Fixed | populate() on non-existent Driver.name / Driver.phone |
| 30 | 🟡 | Data | ✅ Fixed | Driver pre-save hook uses `throw` instead of `next(err)` |
| 31 | 🟡 | Data | ✅ Fixed | Booking schema missing `bookingReference` field |
| 32 | 🔴 | Admin | ✅ Fixed | Frontend/Admin port conflict |
| 33 | 🟠 | Admin | ✅ Fixed | Admin has no real authentication flow |
| 34 | 🟡 | Admin | ✅ Fixed | Admin API endpoint names mismatch backend routes |
| 35 | 🟡 | Code | ✅ Fixed | Duplicate auth middleware files |
| 36 | 🟡 | Code | ✅ Fixed | Duplicate generateToken implementations |
| 37 | 🔵 | Code | ✅ Fixed | Windows file paths in comments |

**Fixed: 37 / 37 original issues ✅**

> **Re-audit 2026-06-08:** All 37 original issues confirmed fixed in code.  
> Stack updates since original audit: **ImageKit** replaces Cloudinary for file storage; **Brevo** API replaces SMTP for email; refresh token + email verification fully implemented.

---

## All Issues Resolved

| # | Status | Fix |
|---|--------|-----|
| 2 | ✅ | CORS now reads `FRONTEND_URL` / `ADMIN_URL` from `.env` |
| 10 | ✅ | `error.message` gated behind `NODE_ENV === 'development'` in all controllers |
| 11 | ✅ | `helmet` installed and applied in `server.js` |
| 12 | ✅ | `apiLimiter` applied globally at `/api` in `server.js` |
| 13 | ✅ | `express-mongo-sanitize` strips `$`/`.` operators from all request data |
| 14 | ✅ | `BCRYPT_ROUNDS = 12` constant used everywhere |
| 15 | ✅ | All 12 driver functions fully implemented in `driverController.js` |
| 16 | ✅ | Admin panel now calls `/api/auth/login` with role check |
| 19 | ✅ | `validateUserRegistration` applied to `/api/auth/register` |
| 20 | ✅ | `utils/generateToken.js` is now the single source (inline duplicate removed) |
| 21 | ✅ | `config/db-clean.js` deleted |
| 24 | ✅ | `updateBooking` checks for driver time-slot conflicts on reschedule |
| 25 | ✅ | Mock driver system removed; real MongoDB ObjectId required for all bookings |
| 26 | ✅ | All endpoints now return `{ success, data, message, pagination? }` |
| 30 | ✅ | Driver `pre('save')` hook uses `next(err)` instead of `throw` |
| 31 | ✅ | `bookingReference` field added to Booking schema with auto-generation |
| 34 | ✅ | Admin `dashboardAPI` calls aligned to actual backend routes |
| 35 | ✅ | `middleware/authMiddleware.js` deleted |
| 36 | ✅ | Duplicate `generateToken` removed from `authController.js` |
| 37 | ✅ | Windows file path comments removed |

### Note: Creating the first admin account
Since `role` is no longer accepted from the registration form, the first admin must be created directly in MongoDB Atlas:
```js
// In MongoDB Atlas shell or Compass:
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
