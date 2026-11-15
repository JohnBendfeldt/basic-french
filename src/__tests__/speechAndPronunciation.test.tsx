import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import {
  scoreFrenchVoice,
  getFrenchVoices,
  getBestFrenchVoice,
  setPreferredAccent,
  getPreferredAccent,
  setPreferredRate,
  getPreferredRate,
  setPreferredVoice,
  getPreferredVoiceURI,
  getFrenchVoiceInstallInstructions,
  speakFrenchText,
} from '../utils/browserSpeech';
import { speak, cancelAllSpeech } from '../utils/speech';
import PronunciationButton from '../components/PronunciationButton';

describe('French Speech Engine, Voice Scoring & PronunciationButton', () => {
  const originalAudio = global.Audio;
  const originalUserAgent = navigator.userAgent;

  beforeEach(() => {
    cancelAllSpeech();
    setPreferredAccent('fr-FR');
    setPreferredRate(0.95);
    setPreferredVoice(null);
  });

  afterEach(() => {
    global.Audio = originalAudio;
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });
  });

  it('scores French neural voices higher than generic voices and rejects non-French voices', () => {
    const deniseVoice = {
      name: 'Microsoft Denise Online (Natural) - French (France)',
      lang: 'fr-FR',
      voiceURI: 'denise-fr',
      localService: false,
      default: false,
    } as SpeechSynthesisVoice;

    const caVoice = {
      name: 'Amélie',
      lang: 'fr-CA',
      voiceURI: 'amelie-ca',
      localService: true,
      default: false,
    } as SpeechSynthesisVoice;

    const enVoice = {
      name: 'Samantha',
      lang: 'en-US',
      voiceURI: 'samantha-en',
      localService: true,
      default: true,
    } as SpeechSynthesisVoice;

    expect(scoreFrenchVoice(enVoice, 'fr-FR')).toBe(-1);
    expect(scoreFrenchVoice(deniseVoice, 'fr-FR')).toBeGreaterThan(scoreFrenchVoice(caVoice, 'fr-FR'));

    vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValue([enVoice, caVoice, deniseVoice]);

    const frVoices = getFrenchVoices();
    expect(frVoices).toHaveLength(2);
    expect(getBestFrenchVoice('fr-FR')?.voiceURI).toBe('denise-fr');

    setPreferredVoice('amelie-ca');
    expect(getPreferredVoiceURI()).toBe('amelie-ca');
    expect(getBestFrenchVoice('fr-FR')?.voiceURI).toBe('amelie-ca');
  });

  it('clamps speech rate and persists preferred French accent', () => {
    setPreferredAccent('fr-CA');
    expect(getPreferredAccent()).toBe('fr-CA');

    setPreferredRate(0.2);
    expect(getPreferredRate()).toBe(0.5);

    setPreferredRate(2.5);
    expect(getPreferredRate()).toBe(1.5);
  });

  it('returns OS-appropriate French voice install instructions (checking iOS before macOS)', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      configurable: true,
    });
    expect(getFrenchVoiceInstallInstructions()).toMatch(/On iPhone\/iPad/i);

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',
      configurable: true,
    });
    expect(getFrenchVoiceInstallInstructions()).toMatch(/On macOS/i);

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });
    expect(getFrenchVoiceInstallInstructions()).toMatch(/On Windows/i);

    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Linux; Android 14)',
      configurable: true,
    });
    expect(getFrenchVoiceInstallInstructions()).toMatch(/On Android/i);
  });

  it('plays pre-rendered neural MP3s, supports 0.7x slow playback, interrupts prior audio, and falls back to Web Speech on error', async () => {
    const instances: any[] = [];
    class MockAudio {
      src: string;
      playbackRate = 1;
      currentTime = 0;
      duration = 1.2;
      listeners: Record<string, Array<() => void>> = {};
      pause = vi.fn();
      play = vi.fn(() => Promise.resolve());

      constructor(src: string) {
        this.src = src;
        instances.push(this);
      }
      addEventListener(event: string, cb: () => void) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(cb);
      }
      emit(event: string) {
        (this.listeners[event] || []).forEach(fn => fn());
      }
    }
    global.Audio = MockAudio as any;

    const firstEnded = vi.fn();
    speak('Bonjour', 'fr-FR', 'btn-1', firstEnded, undefined, { rate: 0.7, category: 'basicPhrases' });
    expect(instances).toHaveLength(1);
    expect(instances[0].src).toMatch(/\/audio\/.+\.mp3$/);

    instances[0].emit('loadedmetadata');
    expect(instances[0].playbackRate).toBe(0.7);

    // Starting a second playback interrupts the first and triggers its onEnd cleanup
    const secondEnded = vi.fn();
    speak('eau', 'fr-FR', 'btn-2', secondEnded, undefined, { category: 'commonWords' });
    expect(instances[0].pause).toHaveBeenCalled();
    expect(firstEnded).toHaveBeenCalled();

    instances[1].emit('ended');
    expect(secondEnded).toHaveBeenCalled();

    // Error on Audio element falls back to browser speechSynthesis
    const synthSpy = vi.spyOn(window.speechSynthesis, 'speak').mockImplementation((utt: any) => {
      if (utt.onend) utt.onend();
    });
    const fallbackEnded = vi.fn();
    speak('Bonjour', 'fr-FR', 'btn-err', fallbackEnded, undefined, { category: 'basicPhrases' });
    instances[2].emit('error');
    expect(synthSpy).toHaveBeenCalled();
    expect(fallbackEnded).toHaveBeenCalled();
    synthSpy.mockRestore();
  });

  it('handles speakFrenchText utterance completion and cancellation', () => {
    const speakSpy = vi.spyOn(window.speechSynthesis, 'speak').mockImplementation((utt: any) => {
      if (utt.onerror) utt.onerror({ error: 'interrupted' });
    });
    const onEnd = vi.fn();
    speakFrenchText('Bonsoir', { accent: 'fr-FR', rate: 0.9 }, onEnd);
    expect(onEnd).toHaveBeenCalled();
    speakSpy.mockRestore();
  });

  it('renders PronunciationButton, plays French audio on click, and resets state on completion', async () => {
    render(<PronunciationButton text="Bonjour" audioCategory="basicPhrases" />);

    const btn = await screen.findByRole('button', { name: /Pronounce "Bonjour"/i });
    await waitFor(() => expect(btn).toHaveAttribute('aria-disabled', 'false'));

    fireEvent.click(btn);
    await waitFor(() => {
      expect(btn).toHaveAttribute('aria-label', 'Pronounce "Bonjour"');
      expect(btn).toHaveAttribute('aria-disabled', 'false');
    });
  });

  it('retains keyboard focus on PronunciationButton during active playback using aria-disabled instead of disabled', async () => {
    const audioInstances: any[] = [];
    class HangingAudio {
      src: string;
      playbackRate = 1;
      currentTime = 0;
      duration = 1.0;
      listeners: Record<string, Array<() => void>> = {};
      pause = vi.fn();
      play = vi.fn(() => Promise.resolve());

      constructor(src: string) {
        this.src = src;
        audioInstances.push(this);
      }
      addEventListener(event: string, cb: () => void) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(cb);
      }
      emit(event: string) {
        (this.listeners[event] || []).forEach(fn => fn());
      }
    }
    global.Audio = HangingAudio as any;

    render(<PronunciationButton text="Bonjour" audioCategory="basicPhrases" />);
    const btn = await screen.findByRole('button', { name: /Pronounce "Bonjour"/i });
    await waitFor(() => expect(btn).toHaveAttribute('aria-disabled', 'false'));

    btn.focus();
    expect(document.activeElement).toBe(btn);

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    expect(btn).not.toBeDisabled();
    expect(document.activeElement).toBe(btn);

    // Additional clicks while aria-disabled="true" are ignored cleanly
    fireEvent.click(btn);
    expect(audioInstances).toHaveLength(1);

    audioInstances[0].emit('ended');
    await waitFor(() => {
      expect(btn).toHaveAttribute('aria-disabled', 'false');
    });
    expect(document.activeElement).toBe(btn);
  });
});
