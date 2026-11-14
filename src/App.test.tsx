import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('Basic French App Shell', () => {
  it('renders header brand, French alphabet section, and Basic Language School links', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Basic French/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Basic French logo/i)).toBeInTheDocument();

    const headerHubLink = screen.getByRole('link', {
      name: /Explore 15\+ world languages on Basic Language School/i,
    });
    expect(headerHubLink).toHaveAttribute('href', 'https://basiclanguage.school');

    const footerHubLink = screen.getByRole('link', { name: /^Basic Language School$/i });
    expect(footerHubLink).toHaveAttribute('href', 'https://basiclanguage.school');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /French Alphabet & Phonetics/i })).toBeInTheDocument();
    });
  });
});
