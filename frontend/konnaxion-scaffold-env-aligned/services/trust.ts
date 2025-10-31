export async function fetchUserBadges() {
  return { earned: [{ id: 'b1', name: 'Early Adopter', desc: 'Joined in the first month' }],
           progress: [{ id: 'p1', name: 'Helpful Reviewer', current: 3, required: 5 }] };
}
export async function uploadCredential(_file: File) { return; }
export async function fetchUserProfile() {
  return { avatar: 'https://via.placeholder.com/120', name: 'Jane Doe', joined: '2025-09-01', score: 420,
           activity: [{ id: 'a1', when: '2025-10-01', text: 'Answered a question' }] };
}
