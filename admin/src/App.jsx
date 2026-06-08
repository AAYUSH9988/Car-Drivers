import React, { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/auth/Login';

// Lazy-loaded pages
const AllBookings = lazy(() => import('./pages/bookings/AllBookings'));
const BookingDetails = lazy(() => import('./pages/bookings/BookingDetails'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const AddDriver = lazy(() => import('./pages/drivers/AddDriver'));
const AllDrivers = lazy(() => import('./pages/drivers/AllDrivers'));
const DriverDetails = lazy(() => import('./pages/drivers/DriverDetails'));
const VerifyDriver = lazy(() => import('./pages/drivers/VerifyDriver'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const AddUser = lazy(() => import('./pages/users/AddUser'));
const AllUsers = lazy(() => import('./pages/users/AllUsers'));
const UserDetails = lazy(() => import('./pages/users/UserDetails'));

const PageSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-48 bg-admin-elevated rounded" />
    <div className="bg-admin-surface border border-admin-border rounded-md h-64" />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>} />
              <Route path="/dashboard" element={<Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>} />

              {/* Drivers Routes */}
              <Route path="/drivers" element={<Suspense fallback={<PageSkeleton />}><AllDrivers /></Suspense>} />
              <Route path="/drivers/add" element={<Suspense fallback={<PageSkeleton />}><AddDriver /></Suspense>} />
              <Route path="/drivers/:id" element={<Suspense fallback={<PageSkeleton />}><DriverDetails /></Suspense>} />
              <Route path="/drivers/verify/:id" element={<Suspense fallback={<PageSkeleton />}><VerifyDriver /></Suspense>} />

              {/* Bookings Routes */}
              <Route path="/bookings" element={<Suspense fallback={<PageSkeleton />}><AllBookings /></Suspense>} />
              <Route path="/bookings/:id" element={<Suspense fallback={<PageSkeleton />}><BookingDetails /></Suspense>} />

              {/* Users Routes */}
              <Route path="/users" element={<Suspense fallback={<PageSkeleton />}><AllUsers /></Suspense>} />
              <Route path="/users/add" element={<Suspense fallback={<PageSkeleton />}><AddUser /></Suspense>} />
              <Route path="/users/:id" element={<Suspense fallback={<PageSkeleton />}><UserDetails /></Suspense>} />

              {/* Reports */}
              <Route path="/reports" element={<Suspense fallback={<PageSkeleton />}><Reports /></Suspense>} />

              {/* Settings */}
              <Route path="/settings" element={<Suspense fallback={<PageSkeleton />}><Settings /></Suspense>} />

              {/* Profile */}
              <Route path="/profile" element={<Suspense fallback={<PageSkeleton />}><Profile /></Suspense>} />
            </Route>
          </Routes>
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: { background: '#1A1E2E', border: '1px solid #232840', color: '#F1F5F9' },
            }}
          />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;