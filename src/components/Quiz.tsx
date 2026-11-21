import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FaTrophy,
  FaRedo,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaGraduationCap,
  FaVolumeUp,
  FaInfoCircle,
} from 'react-icons/fa';
import PronunciationButton from './PronunciationButton';
import { ProgressService } from '../services/progressService';
import { MASTERY_THRESHOLD } from '../types/progress';
import { speak } from '../utils/speech';
import { getScrollBehavior } from '../utils/useModalAccessibility';
import {
  FRENCH_ACCENT_CHARS,
  FRENCH_ACCENT_TIPS,
  normalizeFrenchText,
  normalizeEnglishAnswer,
  getSpellingDifferences,
  checkFrenchNumberEquivalence,
  levenshteinDistance,
} from '../utils/frenchText';
import { AlphabetItem, PhraseItem } from '../types/index';

export type QuizCategoryFilter =
  | 'all'
  | 'alphabet'
  | 'basicPhrases'
  | 'numbers'
  | 'time'
  | 'commonWords';

interface QuizProps {
  data: {
    alphabet?: AlphabetItem[];
    basicPhrases?: PhraseItem[];
    numbers?: PhraseItem[];
    time?: PhraseItem[];
    commonWords?: PhraseItem[];
    [key: string]: any;
  };
}

interface QuestionDef {
  item: AlphabetItem | PhraseItem;
  isFrenchToEnglish: boolean;
  id: string;
  wordId: string;
  category: Exclude<QuizCategoryFilter, 'all'>;
}

interface ActiveQuestion {
  id: string;
  wordId: string;
  type: Exclude<QuizCategoryFilter, 'all'>;
  prompt: string;
  answer: string;
  hint: string;
  target: string;
  pronunciation?: string;
  isFrenchToEnglish: boolean;
  badgeIcon: string;
  badgeText: string;
  audioCategory: 'alphabet' | 'phrases' | 'numbers' | 'time' | 'words' | 'examples';
}

const isQuestionMastered = (
  q: { id?: string; wordId?: string },
  masteredSet: Set<string>
): boolean => Boolean((q.wordId && masteredSet.has(q.wordId)) || (q.id && masteredSet.has(q.id)));

interface MissedWord {
  prompt: string;
  answer: string;
  userAnswer: string;
  category: string;
  target?: string;
  isFrenchToEnglish?: boolean;
}

export interface GradeResult {
  isCorrect: boolean;
  usedAccentForgiveness: boolean;
  spellingDiff: Array<{ char: string; isDiff: boolean }> | null;
  matchedCandidate: string;
}

/**
 * Grade a learner's answer against French or English target answers,
 * supporting slash-separated alternatives, French accent forgiveness with
 * diff highlighting, French vigesimal number equivalence, and minor typos.
 */
export const gradeQuizAnswer = (
  userRaw: string,
  expectedAnswer: string,
  isFrenchToEnglish: boolean
): GradeResult => {
  const trimmedUser = userRaw.trim().slice(0, 250);
  if (!trimmedUser) {
    return {
      isCorrect: false,
      usedAccentForgiveness: false,
      spellingDiff: null,
      matchedCandidate: expectedAnswer,
    };
  }

  const rawParts = expectedAnswer.split('/').map(p => p.trim()).filter(Boolean);
  const expandedCandidates: string[] = [expectedAnswer.trim()];
  const EDITORIAL_TAG = /^(?:formal|informal|singular|plural|masculine|feminine|cup|video|lit\.?)$/i;

  for (const part of rawParts) {
    // Expand French optional feminine "(e)" -> both masculine and feminine spellings (e.g. Enchanté(e) -> Enchanté, Enchantée)
    if (/\p{L}\(e\)/u.test(part)) {
      expandedCandidates.push(part.replace(/(\p{L})\(e\)/gu, '$1').trim());
      expandedCandidates.push(part.replace(/(\p{L})\(e\)/gu, '$1e').trim());
    }
    const stripped = part.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    if (stripped) expandedCandidates.push(stripped);

    // Extract substantive parenthetical time expressions (e.g. "It is 3:30 (half past three)")
    if (isFrenchToEnglish) {
      const parenMatches = part.matchAll(/\(([^)]+)\)/g);
      for (const m of parenMatches) {
        const inner = m[1].trim();
        if (inner && !EDITORIAL_TAG.test(inner)) {
          expandedCandidates.push(inner);
          if (/^it is\s+/i.test(stripped)) {
            expandedCandidates.push(`It is ${inner}`);
          }
        }
      }
      const clockMatch = stripped.match(/\b\d{1,2}:\d{2}\b/);
      if (clockMatch) {
        expandedCandidates.push(clockMatch[0]);
      }
    }
  }
  const rawCandidates = rawParts.map(part => part.replace(/\s*\([^)]*\)\s*/g, ' ').trim()).filter(Boolean);
  const candidates = Array.from(new Set(expandedCandidates.filter(Boolean)));

  if (!isFrenchToEnglish) {
    // Learner is typing French
    const userWithAccents = normalizeFrenchText(trimmedUser, true);
    const userNoAccents = normalizeFrenchText(trimmedUser, false);

    for (const candidate of candidates) {
      const candWithAccents = normalizeFrenchText(candidate, true);
      if (candWithAccents && userWithAccents === candWithAccents) {
        return {
          isCorrect: true,
          usedAccentForgiveness: false,
          spellingDiff: null,
          matchedCandidate: candidate,
        };
      }
    }

    for (const candidate of candidates) {
      const candNoAccents = normalizeFrenchText(candidate, false);
      if (candNoAccents && userNoAccents === candNoAccents) {
        return {
          isCorrect: true,
          usedAccentForgiveness: true,
          spellingDiff: getSpellingDifferences(trimmedUser, candidate),
          matchedCandidate: candidate,
        };
      }
    }

    for (const candidate of candidates) {
      if (checkFrenchNumberEquivalence(trimmedUser, candidate)) {
        return {
          isCorrect: true,
          usedAccentForgiveness: false,
          spellingDiff: null,
          matchedCandidate: candidate,
        };
      }
    }

    for (const candidate of candidates) {
      const candNoAccents = normalizeFrenchText(candidate, false);
      if (
        candNoAccents.length >= 5 &&
        userNoAccents.length >= 4 &&
        !/\d/.test(candNoAccents) &&
        !/\d/.test(userNoAccents) &&
        levenshteinDistance(userNoAccents, candNoAccents) <= 1
      ) {
        return {
          isCorrect: true,
          usedAccentForgiveness: false,
          spellingDiff: getSpellingDifferences(trimmedUser, candidate),
          matchedCandidate: candidate,
        };
      }
    }
  } else {
    // Learner is typing English meaning
    const normUserEn = normalizeEnglishAnswer(trimmedUser);

    for (const candidate of candidates) {
      const normCandEn = normalizeEnglishAnswer(candidate);
      if (
        normCandEn &&
        (normUserEn === normCandEn ||
          (normCandEn.startsWith('to ') && normUserEn === normCandEn.slice(3)))
      ) {
        return {
          isCorrect: true,
          usedAccentForgiveness: false,
          spellingDiff: null,
          matchedCandidate: candidate,
        };
      }
    }

    for (const candidate of candidates) {
      if (checkFrenchNumberEquivalence(trimmedUser, candidate)) {
        return {
          isCorrect: true,
          usedAccentForgiveness: false,
          spellingDiff: null,
          matchedCandidate: candidate,
        };
      }
    }

    for (const candidate of candidates) {
      const normCandEn = normalizeEnglishAnswer(candidate);
      if (
        normCandEn.length >= 5 &&
        normUserEn.length >= 4 &&
        !/\d/.test(normCandEn) &&
        !/\d/.test(normUserEn) &&
        levenshteinDistance(normUserEn, normCandEn) <= 1
      ) {
        return {
          isCorrect: true,
          usedAccentForgiveness: false,
          spellingDiff: getSpellingDifferences(trimmedUser, candidate),
          matchedCandidate: candidate,
        };
      }
    }
  }

  return {
    isCorrect: false,
    usedAccentForgiveness: false,
    spellingDiff: null,
    matchedCandidate: rawCandidates[0] || expectedAnswer,
  };
};

