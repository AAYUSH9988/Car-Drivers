import { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import EnhancedFooter from './components/layout/EnhancedFooter';
import EnhancedNavbar from './components/layout/EnhancedNavbar';
import { PageSpinner } from './components/shared/Spinner';
import { AuthProvider } from './context/AuthContext';

// Eagerly loaded — critical path
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy loaded — below the fold
const Drivers        = lazy(() => import('./pages/Drivers'));
const DriverDetails  = lazy(() => import('./pages/DriverDetails'));
const SearchResults  = lazy(() => import('./pages/SearchResults'));
const About          = lazy(() => import('./pages/About'));
const Contact        = lazy(() => import('./pages/Contact'));
const Services       = lazy(() => import('./pages/Services'));
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const BookingSuccess = lazy(() => import('./pages/BookingSuccess'));
const BookingFailed = lazy(() => import('./pages/BookingFailed'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail    = lazy(() => import('./pages/VerifyEmail'));
const Profile        = lazy(() => import('./pages/Profile'));
const Terms          = lazy(() => import('./pages/Terms'));
const Privacy        = lazy(() => import('./pages/Privacy'));


function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
        {/* Skip to main content — accessibility */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-on-primary focus:font-ui-button focus:text-ui-button focus:uppercase focus:tracking-widest focus:px-6 focus:py-3"
        >
          Skip to main content
        </a>
        <div className="min-h-screen flex flex-col bg-surface">
          <EnhancedNavbar />
          <main id="main" className="flex-grow pt-16 md:pt-20">
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                {/* Public */}
                <Route path="/"               element={<Home />} />
                <Route path="/pilots"         element={<Drivers />} />
                <Route path="/pilot/:id"      element={<DriverDetails />} />
                <Route path="/search-pilots"  element={<SearchResults />} />
                <Route path="/pilots/search"  element={<SearchResults />} />
                <Route path="/pilots/available" element={<SearchResults />} />
                <Route path="/pilots/:location" element={<SearchResults />} />
                <Route path="/login"                  element={<Login />} />
                <Route path="/register"              element={<Register />} />
                <Route path="/forgot-password"       element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token"   element={<VerifyEmail />} />
                <Route path="/about"                 element={<About />} />
                <Route path="/contact"               element={<Contact />} />
                <Route path="/services"              element={<Services />} />
                <Route path="/terms"                 element={<Terms />} />
                <Route path="/privacy"               element={<Privacy />} />

                {/* Protected */}
                <Route path="/booking/success" element={
                  <ProtectedRoute><BookingSuccess /></ProtectedRoute>
                } />
                <Route path="/booking/failed" element={
                  <ProtectedRoute><BookingFailed /></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </main>

          <EnhancedFooter />

          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#fbf9f9',
                border: '1px solid #1b1c1c',
                borderRadius: '0',
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: '14px',
                color: '#1b1c1c',
                letterSpacing: '0.02em',
              },
            }}
          />
        </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
