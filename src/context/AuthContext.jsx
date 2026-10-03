import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { showToast } from '../utils/toast';
import api from '../utils/api';

const AuthContext = createContext();

// The last known profile is kept locally so logged-in pages can render right away
// instead of waiting for /auth/me. It only drives the UI: the server still checks
// the token on every request, and /auth/me re-validates it in the background.
const USER_CACHE_KEY = 'auth_user';
const readCachedUser = () => {
  try {
    return localStorage.getItem('token') ? JSON.parse(localStorage.getItem(USER_CACHE_KEY)) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(readCachedUser);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  // Only block protected pages when there is a token but no cached profile yet
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token') && !readCachedUser());

  const setUser = useCallback((nextUser) => {
    setUserState(nextUser);
    try {
      if (nextUser) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(nextUser));
      else localStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // Storage unavailable: the app still works, just without the instant start
    }
  }, []);

  // Verify and refresh the profile on load if a token exists
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
  const login = useCallback(async (firebaseToken) => {
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
  }, [setUser]);

  /**
   * Log into account (Admin) using Firebase Token
   */
  const adminLogin = useCallback(async (firebaseToken) => {
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
  }, [setUser]);

  /**
   * Register customer account using Firebase Token
   */
  const register = useCallback(async (name, mobile, address, email, coordinates, firebaseToken) => {
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
  }, [setUser]);

  /**
   * Close session
   */
  const logout = useCallback(async (showToastMessage = true) => {
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
  }, [setUser]);

  // Memoised so consumers only re-render when auth state actually changes
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      adminLogin,
      register,
      logout,
      updateUserProfile: setUser,
    }),
    [user, token, loading, login, adminLogin, register, logout, setUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
