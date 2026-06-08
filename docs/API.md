# API Documentation

Base URL: `https://your-backend.onrender.com/api`

---

## Authentication

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... }
}
```

---

## Auth Endpoints

### POST `/auth/register`
Register a new user.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+911234567890",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please log in.",
  "data": { ... }
}
```

---

### POST `/auth/login`
Authenticate and get tokens.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "_id": "..."
  },
  "token": "eyJhbGciOiJIUzI1...",
  "refreshToken": "..."
}
```

---

### GET `/auth/me`
Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+911234567890"
  }
}
```

---

### POST `/auth/refresh`
Refresh access token using refresh token.

**Body:**
```json
{
  "refreshToken": "..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1...",
  "refreshToken": "..."
}
```

---

### POST `/auth/logout`
Logout and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

---

### POST `/auth/forgot-password`
Request password reset email.

**Body:**
```json
{
  "email": "john@example.com"
}
```

---

### PUT `/auth/reset-password/:token`
Reset password using token from email.

**Body:**
```json
{
  "password": "newpassword123"
}
```

---

### GET `/auth/verify-email/:token`
Verify email address.

---

## Users

Endpoints for managing users.

### GET `/users`
Get all users (Admin only).

**Query Parameters:**
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10)
- `role` — Filter by role (`user`, `driver`, `admin`)
- `search` — Search by name or email

**Response:**
```json
{
  "success": true,
  "data": [ { ... }, { ... } ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "total": 50
  }
}
```

---

### GET `/users/profile/me`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

---

### PUT `/users/profile/me`
Update current user profile.

**Body:**
```json
{
  "name": "John Updated",
  "phone": "+911111111111"
}
```

---

### GET `/users/:id`
Get user by ID.

---

### PUT `/users/:id`
Update user (Admin only).

---

### DELETE `/users/:id`
Delete user (Admin only).

---

### PUT `/users/:id/password`
Update user password.

**Body:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass123"
}
```

---

### PUT `/users/:id/photo`
Upload profile photo.

**Body:** `multipart/form-data` with `photo` field.

---

### GET `/users/:id/bookings`
Get bookings for a user.

---

### GET `/users/:id/stats`
Get user statistics.

---

## Drivers

Endpoints for driver management.

### GET `/drivers`
Get all drivers with filters.

**Query Parameters:**
- `status` — `pending`, `active`, `rejected`
- `isAvailable` — `true` or `false`
- `page`, `limit` — Pagination
- `search` — Search by name or vehicle

---

### GET `/drivers/:id`
Get driver by ID.

---

### POST `/drivers`
Register a new driver.

**Body:**
```json
{
  "user": "user_id",
  "licenseNumber": "DL1234567890",
  "vehicleModel": "Mercedes S-Class",
  "vehicleType": "luxury",
  "vehicleColor": "Black",
  "vehicleNumber": "MH01AB1234",
  "experience": 5,
  "hourlyRate": 2000,
  "languages": ["English", "Hindi"],
  "preferredLocations": [["Mumbai", "Delhi"]],
  "phone": "+911234567890",
  "address": "123 Main St",
  "bio": "Professional chauffeur with 5+ years experience."
}
```

---

### GET `/drivers/available`
Get all available drivers.

---

### GET `/drivers/search`
Search drivers with query parameters.

---

### GET `/drivers/nearby`
Find nearby drivers using geospatial query.

**Query Parameters:**
- `longitude` — User's longitude
- `latitude` — User's latitude
- `maxDistance` — Maximum distance in meters (default: 5000)

---

### GET `/drivers/:id/availability`
Get driver availability schedule.

---

### GET `/drivers/:id/ratings`
Get driver ratings and reviews.

---

### PATCH `/drivers/:id/status`
Update driver status (Admin only).

**Body:**
```json
{
  "status": "approved"
}
```

---

## Bookings

Endpoints for managing bookings.

### GET `/bookings`
Get all bookings.

**Query Parameters:**
- `page`, `limit` — Pagination
- `status` — Filter by status
- `user`, `driver` — Filter by user/driver ID

---

### POST `/bookings`
Create a new booking.

**Body:**
```json
{
  "driver": "driver_id",
  "pickupLocation": "123 Main St, Mumbai",
  "dropoffLocation": "456 Park Ave, Mumbai",
  "startTime": "2026-06-15T10:00:00.000Z",
  "endTime": "2026-06-15T14:00:00.000Z",
  "totalAmount": 8000,
  "paymentMethod": "online"
}
```

---

### GET `/bookings/:id`
Get booking by ID.

---

### PUT `/bookings/:id`
Update booking.

---

### PATCH `/bookings/:id/cancel`
Cancel a booking.

---

### DELETE `/bookings/:id`
Delete a booking.

---

### POST `/bookings/:id/review`
Add a review to a booking.

**Body:**
```json
{
  "rating": 5,
  "review": "Excellent service!"
}
```

---

## Payments

### POST `/payments/create-order`
Create a Razorpay order.

**Body:**
```json
{
  "amount": 8000,
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_xxx",
    "amount": 800000,
    "currency": "INR"
  }
}
```

---

### POST `/payments/verify`
Verify Razorpay payment signature.

**Body:**
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "..."
}
```

---

### POST `/payments/refund/:bookingId`
Process a refund for a booking.

---

## Admin

All admin endpoints are protected by `authorize('admin')` middleware.

### GET `/admin/dashboard`
Get admin dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalDrivers": 45,
    "totalBookings": 320,
    "totalRevenue": 450000,
    "recentBookings": [ ... ]
  }
}
```

---

### GET `/admin/analytics`
Get detailed analytics data.

---

### GET `/admin/system-info`
Get system information.

---

### PUT `/admin/system-settings`
Update system settings.

---

### GET `/admin/reports`
Generate reports.

---

### POST `/admin/users/bulk-update`
Bulk update users.

---

### POST `/admin/drivers/bulk-update`
Bulk update drivers.

---

### POST `/admin/notifications/bulk`
Send bulk notifications.

---

### POST `/admin/export`
Export data.

