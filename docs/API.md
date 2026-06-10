# API Documentation

Base URL: `https://your-backend.onrender.com/api`

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Response Format

```json
{
  "success": true,
  "data": { ... }
}
```

Paginated responses include a `pagination` key:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

---

## Auth

### `POST /auth/register`

```json
{ "name": "Arjun Sharma", "email": "arjun@example.com", "phone": "+911234567890", "password": "secret123" }
```

### `POST /auth/login`

```json
{ "email": "arjun@example.com", "password": "secret123" }
```

Response includes `token` and `refreshToken`.

### `POST /auth/refresh`

```json
{ "refreshToken": "..." }
```

### `GET /auth/me` — `protected`

Returns current user.

### `PUT /auth/profile` — `protected`

```json
{ "name": "Arjun Sharma", "phone": "+919999999999" }
```

### `POST /auth/logout` — `protected`

### `POST /auth/forgot-password`

```json
{ "email": "arjun@example.com" }
```

### `PUT /auth/reset-password/:token`

```json
{ "password": "newpassword123" }
```

### `GET /auth/verify-email/:token`

---

## Users — `protected`

All `/users` routes require authentication. The authenticated user's identity comes from the JWT — no user ID in the URL.

### `GET /users/profile`
Get current user's profile.

### `GET /users/stats`
Get current user's booking statistics.

**Response:**
```json
{
  "totalBookings": 12,
  "completedBookings": 10,
  "cancelledBookings": 1,
  "totalSpent": 45000
}
```

### `PUT /users/password`
Change password.

```json
{ "currentPassword": "old", "newPassword": "newpass123" }
```

### `PUT /users/profile/photo`
Upload profile photo. `multipart/form-data` with `photo` field.

---

## Drivers

### `GET /drivers`

Query parameters:
- `isAvailable` — `"true"` or `"false"`
- `status` — `pending`, `active`, `suspended`, `inactive`
- `vehicleType` — filter by vehicle type
- `search` — search by name or location
- `page`, `limit` — pagination (default `1`, `10`)

> **Note:** There is no `/drivers/available` or `/drivers/search` route. Use `GET /drivers?isAvailable=true` for available drivers.

### `GET /drivers/:id`
Get driver profile by ID.

### `POST /drivers` — `protected`
Create driver profile.

```json
{
  "licenseNumber": "DL1234567890",
  "vehicleModel": "Mercedes S-Class",
  "vehicleType": "luxury",
  "vehicleColor": "Black",
  "vehicleNumber": "MH01AB1234",
  "experience": 5,
  "hourlyRate": 1500,
  "languages": ["English", "Hindi"]
}
```

---

## Bookings — `protected`

### `GET /bookings`
Get current user's bookings.

### `POST /bookings`

```json
{
  "driver": "driver_id",
  "pickupLocation": "Connaught Place, Delhi",
  "dropoffLocation": "IGI Airport, Delhi",
  "startTime": "2026-06-15T10:00:00.000Z",
  "endTime": "2026-06-15T14:00:00.000Z",
  "totalAmount": 6000,
  "paymentMethod": "online"
}
```

### `GET /bookings/:id`

### `PUT /bookings/:id`

### `PATCH /bookings/:id/cancel`

### `DELETE /bookings/:id`

### `POST /bookings/:id/review`

```json
{ "rating": 5, "review": "Excellent service!" }
```

---

## Payments — `protected`

### `POST /payments/create-order`

```json
{ "amount": 6000, "currency": "INR" }
```

Response includes Razorpay `order_id`.

### `POST /payments/verify`

```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "..."
}
```

### `POST /payments/refund/:bookingId`

---

## Admin — `protected` + `authorize('admin')`

All admin routes live under `/admin/`. Role `admin` is required.

### `GET /admin/dashboard`

```json
{
  "data": {
    "overview": {
      "totalUsers": 150,
      "totalDrivers": 45,
      "totalBookings": 320,
      "pendingBookings": 12,
      "completedBookings": 280
    },
    "revenue": { "total": 450000 },
    "recentBookings": [ ... ]
  }
}
```

### `GET /admin/analytics?type=revenue&period=30`

`type`: `revenue` | `bookings` | `users`
`period`: number of days (e.g. `7`, `30`, `90`)

Response includes `daily` array:
```json
{ "daily": [{ "_id": "2026-06-01", "revenue": 12000 }, ...] }
```

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/users` | List users (`?search=&page=&limit=`) |
| `GET` | `/admin/users/:id` | Get user by ID |
| `GET` | `/admin/users/:id/stats` | User booking stats |
| `POST` | `/admin/users` | Create user |
| `PUT` | `/admin/users/:id` | Update user |
| `DELETE` | `/admin/users/:id` | Delete user |
| `PATCH` | `/admin/users/bulk-update` | Bulk update `{ ids, updates }` |

### Drivers

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/drivers` | List drivers (`?search=&status=&page=&limit=`) |
| `GET` | `/admin/drivers/:id` | Get driver details |
| `GET` | `/admin/drivers/:id/stats` | Driver trip & earnings stats |
| `POST` | `/admin/drivers` | Create driver (creates linked user) |
| `PUT` | `/admin/drivers/:id` | Update driver profile |
| `DELETE` | `/admin/drivers/:id` | Delete driver + linked user |
| `PATCH` | `/admin/drivers/:id/status` | `{ status: 'active' \| 'suspended' }` |
| `PATCH` | `/admin/drivers/bulk-update` | Bulk update `{ ids, updates }` |

### Bookings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/bookings` | List all bookings (`?status=&page=&limit=`) |
| `GET` | `/admin/bookings/:id` | Get booking with full population |
| `PATCH` | `/admin/bookings/:id/status` | `{ status, note }` |

### Settings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/settings` | Get platform settings |
| `PUT` | `/admin/settings` | Update settings |

### Export

### `POST /admin/export`

```json
{ "type": "revenue" }
```

`type`: `revenue` | `bookings` | `users` | `drivers`

Returns a JSON file download.

### Notifications

### `POST /admin/notifications/bulk`

```json
{ "target": "all", "title": "Maintenance", "message": "The platform will be down for 30 minutes." }
```

`target`: `all` | `users` | `drivers`
