import {
  FRENCH_ACCENT_CHARS,
  FRENCH_ACCENT_TIPS,
  stripFrenchAccents,
  normalizeFrenchText,
  normalizeEnglishAnswer,
  getSpellingDifferences,
  checkFrenchNumberEquivalence,
  levenshteinDistance,
} from '../utils/frenchText';
import { gradeQuizAnswer } from '../components/Quiz';

describe('French Text, Diacritics, Ligatures & Quiz Grading Utilities', () => {
  it('exposes complete French accent character bar and instructional tips', () => {
    expect(FRENCH_ACCENT_CHARS).toEqual(
      expect.arrayContaining(['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û', 'œ'])
    );
    expect(FRENCH_ACCENT_TIPS.length).toBeGreaterThanOrEqual(5);
  });

  it('strips French diacritics and expands œ/æ ligatures accurately', () => {
    expect(stripFrenchAccents('')).toBe('');
    expect(stripFrenchAccents('Ça va très bien, merci !')).toBe('Ca va tres bien, merci !');
    expect(stripFrenchAccents('Cœur, Sœur, Œuf, Æther, ŒUVRE')).toBe(
      'Coeur, Soeur, Oeuf, Aether, OEUVRE'
    );
    expect(stripFrenchAccents('français à l’école où l’été plaît')).toBe(
      'francais a l’ecole ou l’ete plait'
    );
  });

  it('normalizes French punctuation, hyphens, guillemets, and optional accents', () => {
    expect(normalizeFrenchText('')).toBe('');
    expect(normalizeFrenchText('« S’il vous plaît ! » (formel)', true)).toBe('s il vous plaît');
    expect(normalizeFrenchText('« S’il vous plaît ! » (formel)', false)).toBe('s il vous plait');
    expect(normalizeFrenchText('quatre-vingt-dix', false)).toBe('quatre vingt dix');
    expect(normalizeFrenchText('cœur', true)).toBe('coeur');
  });

  it('normalizes English contractions and everyday polite synonyms', () => {
    expect(normalizeEnglishAnswer("What's your name?")).toBe('what is your name');
    expect(normalizeEnglishAnswer("Where's the restroom?")).toBe('where is the bathroom');
    expect(normalizeEnglishAnswer('Many thanks!')).toBe('thank you');
    expect(normalizeEnglishAnswer('The bill, please')).toBe('the check please');
    expect(normalizeEnglishAnswer("I don't understand (polite)")).toBe('i do not understand');
  });

  it('computes character-level spelling differences for missing French accents', () => {
    const diff = getSpellingDifferences('ca va', 'Ça va');
    expect(diff[0]).toEqual({ char: 'Ç', isDiff: true });
    expect(diff[1]).toEqual({ char: 'a', isDiff: false });
  });

  it('matches French vigesimal numbers across digits, French words, and English words', () => {
    expect(checkFrenchNumberEquivalence('', '70')).toBe(false);
    expect(checkFrenchNumberEquivalence('70', 'soixante-dix')).toBe(true);
    expect(checkFrenchNumberEquivalence('soixante dix', '70 (seventy)')).toBe(true);
    expect(checkFrenchNumberEquivalence('quatre-vingts', '80')).toBe(true);
    expect(checkFrenchNumberEquivalence('quatre vingt', 'quatre-vingts')).toBe(true);
    expect(checkFrenchNumberEquivalence('90', 'quatre-vingt-dix')).toBe(true);
    expect(checkFrenchNumberEquivalence('1000', 'mille')).toBe(true);
    expect(checkFrenchNumberEquivalence('12', 'quarante')).toBe(false);
  });

  it('calculates Levenshtein edit distance accurately', () => {
    expect(levenshteinDistance('bonjour', 'bonjour')).toBe(0);
    expect(levenshteinDistance('bonjor', 'bonjour')).toBe(1);
    expect(levenshteinDistance('chat', 'chien')).toBe(3);
  });

  it('grades French & English quiz answers with accent forgiveness, slash options, and typo tolerance', () => {
    // Empty answer
    expect(gradeQuizAnswer('   ', 'Bonjour', false).isCorrect).toBe(false);

    // Exact accented French match -> no accent warning needed
    const exactFr = gradeQuizAnswer('Ça va', 'Ça va', false);
    expect(exactFr.isCorrect).toBe(true);
    expect(exactFr.usedAccentForgiveness).toBe(false);
    expect(exactFr.spellingDiff).toBeNull();

    // Unaccented French match -> accepted WITH accent diff note
    const unaccentedFr = gradeQuizAnswer('ca va', 'Ça va', false);
    expect(unaccentedFr.isCorrect).toBe(true);
    expect(unaccentedFr.usedAccentForgiveness).toBe(true);
    expect(unaccentedFr.spellingDiff).not.toBeNull();

    // Slash-separated English options
    const slashEn = gradeQuizAnswer('bye', 'Hi / Bye (informal)', true);
    expect(slashEn.isCorrect).toBe(true);

    // Minor 1-letter typo on >= 5 char word
    const typoFr = gradeQuizAnswer('bonjor', 'Bonjour', false);
    expect(typoFr.isCorrect).toBe(true);
    expect(typoFr.spellingDiff).not.toBeNull();

    // Wrong answer rejected
    expect(gradeQuizAnswer('au revoir', 'Bonjour', false).isCorrect).toBe(false);
    expect(gradeQuizAnswer('goodbye', 'Hello', true).isCorrect).toBe(false);
  });
});
