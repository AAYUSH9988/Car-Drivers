import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('admin_user') || 'null');
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;

      if (data.role !== 'admin') {
        throw new Error('Access denied. Admin accounts only.');
      }

      const userData = { ...data, token };
      localStorage.setItem('admin_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed.';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('admin_user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  const updateProfile = (userData) => {
    setUser(userData);
    localStorage.setItem('admin_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};