// services/trust.ts
import { get, post, put, patch, del } from './_request'

export interface ActivityItem {
  id: string
  when: string
  text: string
}

export interface UserProfile {
  avatar: string | null
  name: string
  joined: string
  score: number
  activity: ActivityItem[]
}

export interface EarnedBadge {
  id: string
  name: string
  desc?: string
}

export interface BadgeProgress {
  id: string
  name: string
  current: number
  required: number
}

export interface UserBadges {
  earned: EarnedBadge[]
  progress: BadgeProgress[]
}

export async function fetchUserProfile(): Promise<UserProfile> {
  return get<UserProfile>('trust/profile')
}

export async function uploadCredential(file: File): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  await post<void>('trust/credentials', form)
}

export async function fetchUserBadges(): Promise<UserBadges> {
  return get<UserBadges>('trust/badges')
}
