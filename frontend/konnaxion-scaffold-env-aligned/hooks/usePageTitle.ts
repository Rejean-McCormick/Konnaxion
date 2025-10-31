'use client';
import { useEffect } from 'react';

export default function usePageTitle(title: string) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const prev = document.title;
      document.title = title;
      return () => { document.title = prev; };
    }
  }, [title]);
}
