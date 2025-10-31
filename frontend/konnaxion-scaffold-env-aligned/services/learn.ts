export async function fetchGlossary() {
  return { items: [{ id: 't1', term: 'Ethics', definition: 'Moral principles that govern behavior.' }] };
}
export async function fetchGuides() {
  return { sections: [{ id: 's1', title: 'Getting Started', content: 'Welcome to Konnaxion.' }] };
}
export async function fetchChangelog() {
  return { entries: [{ version: 'v1.0.0', date: '2025-09-15', tags: ['NEW'], notes: ['Initial release'] }] };
}
