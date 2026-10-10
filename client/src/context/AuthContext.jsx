import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fincare_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fincare_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('[Auth] Session expired or invalid token:', err.message);
          localStorage.removeItem('fincare_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      if (res.success) {
        localStorage.setItem('fincare_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);
      if (res.success) {
        localStorage.setItem('fincare_token', res.token);
        setToken(res.token);
        setUser(res.user);
        showToast('Account registered successfully! Welcome to FinCareAdvice.', 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('fincare_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  // Demo user login convenience helper
  const loginAsDemo = async () => {
    // Attempt standard demo credentials
    const success = await login('demo@fincareadvice.com', 'Password123!');
    if (!success) {
      // If demo account doesn't exist yet, auto-register it
      const regSuccess = await register({
        name: 'Priya Sharma',
        email: 'demo@fincareadvice.com',
        password: 'Password123!',
        age: 32,
        cityTier: 'metro',
        dependents: 1,
        hasFamily: true,
      });
      return regSuccess;
    }
    return success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
