import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { accountService } from '../services/account.service';
import { AuthContext } from '../hooks/useAuth';
import type { LoginCredentials, User } from '../hooks/useAuth';

export type { User } from '../hooks/useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const updatedUser = await accountService.getProfile();
      if (updatedUser) {
        localStorage.setItem('@aprovaai:user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  }

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem('@aprovaai:token');
      const storedUser = localStorage.getItem('@aprovaai:user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
        accountService
          .getProfile()
          .then((updatedUser) => {
            if (updatedUser) {
              localStorage.setItem(
                '@aprovaai:user',
                JSON.stringify(updatedUser),
              );
              setUser(updatedUser);
            }
          })
          .catch((err) => console.error(err));
      }
      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function signIn(data: LoginCredentials) {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data;

    localStorage.setItem('@aprovaai:token', token);
    localStorage.setItem('@aprovaai:user', JSON.stringify(user));

    setUser(user);
    await refreshUser();
  }

  async function signUp(
    data: Omit<LoginCredentials, 'password'> & {
      password: string;
      fullName: string;
      dateOfBirth: string;
    },
  ) {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;

    localStorage.setItem('@aprovaai:token', token);
    localStorage.setItem('@aprovaai:user', JSON.stringify(user));

    setUser(user);
    await refreshUser();
  }

  function signOut() {
    localStorage.removeItem('@aprovaai:token');
    localStorage.removeItem('@aprovaai:user');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        signIn,
        signUp,
        signOut,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
