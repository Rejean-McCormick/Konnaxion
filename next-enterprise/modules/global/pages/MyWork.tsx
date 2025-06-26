import React from 'react';
import { AppShell } from '../components/AppShell';

const MyWorkPage: React.FC = () => (
  <AppShell>
    <main className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">My Work</h1>
      <p>Your recent work items and tasks will appear here.</p>
      {/* TODO: replace with actual “My Work” listings */}
    </main>
  </AppShell>
);

export default MyWorkPage;

