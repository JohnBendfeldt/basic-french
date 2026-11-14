/**
 * Types for user authentication, quiz history, and spaced-repetition word progress
 * in Basic French (basicfrench.org).
 */

export type AuthProviderType = 'google' | 'azure' | 'github' | 'guest';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  provider: AuthProviderType;
  createdAt: string;
}

export interface QuizSession {
  id: string;
  userId: string;
  category: string; // 'alphabet' | 'numbers' | 'time' | 'basicPhrases' | 'commonWords' | 'all'
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface WordProgress {
  id?: string;
  userId: string;
  category: string;
  wordId: string; // e.g. "alphabet-A" or "basicPhrases-Bonjour"
  prompt: string;
  answer: string;
  target?: string;
  timesCorrect: number;
  timesIncorrect: number;
  lastTestedAt: string;
  masteryLevel: number; // 0 (learning) to 5 (mastered)
}

export interface UserStats {
  totalQuizzesTaken: number;
  averageScore: number;
  wordsMasteredCount: number;
  wordsLearningCount: number;
  wordsToReview: WordProgress[];
  recentSessions: QuizSession[];
}
