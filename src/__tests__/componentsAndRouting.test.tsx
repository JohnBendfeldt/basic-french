import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import UserMenu from '../components/UserMenu';

describe('SPA Routing, Modals, UserMenu Security & Ecosystem Links', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('navigates across Alphabet, Phrases, Numbers & Time, Common Words, Quiz, Privacy, and Terms with URL & popstate updates', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /French Alphabet & Phonetics/i })).toBeInTheDocument();
    });

    // Navigate via top Navigation to Numbers & Time
    fireEvent.click(screen.getByText('Numbers & Time'));
    expect(window.location.pathname).toBe('/numbers');
    expect(screen.getByRole('heading', { name: /French Numbers \(0–1,000\)/i })).toBeInTheDocument();

    // Switch sub-tab to Telling Time -> updates URL to /time
    fireEvent.click(screen.getByRole('tab', { name: /Telling Time/i }));
    expect(window.location.pathname).toBe('/time');
    expect(screen.getByRole('heading', { name: /Telling Time & Time Phrases/i })).toBeInTheDocument();

    // Navigate via BottomNavigation to Words
    fireEvent.click(screen.getByRole('button', { name: /Switch to Words section/i }));
    expect(window.location.pathname).toBe('/words');
    expect(screen.getByRole('heading', { name: /Common French Words/i })).toBeInTheDocument();

    // Footer Privacy Policy <-> Terms of Service navigation
    fireEvent.click(screen.getByRole('link', { name: /^Privacy Policy$/i }));
    expect(window.location.pathname).toBe('/privacy');
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /View Terms of Service/i }));
    expect(window.location.pathname).toBe('/terms');
    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();

    // Browser popstate back to /phrases
    act(() => {
      window.history.pushState({}, '', '/phrases');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByRole('heading', { name: /Basic French Phrases/i })).toBeInTheDocument();
  });

  it('handles PWA beforeinstallprompt and opens AuthModal & ProgressModal from guest UserMenu', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /French Alphabet & Phonetics/i })).toBeInTheDocument();
    });

    // Trigger PWA install banner
    const promptMock = vi.fn();
    const installEvent = new Event('beforeinstallprompt');
    Object.assign(installEvent, {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
    act(() => {
      window.dispatchEvent(installEvent);
    });

    const installBtn = screen.getByRole('button', { name: /Install App/i });
    fireEvent.click(installBtn);
    expect(promptMock).toHaveBeenCalled();

    // Open Guest AuthModal and try OAuth buttons in Guest Mode
    fireEvent.click(screen.getByRole('button', { name: /Sign in to sync progress/i }));
    expect(screen.getByRole('heading', { name: /Sync Your Learning Progress/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));
    expect(await screen.findByText(/Supabase is not configured/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));

    // Open Guest ProgressModal
    fireEvent.click(screen.getByRole('button', { name: /View learning stats/i }));
    expect(await screen.findByRole('heading', { name: /No Quiz History Yet/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
  });

  it('enforces HTTPS avatar validation and exposes 15+ Languages Hub + legal links in logged-in UserMenu', () => {
    const onNavigate = vi.fn();
    const { rerender } = render(
      <UserMenu
        onNavigate={onNavigate}
        initialUser={{
          email: 'camille@basicfrench.org',
          app_metadata: { provider: 'github' },
          user_metadata: {
            full_name: 'Camille Laurent',
            avatar_url: 'http://insecure.example.com/avatar.png',
          },
        }}
      />
    );

    // Insecure http:// avatar URL must NOT render an <img>
    expect(screen.queryByRole('img', { name: 'Camille Laurent' })).not.toBeInTheDocument();

    // Rerender with valid https:// avatar URL
    rerender(
      <UserMenu
        onNavigate={onNavigate}
        initialUser={{
          email: 'camille@basicfrench.org',
          app_metadata: { provider: 'github' },
          user_metadata: {
            full_name: 'Camille Laurent',
            avatar_url: 'https://avatars.githubusercontent.com/u/999',
          },
        }}
      />
    );

    const trigger = screen.getByRole('button', { name: /User menu for Camille Laurent/i });
    fireEvent.click(trigger);

    const hubLink = screen.getByRole('link', { name: /15\+ Languages Hub/i });
    expect(hubLink).toHaveAttribute('href', 'https://basiclanguage.school');
    expect(hubLink).toHaveAttribute('target', '_blank');

    fireEvent.click(screen.getByRole('button', { name: 'Privacy Policy' }));
    expect(onNavigate).toHaveBeenCalledWith('privacy');
  });
});
