// services/trust.ts
import apiRequest from './_request';

export async function fetchUserProfile() {
  return apiRequest.get('trust/profile');
}

export async function uploadCredential(file: File) {
  const form = new FormData();
  form.append('file', file);
  return apiRequest.post('trust/credentials', form);
}

export async function fetchUserBadges() {
  return apiRequest.get('trust/badges');
}
