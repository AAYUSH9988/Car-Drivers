import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { endpoints } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Validate token is still alive and get fresh user data
    endpoints.auth.getMe()
      .then((res) => {
        const freshUser = res.data?.data;
        // Validate shape — must have _id, name, email, role
        if (
          freshUser &&
          typeof freshUser === 'object' &&
          freshUser._id &&
          typeof freshUser.name === 'string' &&
          typeof freshUser.email === 'string'
        ) {
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
        } else {
          throw new Error('Invalid user shape from /auth/me');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const clearError = () => {
    setAuthError(null);
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setAuthError(null);
      const response = await endpoints.auth.register(userData);
      
      // Don't auto-login after registration for security
      toast.success('Registration successful! Please log in.');
      return response.data;
    } catch (err) {
      // Extract detailed validation errors if present
      const responseErrors = err.response?.data?.errors;
      let message;
      if (Array.isArray(responseErrors) && responseErrors.length > 0) {
        message = responseErrors.join('. ');
      } else {
        message = err.response?.data?.message || 'Registration failed';
      }
      setAuthError(message);
      // Don't show toast here — let Register.jsx handle inline display
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setAuthError(null);
      const response = await endpoints.auth.login({
        email: credentials.email,
        password: credentials.password
      });

      const { data: userData, token, refreshToken } = response.data;

      localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      toast.success('Login successful!');

      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setAuthError(message);
      // Don't show toast here — let Login.jsx handle inline display
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      await endpoints.auth.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (err) {
      const message = err.response?.data?.message || 'Logout failed';
      setAuthError(message);
      console.error('Logout error:', err);
      toast.error(message);
    }
  };

  const value = {
    user,
    loading,
    error: authError,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};