const getAudioCategory = (
  questionType: string
): 'alphabet' | 'phrases' | 'numbers' | 'time' | 'words' | 'examples' => {
  switch (questionType) {
    case 'alphabet':
      return 'examples';
    case 'basicPhrases':
      return 'phrases';
    case 'numbers':
      return 'numbers';
    case 'time':
      return 'time';
    case 'commonWords':
      return 'words';
    default:
      return 'phrases';
  }
};

const CATEGORY_TABS: ReadonlyArray<{ id: QuizCategoryFilter; label: string; icon: string }> = [
  { id: 'all', label: 'All Topics', icon: '🎯' },
  { id: 'alphabet', label: 'Alphabet', icon: '🔤' },
  { id: 'basicPhrases', label: 'Phrases', icon: '💬' },
  { id: 'numbers', label: 'Numbers', icon: '🔢' },
  { id: 'time', label: 'Time', icon: '⏰' },
  { id: 'commonWords', label: 'Words', icon: '📖' },
];

const renderAccentTipExample = (accent: string, example: string): React.ReactNode => {
  switch (accent) {
    case 'é':
      return (
        <>
          <span lang="fr">café, été</span> (pronounced &quot;ay&quot;)
        </>
      );
    case 'è / ê':
      return (
        <>
          <span lang="fr">père, fête</span> (open &quot;eh&quot;)
        </>
      );
    case 'ç':
      return (
        <>
          <span lang="fr">ça va, français</span> (soft &quot;s&quot; before a/o/u)
        </>
      );
    case 'à / ù':
      return (
        <>
          <span lang="fr">à</span> (to/at) vs <span lang="fr">a</span> (has),{' '}
          <span lang="fr">où</span> (where) vs <span lang="fr">ou</span> (or)
        </>
      );
    case 'œ':
      return <span lang="fr">{example}</span>;
    default:
      return <span lang="fr">{example}</span>;
  }
};

