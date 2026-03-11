import api from './api';

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
  _count?: {
    levels: number;
  };
}

export interface CreateTopicDTO {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  examId: string;
}

export type UpdateTopicDTO = Partial<Omit<CreateTopicDTO, 'examId'>>;

export const topicsService = {
  findAll: async (examSlug?: string) => {
    const response = await api.get<Topic[]>('/topics', {
      params: { examSlug },
    });
    return response.data;
  },

  findOne: async (idOrSlug: string) => {
    const response = await api.get<Topic>(`/topics/${idOrSlug}`);
    return response.data;
  },

  create: async (data: CreateTopicDTO) => {
    const response = await api.post<Topic>('/topics', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTopicDTO) => {
    const response = await api.patch<Topic>(`/topics/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/topics/${id}`);
  },

  reorder: async (ids: string[]) => {
    await api.patch('/topics/reorder', { ids });
  },
};
