import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { accountService } from '../services/account.service';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  username: string;
  xp: number;
  streakCount?: number;
  bestStreak?: number;
  lastActiveAt?: string | null;
  subscriptionPlan: string;
  createdAt?: string;
}

interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

interface AuthContextData {
  user: User | null;
  signed: boolean;
  signIn: (data: LoginCredentials) => Promise<void>;
  signUp: (
    data: Omit<LoginCredentials, 'password'> & {
      password: string;
      fullName: string;
      dateOfBirth: string;
    },
  ) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

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
        accountService.getProfile()
          .then((updatedUser) => {
            if (updatedUser) {
              localStorage.setItem('@aprovaai:user', JSON.stringify(updatedUser));
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
      value={{ signed: !!user, user, signIn, signUp, signOut, refreshUser, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
