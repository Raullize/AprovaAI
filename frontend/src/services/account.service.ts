import api from './api';
import type { User } from '../context/AuthContext';

export interface UpdateProfileDTO {
  fullName?: string;
  email?: string;
  username?: string;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export const accountService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/account/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDTO): Promise<void> => {
    await api.patch('/account/profile', data);
  },

  updatePassword: async (data: UpdatePasswordDTO): Promise<void> => {
    await api.patch('/account/password', data);
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/account');
  },
};
