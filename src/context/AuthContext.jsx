import React, { createContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser());
  const [tokens, setTokens] = useState(() => storage.getTokens());
  const [loading, setLoading] = useState(true);
  const [authMethods, setAuthMethods] = useState(['password', 'otp', 'google']);

  // Handle setting session tokens and user state
  const setSession = useCallback((newTokens, newUser) => {
    setTokens(newTokens);
    setUser(newUser);
    if (newTokens) storage.setTokens(newTokens);
    if (newUser) storage.setUser(newUser);
  }, []);

  // Clear session state
  const clearSession = useCallback(() => {
    setTokens(null);
    setUser(null);
    storage.clear();
  }, []);

  // Fetch backend available auth methods & current user profile on initial load
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const methodsRes = await authApi.getAuthMethods();
        if (isMounted && methodsRes.data?.methods) {
          setAuthMethods(methodsRes.data.methods);
        }
      } catch (err) {
        console.warn('Could not fetch active auth methods from backend', err);
      }

      const storedTokens = storage.getTokens();
      if (storedTokens?.accessToken) {
        try {
          const profileRes = await userApi.getProfile();
          if (isMounted && profileRes.data?.user) {
            setUser(profileRes.data.user);
            storage.setUser(profileRes.data.user);
          }
        } catch (err) {
          console.warn('Profile auto-recovery failed', err);
          if (isMounted) clearSession();
        }
      }

      if (isMounted) setLoading(false);
    };

    initAuth();

    // Listen for global logout events dispatched by Axios interceptor
    const handleLogoutEvent = () => clearSession();
    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [clearSession]);

  // Login with Password
  const loginWithPassword = async ({ identifier, password }) => {
    const isEmail = identifier.includes('@');
    const payload = isEmail
      ? { email: identifier, password }
      : { phone: identifier, password };

    const res = await authApi.login(payload);
    const { tokens: newTokens, user: newUser } = res.data;
    setSession(newTokens, newUser);
    return newUser;
  };

  // Register with Password
  const registerWithPassword = async ({ name, email, phone, password, role }) => {
    const payload = { name, password, role: role || 'patient' };
    if (email) payload.email = email;
    if (phone) payload.phone = phone;

    const res = await authApi.register(payload);
    return res.data?.user;
  };

  // Request OTP (Email or Phone)
  const requestOtp = async ({ identifier, type }) => {
    const res = await authApi.sendOtp({ identifier, type });
    return res.message || 'OTP sent successfully';
  };

  // Login / Verify OTP
  const loginWithOtp = async ({ identifier, otp, type, role }) => {
    const payload = { identifier, otp, type, role: role || 'patient' };
    const res = await authApi.loginWithOtp(payload);
    const { tokens: newTokens, user: newUser } = res.data;
    setSession(newTokens, newUser);
    return newUser;
  };

  // Register with OTP
  const registerWithOtp = async ({ identifier, otp, type, role, password, name }) => {
    const payload = { identifier, otp, type, role: role || 'patient' };
    if (password) payload.password = password;
    if (name) payload.name = name;

    const res = await authApi.registerWithOtp(payload);
    const { tokens: newTokens, user: newUser } = res.data;
    setSession(newTokens, newUser);
    return newUser;
  };

  // Logout User
  const logout = async () => {
    if (tokens?.refreshToken) {
      try {
        await authApi.logout(tokens.refreshToken);
      } catch (err) {
        console.warn('Backend logout call failed', err);
      }
    }
    clearSession();
  };

  // Update authenticated profile
  const updateProfile = async (updateData) => {
    const res = await userApi.updateProfile(updateData);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    storage.setUser(updatedUser);
    return updatedUser;
  };

  // Refresh profile manually
  const refreshProfile = async () => {
    const res = await userApi.getProfile();
    const fetchedUser = res.data.user;
    setUser(fetchedUser);
    storage.setUser(fetchedUser);
    return fetchedUser;
  };

  const value = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens?.accessToken,
    loading,
    authMethods,
    loginWithPassword,
    registerWithPassword,
    requestOtp,
    loginWithOtp,
    registerWithOtp,
    logout,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
