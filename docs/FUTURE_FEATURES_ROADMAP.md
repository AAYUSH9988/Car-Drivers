# GoPilot — Features Roadmap

> **Goal:** Transform GoPilot from a basic CRUD app into a standout public product  
> **Approach:** Features ordered by impact-to-effort ratio  
> **Date:** 2026-06-06

---

## Table of Contents

1. [Core Missing Features (Pre-Launch Required)](#1-core-missing-features-pre-launch-required)
2. [Standout Features (Differentiation)](#2-standout-features-differentiation)
3. [Trust & Safety Features](#3-trust--safety-features)
4. [Monetization Features](#4-monetization-features)
5. [Driver-Side Features](#5-driver-side-features)
6. [Communication Features](#6-communication-features)
7. [Analytics & Intelligence](#7-analytics--intelligence)
8. [Future Vision (V2+)](#8-future-vision-v2)
9. [Implementation Priority Matrix](#9-implementation-priority-matrix)

---

## 1. Core Missing Features (Pre-Launch Required)

These are not "nice to haves" — the product cannot launch without them.

---

### F1 — Working Booking Flow

**What's Missing:** The entire booking flow is broken. Users can see drivers but cannot book one.

**What to Build:**
1. Driver detail page → "Book This Driver" button
2. Booking form modal: pickup address, drop address, date, time, vehicle type, notes
3. Price estimate calculation (hourlyRate × estimated hours)
4. Booking confirmation screen with reference number
5. Booking confirmation email (to user and driver)

**API Endpoints Needed:**
- `POST /api/bookings` — create booking (exists, needs frontend)
- `GET /api/drivers/:id/availability` — check availability (missing)

**User Flow:**
```
Driver Card → View Profile → "Book Now" 
→ Booking Form (address, date, time)
→ Price Summary (₹450/hr × 3hrs = ₹1350)
→ Confirm Booking
→ Booking Reference: BK-1234567890
→ Email confirmation sent
→ Driver notified
```

---

### F2 — User Dashboard (Booking History)

**What's Missing:** `pages/Dashboard.jsx` is empty — just "Welcome to your dashboard".

**What to Build:**
1. Upcoming bookings (with cancel option)
2. Past bookings list with status
3. Booking details view (driver info, route, amount paid)
4. Re-book from history (one click)
5. Profile edit (name, phone, photo)

---

### F3 — Password Reset Flow

**What's Missing:** No "Forgot Password" link, no email reset.

**What to Build:**
- Frontend: "Forgot Password" link on login page → email input form
- Backend: `POST /api/auth/forgot-password` → generate reset token → send email
- Frontend: Reset password form (`/reset-password/:token`)
- Backend: `PUT /api/auth/reset-password/:token` → verify token → update password
- Email template: Simple HTML email with reset link (valid 1 hour)

**Required:** Email service — Nodemailer + Gmail App Password (free) or Resend.com (free tier)

---

### F4 — Email Verification on Registration

**What's Missing:** Anyone can register with a fake email address.

**What to Build:**
- After registration, send verification email
- User must click link before their account is "verified"
- Unverified users can browse but see a banner asking them to verify
- `User.js` needs `isEmailVerified: Boolean` field

---

### F5 — Driver Search / Filter

**What's Missing:** `/api/drivers/available` endpoint doesn't exist. Users can't filter by location, vehicle type, or date.

**What to Build (Backend):**
```
GET /api/drivers/available
?location=Mumbai
&vehicleType=sedan
&date=2026-06-10
&startTime=09:00
&endTime=13:00
&maxRate=500
```

**What to Build (Frontend):**
- Filter sidebar on Drivers page: location, vehicle type, date range, max price, min rating
- Sort options: lowest price, highest rated, most trips

---

## 2. Standout Features (Differentiation)

These features make GoPilot memorable and different from generic car booking apps.

---

### F6 — Driver Personality Profiles ⭐

**Concept:** Instead of a generic grid of drivers, give each driver a rich profile that feels human.

**What's Unique:** Most platforms show: photo, rating, price. GoPilot shows:
- Short bio written by the driver ("10 years experience, fluent in 3 languages, I know every shortcut in Mumbai")
- Specialty tags: `#AirportSpecialist` `#NightDriving` `#KidsWelcome` `#MusicLover`
- Languages spoken with proficiency level
- Vehicle showcase: photos of the actual car (interior + exterior)
- Fun stat: "Driven the equivalent of 3x around Earth"
- Driver's music preference / will play what you want
- "Ask me about:" section (local food spots, city tours, etc.)

**Why it Works:** This creates emotional connection. Users pick drivers they feel comfortable with, not just the cheapest. This also makes GoPilot great for tourists.

**Implementation:**
- Add `bio`, `specialties: [String]`, `vehiclePhotos: [String]`, `funFacts` to Driver model
- Build a rich DriverProfile page component
- Admin can approve/edit driver bios

---

### F7 — Smart Fare Estimator ⭐

**Concept:** Before booking, show a real-time fare estimate with breakdown.

**What's Unique:** Uber shows a single number. GoPilot shows:
```
┌────────────────────────────────────────────┐
│  Fare Estimate for Ravi Kumar               │
│                                            │
│  Base rate:         ₹450/hr                │
│  Estimated time:    ~2.5 hours             │
│  ─────────────────────────────────         │
│  Subtotal:          ₹1,125                 │
│  Night surcharge:   ₹112 (10%)            │
│  Platform fee:      ₹50                   │
│  ─────────────────────────────────         │
│  Total Estimate:    ₹1,287                 │
│                                            │
│  ⚡ Price locked for 10 minutes             │
│  ✓ No hidden charges                       │
└────────────────────────────────────────────┘
```

**Why it Works:** Transparency builds trust. Users hate surprise fees. Showing the breakdown upfront is a strong differentiator.

**Implementation:**
- Add `nightSurcharge`, `weekendSurcharge`, `platformFee` to a PricingConfig model (admin-configurable)
- Fare calculator utility: `calculateFare(driver, startTime, endTime, date)`
- Show estimate in real-time as user adjusts date/time

---

### F8 — Driver Availability Calendar

**Concept:** Each driver has a visual calendar showing their available slots.

**What's Unique:** Instead of "Is this driver available?", users see a weekly calendar with open slots highlighted in green.

```
        Mon  Tue  Wed  Thu  Fri  Sat  Sun
9am     ✅   ✅   ✅   ❌   ✅   ✅   ❌
12pm    ✅   ❌   ✅   ❌   ✅   ✅   ❌
3pm     ❌   ✅   ❌   ✅   ✅   ✅   ✅
6pm     ✅   ✅   ✅   ✅   ✅   ❌   ✅
```

**Why it Works:** Eliminates the frustration of "try booking, get rejected, try another driver". Users see availability upfront and plan ahead.

**Implementation:**
- Backend: `GET /api/drivers/:id/availability?week=2026-06-10`
- Returns busy slots based on existing confirmed bookings + driver's working hours
- Frontend: Simple CSS grid calendar component

---

### F9 — Recurring Bookings / "My Regular Driver"

**Concept:** Users can set up a recurring booking — "Every Monday and Friday at 8am with Ravi".

**Why it Works:** Captures high-value customers (corporate commuters, weekly airport trips). Creates driver loyalty and predictable income for drivers.

**Implementation:**
- Add `recurrenceRule` to Booking model: `{ frequency: 'weekly', days: ['monday', 'friday'], time: '08:00' }`
- Cron job to auto-create bookings 48 hours in advance
- Notify driver and user to confirm
- "Favorite Driver" button on driver profile

---

### F10 — Shareable Trip Link

**Concept:** When a user books a driver, they get a shareable link. Share with family so they know you're safe.

**Example:** `gopilot.app/track/BK-123456` — shows driver's name, vehicle, and estimated arrival.

**Why it Works:** Safety feature that's also a viral growth mechanism. Family members who receive the link discover GoPilot.

**Implementation:**
- Public read-only booking view at `/track/:bookingRef`
- Shows: driver name, vehicle, booking status
- Future: shows real-time GPS (requires WebSockets)

---

### F11 — "City Specialist" Badges

**Concept:** Drivers earn badges based on expertise.

**Examples:**
- 🏆 "Airport Specialist" — completed 100+ airport pickups
- ⭐ "5-Star Driver" — maintained 5.0 for 50+ trips  
- 🌙 "Night Owl" — available after midnight
- 💼 "Corporate Elite" — completed corporate training
- 🗺️ "Local Expert: Mumbai" — 500+ trips in a city

**Why it Works:** Creates a gamification layer for drivers (motivates performance) and helps users filter for expertise.

**Implementation:**
- `badges: [{ type: String, awardedAt: Date }]` on Driver model
- Cron job that checks criteria and awards badges automatically
- Display prominently on driver cards and profile

---

## 3. Trust & Safety Features

---

### F12 — Verified Reviews System

**What to Build:**
- After trip completion, user gets an email prompt to rate the driver (1-5 stars + text review)
- Review only accepted within 48 hours of trip completion
- Reviews are public on driver profile
- Driver can respond to reviews (builds trust, shows professionalism)

**Important:** Only users who actually completed a booking with that driver can review them.

**Backend Needed:**
- `POST /api/bookings/:id/review` — submit rating + review text
- `GET /api/drivers/:id/reviews` — paginated reviews list

---

### F13 — SOS / Emergency Feature

**Concept:** In-app emergency button that sends the user's current location + booking details to an emergency contact.

**Why it's Standout:** No other small booking platform has this. It's a major trust signal especially for solo travelers and women.

**What to Build:**
- Emergency contact field in user profile
- "SOS" button visible during active booking
- On tap: sends SMS/email with "I'm in a GoPilot car with driver [name], vehicle [plate], last location: [GPS link]"

**Backend Needed:**
- `POST /api/bookings/:id/sos` — logs the event + triggers notification
- Twilio or Firebase SMS integration

---

### F14 — Background Check Badge

**Concept:** Show "Background Verified" badge on driver profiles where admin has verified their documents.

**Why it Works:** Pure trust signal. Parents letting their child take a car service will pay more for verified drivers.

**Implementation:**
- Already have `status: 'active'` for verified drivers
- Just need to display it prominently as "Police Verified" or "Document Verified"

---

## 4. Monetization Features

---

### F15 — Platform Commission System

**How it Works:** GoPilot takes 10-15% commission on every booking.

**Backend Changes:**
- Add `platformFee: Number` and `driverEarning: Number` to Booking model
- Admin can configure commission rate in Settings
- Booking creation auto-calculates: `platformFee = totalAmount * commissionRate`

---

### F16 — Subscription / Membership Plans (Future)

**Concept:** Users pay a monthly fee for benefits.

**Plan Ideas:**
- **GoPilot Free** — Standard booking, standard rates
- **GoPilot Pro (₹299/mo)** — Priority driver matching, 5% discount, dedicated support
- **GoPilot Corporate (Custom)** — Invoice billing, multiple seats, company dashboard

**Why it Works:** Creates predictable recurring revenue vs one-time booking fees.

---

### F17 — Corporate Accounts

**Concept:** Companies book drivers for their employees.

**What it Includes:**
- Company account with multiple employee profiles
- Monthly invoice instead of per-booking payment
- Admin dashboard for the company (not the platform admin)
- Booking approval workflow (employee requests → manager approves)

---

## 5. Driver-Side Features

---

### F18 — Driver Mobile App / PWA

**What's Missing:** Drivers currently have no way to accept/reject bookings.

**Minimum Viable Driver App:**
- See incoming booking requests
- Accept or reject within 2 minutes (or auto-assigned)
- View today's schedule
- Navigate to pickup (opens Google Maps / Waze)
- Mark trip as started / completed
- View earnings for today/week/month

**Quick Path:** Build as a PWA (Progressive Web App) — same React codebase, deployed separately, installable on phone.

---

### F19 — Driver Earnings Dashboard

**What's Missing:** Drivers have no visibility into their earnings.

**What to Build:**
- Daily/weekly/monthly earnings summary
- Trip-by-trip earnings breakdown
- "Payout pending" vs "Paid" tracking
- Estimated weekly payout date
- Earnings growth chart

**Backend:** Already exists — `GET /api/drivers/:id/earnings`

---

## 6. Communication Features

---

### F20 — Automated Email Notifications

**Trigger emails for:**

| Event | Email To |
|---|---|
| New registration | User: Welcome + verify email |
| Booking confirmed | User: Booking details + driver info |
| Booking confirmed | Driver: New booking alert |
| Booking cancelled | User + Driver: Cancellation notice |
| Trip completed | User: Rate your driver (with star rating link) |
| Password reset | User: Reset link (valid 1 hour) |
| Driver approved | Driver: Account activated |
| Driver documents rejected | Driver: Reason + re-upload instructions |

**Tech Stack:** Nodemailer + HTML email templates (or Resend.com for better deliverability)

---

### F21 — In-App Notifications (Bell Icon)

**What to Build:**
- Notification center in navbar (bell icon with badge count)
- Notification types: booking update, driver verified, review reminder
- Mark as read / clear all
- Store last 50 notifications per user

**Backend:**
- `Notification` model: `{ user, type, title, body, isRead, link }`
- `GET /api/users/:id/notifications`
- `PATCH /api/notifications/:id/read`

---

### F22 — Driver-User Chat (Future)

**Concept:** Simple in-app messaging after a booking is confirmed, so user can share specific instructions ("I'm at Gate 2 entrance").

**Tech:** Socket.io for real-time messaging. Firebase Realtime Database is easier for MVP.

---

## 7. Analytics & Intelligence

---

### F23 — Driver Matching Algorithm

**Current:** Users browse a list and pick manually.  
**Better:** System suggests "Best Match" drivers based on:

- User's location → nearest available driver
- User's past bookings → preferred vehicle types
- User's rating history → highly-rated driver preference
- Time of day → drivers who work that shift

**Implementation:** Simple scoring function (no ML needed for V1):
```js
const score = (
  (proximity * 0.4) +
  (vehicleMatch * 0.25) +
  (rating * 0.25) +
  (priceMatch * 0.1)
);
```

---

### F24 — Dynamic Pricing (Surge)

**Concept:** Higher prices during peak demand (rush hour, rain, events).

**Why it Works:** Incentivizes more drivers to be available when demand is high.

**Implementation:**
- Track demand metrics (pending bookings in last 30 min per city zone)
- If demand > 2x normal: apply 1.2x-1.5x surge multiplier
- Show "High Demand" banner + adjusted price to users

---

### F25 — Admin Analytics Dashboard

**What to Build:**
- Peak booking hours heatmap
- Revenue per city zone (choropleth map)
- Driver utilization rate (active vs idle)
- Customer retention (returning vs new users)
- Cancellation rate analysis (by driver, by time, by reason)
- Average rating trend over time

**Tech:** Recharts or Victory Charts (lighter than Chart.js)

---

## 8. Future Vision (V2+)

These require significant investment but could make GoPilot dominant:

| Feature | Description | Complexity |
|---|---|---|
| **Real-Time GPS Tracking** | Live map showing driver position during booking | High — needs WebSockets + maps API |
| **Multi-City Expansion** | City-specific driver pools, pricing, and promotions | High — ops + scaling |
| **Driver Referral Program** | Drivers earn ₹500 for each new driver they refer | Medium |
| **Loyalty Points** | Users earn points per booking, redeem for discounts | Medium |
| **Airport Concierge Package** | Bundled service: driver + meet-and-greet + luggage help | Low (product only) |
| **Corporate API** | Enterprise API for travel management software to integrate GoPilot | High |
| **Multi-Language UI** | Hindi, Gujarati, Tamil support for wider India reach | Medium |
| **Insurance Micro-Policy** | ₹20/trip insurance option for passengers | High — insurance partnerships |

---

## 9. Implementation Priority Matrix

### Phase 1 — Launch-Blocker (Build Before Going Live)

| Feature | Effort | Impact |
|---|---|---|
| F1 — Working Booking Flow | Medium | 🔴 Critical |
| F2 — User Dashboard | Small | 🔴 Critical |
| F3 — Password Reset | Small | 🔴 Critical |
| F4 — Email Verification | Small | 🟠 High |
| F5 — Driver Search/Filter | Medium | 🔴 Critical |
| F20 — Email Notifications (basic) | Medium | 🔴 Critical |

### Phase 2 — Growth (First Month After Launch)

| Feature | Effort | Impact |
|---|---|---|
| F6 — Driver Personality Profiles | Small | 🟠 High — differentiator |
| F7 — Smart Fare Estimator | Small | 🟠 High — trust |
| F8 — Availability Calendar | Medium | 🟠 High |
| F12 — Reviews System | Medium | 🟠 High — trust |
| F14 — Background Check Badge | Very Small | 🟠 High — trust |
| F19 — Driver Earnings Dashboard | Small | 🟠 High — driver retention |
| F21 — In-App Notifications | Medium | 🟡 Medium |

### Phase 3 — Differentiation (Month 2-3)

| Feature | Effort | Impact |
|---|---|---|
| F9 — Recurring Bookings | Medium | 🟠 High — retention |
| F10 — Shareable Trip Link | Small | 🟠 High — viral |
| F11 — Driver Badges | Small | 🟡 Medium — gamification |
| F13 — SOS Feature | Medium | 🟠 High — safety |
| F15 — Commission System | Small | 🟠 High — revenue |
| F18 — Driver PWA | Large | 🔴 Critical for ops |
| F23 — Driver Matching | Medium | 🟠 High — UX |

### Phase 4 — Scale (Month 4+)

| Feature | Effort | Impact |
|---|---|---|
| F17 — Corporate Accounts | Large | 🔴 Critical for B2B |
| F24 — Dynamic Pricing | Large | 🟠 High — revenue |
| F25 — Analytics Dashboard | Medium | 🟡 Medium |
| Real-Time GPS Tracking | Very Large | 🟠 High |

---

## Quick Wins (Can Build in 1-2 Days Each)

1. **Shareable booking link** — just a public read-only page for `/track/:ref`
2. **Driver badge display** — just UI, badges awarded manually by admin initially
3. **Fare estimator** — pure frontend calculation with hardcoded rate
4. **Driver specialty tags** — just a string array on the profile, shown as chips
5. **"Re-book" button** in booking history — pre-fills booking form with previous trip details
6. **Cancellation policy banner** — static text shown in booking form
