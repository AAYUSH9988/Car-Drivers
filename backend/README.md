# GoPilot Backend API

A comprehensive Node.js backend API for a premium chauffeur booking application with admin dashboard functionality.

## Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (User, Driver, Admin)
- Secure password hashing with bcrypt

### User Management
- User registration and login
- Profile management with photo upload
- Booking history and statistics
- Password updates with validation

### Driver Management
- Driver registration with vehicle details
- Document upload and verification workflow
- Geolocation tracking for nearby driver queries
- Availability management
- Approval workflow (pending → approved → active)

### Booking System
- Complete CRUD operations for bookings
- Real-time status updates
- Payment integration with Razorpay
- Booking conflict prevention
- Review and rating system

### Admin Dashboard
- Dashboard analytics and statistics
- User and driver management
- Booking oversight
- System configuration

## Tech Stack

- **Runtime:** Node.js with ES6 modules
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** ImageKit
- **Security:** bcrypt, CORS, rate limiting, helmet
- **Email:** Brevo (Sendinblue)
- **Payments:** Razorpay

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
backend/
├── controllers/          # Route handlers
├── middleware/           # Custom middleware (auth, validation, rate limiting)
├── models/              # Database models (User, Driver, Booking)
├── routes/              # Route definitions
├── utils/               # Utility functions
├── config/              # Configuration
├── Dockerfile             # Docker configuration for Render
├── render.yaml          # Render deployment blueprint
├── server.js            # Application entry point
└── package.json
```

## Environment Variables

See `.env.example` for the complete list of required environment variables.

## Deployment

This backend is configured for deployment on Render using Docker. See `DEPLOYMENT.md` in the project root for the full deployment guide.

