import { createContext, useContext } from 'react';

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
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthContextData {
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

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

export function useAuth() {
  return useContext(AuthContext);
}
