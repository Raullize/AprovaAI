import api from './api';

export interface Level {
  id: string;
  name: string;
  slug: string;
  xpReward: number;
  passingPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  topicId: string;
  _count?: {
    questions: number;
  };
}

export interface CreateLevelDTO {
  name: string;
  xpReward: number;
  passingPercentage: number;
  status: 'ACTIVE' | 'INACTIVE';
  topicId: string;
}

export type UpdateLevelDTO = Partial<Omit<CreateLevelDTO, 'topicId'>>;

export const levelsService = {
  findAll: async (topicSlug?: string) => {
    const response = await api.get<Level[]>('/levels', {
      params: { topicSlug },
    });
    return response.data;
  },

  findOne: async (idOrSlug: string) => {
    const response = await api.get<Level>(`/levels/${idOrSlug}`);
    return response.data;
  },

  create: async (data: CreateLevelDTO) => {
    const response = await api.post<Level>('/levels', data);
    return response.data;
  },

  update: async (id: string, data: UpdateLevelDTO) => {
    const response = await api.patch<Level>(`/levels/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/levels/${id}`);
  },

  reorder: async (ids: string[]) => {
    await api.patch('/levels/reorder', { ids });
  },
};
