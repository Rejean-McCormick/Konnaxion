'use client';

import React from 'react';
import Head from 'next/head';
import usePageTitle from '@/hooks/usePageTitle';

type KeenPageProps = {
  /** Gros titre de la page, affiché en <h1> */
  title: string;

  /** Sous-titre / description sous le titre */
  description?: string;

  /** Titre <title> du navigateur. Si non fourni, on génère "KeenKonnect · {title}" */
  metaTitle?: string;

  /** Contenu principal de la page */
  children: React.ReactNode;

  /**
   * Élément(s) à droite du titre (boutons d’action, filtres, etc.)
   * ex: <Button type="primary">New</Button>
   */
  toolbar?: React.ReactNode;

  /** Largeur max de la zone centrale */
  maxWidth?: number | string;
};

export default function KeenPage({
  title,
  description,
  metaTitle,
  children,
  toolbar,
  maxWidth = 1200,
}: KeenPageProps) {
  const finalMetaTitle = metaTitle ?? `KeenKonnect · ${title}`;

  // Synchronise le titre de l’onglet (hook existant dans ton codebase)
  usePageTitle(finalMetaTitle);

  return (
    <>
      <Head>
        <title>{finalMetaTitle}</title>
      </Head>

      <div className="container mx-auto p-5" style={{ maxWidth }}>
        {/* Header de page standardisé */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="mt-1 text-gray-500">{description}</p>
            )}
          </div>

          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>

        {/* Contenu spécifique à la page */}
        {children}
      </div>
    </>
  );
}
