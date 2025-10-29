// pages/pageTemplate/index.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTemplate from './index';

describe('PageTemplate', () => {
  it('devrait afficher le titre générique', () => {
    render(<PageTemplate />);
    expect(screen.getByText('Titre de la Page Générique')).toBeInTheDocument();
  });
});
