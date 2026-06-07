import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { endpoints } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      } else {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
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
      const message = err.response?.data?.message || 'Registration failed';
      setAuthError(message);
      toast.error(message);
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
      
      const { data: userData, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Login successful!');
      
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setAuthError(message);
      toast.error(message);
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