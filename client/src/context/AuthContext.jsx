import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(res.data.user);
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, password });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-email`, { email, otp });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
    return res.data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, { token, newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, verifyOtp, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
