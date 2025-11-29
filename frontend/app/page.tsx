// FILE: frontend/app/page.tsx
// app/page.tsx
import { cookies } from 'next/headers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Konnaxion entry point – choose your space or sign in.',
};

type SuiteKey = 'ekoh' | 'ethikos' | 'keenkonnect' | 'konnected' | 'kreative';

// Home URL for each module (with sidebar param)
const HOME_BY_SUITE: Record<SuiteKey, string> = {
  ekoh: '/ekoh/dashboard?sidebar=ekoh',
  ethikos: '/ethikos/insights?sidebar=ethikos',
  keenkonnect: '/keenkonnect/dashboard?sidebar=keenkonnect',
  konnected: '/konnected/dashboard?sidebar=konnected',
  kreative: '/kreative/dashboard?sidebar=kreative',
};

// Display label for each module (brand casing)
const SUITE_LABEL: Record<SuiteKey, string> = {
  ekoh: 'EkoH',
  ethikos: 'ethiKos',
  keenkonnect: 'keenKonnect',
  konnected: 'KonnectED',
  kreative: 'Kreative',
};

// Cookie name storing preferred home suite
const HOME_SUITE_COOKIE = 'konnaxion.homeSuite';

// Normalize cookie value
function normalizeSuite(raw: string | undefined | null): SuiteKey {
  const value = (raw ?? '').toLowerCase();
  if (
    value === 'ekoh' ||
    value === 'ethikos' ||
    value === 'keenkonnect' ||
    value === 'konnected' ||
    value === 'kreative'
  ) {
    return value;
  }
  return 'ekoh'; // default fallback
}

// Rebuild backend root from NEXT_PUBLIC_API_BASE
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
const BACKEND_ROOT = RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/, '');

// Full backend login/signup URLs
const BACKEND_LOGIN_URL = BACKEND_ROOT
  ? `${BACKEND_ROOT}/accounts/login/`
  : '/accounts/login/';

const BACKEND_SIGNUP_URL = BACKEND_ROOT
  ? `${BACKEND_ROOT}/accounts/signup/`
  : '/accounts/signup/';

export default async function Page() {
  // In newer Next/TypeScript typings, cookies() is async and returns a Promise<ReadonlyRequestCookies>
  const store = await cookies();
  const rawPref = store.get(HOME_SUITE_COOKIE)?.value ?? null;

  const suite = normalizeSuite(rawPref);
  const preferredPath = HOME_BY_SUITE[suite];
  const preferredLabel = SUITE_LABEL[suite];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl space-y-10">
        <header className="space-y-5 text-center">
          <div className="flex justify-center">
            <img
              src="/LogoK.svg"
              alt="Konnaxion logo"
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Welcome to Konnaxion
            </h1>
            <p className="text-sm md:text-base text-gray-500">
              A unified ecosystem for learning, collaboration, ethical choices,
              and creative expression.
            </p>
          </div>
        </header>

        {/* Sign in / sign up */}
        <section className="flex flex-col items-center gap-3">
          <div className="inline-flex flex-wrap items-center justify-center gap-3">
            <a
              href={BACKEND_LOGIN_URL}
              className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
            >
              Sign in
            </a>
            <a
              href={BACKEND_SIGNUP_URL}
              className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
            >
              Create an account
            </a>
          </div>
          <p className="text-xs text-gray-400">
            You&apos;ll be redirected back to Konnaxion after signing in.
          </p>
        </section>

        {/* Preferred space shortcut */}
        <section className="flex flex-col items-center gap-3">
          <a
            href={preferredPath}
            className="inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Go straight to your preferred space ({preferredLabel})
          </a>
          <p className="text-xs text-gray-400">
            You can switch space at any time from the navigation.
          </p>
        </section>

        {/* Module cards */}
        <section className="grid gap-4 md:grid-cols-2">
          <a
            href={HOME_BY_SUITE.ekoh}
            className="border rounded-xl px-4 py-5 hover:bg-gray-50 transition flex flex-col gap-1"
          >
            <h2 className="font-semibold">Distribute influence with EkoH</h2>
            <p className="text-xs text-gray-500">
              Use merit-based, ethics-aware weighting to surface the most
              trustworthy expertise across Konnaxion.
            </p>
          </a>

          <a
            href={HOME_BY_SUITE.ethikos}
            className="border rounded-xl px-4 py-5 hover:bg-gray-50 transition flex flex-col gap-1"
          >
            <h2 className="font-semibold">Take positions with ethiKos</h2>
            <p className="text-xs text-gray-500">
              Explore structured ethical questions, see how different groups
              position themselves, and ground decisions in shared values.
            </p>
          </a>

          <a
            href={HOME_BY_SUITE.keenkonnect}
            className="border rounded-xl px-4 py-5 hover:bg-gray-50 transition flex flex-col gap-1"
          >
            <h2 className="font-semibold">Build solutions with keenKonnect</h2>
            <p className="text-xs text-gray-500">
              Co-create practical, technological projects to solve common
              problems, from clean energy to health and resilience.
            </p>
          </a>

          <a
            href={HOME_BY_SUITE.konnected}
            className="border rounded-xl px-4 py-5 hover:bg-gray-50 transition flex flex-col gap-1"
          >
            <h2 className="font-semibold">Learn together with KonnectED</h2>
            <p className="text-xs text-gray-500">
              Share foundational knowledge, practical skills, and inclusive
              learning paths for communities around the world.
            </p>
          </a>

          <a
            href={HOME_BY_SUITE.kreative}
            className="border rounded-xl px-4 py-5 hover:bg-gray-50 transition flex flex-col gap-1 md:col-span-2"
          >
            <h2 className="font-semibold">Create and curate with Kreative</h2>
            <p className="text-xs text-gray-500">
              Showcase art, preserve cultural heritage, and co-create immersive
              experiences through digital galleries and collaborations.
            </p>
          </a>
        </section>
      </div>
    </main>
  );
}
