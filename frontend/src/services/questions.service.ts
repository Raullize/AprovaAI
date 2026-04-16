import api from './api';

export interface Option {
  id?: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Question {
  id: string;
  content: string;
  imageUrl?: string;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status: 'ACTIVE' | 'INACTIVE';
  explanation?: string;
  studyLink?: string;
  order: number;
  options: Option[];
  levelId: string;
}

export interface CreateQuestionDTO {
  content: string;
  imageUrl?: string | null;
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';
  status: 'ACTIVE' | 'INACTIVE';
  explanation?: string;
  studyLink?: string;
  levelId: string;
  options: Omit<Option, 'id'>[];
}

export type UpdateQuestionDTO = Partial<Omit<CreateQuestionDTO, 'levelId'>>;

export const questionsService = {
  findAll: async (levelId?: string) => {
    if (levelId) {
      const response = await api.get<Question[]>(`/questions/level/${levelId}`);
      return response.data;
    }
    const response = await api.get<Question[]>('/questions');
    return response.data;
  },

  create: async (data: CreateQuestionDTO) => {
    const response = await api.post<Question>('/questions', data);
    return response.data;
  },

  update: async (id: string, data: UpdateQuestionDTO) => {
    const response = await api.patch<Question>(`/questions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/questions/${id}`);
  },

  reorder: async (ids: string[]) => {
    await api.patch('/questions/reorder', { ids });
  },
};
