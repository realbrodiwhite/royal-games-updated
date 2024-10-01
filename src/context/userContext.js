import React, { createContext, useState } from 'react';
import { apiHandler } from './apiHandler';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const { success, data } = await apiHandler('/api/user/login', 'POST', { username, password });
    if (success) {
      setUser(data.user);
      console.log('User logged in:', data.user);
    }
    return { success, data };
  };

  const register = async (user) => {
    const { success, data } = await apiHandler('/api/user/register', 'POST', user);
    if (success) {
      console.log('User registered successfully');
    }
    return { success, data };
  };

  const updateProfile = async (formData) => {
    try {
      const { success, data } = await apiHandler('/api/user/profile', 'PUT', formData);
      if (success) {
        setUser(data);
        console.log('Profile updated successfully:', data);
        return { success: true, data };
      } else {
        console.warn('Profile update failed:', data.error);
        return { success: false, data };
      }
    } catch (error) {
      console.error('Error during profile update:', error.message, error.stack);
      return { success: false, error };
    }
  };

  const resetPassword = async (userId, newPassword) => {
    const { success, data } = await apiHandler('/api/user/reset-password', 'POST', { userId, newPassword });
    if (success) {
      console.log('Password reset successfully for user ID:', userId);
    }
    return { success, data };
  };

  return (
    <UserContext.Provider value={{ user, login, register, updateProfile, resetPassword }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };