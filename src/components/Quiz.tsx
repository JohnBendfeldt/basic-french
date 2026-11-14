import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { speak } from '../utils/speech';
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
  category: Exclude<QuizCategoryFilter, 'all'>;
}

interface ActiveQuestion {
  id: string;
  type: Exclude<QuizCategoryFilter, 'all'>;
  prompt: string;
  answer: string;
  hint: string;
  target: string;
  pronunciation?: string;
  isFrenchToEnglish: boolean;
  badge: string;
  audioCategory: 'alphabet' | 'phrases' | 'numbers' | 'time' | 'words' | 'examples';
}

interface MissedWord {
  prompt: string;
  answer: string;
  userAnswer: string;
  category: string;
  target?: string;
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
  const trimmedUser = userRaw.trim();
  if (!trimmedUser) {
    return {
      isCorrect: false,
      usedAccentForgiveness: false,
      spellingDiff: null,
      matchedCandidate: expectedAnswer,
    };
  }

  const rawCandidates = expectedAnswer
    .split('/')
    .map(part => part.replace(/\s*\([^)]*\)\s*/g, ' ').trim())
    .filter(Boolean);
  const candidates = Array.from(new Set([expectedAnswer.trim(), ...rawCandidates]));

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
      if (normCandEn && normUserEn === normCandEn) {
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

const CATEGORY_TABS: ReadonlyArray<{ id: QuizCategoryFilter; label: string }> = [
  { id: 'all', label: 'All Topics' },
  { id: 'alphabet', label: 'Alphabet' },
  { id: 'basicPhrases', label: 'Phrases' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'time', label: 'Time' },
  { id: 'commonWords', label: 'Words' },
];

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

  const inputRef = useRef<HTMLInputElement>(null);
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

  const buildQuestionPool = useCallback(
    (categoryFilter: QuizCategoryFilter): QuestionDef[] => {
      if (!data) return [];
      const questions: QuestionDef[] = [];

      const includeCat = (cat: Exclude<QuizCategoryFilter, 'all'>) =>
        categoryFilter === 'all' || categoryFilter === cat;

      if (includeCat('alphabet') && Array.isArray(data.alphabet)) {
        data.alphabet.forEach(item => {
          if (!item.word || !item.meaning) return;
          questions.push({
            item,
            isFrenchToEnglish: true,
            id: `alphabet-${item.letter}-fr-to-en`,
            category: 'alphabet',
          });
          questions.push({
            item,
            isFrenchToEnglish: false,
            id: `alphabet-${item.letter}-en-to-fr`,
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
            questions.push({
              item,
              isFrenchToEnglish: true,
              id: `${cat}-${item.phrase}-fr-to-en`,
              category: cat,
            });
            questions.push({
              item,
              isFrenchToEnglish: false,
              id: `${cat}-${item.phrase}-en-to-fr`,
              category: cat,
            });
          });
        }
      });

      return questions;
    },
    [data]
  );

  const totalCurriculumQuestions = buildQuestionPool(selectedCategory).length;

  const formatQuestion = (selected: QuestionDef): ActiveQuestion => {
    if (selected.category === 'alphabet') {
      const item = selected.item as AlphabetItem;
      const word = item.word || item.example;
      const meaning = item.meaning || item.example;
      if (selected.isFrenchToEnglish) {
        return {
          id: selected.id,
          type: 'alphabet',
          prompt: `${item.letter} — ${word}`,
          answer: meaning,
          hint: `What does the French example word "${word}" mean in English?`,
          target: word,
          pronunciation: item.pronunciation,
          isFrenchToEnglish: true,
          badge: '🔤 French Alphabet & Vocabulary',
          audioCategory: 'examples',
        };
      }
      return {
        id: selected.id,
        type: 'alphabet',
        prompt: `${meaning} (starts with ${item.letter})`,
        answer: word,
        hint: `How do you write "${meaning}" in French?`,
        target: word,
        pronunciation: item.pronunciation,
        isFrenchToEnglish: false,
        badge: '✍️ Spell in French',
        audioCategory: 'examples',
      };
    }

    const item = selected.item as PhraseItem;
    const audioCategory = getAudioCategory(selected.category);
    if (selected.isFrenchToEnglish) {
      return {
        id: selected.id,
        type: selected.category,
        prompt: item.phrase,
        answer: item.translation,
        hint: 'What does this mean in English?',
        target: item.phrase,
        pronunciation: item.pronunciation,
        isFrenchToEnglish: true,
        badge: '🇫🇷 → 🇬🇧 French to English',
        audioCategory,
      };
    }
    return {
      id: selected.id,
      type: selected.category,
      prompt: item.translation,
      answer: item.phrase,
      hint: 'How do you say this in French?',
      target: item.phrase,
      pronunciation: item.pronunciation,
      isFrenchToEnglish: false,
      badge: '🇬🇧 → 🇫🇷 English to French',
      audioCategory,
    };
  };

  const getRandomQuestion = useCallback(
    (overrideMastered?: Set<string>, overrideCategory?: QuizCategoryFilter) => {
      setUserAnswer('');
      setIsCorrect(null);
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

      const activeMastered = overrideMastered || masteredWordIdsRef.current || masteredWordIds;

      let candidatePool = pool.filter(
        q => !activeMastered.has(q.id) && !askedQuestionsRef.current.has(q.id)
      );

      if (candidatePool.length === 0) {
        askedQuestionsRef.current.clear();
        candidatePool = pool.filter(q => !activeMastered.has(q.id));
      }

      if (candidatePool.length === 0) {
        candidatePool = pool;
      }

      const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      askedQuestionsRef.current.add(selected.id);
      setCurrentQuestion(formatQuestion(selected));
    },
    [buildQuestionPool, masteredWordIds, selectedCategory]
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
            if (prev && ids.has(prev.id) && sessionStatsRef.current.total === 0) {
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
    }
  }, [getRandomQuestion]);

  useEffect(() => {
    if (currentQuestion && !showNext && !isSessionComplete && inputRef.current) {
      inputRef.current.focus();
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
    };
  }, []);

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

  const handleInsertAccent = (char: string) => {
    if (showNext) return;
    const input = inputRef.current;
    if (input && typeof input.selectionStart === 'number' && typeof input.selectionEnd === 'number') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const updated = userAnswer.slice(0, start) + char + userAnswer.slice(end);
      setUserAnswer(updated);
      requestAnimationFrame(() => {
        input.focus();
        const cursor = start + char.length;
        input.setSelectionRange(cursor, cursor);
      });
    } else {
      setUserAnswer(prev => prev + char);
      input?.focus();
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
        },
      ]);
    }

    try {
      const updatedWord = await ProgressService.recordWordAttempt({
        category: currentQuestion.type,
        wordId: currentQuestion.id,
        prompt: currentQuestion.prompt,
        answer: currentQuestion.answer,
        target: currentQuestion.target,
        isCorrect: grade.isCorrect,
      });

      if (grade.isCorrect && updatedWord.masteryLevel >= 5 && !masteredWordIdsRef.current.has(currentQuestion.id)) {
        const nextSet = new Set(masteredWordIdsRef.current);
        nextSet.add(currentQuestion.id);
        masteredWordIdsRef.current = nextSet;
        setMasteredWordIds(nextSet);
        setIsWordJustMastered(true);
      }
    } catch (err) {
      console.warn('Could not record word attempt:', err);
    }
  };

  const handleNextQuestion = useCallback(() => {
    setSessionIndex(prev => prev + 1);
    getRandomQuestion();
  }, [getRandomQuestion]);

  const handleCompleteSession = useCallback(async () => {
    setIsSessionComplete(true);
    sessionStatsRef.current.isSaved = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      await ProgressService.recordQuizSession({
        category: selectedCategory,
        score: sessionScore,
        totalQuestions: sessionGoal,
      });
    } catch (err) {
      console.warn('Could not record completed quiz session:', err);
    }
  }, [selectedCategory, sessionScore, sessionGoal]);

  const startNewQuizSession = useCallback(
    (newGoal?: number, newCategory?: QuizCategoryFilter) => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isSessionComplete) {
          e.preventDefault();
          startNewQuizSession();
        } else if (showNext && !(e.target instanceof HTMLInputElement)) {
          e.preventDefault();
          if (sessionAnswered >= sessionGoal) {
            handleCompleteSession();
          } else {
            handleNextQuestion();
          }
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

  const activePoolIds = new Set(buildQuestionPool(selectedCategory).map(q => q.id));
  const masteredInScope = Array.from(masteredWordIds).filter(id => activePoolIds.has(id)).length;
  const remainingToMaster = Math.max(0, totalCurriculumQuestions - masteredInScope);

  if (isSessionComplete) {
    const percentage = sessionGoal > 0 ? Math.round((sessionScore / sessionGoal) * 100) : 0;

    let headlineTitle = 'Félicitations !';
    let headlinePronunciation = 'fay-lee-see-tah-syohn';
    let headlineEnglish = 'Outstanding French mastery!';
    let recapIcon = <FaTrophy className="recap-icon gold" />;

    if (percentage >= 90) {
      headlineTitle = 'Félicitations !';
      headlinePronunciation = 'fay-lee-see-tah-syohn';
      headlineEnglish = 'Outstanding French mastery!';
      recapIcon = <FaTrophy className="recap-icon gold" />;
    } else if (percentage >= 70) {
      headlineTitle = 'Très bien !';
      headlinePronunciation = 'treh byahn';
      headlineEnglish = 'Great job — your French is coming along nicely!';
      recapIcon = <FaStar className="recap-icon silver" />;
    } else if (percentage >= 50) {
      headlineTitle = 'Bon effort !';
      headlinePronunciation = 'bohn eh-for';
      headlineEnglish = 'Good effort — keep building momentum!';
      recapIcon = <FaStar className="recap-icon bronze" />;
    } else {
      headlineTitle = 'Continuez !';
      headlinePronunciation = 'kohn-tee-nway';
      headlineEnglish = 'Keep practicing — every question brings you closer!';
      recapIcon = <FaGraduationCap className="recap-icon practice" />;
    }

    return (
      <div className="section quiz-section quiz-recap-section">
        <h2 className="quiz-recap-title">Quiz Session Complete!</h2>

        <div className="quiz-card quiz-recap-card">
          <div className="recap-header">
            <div className="recap-title-row">
              <span className="recap-icon-inline">{recapIcon}</span>
              <h3 className="recap-headline-title">{headlineTitle}</h3>
            </div>
            <div className="recap-subtitle-row">
              {headlinePronunciation && (
                <span className="recap-pronunciation">
                  Pronunciation: <span className="pronunciation-text">{headlinePronunciation}</span>
                </span>
              )}
              <span className="recap-separator">·</span>
              <span className="recap-english-subtitle">{headlineEnglish}</span>
            </div>
          </div>

          <div className="recap-score-display">
            <div className="recap-score-main">
              <span className="recap-score-percent">{percentage}%</span>
              <span className="recap-score-ratio">{sessionScore} / {sessionGoal} correct</span>
            </div>

            <div className="recap-stats-row" role="group" aria-label="Session summary stats">
              <div className="recap-stat-pill">
                <span className="stat-label">Goal</span>
                <span className="stat-value">{sessionGoal} Qs</span>
              </div>
              <div className="recap-stat-pill correct">
                <span className="stat-label">Correct</span>
                <span className="stat-value">{sessionScore} ✓</span>
              </div>
              <div className="recap-stat-pill highlight">
                <span className="stat-label">Mastered</span>
                <span className="stat-value">{masteredInScope} / {totalCurriculumQuestions}</span>
              </div>
              <div className="recap-stat-pill pool-left">
                <span className="stat-label">Remaining</span>
                <span className="stat-value">{remainingToMaster}</span>
              </div>
            </div>

            <p className="recap-save-notice">
              <FaCheckCircle className="notice-icon" /> Logged as 1 completed quiz in your learning progress
            </p>
          </div>

          {missedInSession.length > 0 && (
            <div className="recap-missed-section">
              <h4>Words to Review from This Session ({missedInSession.length})</h4>
              <p className="missed-hint">Listen to the correct French pronunciation to reinforce your memory:</p>
              <div className="missed-words-list">
                {missedInSession.map((item, idx) => (
                  <div key={idx} className="missed-word-item">
                    <div className="missed-word-details">
                      <div className="missed-word-prompt">{item.prompt}</div>
                      <div className="missed-word-answers">
                        <span className="correct-answer-text">
                          Answer: <strong>{item.answer.split('/')[0].trim()}</strong>
                        </span>
                        {item.userAnswer && (
                          <span className="user-answer-text">
                            You typed: <span className="strikethrough">{item.userAnswer}</span>
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
            <div className="recap-goal-picker">
              <span className="goal-picker-label">Choose next quiz length:</span>
              <div className="goal-picker-buttons" role="group" aria-label="Next quiz length">
                {[5, 10, 20].map(count => (
                  <button
                    key={count}
                    type="button"
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
                autoFocus
                title="Start next quiz session"
                aria-label={`Start Next Quiz (${sessionGoal} Qs)`}
              >
                <span className="btn-main-label">
                  <FaRedo className="btn-icon" /> Start Next Quiz ({sessionGoal} Qs)
                </span>
                <span className="btn-hint-badge">
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
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selectedCategory === tab.id}
            className={`quiz-category-pill ${selectedCategory === tab.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quiz Progress HUD */}
      <div className="quiz-header-panel">
        <div className="quiz-progress-bar-container" aria-label="Session progress bar">
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
          <span className="pool-icon">🏆</span>
          <span>
            Mastered: <strong>{masteredInScope}</strong> / {totalCurriculumQuestions}
          </span>
          <span className="pool-remaining-tag">({remainingToMaster} remaining)</span>
        </div>
      </div>

      <div className="quiz-card">
        <div className="quiz-mode-pill-container">
          <span className="quiz-mode-pill">{currentQuestion.badge}</span>
        </div>

        <h3 className="quiz-question-hint">{currentQuestion.hint}</h3>

        <div className="quiz-prompt">
          <span className="quiz-prompt-text">{currentQuestion.prompt}</span>
          {currentQuestion.isFrenchToEnglish && currentQuestion.target && (
            <PronunciationButton
              text={currentQuestion.target}
              className="quiz-prompt-audio margin-left"
              audioCategory={currentQuestion.audioCategory}
            />
          )}
        </div>

        {/* Native French Audio Toolbar */}
        {currentQuestion.target && (
          <div className="quiz-audio-controller" role="toolbar" aria-label="Audio controls">
            <button
              type="button"
              className={`quiz-audio-btn primary ${isPlayingAudio ? 'playing' : ''}`}
              onClick={() => playAudio(currentQuestion.target, 1.0, currentQuestion.audioCategory)}
              aria-label="Play audio"
            >
              <FaVolumeUp className={isPlayingAudio ? 'pulse-animation' : ''} />
              <span>{isPlayingAudio ? 'Speaking...' : 'Play Audio'}</span>
            </button>
            <button
              type="button"
              className="quiz-audio-btn slow"
              onClick={() => playAudio(currentQuestion.target, 0.7, currentQuestion.audioCategory)}
              aria-label="Play audio slowly at 0.7x speed"
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
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={
              currentQuestion.isFrenchToEnglish
                ? 'Type the English meaning...'
                : 'Type your answer in French...'
            }
            aria-label="Quiz answer input"
            disabled={showNext}
            autoFocus
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
                  onClick={() => handleInsertAccent(char)}
                  disabled={showNext}
                  aria-label={`Insert ${char}`}
                  title={`Insert ${char}`}
                >
                  {char}
                </button>
              ))}
              <button
                type="button"
                className={`accent-guide-toggle ${showAccentTips ? 'active' : ''}`}
                onClick={() => setShowAccentTips(prev => !prev)}
                aria-expanded={showAccentTips}
                aria-label="French accent guide"
                title="How French accents work"
              >
                <FaInfoCircle aria-hidden="true" />
                <span>Accents</span>
              </button>
            </div>

            {showAccentTips && (
              <div className="accent-tips-popover" role="note" aria-label="French accent tips">
                <div className="accent-tips-header">
                  <strong>French Accent Marks Guide</strong>
                  <span>Unaccented answers are accepted too!</span>
                </div>
                <ul className="accent-tips-list">
                  {FRENCH_ACCENT_TIPS.map(tip => (
                    <li key={tip.accent}>
                      <span className="accent-badge">{tip.accent}</span>
                      <strong>{tip.name}:</strong> {tip.example}
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
              aria-label="Check Answer"
            >
              <span className="btn-main-label">Check Answer</span>
              <span className="btn-hint-badge">
                press <span className="btn-kbd">↵ Enter</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Feedback Drawer */}
      {showNext && isCorrect !== null && (
        <div
          className={`quiz-feedback-drawer ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
          role="region"
          aria-live="polite"
        >
          <div className="feedback-drawer-inner">
            <div className="feedback-info-area">
              <div className="feedback-header-row">
                {isCorrect ? (
                  <FaCheckCircle className="feedback-icon correct-icon" />
                ) : (
                  <FaTimesCircle className="feedback-icon incorrect-icon" />
                )}
                <div className="feedback-text-content">
                  <span className="feedback-title">
                    {isCorrect ? 'Correct!' : 'Not quite'}
                  </span>

                  {!isCorrect && (
                    <div className="feedback-answer-line">
                      <span>The correct answer is: </span>
                      <strong className="feedback-correct-word">
                        {currentQuestion.answer.includes('/')
                          ? currentQuestion.answer.split('/')[0].trim()
                          : currentQuestion.answer}
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
                      <strong>
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
                      🏆 <strong>Word Mastered (5/5)!</strong> Removed from upcoming questions.
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
              {sessionAnswered < sessionGoal ? (
                <button
                  type="button"
                  className={`feedback-continue-button ${isCorrect ? 'btn-next-correct' : 'btn-next-incorrect'}`}
                  onClick={handleNextQuestion}
                  autoFocus
                  aria-label={`Next Question (${sessionIndex + 1}/${sessionGoal})`}
                >
                  <span className="btn-main-label">
                    Next Question ({sessionIndex + 1}/{sessionGoal})
                  </span>
                  <span className="btn-hint-badge">
                    press <span className="btn-kbd">↵ Enter</span>
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="feedback-continue-button finish-quiz-button"
                  onClick={handleCompleteSession}
                  autoFocus
                  aria-label="Complete Quiz & View Results"
                >
                  <span className="btn-main-label">
                    <FaCheckCircle className="btn-icon" /> Complete Quiz &amp; View Results 🎉
                  </span>
                  <span className="btn-hint-badge">
                    press <span className="btn-kbd">↵ Enter</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
