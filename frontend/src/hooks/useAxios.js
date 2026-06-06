import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAxios = ({ url, method = 'get', immediate = true, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(initialData);

  const fetchData = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios({
        url,
        method,
        ...options,
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, url]);

  const reset = () => {
    setData(initialData);
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    data,
    fetchData,
    reset
  };
};