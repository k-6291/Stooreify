// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('userData');
    if (token && userData) {
      try {
        setUser({ token, ...JSON.parse(userData) });
      } catch (e) {
        sessionStorage.clear();
      }
    }
  }, []);

  const login = (loginData) => {
    return new Promise(async (resolve) => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData)
        });

        const data = await res.json();

        if (!res.ok) {
          return resolve({ success: false, message: data.message || 'فشل' });
        }

        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('userData', JSON.stringify(data.user));
        setUser({ token: data.token, ...data.user });
        resolve({ success: true });
      } catch (error) {
        resolve({ success: false, message: 'خطأ في الاتصال' });
      }
    });
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};