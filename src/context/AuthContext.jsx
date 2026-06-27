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
        // Only log out if the server explicitly tells us the token is invalid or expired (401)
        if (error.response && error.response.status === 401) {
          logout(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  /**
   * Log into account (User) using Firebase Token
   */
  const login = async (firebaseToken) => {
    try {
      const response = await api.post('/auth/login', { firebaseToken });
      const data = response.data;

      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      showToast.success('Login Successful!');
      return { success: true, user: data.user };
    } catch (error) {
      if (error.response?.status === 404 && error.response?.data?.notRegistered) {
        return { success: false, notRegistered: true, mobile: error.response.data.mobile };
      }
      const errorMessage = error.response?.data?.message || 'Server error during login';
      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Log into account (Admin) using Firebase Token
   */
  const adminLogin = async (firebaseToken) => {
    try {
      const response = await api.post('/auth/admin-login', { firebaseToken });
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
   * Register customer account using Firebase Token
   */
  const register = async (name, mobile, address, email, coordinates, firebaseToken) => {
    try {
      const response = await api.post('/auth/register', { name, mobile, address, email, coordinates, firebaseToken });
      const data = response.data;

      // Auto login on registration success
      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);

      showToast.success('Registration and login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Server error during registration';
      showToast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Close session
   */
  const logout = async (showToastMessage = true) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    if (showToastMessage) {
      showToast.success('Logged out successfully');
    }
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
