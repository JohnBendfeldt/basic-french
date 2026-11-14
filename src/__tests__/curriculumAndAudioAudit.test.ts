import fs from 'node:fs';
import path from 'node:path';
import frenchData from '../data/frenchData';
import {
  AUDIO_VOICE,
  AUDIO_TEXT_MAP,
  AUDIO_CATEGORY_MAP,
  getLocalAudioUrl,
} from '../data/audioManifest';

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');

describe('French Curriculum & Studio Neural Audio Integrity Audit', () => {
  it('contains all 26 French letters A-Z with non-empty phonetics, example words, meanings, and icons', () => {
    expect(frenchData.alphabet).toHaveLength(26);
    const letters = frenchData.alphabet.map(item => item.letter);
    expect(letters.join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    for (const item of frenchData.alphabet) {
      expect(item.pronunciation.trim().length).toBeGreaterThan(0);
      expect(item.example.trim().length).toBeGreaterThan(0);
      expect(item.word && item.word.trim().length).toBeGreaterThan(0);
      expect(item.meaning && item.meaning.trim().length).toBeGreaterThan(0);
      expect(item.icon && item.icon.trim().length).toBeGreaterThan(0);
    }
  });

  it('contains curated beginner French phrases, numbers (0-1,000), time expressions, and common words with phonetics', () => {
    expect(frenchData.basicPhrases.length).toBeGreaterThanOrEqual(30);
    expect(frenchData.numbers.length).toBeGreaterThanOrEqual(25);
    expect(frenchData.time.length).toBeGreaterThanOrEqual(6);
    expect(frenchData.commonWords.length).toBeGreaterThanOrEqual(200);

    const allItems = [
      ...frenchData.basicPhrases,
      ...frenchData.numbers,
      ...frenchData.time,
      ...frenchData.commonWords,
    ];

    for (const item of allItems) {
      expect(item.phrase.trim().length).toBeGreaterThan(0);
      expect(item.translation.trim().length).toBeGreaterThan(0);
      expect(item.pronunciation.trim().length).toBeGreaterThan(0);
    }

    const numberPhrases = frenchData.numbers.map(n => n.phrase.toLowerCase());
    expect(numberPhrases).toContain('soixante-dix');
    expect(numberPhrases).toContain('quatre-vingts');
    expect(numberPhrases).toContain('quatre-vingt-dix');
  });

  it('uses fr-FR-DeniseNeural voice and maps every manifest entry to an existing non-empty MP3 on disk', () => {
    expect(AUDIO_VOICE).toBe('fr-FR-DeniseNeural');

    const indexJsonPath = path.join(AUDIO_DIR, 'index.json');
    expect(fs.existsSync(indexJsonPath)).toBe(true);
    const indexJson = JSON.parse(fs.readFileSync(indexJsonPath, 'utf-8'));
    expect(indexJson.voice).toBe('fr-FR-DeniseNeural');

    const referencedUrls = new Set<string>(Object.values(AUDIO_TEXT_MAP));
    for (const catMap of Object.values(AUDIO_CATEGORY_MAP)) {
      for (const fileUrl of Object.values(catMap)) {
        referencedUrls.add(fileUrl);
      }
    }

    expect(referencedUrls.size).toBeGreaterThanOrEqual(350);

    for (const audioUrl of referencedUrls) {
      const fullPath = path.join(PUBLIC_DIR, audioUrl.replace(/^\//, ''));
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size).toBeGreaterThan(500);
    }
  });

  it('resolves getLocalAudioUrl across categories, punctuation variants, and unknown phrases', () => {
    expect(getLocalAudioUrl('')).toBeNull();
    expect(getLocalAudioUrl('phrase inexistant xyz')).toBeNull();

    expect(getLocalAudioUrl('a', 'alphabet')).toBe('/audio/alphabet/a.mp3');
    expect(getLocalAudioUrl('Ami', 'examples')).toBe('/audio/examples/ami.mp3');
    expect(getLocalAudioUrl('Bonjour', 'basicPhrases')).toMatch(/^\/audio\/.+\.mp3$/);
    expect(getLocalAudioUrl('Bonjour !')).toMatch(/^\/audio\/.+\.mp3$/);
    expect(getLocalAudioUrl('soixante-dix', 'numbers')).toMatch(/^\/audio\/numbers\/.+\.mp3$/);
    expect(getLocalAudioUrl(frenchData.time[0].phrase, 'time')).toMatch(/^\/audio\/.+\.mp3$/);
    expect(getLocalAudioUrl(frenchData.commonWords[0].phrase, 'commonWords')).toMatch(/^\/audio\/.+\.mp3$/);
  });
});
