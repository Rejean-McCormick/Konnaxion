// services/learn.ts
import { get, post, put, patch, del } from './_request';

/* ---------- Changelog ---------- */

export interface ChangelogEntry {
  version: string;
  date: string;                      // ISO-8601 string (e.g. "2025-04-25")
  tags: ('NEW' | 'FIX' | 'IMPROVE')[];
  notes: string[];
}

export async function fetchChangelog(): Promise<{
  entries: ChangelogEntry[];
}> {
  return get('learn/changelog');
}

/* ---------- Guides ---------- */

export interface GuideSection {
  id: string;
  title: string;
  content: string;                  // Markdown / HTML-ready text
}

export async function fetchGuides(): Promise<{
  sections: GuideSection[];
}> {
  return get('learn/guides');
}

/* ---------- Glossary ---------- */

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
}

export async function fetchGlossary(): Promise<{
  items: GlossaryItem[];
}> {
  return get('learn/glossary');
}
