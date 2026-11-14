/**
 * Shared TypeScript interfaces for Basic French (basicfrench.org)
 */

// Alphabet item structure
export interface AlphabetItem {
  letter: string;
  pronunciation: string;
  example: string;
  word?: string;        // French example word (e.g. Ami, Bonjour)
  meaning?: string;     // English meaning of example word (e.g. Friend, Hello)
  icon?: string;        // Visual emoji identifier
}

// Phrase / vocabulary item structure
export interface PhraseItem {
  phrase: string;        // Primary French phrase or word
  translation: string;   // English translation
  pronunciation: string; // Beginner phonetic guide
  category?: string;
  icon?: string;         // Visual emoji identifier
}

// Quiz-related interfaces
export interface QuizItem {
  prompt: string;
  answer: string;
  hint?: string;
  french?: string;
  target?: string;
  id?: string;
  type?: string;
}

// App data structure
export interface AppData {
  alphabet: AlphabetItem[];
  basicPhrases: PhraseItem[];
  numbers: PhraseItem[];
  time: PhraseItem[];
  commonWords: PhraseItem[];
}
