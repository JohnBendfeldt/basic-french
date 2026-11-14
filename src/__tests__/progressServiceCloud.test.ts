import { vi } from 'vitest';

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: (...args: any[]) => mockGetUser(...args),
    },
    from: (...args: any[]) => mockFrom(...args),
  },
}));

import {
  ProgressService,
  LOCAL_STORAGE_SESSIONS_KEY,
  LOCAL_STORAGE_WORDS_KEY,
} from '../services/progressService';

describe('ProgressService Cloud Sync & Supabase Resilience', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('upserts word attempts to Supabase and retries without target column if schema lacks target', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-fr-1' } } });

    const selectSingle = vi.fn().mockResolvedValue({
      data: { times_correct: 2, times_incorrect: 0, mastery_level: 2 },
    });

    const upsertFirstSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Could not find the "target" column of "word_progress"' },
    });

    const upsertRetrySingle = vi.fn().mockResolvedValue({
      data: {
        id: 'row-1',
        user_id: 'user-fr-1',
        category: 'basicPhrases',
        word_id: 'phrase-bonjour',
        prompt: 'Bonjour',
        answer: 'Hello',
        times_correct: 3,
        times_incorrect: 0,
        last_tested_at: '2026-11-13T00:00:00Z',
        mastery_level: 3,
      },
      error: null,
    });

    let upsertCallCount = 0;
    const eqChain: { eq: () => typeof eqChain; single: typeof selectSingle } = {
      eq: () => eqChain,
      single: selectSingle,
    };
    mockFrom.mockImplementation(() => ({
      select: () => eqChain,
      upsert: () => {
        upsertCallCount++;
        return {
          select: () => ({
            single: upsertCallCount === 1 ? upsertFirstSingle : upsertRetrySingle,
          }),
        };
      },
    }));

    const result = await ProgressService.recordWordAttempt({
      category: 'basicPhrases',
      wordId: 'phrase-bonjour',
      prompt: 'Bonjour',
      answer: 'Hello',
      target: 'Bonjour',
      isCorrect: true,
    });

    expect(upsertCallCount).toBe(2);
    expect(result.masteryLevel).toBe(3);
    expect(result.userId).toBe('user-fr-1');
  });

  it('records quiz sessions and fetches aggregated stats from Supabase when authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-fr-1' } } });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'quiz_sessions') {
        return {
          insert: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: 'cloud-sess-1',
                    user_id: 'user-fr-1',
                    category: 'all',
                    score: 9,
                    total_questions: 10,
                    percentage: 90,
                    completed_at: '2026-11-13T12:00:00Z',
                  },
                  error: null,
                }),
            }),
          }),
          select: () => ({
            eq: () => ({
              order: () => ({
                limit: () =>
                  Promise.resolve({
                    data: [
                      {
                        id: 'cloud-sess-1',
                        user_id: 'user-fr-1',
                        category: 'all',
                        score: 9,
                        total_questions: 10,
                        percentage: 90,
                        completed_at: '2026-11-13T12:00:00Z',
                      },
                    ],
                  }),
              }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          eq: () =>
            Object.assign(
              Promise.resolve({
                data: [
                  {
                    id: 'w-1',
                    user_id: 'user-fr-1',
                    category: 'numbers',
                    word_id: 'numbers-70',
                    prompt: 'soixante-dix',
                    answer: '70',
                    times_correct: 5,
                    times_incorrect: 0,
                    last_tested_at: '2026-11-13T12:00:00Z',
                    mastery_level: 5,
                  },
                ],
              }),
              {
                gte: () => Promise.resolve({ data: [{ word_id: 'numbers-70' }] }),
              }
            ),
        }),
      };
    });

    const session = await ProgressService.recordQuizSession({
      category: 'all',
      score: 9,
      totalQuestions: 10,
    });
    expect(session.id).toBe('cloud-sess-1');
    expect(session.percentage).toBe(90);

    const mastered = await ProgressService.getMasteredWordIds();
    expect(mastered.has('numbers-70')).toBe(true);

    const stats = await ProgressService.getUserStats();
    expect(stats.totalQuizzesTaken).toBe(1);
    expect(stats.averageScore).toBe(90);
    expect(stats.wordsMasteredCount).toBe(1);
  });

  it('syncs guest progress to cloud, clears synced caches, and retains local data if upload fails', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-fr-1' } } });

    localStorage.setItem(
      LOCAL_STORAGE_WORDS_KEY,
      JSON.stringify({
        w1: {
          userId: 'guest_user',
          category: 'words',
          wordId: 'w1',
          prompt: 'eau',
          answer: 'water',
          timesCorrect: 1,
          timesIncorrect: 0,
          lastTestedAt: '2026-11-13T00:00:00Z',
          masteryLevel: 1,
        },
      })
    );
    localStorage.setItem(
      LOCAL_STORAGE_SESSIONS_KEY,
      JSON.stringify([
        {
          id: 's1',
          userId: 'guest_user',
          category: 'words',
          score: 5,
          totalQuestions: 5,
          percentage: 100,
          completedAt: '2026-11-13T00:00:00Z',
        },
      ])
    );

    // First test partial failure -> sessions fail, words succeed
    mockFrom.mockImplementation((table: string) => {
      if (table === 'word_progress') {
        return { upsert: () => Promise.resolve({ error: null }) };
      }
      return { insert: () => Promise.resolve({ error: { message: 'network error' } }) };
    });

    await ProgressService.syncGuestDataToCloud();
    expect(localStorage.getItem(LOCAL_STORAGE_WORDS_KEY)).toBeNull();
    expect(localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY)).not.toBeNull();

    // Retry when sessions succeed -> clears remaining local sessions
    mockFrom.mockImplementation(() => ({
      upsert: () => Promise.resolve({ error: null }),
      insert: () => Promise.resolve({ error: null }),
    }));

    await ProgressService.syncGuestDataToCloud();
    expect(localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY)).toBeNull();

    infoSpy.mockRestore();
  });
});
