import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const savedToken = authService.getStoredToken();
    const savedUser = authService.getStoredUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
      try {
        const profileRes = await authService.getProfile();
        if (profileRes.success) {
          setUser(profileRes.data);
          localStorage.setItem('hostelhive_user', JSON.stringify(profileRes.data));
        }
      } catch (error) {
        console.warn('Session check notice:', error.message);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response && response.success) {
        setUser(response.data);
        setToken(response.data.token);
        return { success: true, user: response.data };
      }
    } catch (error) {
      let message = 'Login failed.';
      if (!error.response) {
        message = '❌ Cannot connect to Backend Server on http://localhost:5000. Is "npm run dev" running?';
      } else if (error.response.data && error.response.data.message) {
        message = error.response.data.message;
      }
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      if (response && response.success) {
        setUser(response.data);
        setToken(response.data.token);
        toast.success('Registration successful!');
        return { success: true, user: response.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully.');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      if (response && response.success) {
        setUser(response.data);
        toast.success('Profile updated!');
        return { success: true, user: response.data };
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    }
  };

  const isWarden = user?.role === 'warden';
  const isStudent = user?.role === 'student';
  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isWarden,
    isStudent,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => React.useContext(AuthContext);
