// app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0';

// Catch‑all route handler (GET /api/auth/*)
export const GET = handleAuth();

// Si vous devez supporter des POST (rare), décommentez :
// export const POST = handleAuth();
