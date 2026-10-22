import api from './api';

export interface AiChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface SendChatMessageResponse {
  reply: string;
}

export const aiService = {
  sendMessage: async (message: string): Promise<SendChatMessageResponse> => {
    const response = await api.post<SendChatMessageResponse>('/ai/chat', {
      message,
    });
    return response.data;
  },

  getHistory: async (limit = 20): Promise<AiChatMessage[]> => {
    const response = await api.get<AiChatMessage[]>('/ai/chat/history', {
      params: { limit },
    });
    return Array.isArray(response.data) ? response.data : [];
  },
};
