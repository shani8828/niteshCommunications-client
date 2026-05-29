import React, { createContext, useState, useEffect, useContext } from 'react';
import { showToast } from '../utils/toast';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set auth header helper (kept for backward compatibility if referenced elsewhere)
  const getHeaders = (customToken = token) => {
    return {
      'Content-Type': 'application/json',
      Authorization: customToken ? `Bearer ${customToken}` : '',
    };
  };

  // Verify and fetch profile on load if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Token expired or invalid
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  /**
   * Log into account (User)
   */
  const login = async (mobile, password) => {
    try {
      const response = await api.post('/auth/login', { mobile, password });
      const data = response.data;

      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      showToast.success('Login Successful!');
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Server error during login';
      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Log into account (Admin)
   */
  const adminLogin = async (mobile, password) => {
    try {
      const response = await api.post('/auth/admin-login', { mobile, password });
      const data = response.data;

      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      showToast.success('Admin Login Successful!');
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Server error during admin login';
      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };



  /**
   * Register customer account
   */
  const register = async (name, mobile, password, address, email, coordinates) => {
    try {
      const response = await api.post('/auth/register', { name, mobile, password, address, email, coordinates });
      const data = response.data;

      // Auto login on registration success
      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);

      showToast.success('Registration and login successful!');
      return { success: true, recoveryCodes: data.recoveryCodes };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Server error during registration';
      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Request password reset OTP
   */
  const forgotPassword = async (mobile) => {
    try {
      const response = await api.post('/auth/forgot-password', { mobile });
      showToast.success(response.data.message);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to request reset OTP';
      showToast.error(errorMessage);
      return false;
    }
  };

  /**
   * Submit new password with OTP
   */
  const resetPassword = async (mobile, code, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { mobile, code, newPassword });
      showToast.success(response.data.message);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      showToast.error(errorMessage);
      return false;
    }
  };

  /**
   * Close session
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    showToast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        adminLogin,
        register,
        forgotPassword,
        resetPassword,
        logout,
        getHeaders,
        updateUserProfile: (updatedData) => setUser(updatedData),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
