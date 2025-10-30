// File: shared/services/admin.ts
export async function getAdminStats() {
  // TODO: hit your real DB or data‐layer here
  return { totalUsers: 1234, activeUsers: 567, newUsers: 89 };
}

export async function getModerationQueue() {
  // TODO: hit your real DB or data‐layer here
  return [
    {
      id: "1",
      type: "comment",
      content: "Offensive comment text here",
      reason: "profanity",
      userId: "user_123",
      createdAt: new Date().toISOString(),
    },
  ];
}
