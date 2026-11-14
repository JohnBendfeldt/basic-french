import fs from 'node:fs';
import path from 'node:path';
import frenchData from '../data/frenchData';
import { AUDIO_VOICE, getLocalAudioUrl } from '../data/audioManifest';

const PUBLIC_DIR = path.resolve(__dirname, '../../public');
const AUDIO_DIR = path.join(PUBLIC_DIR, 'audio');

describe('Basic French Studio Audio Completeness & Voice Consistency', () => {
  it('standardizes metadata on fr-FR-HenriNeural matching basic-language-school', () => {
    expect(AUDIO_VOICE).toBe('fr-FR-HenriNeural');

    const indexJson = JSON.parse(
      fs.readFileSync(path.join(AUDIO_DIR, 'index.json'), 'utf-8')
    );
    expect(indexJson.voice).toBe('fr-FR-HenriNeural');
  });

  it('resolves every single curriculum item in frenchData to an existing >1000-byte MP3 on disk', () => {
    const unresolved: string[] = [];

    const verify = (text: string, category: string) => {
      const url = getLocalAudioUrl(text, category);
      if (!url) {
        unresolved.push(`${category}:${text} -> null`);
        return;
      }
      const diskPath = path.join(PUBLIC_DIR, url.replace(/^\//, ''));
      if (!fs.existsSync(diskPath) || fs.statSync(diskPath).size <= 1000) {
        unresolved.push(`${category}:${text} -> missing or small (${url})`);
      }
    };

    for (const item of frenchData.alphabet) {
      verify(item.letter.toLowerCase(), 'alphabet');
      const exampleWord = item.word || item.example;
      if (exampleWord) {
        verify(exampleWord, 'examples');
      }
    }

    for (const item of frenchData.basicPhrases) {
      if (item.phrase) verify(item.phrase, 'basicPhrases');
    }
    for (const item of frenchData.numbers) {
      if (item.phrase) verify(item.phrase, 'numbers');
    }
    for (const item of frenchData.time) {
      if (item.phrase) verify(item.phrase, 'time');
    }
    for (const item of frenchData.commonWords) {
      if (item.phrase) verify(item.phrase, 'commonWords');
    }

    expect(unresolved).toEqual([]);
  });
});
