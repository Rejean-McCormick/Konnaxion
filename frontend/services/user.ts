// frontend/services/user.ts
// Wrapper around /api/users/me/ + helpers for avatar_url

import { get } from './_request'

/**
 * Shape returned by /api/users/me/.
 * Backend will be extended to include avatar_url.
 */
export interface CurrentUser {
  username: string
  name: string | null
  /** Optional, depending on how the backend serializer is configured */
  email?: string | null
  url: string
  /** Absolute or relative URL to the user’s avatar image */
  avatar_url?: string | null
}

/**
 * Default avatar used when no avatar_url is provided by the backend.
 * This must match the file you placed under:
 *   backend/konnaxion/media/kreative/artworks/default_profile.png
 */
export const DEFAULT_AVATAR_URL = '/media/kreative/artworks/default_profile.png'

/**
 * Fetch the authenticated user via /api/users/me/.
 * This uses the global NEXT_PUBLIC_API_BASE from services/_request.
 */
export async function fetchCurrentUser(): Promise<CurrentUser> {
  return get<CurrentUser>('users/me/')
}

/**
 * Helper that always returns a usable avatar URL.
 * If the user has no avatar_url yet, we fall back to DEFAULT_AVATAR_URL.
 */
export function resolveAvatarUrl(
  user: Pick<CurrentUser, 'avatar_url'> | null | undefined,
): string {
  const src = user?.avatar_url
  if (typeof src === 'string' && src.trim().length > 0) {
    return src
  }
  return DEFAULT_AVATAR_URL
}


/*
import { Avatar } from 'antd'
import { useEffect, useState } from 'react'
import { fetchCurrentUser, resolveAvatarUrl, type CurrentUser } from '@/services/user'

export default function HeaderUserAvatar() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const me = await fetchCurrentUser()
        setUser(me)
      } catch {
        setUser(null)
      }
    })()
  }, [])

  const src = resolveAvatarUrl(user)

  return <Avatar size={40} src={src} />
}
*/