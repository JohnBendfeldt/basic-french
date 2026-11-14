import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock window.scrollTo for jsdom
window.scrollTo = vi.fn();

// Provide Web Speech API mocks for jsdom
if (typeof window !== 'undefined') {
  if (!('speechSynthesis' in window)) {
    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: {
        speak: vi.fn((utterance: any) => {
          if (utterance && typeof utterance.onend === 'function') {
            Promise.resolve().then(() => utterance.onend());
          }
        }),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => []),
        onvoiceschanged: null,
      },
    });
  }

  if (typeof (window as any).SpeechSynthesisUtterance === 'undefined') {
    class MockSpeechSynthesisUtterance {
      text: string;
      lang = 'fr-FR';
      rate = 1;
      pitch = 1;
      voice: SpeechSynthesisVoice | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
    (globalThis as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  }
}

// Stub HTMLMediaElement play/pause in jsdom so <audio> elements never throw Not implemented
if (typeof HTMLMediaElement !== 'undefined') {
  HTMLMediaElement.prototype.play = vi.fn(function (this: HTMLMediaElement) {
    Promise.resolve().then(() => {
      this.dispatchEvent(new Event('ended'));
    });
    return Promise.resolve();
  });
  HTMLMediaElement.prototype.pause = vi.fn();
}
