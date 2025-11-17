// services/projects.ts
// Thin service layer around the backend /api/projects/ endpoints.

import { get, post, put, del } from './_request';

export type ProjectStatusApi = 'idea' | 'progress' | 'completed' | 'validated';

export interface ApiProject {
  id: number;
  creator: string;
  title: string;
  description: string;
  category: string;
  status: ProjectStatusApi;
  created_at: string;
  updated_at: string;
  tags: number[];
}

/**
 * Fetch list of collaborative projects.
 * Backend: GET /api/projects/
 */
export async function fetchProjects(): Promise<ApiProject[]> {
  // baseURL is provided by NEXT_PUBLIC_API_BASE (e.g. http://localhost:8000/api)
  return get<ApiProject[]>('projects/');
}

/**
 * Fetch a single project by id.
 * Backend: GET /api/projects/:id/
 */
export async function fetchProject(id: number | string): Promise<ApiProject> {
  return get<ApiProject>(`projects/${id}/`);
}

export interface CreateProjectPayload {
  title: string;
  description?: string;
  category?: string;
  status?: ProjectStatusApi;
  tags?: number[];
}

/**
 * Create a new project.
 * Backend: POST /api/projects/
 * The authenticated user is taken from the session/cookie.
 */
export async function createProject(
  payload: CreateProjectPayload,
): Promise<ApiProject> {
  return post<ApiProject>('projects/', payload);
}

/**
 * Update an existing project.
 * Backend: PUT /api/projects/:id/
 */
export async function updateProject(
  id: number | string,
  payload: Partial<CreateProjectPayload>,
): Promise<ApiProject> {
  return put<ApiProject>(`projects/${id}/`, payload);
}

/**
 * Delete an existing project.
 * Backend: DELETE /api/projects/:id/
 */
export async function deleteProject(id: number | string): Promise<void> {
  await del<void>(`projects/${id}/`);
}
