import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Login from './pages/auth/Login';
import AllBookings from './pages/bookings/AllBookings';
import BookingDetails from './pages/bookings/BookingDetails';
import Dashboard from './pages/dashboard/Dashboard';
import AddDriver from './pages/drivers/AddDriver';
import AllDrivers from './pages/drivers/AllDrivers';
import DriverDetails from './pages/drivers/DriverDetails';
import VerifyDriver from './pages/drivers/VerifyDriver';
import Profile from './pages/profile/Profile';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import AddUser from './pages/users/AddUser';
import AllUsers from './pages/users/AllUsers';
import UserDetails from './pages/users/UserDetails';

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
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Drivers Routes */}
              <Route path="/drivers" element={<AllDrivers />} />
              <Route path="/drivers/add" element={<AddDriver />} />
              <Route path="/drivers/:id" element={<DriverDetails />} />
              <Route path="/drivers/verify/:id" element={<VerifyDriver />} />
              
              {/* Bookings Routes */}
              <Route path="/bookings" element={<AllBookings />} />
              <Route path="/bookings/:id" element={<BookingDetails />} />
              
              {/* Users Routes */}
              <Route path="/users" element={<AllUsers />} />
              <Route path="/users/add" element={<AddUser />} />
              <Route path="/users/:id" element={<UserDetails />} />
              
              {/* Reports */}
              <Route path="/reports" element={<Reports />} />
              
              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
              
              {/* Profile */}
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;