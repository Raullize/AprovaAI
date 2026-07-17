import api from './api';

export interface Exam {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'PUBLISHED' | 'DRAFT';
  topicsCount: number;
  iconKey?: string | null;
  colorScheme?: string | null;
  category?: string | null;
}

export interface CreateExamDTO {
  name: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT';
  iconKey?: string;
  colorScheme?: string;
  category?: string;
}

export type UpdateExamDTO = Partial<CreateExamDTO>;

export const examsService = {
  findAll: async () => {
    const response = await api.get<Exam[]>('/exams');
    return response.data;
  },

  findOne: async (idOrSlug: string) => {
    const response = await api.get<Exam>(`/exams/${idOrSlug}`);
    return response.data;
  },

  create: async (data: CreateExamDTO) => {
    const response = await api.post<Exam>('/exams', data);
    return response.data;
  },

  update: async (id: string, data: UpdateExamDTO) => {
    const response = await api.patch<Exam>(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/exams/${id}`);
  },

  reorder: async (ids: string[]) => {
    await api.patch('/exams/reorder', { ids });
  },
};
