import React, { createContext, useState, useEffect, useContext } from 'react';
import { showToast } from '../utils/toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set auth header helper
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
        const response = await fetch('/api/auth/me', {
          headers: getHeaders(),
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Login failed');
        return { success: false, error: data.message };
      }

      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      showToast.success('Login Successful!');
      return { success: true, user: data.user };
    } catch (error) {
      showToast.error('Server error during login');
      return { success: false, error: error.message };
    }
  };

  /**
   * Log into account (Admin)
   */
  const adminLogin = async (mobile, password) => {
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Admin login failed');
        return { success: false, error: data.message };
      }

      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      showToast.success('Admin Login Successful!');
      return { success: true, user: data.user };
    } catch (error) {
      showToast.error('Server error during admin login');
      return { success: false, error: error.message };
    }
  };

  /**
   * Log into account (Partner)
   */
  const partnerLogin = async (mobile, password) => {
    try {
      const response = await fetch('/api/auth/partner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Partner login failed');
        return { success: false, error: data.message };
      }

      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      showToast.success('Partner Login Successful!');
      return { success: true, user: data.user };
    } catch (error) {
      showToast.error('Server error during partner login');
      return { success: false, error: error.message };
    }
  };

  /**
   * Register customer account
   */
  const register = async (name, mobile, password, address, email, coordinates) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, password, address, email, coordinates }),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast.error(data.message || 'Registration failed');
        return { success: false, error: data.message };
      }

      // Auto login on registration success
      localStorage.setItem('token', data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);

      showToast.success('Registration and login successful!');
      return { success: true, recoveryCodes: data.recoveryCodes };
    } catch (error) {
      showToast.error('Server error during registration');
      return { success: false, error: error.message };
    }
  };

  /**
   * Request password reset OTP
   */
  const forgotPassword = async (mobile) => {
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast.error(data.message);
        return false;
      }
      showToast.success(data.message);
      return true;
    } catch (error) {
      showToast.error('Failed to request reset OTP');
      return false;
    }
  };

  /**
   * Submit new password with OTP
   */
  const resetPassword = async (mobile, code, newPassword) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, code, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast.error(data.message);
        return false;
      }
      showToast.success(data.message);
      return true;
    } catch (error) {
      showToast.error('Failed to reset password');
      return false;
    }
  };

  /**
   * Close session
   */
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
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
        partnerLogin,
        register,
        forgotPassword,
        resetPassword,
        logout,
        getHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