const Quiz: React.FC<QuizProps> = ({ data }) => {
  const [sessionGoal, setSessionGoal] = useState<number>(() => {
    const saved = localStorage.getItem('french_quiz_goal');
    if (saved) {
      const num = parseInt(saved, 10);
      if ([5, 10, 20].includes(num)) return num;
    }
    return 10;
  });

  const [selectedCategory, setSelectedCategory] = useState<QuizCategoryFilter>('all');
  const [masteredWordIds, setMasteredWordIds] = useState<Set<string>>(new Set());
  const masteredWordIdsRef = useRef<Set<string>>(new Set());
  const [isWordJustMastered, setIsWordJustMastered] = useState(false);
  const [isOverridden, setIsOverridden] = useState(false);

  const [sessionIndex, setSessionIndex] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionAnswered, setSessionAnswered] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [missedInSession, setMissedInSession] = useState<MissedWord[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<ActiveQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [spellingDiff, setSpellingDiff] = useState<Array<{ char: string; isDiff: boolean }> | null>(null);
  const [usedAccentForgiveness, setUsedAccentForgiveness] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showAccentTips, setShowAccentTips] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const incorrectSoundRef = useRef<HTMLAudioElement | null>(null);
  const lastWordAttemptPromiseRef = useRef<Promise<any> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const accentToggleRef = useRef<HTMLButtonElement>(null);
  const categoryTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const recapTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const preserveTabFocusRef = useRef(false);
  const askedQuestionsRef = useRef<Set<string>>(new Set());
  const sessionStatsRef = useRef<{
    score: number;
    total: number;
    category: string;
    isSaved: boolean;
  }>({
    score: 0,
    total: 0,
    category: 'all',
    isSaved: false,
  });

  useEffect(() => {
    if (!showAccentTips) return;
    const handleAccentEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowAccentTips(false);
        accentToggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleAccentEsc);
    return () => document.removeEventListener('keydown', handleAccentEsc);
  }, [showAccentTips]);

  const buildQuestionPool = useCallback(
    (categoryFilter: QuizCategoryFilter): QuestionDef[] => {
      if (!data) return [];
      const questions: QuestionDef[] = [];

      const includeCat = (cat: Exclude<QuizCategoryFilter, 'all'>) =>
        categoryFilter === 'all' || categoryFilter === cat;

      if (includeCat('alphabet') && Array.isArray(data.alphabet)) {
        data.alphabet.forEach(item => {
          if (!item.word || !item.meaning) return;
          const canonicalWordId = `alphabet-${item.letter}`;
          questions.push({
            item,
            isFrenchToEnglish: true,
            id: `alphabet-${item.letter}-fr-to-en`,
            wordId: canonicalWordId,
            category: 'alphabet',
          });
          questions.push({
            item,
            isFrenchToEnglish: false,
            id: `alphabet-${item.letter}-en-to-fr`,
            wordId: canonicalWordId,
            category: 'alphabet',
          });
        });
      }

      const phraseCategories: Array<Exclude<QuizCategoryFilter, 'all' | 'alphabet'>> = [
        'basicPhrases',
        'numbers',
        'time',
        'commonWords',
      ];

      phraseCategories.forEach(cat => {
        const list = data[cat];
        if (includeCat(cat) && Array.isArray(list)) {
          list.forEach((item: PhraseItem) => {
            if (!item.phrase || !item.translation) return;
            const canonicalWordId = `${cat}-${item.phrase}`;
            questions.push({
              item,
              isFrenchToEnglish: true,
              id: `${cat}-${item.phrase}-fr-to-en`,
              wordId: canonicalWordId,
              category: cat,
            });
            questions.push({
              item,
              isFrenchToEnglish: false,
              id: `${cat}-${item.phrase}-en-to-fr`,
              wordId: canonicalWordId,
              category: cat,
            });
          });
        }
      });

      return questions;
    },
    [data]
  );

  const allQuestionsForCounts = useMemo(() => buildQuestionPool('all'), [buildQuestionPool]);

  const categoryCounts = useMemo(() => {
    const counts: Record<QuizCategoryFilter, { total: number; mastered: number; wordIds: Set<string> }> = {
      all: { total: 0, mastered: 0, wordIds: new Set() },
      alphabet: { total: 0, mastered: 0, wordIds: new Set() },
      basicPhrases: { total: 0, mastered: 0, wordIds: new Set() },
      numbers: { total: 0, mastered: 0, wordIds: new Set() },
      time: { total: 0, mastered: 0, wordIds: new Set() },
      commonWords: { total: 0, mastered: 0, wordIds: new Set() },
    };

    allQuestionsForCounts.forEach(q => {
      const mastered = isQuestionMastered(q, masteredWordIds);
      if (!counts.all.wordIds.has(q.wordId)) {
        counts.all.wordIds.add(q.wordId);
        counts.all.total += 1;
        if (mastered) counts.all.mastered += 1;
      }
      if (counts[q.category] && !counts[q.category].wordIds.has(q.wordId)) {
        counts[q.category].wordIds.add(q.wordId);
        counts[q.category].total += 1;
        if (mastered) counts[q.category].mastered += 1;
      }
    });

    return counts;
  }, [allQuestionsForCounts, masteredWordIds]);

  const activeTotalWords = categoryCounts[selectedCategory]?.total || 0;
  const masteredInScope = categoryCounts[selectedCategory]?.mastered || 0;
  const remainingToMaster = Math.max(0, activeTotalWords - masteredInScope);

  const formatQuestion = (selected: QuestionDef): ActiveQuestion => {
    if (selected.category === 'alphabet') {
      const item = selected.item as AlphabetItem;
      const word = item.word || item.example;
      const meaning = item.meaning || item.example;
      if (selected.isFrenchToEnglish) {
        return {
          id: selected.id,
          wordId: selected.wordId,
          type: 'alphabet',
          prompt: `${item.letter} — ${word}`,
          answer: meaning,
          hint: `What does the French example word "${word}" mean in English?`,
          target: word,
          pronunciation: item.pronunciation,
          isFrenchToEnglish: true,
          badgeIcon: '🔤',
          badgeText: 'French Alphabet & Vocabulary',
          audioCategory: 'examples',
        };
      }
      const startsWithLetter = normalizeFrenchText(word, false).startsWith(
        normalizeFrenchText(item.letter, false)
      );
      return {
        id: selected.id,
        wordId: selected.wordId,
        type: 'alphabet',
        prompt: `${meaning} (${startsWithLetter ? 'starts with' : 'contains'} ${item.letter})`,
        answer: word,
        hint: `How do you write "${meaning}" in French?`,
        target: word,
        pronunciation: item.pronunciation,
        isFrenchToEnglish: false,
        badgeIcon: '✍️',
        badgeText: 'Spell in French',
        audioCategory: 'examples',
      };
    }

    const item = selected.item as PhraseItem;
    const audioCategory = getAudioCategory(selected.category);
    if (selected.isFrenchToEnglish) {
      return {
        id: selected.id,
        wordId: selected.wordId,
        type: selected.category,
        prompt: item.phrase,
        answer: item.translation,
        hint: 'What does this mean in English?',
        target: item.phrase,
        pronunciation: item.pronunciation,
        isFrenchToEnglish: true,
        badgeIcon: '🇫🇷 → 🇬🇧',
        badgeText: 'French to English',
        audioCategory,
      };
    }
    return {
      id: selected.id,
      wordId: selected.wordId,
      type: selected.category,
      prompt: item.translation,
      answer: item.phrase,
      hint: 'How do you say this in French?',
      target: item.phrase,
      pronunciation: item.pronunciation,
      isFrenchToEnglish: false,
      badgeIcon: '🇬🇧 → 🇫🇷',
      badgeText: 'English to French',
      audioCategory,
    };
  };

  const getRandomQuestion = useCallback(
    (overrideMastered?: Set<string>, overrideCategory?: QuizCategoryFilter) => {
      setUserAnswer('');
      setIsCorrect(null);
      setIsOverridden(false);
      setSpellingDiff(null);
      setUsedAccentForgiveness(false);
      setShowNext(false);
      setIsWordJustMastered(false);

      const cat = overrideCategory ?? selectedCategory;
      const pool = buildQuestionPool(cat);
      if (pool.length === 0) {
        setCurrentQuestion(null);
        return;
      }

      const activeMastered = overrideMastered || masteredWordIdsRef.current;

      let candidatePool = pool.filter(
        q => !isQuestionMastered(q, activeMastered) && !askedQuestionsRef.current.has(q.id)
      );

      if (candidatePool.length === 0) {
        askedQuestionsRef.current.clear();
        candidatePool = pool.filter(q => !isQuestionMastered(q, activeMastered));
      }

      if (candidatePool.length === 0) {
        candidatePool = pool;
      }

      const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      askedQuestionsRef.current.add(selected.id);
      setCurrentQuestion(formatQuestion(selected));
    },
    [buildQuestionPool, selectedCategory]
  );

  useEffect(() => {
    let active = true;
    ProgressService.getMasteredWordIds()
      .then(ids => {
        if (!active) return;
        masteredWordIdsRef.current = ids;
        setMasteredWordIds(ids);
        if (ids.size > 0) {
          setCurrentQuestion(prev => {
            if (prev && isQuestionMastered(prev, ids) && sessionStatsRef.current.total === 0) {
              queueMicrotask(() => getRandomQuestion(ids));
            }
            return prev;
          });
        }
      })
      .catch(err => console.warn('Could not load mastered word IDs:', err));
    return () => {
      active = false;
    };
  }, [getRandomQuestion]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      getRandomQuestion();
      try {
        correctSoundRef.current = new Audio('/audio/sounds/correct.mp3');
        incorrectSoundRef.current = new Audio('/audio/sounds/incorrect.mp3');
      } catch {
        // Ignore Audio init failures in restricted environments
      }
    }
  }, [getRandomQuestion]);

  useEffect(() => {
    if (preserveTabFocusRef.current) {
      preserveTabFocusRef.current = false;
      return;
    }
    if (currentQuestion && !showNext && !isSessionComplete && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [currentQuestion, showNext, isSessionComplete]);

  useEffect(() => {
    return () => {
      const currentStats = sessionStatsRef.current;
      if (currentStats.total >= 3 && !currentStats.isSaved) {
        ProgressService.recordQuizSession({
          category: currentStats.category,
          score: currentStats.score,
          totalQuestions: currentStats.total,
        }).catch(err => console.warn('Could not save partial quiz session:', err));
      }
      try {
        correctSoundRef.current?.pause();
        incorrectSoundRef.current?.pause();
      } catch {
        // Ignore audio pause failures on unmount
      }
    };
  }, []);

  const playSound = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    } catch {
      // Ignore sound effect failures
    }
  };

  const playAudio = useCallback(
    (
      textToSpeak: string,
      rate = 1.0,
      category?: 'alphabet' | 'phrases' | 'numbers' | 'time' | 'words' | 'examples'
    ) => {
      if (!textToSpeak) return;
      setIsPlayingAudio(true);
      try {
        speak(
          textToSpeak,
          'fr-FR',
          'quiz-audio-controller',
          () => setIsPlayingAudio(false),
          () => setIsPlayingAudio(false),
          { rate, category }
        );
      } catch {
        setIsPlayingAudio(false);
      }
    },
    []
  );

  const handleInsertAccent = (char: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    if (showNext) return;
    const isPointerClick = Boolean(e && e.detail > 0);
    const input = inputRef.current;
    if (input && typeof input.selectionStart === 'number' && typeof input.selectionEnd === 'number') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const updated = (userAnswer.slice(0, start) + char + userAnswer.slice(end)).slice(0, 250);
      setUserAnswer(updated);
      requestAnimationFrame(() => {
        if (isPointerClick) {
          input.focus({ preventScroll: true });
        }
        const cursor = Math.min(start + char.length, updated.length);
        try {
          input.setSelectionRange(cursor, cursor);
        } catch {
          // Ignore selection range errors on unfocused inputs in some environments
        }
      });
    } else {
      setUserAnswer(prev => (prev + char).slice(0, 250));
      if (isPointerClick) {
        input?.focus({ preventScroll: true });
      }
    }
  };

  const handleCheckAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim() || showNext) return;

    const grade = gradeQuizAnswer(
      userAnswer,
      currentQuestion.answer,
      currentQuestion.isFrenchToEnglish
    );

    const newAnswered = sessionAnswered + 1;
    const newScore = grade.isCorrect ? sessionScore + 1 : sessionScore;

    setIsCorrect(grade.isCorrect);
    setSpellingDiff(grade.spellingDiff);
    setUsedAccentForgiveness(grade.usedAccentForgiveness);
    setSessionAnswered(newAnswered);
    setSessionScore(newScore);
    setShowNext(true);

    playSound(grade.isCorrect ? correctSoundRef.current : incorrectSoundRef.current);

    sessionStatsRef.current = {
      score: newScore,
      total: newAnswered,
      category: selectedCategory,
      isSaved: false,
    };

    if (!grade.isCorrect) {
      setMissedInSession(prev => [
        ...prev,
        {
          prompt: currentQuestion.prompt,
          answer: currentQuestion.answer,
          userAnswer: userAnswer.trim(),
          category: currentQuestion.type,
          target: currentQuestion.target,
          isFrenchToEnglish: currentQuestion.isFrenchToEnglish,
        },
      ]);
    }

    try {
      const attemptPromise = ProgressService.recordWordAttempt({
        category: currentQuestion.type,
        wordId: currentQuestion.wordId,
        prompt: currentQuestion.prompt,
        answer: currentQuestion.answer,
        target: currentQuestion.target,
        isCorrect: grade.isCorrect,
      });
      lastWordAttemptPromiseRef.current = attemptPromise;
      const updatedWord = await attemptPromise;

      if (
        grade.isCorrect &&
        updatedWord.masteryLevel >= MASTERY_THRESHOLD &&
        !masteredWordIdsRef.current.has(updatedWord.wordId)
      ) {
        const nextSet = new Set(masteredWordIdsRef.current);
        nextSet.add(updatedWord.wordId);
        nextSet.add(currentQuestion.wordId);
        nextSet.add(currentQuestion.id);
        masteredWordIdsRef.current = nextSet;
        setMasteredWordIds(nextSet);
        setIsWordJustMastered(true);
      }
    } catch (err) {
      console.warn('Could not record word attempt:', err);
    }
  };

  const handleOverrideAnswer = async () => {
    if (isCorrect || !currentQuestion) return;
    setIsCorrect(true);
    setIsOverridden(true);
    setUsedAccentForgiveness(false);
    setSpellingDiff(null);
    const newScore = sessionScore + 1;
    setSessionScore(newScore);
    sessionStatsRef.current.score = newScore;
    setMissedInSession(prev => prev.filter(m => m.prompt !== currentQuestion.prompt));
    playSound(correctSoundRef.current);

    const questionSnapshot = currentQuestion;
    try {
      if (lastWordAttemptPromiseRef.current) {
        await lastWordAttemptPromiseRef.current;
      }
      const updatedWord = await ProgressService.overrideWordAttempt({
        category: questionSnapshot.type,
        wordId: questionSnapshot.wordId,
        prompt: questionSnapshot.prompt,
        answer: questionSnapshot.answer,
        target: questionSnapshot.target,
      });
      if (updatedWord && updatedWord.masteryLevel >= MASTERY_THRESHOLD) {
        const nextSet = new Set(masteredWordIdsRef.current);
        nextSet.add(updatedWord.wordId);
        nextSet.add(questionSnapshot.wordId);
        nextSet.add(questionSnapshot.id);
        masteredWordIdsRef.current = nextSet;
        setMasteredWordIds(nextSet);
        if (currentQuestion?.id === questionSnapshot.id) {
          setIsWordJustMastered(true);
        }
      }
    } catch (err) {
      console.warn('Error overriding word attempt:', err);
    }
  };

  const handleNextQuestion = useCallback(() => {
    setSessionIndex(prev => prev + 1);
    getRandomQuestion();
  }, [getRandomQuestion]);

  const handleCompleteSession = useCallback(async () => {
    setIsSessionComplete(true);
    sessionStatsRef.current.isSaved = true;
    window.scrollTo({ top: 0, behavior: getScrollBehavior() });
    try {
      await ProgressService.recordQuizSession({
        category: selectedCategory,
        score: sessionScore,
        totalQuestions: sessionAnswered || sessionGoal,
      });
    } catch (err) {
      console.warn('Could not record completed quiz session:', err);
    }
  }, [selectedCategory, sessionScore, sessionAnswered, sessionGoal]);

  const startNewQuizSession = useCallback(
    (newGoal?: number, newCategory?: QuizCategoryFilter) => {
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
      const goal = newGoal !== undefined ? newGoal : sessionGoal;
      const cat = newCategory !== undefined ? newCategory : selectedCategory;

      if (newGoal !== undefined && newGoal !== sessionGoal) {
        setSessionGoal(goal);
        localStorage.setItem('french_quiz_goal', goal.toString());
      }
      if (newCategory !== undefined && newCategory !== selectedCategory) {
        setSelectedCategory(cat);
      }

      askedQuestionsRef.current.clear();
      setSessionIndex(1);
      setSessionScore(0);
      setSessionAnswered(0);
      setMissedInSession([]);
      setIsSessionComplete(false);
      setShowNext(false);
      setUserAnswer('');
      setIsCorrect(null);
      setIsOverridden(false);
      setSpellingDiff(null);
      setUsedAccentForgiveness(false);
      setIsWordJustMastered(false);

      sessionStatsRef.current = {
        score: 0,
        total: 0,
        category: cat,
        isSaved: false,
      };

      getRandomQuestion(undefined, cat);
    },
    [sessionGoal, selectedCategory, getRandomQuestion]
  );

  const handleGoalChange = (newGoal: number) => {
    if (newGoal === sessionGoal) return;
    localStorage.setItem('french_quiz_goal', newGoal.toString());
    setSessionGoal(newGoal);

    if (sessionAnswered >= newGoal) {
      setIsSessionComplete(true);
      sessionStatsRef.current.isSaved = true;
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
      ProgressService.recordQuizSession({
        category: selectedCategory,
        score: sessionScore,
        totalQuestions: sessionAnswered,
      }).catch(err => console.warn('Could not save quiz session on goal change:', err));
    }
  };

  const handleCategoryChange = (cat: QuizCategoryFilter) => {
    if (cat === selectedCategory) return;
    startNewQuizSession(sessionGoal, cat);
  };

  const handleCategoryTabKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    refs: React.MutableRefObject<Array<HTMLButtonElement | null>>
  ) => {
    const count = CATEGORY_TABS.length;
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % count;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + count) % count;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = count - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      preserveTabFocusRef.current = true;
      const nextTab = CATEGORY_TABS[nextIndex];
      handleCategoryChange(nextTab.id);
      refs.current[nextIndex]?.focus();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      if (document.querySelector('[role="dialog"]')) return;

      if (
        e.target instanceof Element &&
        e.target.closest(
          'button, a, input, select, textarea, [role="button"], [role="tab"], [role="menuitem"]'
        )
      ) {
        return;
      }

      if (isSessionComplete) {
        e.preventDefault();
        startNewQuizSession();
      } else if (showNext) {
        e.preventDefault();
        if (sessionAnswered >= sessionGoal) {
          handleCompleteSession();
        } else {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isSessionComplete,
    showNext,
    sessionAnswered,
    sessionGoal,
    handleCompleteSession,
    handleNextQuestion,
    startNewQuizSession,
  ]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!showNext) {
        handleCheckAnswer();
      } else if (sessionAnswered >= sessionGoal) {
        handleCompleteSession();
      } else {
        handleNextQuestion();
      }
    }
  };

  const primaryCorrectAnswer = currentQuestion
    ? currentQuestion.answer.includes('/')
      ? currentQuestion.answer.split('/')[0].trim()
      : currentQuestion.answer
    : '';

  if (isSessionComplete) {
    const completedTotal = sessionAnswered > 0 ? sessionAnswered : sessionGoal;
    const percentage = completedTotal > 0 ? Math.min(100, Math.round((sessionScore / completedTotal) * 100)) : 0;

    let headlineTitle = 'Félicitations !';
    let headlinePronunciation = 'fay-lee-see-tah-syohn';
    let headlineEnglish = 'Outstanding French mastery!';
    let recapIcon = <FaTrophy className="recap-icon gold" aria-hidden="true" />;

    if (percentage >= 90) {
      headlineTitle = 'Félicitations !';
      headlinePronunciation = 'fay-lee-see-tah-syohn';
      headlineEnglish = 'Outstanding French mastery!';
      recapIcon = <FaTrophy className="recap-icon gold" aria-hidden="true" />;
    } else if (percentage >= 70) {
      headlineTitle = 'Très bien !';
      headlinePronunciation = 'treh byehn';
      headlineEnglish = 'Great job — your French is coming along nicely!';
      recapIcon = <FaStar className="recap-icon silver" aria-hidden="true" />;
    } else if (percentage >= 50) {
      headlineTitle = 'Bon effort !';
      headlinePronunciation = 'boh-neh-for';
      headlineEnglish = 'Good effort — keep building momentum!';
      recapIcon = <FaStar className="recap-icon bronze" aria-hidden="true" />;
    } else {
      headlineTitle = 'Continuez !';
      headlinePronunciation = 'kohn-tee-nway';
      headlineEnglish = 'Keep practicing — every question brings you closer!';
      recapIcon = <FaGraduationCap className="recap-icon practice" aria-hidden="true" />;
    }

    return (
      <div className="section quiz-section quiz-recap-section">
        <h2 className="quiz-recap-title">Quiz Session Complete!</h2>

        <div className="quiz-card quiz-recap-card">
          <div className="recap-header">
            <div className="recap-title-row">
              <span className="recap-icon-inline" aria-hidden="true">{recapIcon}</span>
              <h3 className="recap-headline-title" lang="fr">{headlineTitle}</h3>
            </div>
            <div className="recap-subtitle-row">
              {headlinePronunciation && (
                <>
                  <span className="recap-pronunciation">
                    Pronunciation: <span className="pronunciation-text">{headlinePronunciation}</span>
                  </span>
                  <span className="recap-separator" aria-hidden="true">·</span>
                </>
              )}
              <span className="recap-english-subtitle" lang="en">{headlineEnglish}</span>
            </div>
          </div>

          <div className="recap-hero-score">
            <div className="recap-ring-wrap">
              <svg className="recap-progress-ring" width="164" height="164" viewBox="0 0 164 164" aria-hidden="true">
                <defs>
                  <linearGradient id="scoreRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={percentage === 100 ? '#f59e0b' : percentage >= 80 ? '#3b82f6' : '#1d4ed8'} />
                    <stop offset="100%" stopColor={percentage === 100 ? '#fbbf24' : percentage >= 80 ? '#6366f1' : '#1e3a8a'} />
                  </linearGradient>
                </defs>
                <circle
                  className="recap-ring-track"
                  cx="82"
                  cy="82"
                  r={72}
                  strokeWidth="10"
                />
                <circle
                  className="recap-ring-bar"
                  cx="82"
                  cy="82"
                  r={72}
                  strokeWidth="10"
                  strokeDasharray={452.39}
                  strokeDashoffset={452.39 - (percentage / 100) * 452.39}
                  strokeLinecap="round"
                  transform="rotate(-90 82 82)"
                />
              </svg>
              <div className="recap-ring-label">
                <span className="recap-score-percent">{percentage}%</span>
                <span className="recap-score-ratio">{sessionScore} / {completedTotal} correct</span>
              </div>
            </div>

            <div className="recap-stats-grid" role="group" aria-label="Session summary stats">
              <div className="recap-stat-card">
                <span className="stat-label"><span aria-hidden="true">🎯 </span>Goal</span>
                <span className="stat-value">{completedTotal} Qs</span>
              </div>
              <div className="recap-stat-card correct">
                <span className="stat-label"><span aria-hidden="true">✅ </span>Correct</span>
                <span className="stat-value">{sessionScore}</span>
              </div>
              <div className="recap-stat-card highlight">
                <span className="stat-label"><span aria-hidden="true">🏆 </span>Mastered</span>
                <span className="stat-value">{masteredInScope} / {activeTotalWords}</span>
              </div>
              <div className="recap-stat-card pool-left">
                <span className="stat-label"><span aria-hidden="true">📚 </span>Remaining</span>
                <span className="stat-value">{remainingToMaster}</span>
              </div>
            </div>

            <p className="recap-save-notice">
              <FaCheckCircle className="notice-icon" aria-hidden="true" /> Logged as 1 completed quiz in your learning progress
            </p>
          </div>

          {missedInSession.length > 0 && (
            <div className="recap-missed-section">
              <h3>Words to Review from This Session ({missedInSession.length})</h3>
              <p className="missed-hint">Listen to the correct French pronunciation to reinforce your memory:</p>
              <div className="missed-words-list">
                {missedInSession.map((item, idx) => (
                  <div key={idx} className="missed-word-item">
                    <div className="missed-word-details">
                      <div
                        className="missed-word-prompt"
                        lang={item.isFrenchToEnglish ? 'fr' : 'en'}
                      >
                        {item.prompt}
                      </div>
                      <div className="missed-word-answers">
                        <span className="correct-answer-text">
                          Answer:{' '}
                          <strong lang={item.isFrenchToEnglish ? 'en' : 'fr'}>
                            {item.answer.split('/')[0].trim()}
                          </strong>
                        </span>
                        {item.userAnswer && (
                          <span className="user-answer-text">
                            You typed:{' '}
                            <span
                              className="strikethrough"
                              lang={item.isFrenchToEnglish ? 'en' : 'fr'}
                            >
                              {item.userAnswer}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    <PronunciationButton
                      text={item.target || item.prompt}
                      audioCategory={getAudioCategory(item.category)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recap-next-session">
            <div className="recap-topic-selector">
              <span className="goal-picker-label">Choose topic:</span>
              <div className="recap-topic-pills" role="tablist" aria-label="Choose quiz topic">
                {CATEGORY_TABS.map((tab, idx) => {
                  const isActive = selectedCategory === tab.id;
                  const countInfo = categoryCounts[tab.id];
                  const totalCount = countInfo?.total || 0;
                  const unitBase = tab.id === 'alphabet' ? 'letter' : tab.id === 'basicPhrases' ? 'phrase' : tab.id === 'commonWords' ? 'word' : 'item';
                  const unitText = `${totalCount} ${totalCount === 1 ? unitBase : `${unitBase}s`}`;
                  return (
                    <button
                      key={tab.id}
                      ref={el => {
                        recapTabRefs.current[idx] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`recap-cat-tab-${tab.id}`}
                      aria-selected={isActive}
                      tabIndex={isActive ? 0 : -1}
                      className={`recap-topic-pill ${isActive ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(tab.id)}
                      onKeyDown={e => handleCategoryTabKeyDown(e, idx, recapTabRefs)}
                      title={`Switch to ${tab.label} (${unitText})`}
                    >
                      <span className="cat-icon" aria-hidden="true">{tab.icon}</span>
                      <span className="cat-label">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="recap-goal-picker">
              <span className="goal-picker-label">Choose next quiz length:</span>
              <div className="goal-picker-buttons" role="group" aria-label="Next quiz length">
                {[5, 10, 20].map(count => (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={sessionGoal === count}
                    className={`recap-goal-btn ${sessionGoal === count ? 'active' : ''}`}
                    onClick={() => {
                      setSessionGoal(count);
                      localStorage.setItem('french_quiz_goal', count.toString());
                    }}
                    title={`Set next quiz to ${count} questions`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-buttons recap-quiz-buttons">
              <button
                type="button"
                className="next-button start-new-quiz-button"
                onClick={() => startNewQuizSession(sessionGoal)}
                title="Start next quiz session"
              >
                <span className="btn-main-label">
                  <FaRedo className="btn-icon" aria-hidden="true" /> Start Next Quiz ({sessionGoal} Qs)
                </span>
                <span className="btn-hint-badge" aria-hidden="true">
                  press <span className="btn-kbd">↵ Enter</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !currentQuestion) {
    return (
      <div className="section quiz-section">
        <h2>Test Your French Knowledge</h2>
        <div className="quiz-card">
          <h3>No quiz questions available</h3>
          <p>Please select another category or load curriculum data.</p>
        </div>
      </div>
    );
  }

  const progressPercent =
    sessionGoal > 0 ? Math.min(100, Math.round((sessionAnswered / sessionGoal) * 100)) : 0;

  return (
    <div className="section quiz-section">
      <h2 className="quiz-page-title">Test Your French Knowledge</h2>

      {/* Category Filter Pills */}
      <div className="quiz-category-bar" role="tablist" aria-label="Quiz category filter">
        {CATEGORY_TABS.map((tab, idx) => {
          const isSelected = selectedCategory === tab.id;
          const countInfo = categoryCounts[tab.id];
          return (
            <button
              key={tab.id}
              ref={el => {
                categoryTabRefs.current[idx] = el;
              }}
              id={`quiz-cat-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="quiz-active-panel"
              tabIndex={isSelected ? 0 : -1}
              className={`quiz-category-pill ${isSelected ? 'active' : ''}`}
              onClick={() => handleCategoryChange(tab.id)}
              onKeyDown={e => handleCategoryTabKeyDown(e, idx, categoryTabRefs)}
            >
              <span className="cat-icon" aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
              <span className="cat-count-badge">
                {countInfo?.mastered ? `${countInfo.mastered}/${countInfo.total}` : (countInfo?.total || 0)}
                <span className="visually-hidden">
                  {countInfo?.mastered ? ' words mastered' : ' words'}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="quiz-active-panel"
        role="tabpanel"
        aria-labelledby={`quiz-cat-tab-${selectedCategory}`}
      >
        {/* Quiz Progress HUD */}
        <div className="quiz-header-panel">
          <div
            className="quiz-progress-bar-container"
            role="progressbar"
            aria-valuenow={sessionAnswered}
            aria-valuemin={0}
            aria-valuemax={sessionGoal}
            aria-label="Session progress"
          >
            <div
              className="quiz-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="quiz-top-bar">
            <div className="session-progress-counter">
              <span className="counter-label">Question</span>
              <span className="counter-current">{sessionIndex}</span>
              <span className="counter-total">of {sessionGoal}</span>
            </div>

            <div className="session-score-badge">
              <span>
                Score: <strong>{sessionScore}</strong> / {sessionAnswered}
              </span>
            </div>

            <div className="quiz-goal-selector" role="group" aria-label="Session question count">
              {[5, 10, 20].map(count => (
                <button
                  key={count}
                  type="button"
                  aria-pressed={sessionGoal === count}
                  className={`goal-pill ${sessionGoal === count ? 'active' : ''}`}
                  onClick={() => handleGoalChange(count)}
                  title={`Set quiz session to ${count} questions`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>

          <div className="curriculum-pool-badge" title="Mastered words are removed from future questions">
            <span className="pool-icon" aria-hidden="true">🏆</span>
            <span>
              Mastered: <strong>{masteredInScope}</strong> / {activeTotalWords}
            </span>
            <span className="pool-remaining-tag">({remainingToMaster} remaining)</span>
          </div>
        </div>

        <div className="quiz-card">
          <div className="quiz-mode-pill-container">
            <span className="quiz-mode-pill">
              <span aria-hidden="true">{currentQuestion.badgeIcon}</span>{' '}
              <span>{currentQuestion.badgeText}</span>
            </span>
          </div>

          <h3 id="quiz-question-hint" className="quiz-question-hint">
            {currentQuestion.hint}
          </h3>

          <div className="quiz-prompt">
            <span
              id="quiz-question-prompt"
              className="quiz-prompt-text"
              lang={currentQuestion.isFrenchToEnglish ? 'fr' : 'en'}
            >
              {currentQuestion.prompt}
            </span>
            {currentQuestion.isFrenchToEnglish && currentQuestion.target && (
              <PronunciationButton
                text={currentQuestion.target}
                className="quiz-prompt-audio margin-left"
                audioCategory={currentQuestion.audioCategory}
              />
            )}
          </div>

          {/* Native French Audio Toolbar (hidden on English -> French prompts to avoid spoiling answer) */}
          {currentQuestion.isFrenchToEnglish && currentQuestion.target && (
            <div className="quiz-audio-controller" role="toolbar" aria-label="Audio controls">
              <button
                type="button"
                className={`quiz-audio-btn primary ${isPlayingAudio ? 'playing' : ''}`}
                onClick={() => playAudio(currentQuestion.target, 1.0, currentQuestion.audioCategory)}
              >
                <FaVolumeUp className={isPlayingAudio ? 'pulse-animation' : ''} aria-hidden="true" />
                <span>{isPlayingAudio ? 'Speaking...' : 'Play Audio'}</span>
              </button>
              <button
                type="button"
                className="quiz-audio-btn slow"
                onClick={() => playAudio(currentQuestion.target, 0.7, currentQuestion.audioCategory)}
                aria-label="Slow (0.7x) — Play audio slowly at 0.7x speed"
                title="Listen at slower 0.7x speed"
              >
                <span className="slow-icon" aria-hidden="true">🐢</span>
                <span>Slow (0.7x)</span>
              </button>
            </div>
          )}

          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              className="quiz-input"
              value={userAnswer}
              maxLength={250}
              onChange={(e) => setUserAnswer(e.target.value.slice(0, 250))}
              onKeyDown={handleInputKeyDown}
              placeholder={
                currentQuestion.isFrenchToEnglish
                  ? 'Type the English meaning...'
                  : 'Type your answer in French...'
              }
              lang={currentQuestion.isFrenchToEnglish ? 'en' : 'fr'}
              aria-label="Quiz answer input"
              aria-describedby="quiz-question-hint quiz-question-prompt"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={showNext}
            />
          </div>

          {/* French Accent Quick-Insert Bar when typing French */}
          {!currentQuestion.isFrenchToEnglish && (
            <div className="french-accent-helper" role="region" aria-label="French accent characters">
              <div className="french-accent-bar">
                {FRENCH_ACCENT_CHARS.map(char => (
                  <button
                    key={char}
                    type="button"
                    className="accent-key-btn"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => handleInsertAccent(char, e)}
                    disabled={showNext}
                    aria-label={`Insert ${char}`}
                    title={`Insert ${char}`}
                  >
                    <span lang="fr">{char}</span>
                  </button>
                ))}
                <button
                  ref={accentToggleRef}
                  type="button"
                  className={`accent-guide-toggle ${showAccentTips ? 'active' : ''}`}
                  onClick={() => setShowAccentTips(prev => !prev)}
                  aria-expanded={showAccentTips}
                  aria-controls={showAccentTips ? 'french-accent-tips-popover' : undefined}
                  aria-label="Accents — French accent guide"
                  title="How French accents work"
                >
                  <FaInfoCircle aria-hidden="true" />
                  <span>Accents</span>
                </button>
              </div>

              {showAccentTips && (
                <div
                  id="french-accent-tips-popover"
                  className="accent-tips-popover"
                  role="note"
                  aria-label="French accent tips"
                >
                  <div className="accent-tips-header">
                    <strong>French Accent Marks Guide</strong>
                    <span>Unaccented answers are accepted too!</span>
                  </div>
                  <ul className="accent-tips-list">
                    {FRENCH_ACCENT_TIPS.map(tip => (
                      <li key={tip.accent}>
                        <span className="accent-badge" lang="fr">{tip.accent}</span>
                        <strong lang="fr">{tip.name}:</strong>{' '}
                        {renderAccentTipExample(tip.accent, tip.example)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="quiz-buttons">
            {!showNext && (
              <button
                type="button"
                className="check-button"
                onClick={handleCheckAnswer}
              >
                <span className="btn-main-label">Check Answer</span>
                <span className="btn-hint-badge" aria-hidden="true">
                  press <span className="btn-kbd">↵ Enter</span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Persistent Polite Live Region for Feedback Drawer */}
      <div className="quiz-feedback-live-region" aria-live="polite">
        {showNext && isCorrect !== null && (
          <div
            className={`quiz-feedback-drawer ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
            role="region"
            aria-label="Answer feedback"
          >
            <div className="feedback-drawer-inner">
              <div className="feedback-info-area">
                <div className="feedback-header-row">
                  {isCorrect ? (
                    <FaCheckCircle className="feedback-icon correct-icon" aria-hidden="true" />
                  ) : (
                    <FaTimesCircle className="feedback-icon incorrect-icon" aria-hidden="true" />
                  )}
                  <div className="feedback-text-content">
                    <span className="feedback-title">
                      {isCorrect ? (isOverridden ? 'Correct! (Overridden)' : 'Correct!') : 'Not quite'}
                    </span>

                    {isCorrect && isOverridden && (
                      <div className="feedback-overridden-note">
                        Answer accepted as correct — score &amp; mastery updated!
                      </div>
                    )}

                    {!isCorrect && (
                      <div className="feedback-answer-line">
                        <span>The correct answer is: </span>
                        <strong
                          className="feedback-correct-word"
                          lang={currentQuestion.isFrenchToEnglish ? 'en' : 'fr'}
                        >
                          {primaryCorrectAnswer}
                        </strong>
                      </div>
                    )}

                    {isCorrect && spellingDiff && (
                      <div className="spelling-note">
                        <span>
                          {usedAccentForgiveness
                            ? 'Correct French spelling with accents: '
                            : 'Exact spelling: '}
                        </span>
                        <strong lang={currentQuestion.isFrenchToEnglish ? 'en' : 'fr'}>
                          {spellingDiff.map((part, idx) => (
                            <span key={idx} className={part.isDiff ? 'diff-char' : undefined}>
                              {part.char}
                            </span>
                          ))}
                        </strong>
                      </div>
                    )}

                    {isCorrect && isWordJustMastered && (
                      <div className="word-mastered-note">
                        <span aria-hidden="true">🏆 </span>
                        <strong>Word Mastered ({MASTERY_THRESHOLD}/{MASTERY_THRESHOLD})!</strong> Removed from upcoming questions.
                      </div>
                    )}
                  </div>
                </div>

                {currentQuestion.target && (
                  <div className="feedback-audio-action">
                    <PronunciationButton
                      text={currentQuestion.target}
                      className="feedback-pronounce-btn"
                      audioCategory={currentQuestion.audioCategory}
                    />
                  </div>
                )}
              </div>

              <div className="feedback-action-area">
                {!isCorrect && (
                  <button
                    type="button"
                    className="feedback-override-button"
                    onClick={handleOverrideAnswer}
                    title="Mark my answer as correct (alternative valid translation or phrasing)"
                  >
                    <span aria-hidden="true">💡</span> I was right
                  </button>
                )}
                {sessionAnswered < sessionGoal ? (
                  <button
                    type="button"
                    className={`feedback-continue-button ${isCorrect ? 'btn-next-correct' : 'btn-next-incorrect'}`}
                    onClick={handleNextQuestion}
                  >
                    <span className="btn-main-label">
                      Next Question ({sessionIndex + 1}/{sessionGoal})
                    </span>
                    <span className="btn-hint-badge" aria-hidden="true">
                      press <span className="btn-kbd">↵ Enter</span>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="feedback-continue-button finish-quiz-button"
                    onClick={handleCompleteSession}
                  >
                    <span className="btn-main-label">
                      <FaCheckCircle className="btn-icon" aria-hidden="true" /> Complete Quiz &amp; View Results{' '}
                      <span aria-hidden="true">🎉</span>
                    </span>
                    <span className="btn-hint-badge" aria-hidden="true">
                      press <span className="btn-kbd">↵ Enter</span>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
