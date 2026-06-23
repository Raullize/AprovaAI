import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

interface User {
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
      const response = await api.get('/account/profile');
      const updatedUser = response.data;
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
        // Refresh profile in background
        api.get('/account/profile')
          .then((response) => {
            if (response.data) {
              localStorage.setItem('@aprovaai:user', JSON.stringify(response.data));
              setUser(response.data);
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
    // Refresh to get up-to-date stats
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
    // Refresh to get up-to-date stats
    await refreshUser();
  }

  function signOut() {
    localStorage.clear();
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
