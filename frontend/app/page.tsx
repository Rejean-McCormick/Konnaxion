// app/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Accueil',
  description: "Redirection vers le tableau de bord de l'utilisateur",
};

type SuiteKey = 'ekoh' | 'ethikos' | 'keenkonnect' | 'konnected' | 'kreative';

// URL d'accueil par module (avec le paramètre sidebar)
const HOME_BY_SUITE: Record<SuiteKey, string> = {
  ekoh: '/ekoh/dashboard?sidebar=ekoh',
  ethikos: '/ethikos/insights?sidebar=ethikos',
  keenkonnect: '/keenkonnect/dashboard?sidebar=keenkonnect',
  konnected: '/konnected/dashboard?sidebar=konnected',
  kreative: '/kreative/dashboard?sidebar=kreative',
};

// Nom du cookie qui stocke la préférence
const HOME_SUITE_COOKIE = 'konnaxion.homeSuite';

// Petit helper pour normaliser la valeur lue
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
  return 'ekoh'; // fallback par défaut
}

export default function Page() {
  const store = cookies();
  const rawPref = store.get(HOME_SUITE_COOKIE)?.value ?? null;

  const suite = normalizeSuite(rawPref);
  const target = HOME_BY_SUITE[suite];

  // Redirection serveur immédiate vers le bon dashboard
  redirect(target);
}
