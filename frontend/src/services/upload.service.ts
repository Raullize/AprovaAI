import api from './api';

export const uploadService = {
  deleteFile: async (filename: string) => {
    await api.delete(`/upload/${filename}`);
  },
};
