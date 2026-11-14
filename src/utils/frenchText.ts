/**
 * French accent, diacritic, ligature, number equivalence, and fuzzy matching utilities
 * for Basic French (basicfrench.org)
 */

export const FRENCH_ACCENT_CHARS: readonly string[] = [
  'é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û', 'œ',
];

export const FRENCH_ACCENT_TIPS: ReadonlyArray<{ accent: string; name: string; example: string }> = [
  { accent: 'é', name: 'Accent aigu', example: 'café, été (pronounced "ay")' },
  { accent: 'è / ê', name: 'Grave & Circonflexe', example: 'père, fête (open "eh")' },
  { accent: 'ç', name: 'Cédille', example: 'ça va, français (soft "s" before a/o/u)' },
  { accent: 'à / ù', name: 'Distinguishing Grave', example: 'à (to/at) vs a (has), où (where) vs ou (or)' },
  { accent: 'œ', name: 'Ligature e-dans-l’o', example: 'cœur, sœur, œuf' },
];

/**
 * Strip French diacritics and expand ligatures (œ -> oe, æ -> ae)
 */
export const stripFrenchAccents = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/Œ(?=[A-ZÀ-ÖØ-Þ])/g, 'OE')
    .replace(/Œ/g, 'Oe')
    .replace(/œ/g, 'oe')
    .replace(/Æ(?=[A-ZÀ-ÖØ-Þ])/g, 'AE')
    .replace(/Æ/g, 'Ae')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Normalize text for comparison while preserving French diacritics when keepAccents=true
 */
export const normalizeFrenchText = (text: string, keepAccents = true): string => {
  if (!text) return '';
  let s = text
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\.\.\./g, ' ')
    .replace(/[.,/#!$%^&*;:{}=_`~?«»"']/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!keepAccents) {
    s = stripFrenchAccents(s);
  } else {
    s = s.replace(/œ/g, 'oe').replace(/æ/g, 'ae');
  }
  return s;
};

/**
 * Normalize English answers (contractions & polite synonyms)
 */
export const normalizeEnglishAnswer = (text: string): string => {
  let s = stripFrenchAccents(text.toLowerCase().trim());
  s = s.replace(/’/g, "'").replace(/\s*\([^)]*\)\s*/g, ' ');

  const contractions: Array<[RegExp, string]> = [
    [/\b(what's|whats)\b/g, 'what is'],
    [/\b(where's|wheres)\b/g, 'where is'],
    [/\b(it's|its)\b/g, 'it is'],
    [/\b(i'm|im)\b/g, 'i am'],
    [/\b(you're|youre)\b/g, 'you are'],
    [/\b(don't|dont)\b/g, 'do not'],
    [/\b(can't|cant)\b/g, 'cannot'],
    [/\b(let's|lets)\b/g, 'let us'],
  ];
  for (const [re, rep] of contractions) {
    s = s.replace(re, rep);
  }

  s = s.replace(/[.,/#!$%^&*;:{}=\-_`~()?'"]/g, ' ').replace(/\s+/g, ' ').trim();

  const synonyms: Array<[RegExp, string]> = [
    [/\b(restrooms|restroom|toilets|toilet|washroom|wc)\b/g, 'bathroom'],
    [/\b(hi|hey)\b/g, 'hello'],
    [/\b(thanks|many thanks)\b/g, 'thank you'],
    [/\b(bill|check)\b/g, 'check'],
    [/\b(email|e mail)\b/g, 'email'],
  ];
  for (const [re, rep] of synonyms) {
    s = s.replace(re, rep);
  }

  return s.replace(/\s+/g, ' ').trim();
};

/**
 * Character-by-character diff highlighting missing accents or minor typos
 */
export const getSpellingDifferences = (
  userAnswer: string,
  targetAnswer: string
): Array<{ char: string; isDiff: boolean }> => {
  const cleanTarget = targetAnswer.trim();
  const cleanUser = userAnswer.trim().toLowerCase();
  const result: Array<{ char: string; isDiff: boolean }> = [];

  for (let i = 0; i < cleanTarget.length; i++) {
    const tChar = cleanTarget[i];
    const uChar = cleanUser[i] || '';
    result.push({
      char: tChar,
      isDiff: tChar.toLowerCase() !== uChar,
    });
  }
  return result;
};

export const FRENCH_NUMBER_EQUIVALENTS: Record<string, string[]> = {
  '0': ['zero', 'zéro'],
  '1': ['one', 'un', 'une'],
  '2': ['two', 'deux'],
  '3': ['three', 'trois'],
  '4': ['four', 'quatre'],
  '5': ['five', 'cinq'],
  '6': ['six'],
  '7': ['seven', 'sept'],
  '8': ['eight', 'huit'],
  '9': ['nine', 'neuf'],
  '10': ['ten', 'dix'],
  '11': ['eleven', 'onze'],
  '12': ['twelve', 'douze'],
  '13': ['thirteen', 'treize'],
  '14': ['fourteen', 'quatorze'],
  '15': ['fifteen', 'quinze'],
  '16': ['sixteen', 'seize'],
  '17': ['seventeen', 'dix sept', 'dix-sept'],
  '18': ['eighteen', 'dix huit', 'dix-huit'],
  '19': ['nineteen', 'dix neuf', 'dix-neuf'],
  '20': ['twenty', 'vingt'],
  '30': ['thirty', 'trente'],
  '40': ['forty', 'quarante'],
  '50': ['fifty', 'cinquante'],
  '60': ['sixty', 'soixante'],
  '70': ['seventy', 'soixante dix', 'soixante-dix'],
  '80': ['eighty', 'quatre vingts', 'quatre-vingts', 'quatre vingt'],
  '90': ['ninety', 'quatre vingt dix', 'quatre-vingt-dix'],
  '100': ['hundred', 'one hundred', 'cent'],
  '1000': ['thousand', 'one thousand', 'mille'],
};

export const checkFrenchNumberEquivalence = (userRaw: string, targetRaw: string): boolean => {
  const u = normalizeFrenchText(userRaw, false).replace(/,/g, '');
  const t = normalizeFrenchText(targetRaw, false).replace(/,/g, '');
  if (!u || !t) return false;
  if (u === t) return true;

  for (const [digit, forms] of Object.entries(FRENCH_NUMBER_EQUIVALENTS)) {
    const allForms = [digit, ...forms.map(f => normalizeFrenchText(f, false))];
    const uMatch = allForms.includes(u);
    const tMatch = allForms.includes(t) || t.split(' ').includes(digit);
    if (uMatch && tMatch) return true;
  }
  return false;
};

const MAX_LEVENSHTEIN_LEN = 250;

export const levenshteinDistance = (rawA: string, rawB: string): number => {
  const a = rawA.length > MAX_LEVENSHTEIN_LEN ? rawA.slice(0, MAX_LEVENSHTEIN_LEN) : rawA;
  const b = rawB.length > MAX_LEVENSHTEIN_LEN ? rawB.slice(0, MAX_LEVENSHTEIN_LEN) : rawB;
  if (a.length < b.length) return levenshteinDistance(b, a);
  if (b.length === 0) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = new Array<number>(b.length + 1);
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
};
