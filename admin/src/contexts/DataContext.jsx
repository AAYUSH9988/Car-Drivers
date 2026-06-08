import React, { createContext, useState, useContext, useRef, useCallback } from 'react';
import { dashboardAPI } from '../services/api';

const DataContext = createContext();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const DataProvider = ({ children }) => {
  const cache = useRef({});
  const [notifications, setNotifications] = useState([]);
  const [pendingDriverCount, setPendingDriverCount] = useState(0);

  const getCached = (key) => {
    const entry = cache.current[key];
    if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
    return null;
  };

  const setCached = (key, data) => {
    cache.current[key] = { data, ts: Date.now() };
  };

  const invalidate = (key) => {
    if (key) delete cache.current[key];
    else cache.current = {};
  };

  const fetchWithCache = useCallback(async (key, fetcher) => {
    const cached = getCached(key);
    if (cached) return cached;
    const data = await fetcher();
    setCached(key, data);
    return data;
  }, []);

  // Load pending driver count for sidebar badge
  const loadPendingCount = useCallback(async () => {
    try {
      const res = await dashboardAPI.getSummary();
      const count = res.data?.data?.overview?.pendingBookings || 0;
      setPendingDriverCount(count);
    } catch {
      // non-critical
    }
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      ...notification,
      read: false,
      time: notification.time || 'Just now'
    }, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <DataContext.Provider value={{
      fetchWithCache,
      invalidate,
      notifications,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      pendingDriverCount,
      loadPendingCount,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
export default DataContext;
