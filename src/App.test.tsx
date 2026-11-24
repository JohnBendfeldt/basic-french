import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('Basic French App Shell', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('renders header brand, French alphabet section, Basic Language School links, and GitHub link', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Basic French/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Basic French/i })).toHaveAttribute(
      'title',
      'Return to alphabet lessons'
    );
    expect(document.querySelector('svg.app-emblem')).toHaveAttribute('aria-hidden', 'true');

    const headerHubLink = screen.getByRole('link', {
      name: /Explore 15\+ world languages on Basic Language School/i,
    });
    expect(headerHubLink).toHaveAttribute('href', 'https://basiclanguage.school');

    const footerHubLink = screen.getByRole('link', { name: /^Basic Language School$/i });
    expect(footerHubLink).toHaveAttribute('href', 'https://basiclanguage.school');

    const footerAuthorLink = screen.getByRole('link', { name: /^John Bendfeldt$/i });
    expect(footerAuthorLink).toHaveAttribute('href', 'https://johnbendfeldt.com');
    expect(footerAuthorLink).toHaveAttribute('rel', 'noopener noreferrer author');

    const footerGithubLink = screen.getByRole('link', { name: /^GitHub$/i });
    expect(footerGithubLink).toHaveAttribute('href', 'https://github.com/JohnBendfeldt/basic-french');
    expect(footerGithubLink).toHaveAttribute('rel', 'noopener noreferrer');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /French Alphabet & Phonetics/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('link', { name: /Terms of Service/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Terms of Service', level: 2 })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: /MIT License/i })).toHaveAttribute(
      'href',
      'https://github.com/JohnBendfeldt/basic-french/blob/main/LICENSE'
    );
  });
});
