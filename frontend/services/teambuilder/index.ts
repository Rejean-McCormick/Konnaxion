// frontend/services/teambuilder/index.ts
import { api } from '@/services/apiClient'; // Assumes the centralized client created in step 1
import { 
  IBuilderSession, 
  ICreateSessionRequest, 
  ITeam 
} from './types';

const BASE_URL = '/teambuilder';

export const teambuilderService = {
  /**
   * Fetch all team building sessions (history).
   */
  async getSessions(): Promise<IBuilderSession[]> {
    const response = await api.get<IBuilderSession[]>(`${BASE_URL}/sessions/`);
    return response.data;
  },

  /**
   * Get a single session by ID, including its generated teams.
   */
  async getSessionById(sessionId: string): Promise<IBuilderSession> {
    const response = await api.get<IBuilderSession>(`${BASE_URL}/sessions/${sessionId}/`);
    return response.data;
  },

  /**
   * Create a new configuration for a team building session.
   */
  async createSession(data: ICreateSessionRequest): Promise<IBuilderSession> {
    const response = await api.post<IBuilderSession>(`${BASE_URL}/sessions/`, data);
    return response.data;
  },

  /**
   * Trigger the algorithm to generate teams for a specific session.
   */
  async generateTeams(sessionId: string): Promise<IBuilderSession> {
    const response = await api.post<IBuilderSession>(`${BASE_URL}/sessions/${sessionId}/generate/`);
    return response.data;
  },

  /**
   * Fetch specific teams (optional, can filter by session_id in params if needed).
   */
  async getTeams(sessionId?: string): Promise<ITeam[]> {
    const params = sessionId ? { session: sessionId } : {};
    const response = await api.get<ITeam[]>(`${BASE_URL}/teams/`, { params });
    return response.data;
  }
};