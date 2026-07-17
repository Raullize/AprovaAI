import api from './api';
import type { SimulationMode } from '../types/simulation.types';

export interface Simulation {
  id: string;
  name: string;
  slug: string;
  xpReward: number;
  passingPercentage: number;
  status: 'PUBLISHED' | 'DRAFT';
  topicId: string;
  timeLimit: number | null;
  simulationMode: SimulationMode;
  questionsCount?: number;
  order: number;
}

export interface CreateSimulationDTO {
  name: string;
  xpReward: number;
  passingPercentage: number;
  status: 'PUBLISHED' | 'DRAFT';
  topicId: string;
  timeLimit?: number;
  simulationMode: SimulationMode;
}

export type UpdateSimulationDTO = Partial<Omit<CreateSimulationDTO, 'topicId' | 'timeLimit'>> & {
  timeLimit?: number | null;
};

export const simulationsService = {
  findAll: async (topicId?: string) => {
    if (topicId) {
      const response = await api.get<Simulation[]>(`/simulations/topic/${topicId}`);
      return response.data;
    }
    const response = await api.get<Simulation[]>('/simulations');
    return response.data;
  },

  findOne: async (idOrSlug: string) => {
    const response = await api.get<Simulation>(`/simulations/${idOrSlug}`);
    return response.data;
  },

  create: async (data: CreateSimulationDTO) => {
    const response = await api.post<Simulation>('/simulations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateSimulationDTO) => {
    const response = await api.patch<Simulation>(`/simulations/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await api.delete(`/simulations/${id}`);
  },

  reorder: async (ids: string[]) => {
    await api.patch('/simulations/reorder', { ids });
  },
};
