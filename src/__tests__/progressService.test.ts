import { vi } from 'vitest';
import {
  ProgressService,
  LOCAL_STORAGE_SESSIONS_KEY,
  LOCAL_STORAGE_WORDS_KEY,
} from '../services/progressService';

describe('ProgressService (Guest Mode & LocalStorage Security)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records word attempts, increments/decrements mastery clamped to [0, 5], and tracks mastered IDs', async () => {
    const wordId = 'basicPhrases-Bonjour-fr-to-en';

    // Incorrect at mastery 0 stays clamped at 0
    const miss = await ProgressService.recordWordAttempt({
      category: 'basicPhrases',
      wordId,
      prompt: 'Bonjour',
      answer: 'Hello',
      target: 'Bonjour',
      isCorrect: false,
    });
    expect(miss.masteryLevel).toBe(0);
    expect(miss.timesIncorrect).toBe(1);

    // 5 consecutive correct answers reach mastery 5
    for (let i = 1; i <= 5; i++) {
      const hit = await ProgressService.recordWordAttempt({
        category: 'basicPhrases',
        wordId,
        prompt: 'Bonjour',
        answer: 'Hello',
        target: 'Bonjour',
        isCorrect: true,
      });
      expect(hit.masteryLevel).toBe(i);
    }

    // 6th correct stays clamped at 5
    const clamped = await ProgressService.recordWordAttempt({
      category: 'basicPhrases',
      wordId,
      prompt: 'Bonjour',
      answer: 'Hello',
      target: 'Bonjour',
      isCorrect: true,
    });
    expect(clamped.masteryLevel).toBe(5);

    const mastered = await ProgressService.getMasteredWordIds();
    expect(mastered.has(wordId)).toBe(true);
  });

  it('records quiz sessions, calculates percentages, and caps local storage at 100 sessions', async () => {
    for (let i = 0; i < 105; i++) {
      await ProgressService.recordQuizSession({
        category: 'numbers',
        score: 8,
        totalQuestions: 10,
      });
    }

    const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SESSIONS_KEY) || '[]');
    expect(stored).toHaveLength(100);
    expect(stored[0].percentage).toBe(80);

    const zeroTotal = await ProgressService.recordQuizSession({
      category: 'time',
      score: 0,
      totalQuestions: 0,
    });
    expect(zeroTotal.percentage).toBe(0);
  });

  it('aggregates user stats and surfaces missed words needing review (masteryLevel < 2)', async () => {
    await ProgressService.recordWordAttempt({
      category: 'commonWords',
      wordId: 'word-merci',
      prompt: 'merci',
      answer: 'thank you',
      isCorrect: false,
    });
    await ProgressService.recordQuizSession({
      category: 'commonWords',
      score: 4,
      totalQuestions: 5,
    });

    const stats = await ProgressService.getUserStats();
    expect(stats.totalQuizzesTaken).toBe(1);
    expect(stats.averageScore).toBe(80);
    expect(stats.wordsLearningCount).toBe(1);
    expect(stats.wordsToReview).toHaveLength(1);
    expect(stats.wordsToReview[0].wordId).toBe('word-merci');
  });

  it('blocks prototype-pollution keys (__proto__, constructor, prototype) and recovers from corrupted JSON', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    localStorage.setItem(LOCAL_STORAGE_SESSIONS_KEY, '{corrupted-json');
    localStorage.setItem(
      LOCAL_STORAGE_WORDS_KEY,
      '{"__proto__":{"polluted":true},"constructor":{"bad":true},"valid":{"wordId":"valid","masteryLevel":5,"timesCorrect":5,"timesIncorrect":0}}'
    );

    const mastered = await ProgressService.getMasteredWordIds();
    expect(mastered.has('valid')).toBe(true);
    expect(({} as any).polluted).toBeUndefined();

    const stats = await ProgressService.getUserStats();
    expect(stats.totalQuizzesTaken).toBe(0);
    expect(stats.wordsMasteredCount).toBe(1);

    // Array stored in words key is safely ignored
    localStorage.setItem(LOCAL_STORAGE_WORDS_KEY, '[1,2,3]');
    const statsAfterArray = await ProgressService.getUserStats();
    expect(statsAfterArray.wordsMasteredCount).toBe(0);

    warnSpy.mockRestore();
  });
});
