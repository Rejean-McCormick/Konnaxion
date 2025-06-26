import React, { ReactNode } from 'react';
import { GlobalSearchBar } from './GlobalSearchBar';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex items-center">
        <img src="/assets/logo-light.svg" alt="Konnaxion" className="h-8 mr-4" />
        <GlobalSearchBar />
      </div>
    </header>
    <div className="flex-1 bg-gray-50">{children}</div>
    <footer className="bg-gray-100 text-center p-4">
      © {new Date().getFullYear()} Konnaxion
    </footer>
  </div>
);

