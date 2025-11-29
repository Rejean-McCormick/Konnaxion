// FILE: frontend/services/learn.ts
// frontend/services/learn.ts
import { get } from './_request'

export interface ChangelogEntry {
  version: string
  date: string
  tags: string[]
  notes: string[]
}

export interface GuideSection {
  id: string
  title: string
  content: string
}

export interface GlossaryItem {
  id: string
  term: string
  definition: string
}

interface EthikosCategoryApi {
  id: number
  name: string
  description?: string
}

// Static content you can adjust directly in this file
const CHANGELOG: ChangelogEntry[] = [
  {
    version: 'v0.1',
    date: '2025-01-01',
    tags: ['initial'],
    notes: [
      'First deploy of Ethikos kernel (topics, stances, arguments).',
      'Elite / public debates wired on top of the Ethikos models.',
    ],
  },
]

const GUIDES: GuideSection[] = [
  {
    id: 'getting-started',
    title: 'Getting started with Ethikos',
    content:
      'Create a debate topic, invite participants to express a stance, then use DECIDE for outcomes and DELIBERATE for argument threads.',
  },
  {
    id: 'elite-vs-public',
    title: 'Elite vs public consultations',
    content:
      'Elite debates are linked to an expertise category; public debates are open to all. This is defined on the Ethikos topic (expertise_category).',
  },
]

export async function fetchChangelog(): Promise<{ entries: ChangelogEntry[] }> {
  return { entries: CHANGELOG }
}

export async function fetchGuides(): Promise<{ sections: GuideSection[] }> {
  return { sections: GUIDES }
}

export async function fetchGlossary(): Promise<{ items: GlossaryItem[] }> {
  const categories = await get<EthikosCategoryApi[]>('ethikos/categories/')

  const items: GlossaryItem[] = categories.map((c) => ({
    id: String(c.id),
    term: c.name,
    definition: c.description ?? '',
  }))

  return { items }
}
