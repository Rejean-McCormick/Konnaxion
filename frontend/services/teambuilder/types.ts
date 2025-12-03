// frontend/services/teambuilder/types.ts

/**
 * Represents a user in the context of team building.
 * Matches the core UserSerializer fields used by the backend.
 */
export interface ITeambuilderUser {
  id: number;
  username: string;
  email: string;
  name?: string; // Optional full name if your User model has it
  avatar_url?: string; // If available
  // Add other user fields as needed (e.g., ekoh_score if exposed)
}

/**
 * Configuration options for the team generation algorithm.
 */
export interface IAlgorithmConfig {
  target_team_size: number;
  strategy: 'random' | 'balanced_expertise';
  diversity_weight?: number; // Optional scaling factor
  [key: string]: any; // Allow for future config extensibility
}

/**
 * A specific assignment of a user to a team.
 */
export interface ITeamMember {
  id: number;
  user: ITeambuilderUser;
  suggested_role: string;
  match_reason: string;
}

/**
 * A generated team containing a list of members.
 */
export interface ITeam {
  id: string; // UUID
  name: string;
  metrics: {
    member_count?: number;
    avg_skill?: number;
    diversity_score?: number;
    [key: string]: any;
  };
  members: ITeamMember[];
  created_at: string; // ISO Date string
}

export type SessionStatus = 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'ARCHIVED';

/**
 * The main session object holding configuration and results.
 */
export interface IBuilderSession {
  id: string; // UUID
  name: string;
  description: string;
  status: SessionStatus;
  algorithm_config: IAlgorithmConfig;
  created_by?: number; // User ID
  created_at: string;
  updated_at: string;
  
  // Results
  teams: ITeam[];
  
  // Metadata
  candidates_count: number;
}

/**
 * Payload for creating or updating a session.
 */
export interface ICreateSessionRequest {
  name: string;
  description?: string;
  candidate_ids: number[]; // Array of User IDs to include in the pool
  algorithm_config: IAlgorithmConfig;
}