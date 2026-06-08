# Frontend

The client-facing interface for the GoPilot platform, allowing users to browse, book, and manage driver services.

## Features

- **Modern UI**: Sleek, responsive design with TailwindCSS
- **Driver Listings**: Browse available drivers with filtering options
- **Booking System**: Seamless booking flow with confirmation
- **User Authentication**: Secure login/signup functionality
- **User Dashboard**: Manage bookings and account settings
- **Driver Details**: Comprehensive driver profiles with reviews

## Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── assets/           # Images, fonts, and other static files
│   ├── components/       # Reusable components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Application pages
│   ├── services/         # API service functions
│   ├── App.jsx           # Main application component
│   └── main.jsx          # Application entry point
├── public/               # Public static files
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
├── tailwind.config.cjs   # TailwindCSS configuration
└── package.json          # Project dependencies and scripts
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally
