import { vi } from 'vitest';
import {
  isSafeHttpsUrl,
  isSupabaseConfigured,
  signInWithGoogle,
  signInWithGithub,
  signInWithEntra,
  signOutUser,
  getCurrentUser,
} from '../services/supabaseClient';

describe('supabaseClient Security & Guest Fallback', () => {
  it('validates strictly HTTPS URLs and rejects HTTP, javascript:, data:, and malformed URLs', () => {
    expect(isSafeHttpsUrl('https://abc.supabase.co')).toBe(true);
    expect(isSafeHttpsUrl('https://avatars.githubusercontent.com/u/12345')).toBe(true);

    expect(isSafeHttpsUrl(null)).toBe(false);
    expect(isSafeHttpsUrl(undefined)).toBe(false);
    expect(isSafeHttpsUrl('')).toBe(false);
    expect(isSafeHttpsUrl('http://insecure.example.com/avatar.png')).toBe(false);
    expect(isSafeHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpsUrl('data:image/svg+xml;base64,PHN2Zz4=')).toBe(false);
    expect(isSafeHttpsUrl('not-a-valid-url')).toBe(false);
  });

  it('gracefully operates in Guest Mode when Supabase env vars are absent', async () => {
    expect(isSupabaseConfigured()).toBe(false);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const googleRes = await signInWithGoogle();
    expect(googleRes.error?.message).toMatch(/Supabase is not configured/i);

    const githubRes = await signInWithGithub();
    expect(githubRes.error?.message).toMatch(/Supabase is not configured/i);

    const entraRes = await signInWithEntra();
    expect(entraRes.error?.message).toMatch(/Supabase is not configured/i);

    const signOutRes = await signOutUser();
    expect(signOutRes.error).toBeNull();

    const user = await getCurrentUser();
    expect(user).toBeNull();

    warnSpy.mockRestore();
  });
});
