import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isSafeHttpsUrl,
  isSupabaseConfigured,
  signInWithGoogle,
  signInWithGithub,
  signInWithEntra,
  signOutUser,
  getCurrentUser,
} from '../services/supabaseClient';

const GOOGLE_CLIENT_ID = '905048514453-nvuv8q589bhkv121o1lugquu19u2dgsc.apps.googleusercontent.com';

const makeAuthMock = () => ({
  signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
  signInWithIdToken: vi.fn().mockResolvedValue({ error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'learner@basicfrench.org' } } }),
});

const loadModule = async (
  env: { url?: string; key?: string; googleClientId?: string },
  auth = makeAuthMock()
) => {
  vi.resetModules();
  vi.stubEnv('VITE_SUPABASE_URL', env.url ?? '');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', env.key ?? '');
  if (env.googleClientId !== undefined) {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', env.googleClientId);
  }
  const createClient = vi.fn().mockReturnValue({ auth });
  vi.doMock('@supabase/supabase-js', () => ({ createClient }));
  const mod = await import('../services/supabaseClient');
  return { mod, auth, createClient };
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.doUnmock('@supabase/supabase-js');
  vi.resetModules();
});

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

describe('supabaseClient - direct Google OIDC & configured cloud mode', () => {
  const env = { url: 'https://abc.supabase.co', key: 'valid-anon-key' };
  let assignMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    assignMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        origin: 'https://basicfrench.org',
        pathname: '/',
        search: '',
        hash: '',
        assign: assignMock,
      },
      writable: true,
    });
  });

  it('signs in directly with Google OIDC using the site origin and exchanges hash id_token with Supabase', async () => {
    const { mod, auth } = await loadModule(env);

    expect((await mod.signInWithGoogle()).error).toBeNull();
    expect(auth.signInWithOAuth).not.toHaveBeenCalled();
    expect(assignMock).toHaveBeenCalledTimes(1);

    const authUrl = new URL(assignMock.mock.calls[0][0]);
    expect(`${authUrl.origin}${authUrl.pathname}`).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl.searchParams.get('client_id')).toBe(GOOGLE_CLIENT_ID);
    expect(authUrl.searchParams.get('redirect_uri')).toBe('https://basicfrench.org');
    expect(authUrl.searchParams.get('response_type')).toBe('id_token');
    expect(authUrl.searchParams.get('scope')).toBe('openid email profile');
    expect(authUrl.searchParams.get('nonce')).toMatch(/^[a-f0-9]{64}$/);
    const storedNonce = sessionStorage.getItem(mod.GOOGLE_NONCE_STORAGE_KEY);
    expect(storedNonce).toBeTruthy();

    const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    window.location.hash = '#id_token=google.jwt.token';
    await mod.consumeGoogleIdTokenFromHash();

    expect(auth.signInWithIdToken).toHaveBeenCalledWith({
      provider: 'google',
      token: 'google.jwt.token',
      nonce: storedNonce,
    });
    expect(sessionStorage.getItem(mod.GOOGLE_NONCE_STORAGE_KEY)).toBeNull();
    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    replaceStateSpy.mockRestore();
  });

  it('falls back to Supabase OAuth for Google when VITE_GOOGLE_CLIENT_ID is empty', async () => {
    const { mod, auth } = await loadModule({ ...env, googleClientId: '' });

    expect((await mod.signInWithGoogle()).error).toBeNull();
    expect(assignMock).not.toHaveBeenCalled();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'https://basicfrench.org' },
    });
  });
});
