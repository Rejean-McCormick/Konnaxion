// Shared route type used by all module route configs and the sidebar menu.

import type { ReactNode } from 'react';

import type { SuiteKey } from './suites';

export type ModuleKey = SuiteKey;

/**
 * Scope of a route within the overall platform.
 * - 'platform' → affects the whole system
 * - 'module'   → scoped to one product/module
 * - 'org'      → scoped to an organisation/workspace
 */
export type RouteScope = 'platform' | 'module' | 'org';

export interface Route {
  /** Concrete path for a leaf route. */
  path?: string;

  /** English fallback display name shown when no translation exists. */
  name: string;

  /** Stable i18n key for the visible route label. */
  labelKey?: string;

  /** Optional icon for leaf items or section headers. */
  icon?: ReactNode;

  /** Child routes used to define a section. */
  views?: Route[];

  /** Optional navigation scope metadata. */
  scope?: RouteScope;

  /** Module/suite owning the route; `multi` means cross-module operations. */
  moduleKey?: ModuleKey | 'multi';

  /** Marks admin/governance routes. */
  isAdmin?: boolean;

  /** Marks a technical jump across route roots while preserving product ownership. */
  isCrossModule?: boolean;

  /** Optional ordering hint. */
  order?: number;
}
