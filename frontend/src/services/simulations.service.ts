import api from './api';
import type { SimulationMode } from '../types/simulation.types';

export interface SimulationAnswer {
  questionId: string;
  selectedId: string;
  correct: boolean;
}

export interface ApiSimulationAnswer {
  questionId: string;
  selectedOptions: string[];
  isCorrect: boolean | null;
  isFlaggedForReview?: boolean;
}

export interface ApiSimulationHistoryItem {
  id: string;
  levelId: string;
  level?: {
    name?: string;
    xpReward?: number;
    topic?: {
      name?: string;
      exam?: {
        id?: string;
        name?: string;
        slug?: string;
        category?: string;
        iconKey?: string;
        colorScheme?: string;
      };
    };
  };
  mode: SimulationMode;
  status?: string;
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  passed?: boolean;
  stars?: number;
  timeSpent?: number;
  createdAt: string;
  answers?: ApiSimulationAnswer[];
}

export interface StartSimulationResponse {
  id: string;
  answers?: ApiSimulationAnswer[];
}

export interface FinishSimulationResponse {
  examResult: {
    totalQuestions: number;
    score: number;
    timeSpent: number;
    stars: number;
    answers?: ApiSimulationAnswer[];
  };
  xpGained: number;
}

export const simulationsService = {
  getHistory: async (): Promise<ApiSimulationHistoryItem[]> => {
    const response = await api.get<ApiSimulationHistoryItem[]>('/simulations/history');
    return Array.isArray(response.data) ? response.data : [];
  },

  start: async (levelId: string): Promise<StartSimulationResponse> => {
    const response = await api.post<StartSimulationResponse>('/simulations/start', { levelId });
    return response.data;
  },

  saveAnswer: async (
    simulationId: string,
    data: {
      questionId: string;
      selectedOptions: string[];
      timeSpent: number;
      isFlaggedForReview: boolean;
    },
  ): Promise<void> => {
    await api.post(`/simulations/${simulationId}/answers`, data);
  },

  finish: async (
    simulationId: string,
    data: { timeSpent: number },
  ): Promise<FinishSimulationResponse> => {
    const response = await api.post<FinishSimulationResponse>(
      `/simulations/${simulationId}/finish`,
      data,
    );
    return response.data;
  },
};
