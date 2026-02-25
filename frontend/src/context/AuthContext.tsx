import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  username: string;
  xp: number;
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
  signOut: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem('@aprovaai:token');
      const storedUser = localStorage.getItem('@aprovaai:user');

      if (storedToken && storedUser) {
        setUser(JSON.parse(storedUser));
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
  }

  function signOut() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
