/**
 * Audio playback and speech synthesis engine for Basic French (basicfrench.org)
 * Prioritizes studio pre-rendered Microsoft Neural TTS (fr-FR-DeniseNeural) MP3s
 * with automatic fallback to browser French speech synthesis.
 */
import {
  unlockIOSAudio,
  speakFrenchText,
  initVoices as initBrowserVoices,
  SpeechOptions,
  FrenchAccent,
  getPreferredAccent,
  getPreferredRate,
  getPreferredPitch,
  getPreferredVoiceURI,
  getFrenchVoices,
  setPreferredVoice,
  setPreferredAccent,
  setPreferredRate,
  getBestFrenchVoice,
  getFrenchVoiceInstallInstructions,
  isNeuralVoice,
} from './browserSpeech';
import { getLocalAudioUrl } from '../data/audioManifest';

const speakingButtons = new Map<string, boolean>();
const speechQueues = new Map<
  string,
  Array<{
    text: string;
    lang?: string;
    options?: SpeechOptions;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }>
>();

interface ActivePlayback {
  audio: HTMLAudioElement;
  buttonId: string;
  onEnd?: () => void;
  timerId?: ReturnType<typeof setTimeout> | null;
}

let currentActivePlayback: ActivePlayback | null = null;
let isInitialized = false;

export const isSpeechSupported = (): boolean => true;

export const initVoices = async (): Promise<void> => {
  if (isInitialized) return;
  await initBrowserVoices();
  isInitialized = true;
};

const fallbackToSpeechSynthesis = (
  text: string,
  lang: string | undefined,
  options: SpeechOptions | undefined,
  buttonId: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void => {
  const speechOptions: SpeechOptions = {
    accent: (lang as FrenchAccent) || options?.accent || getPreferredAccent(),
    rate: options?.rate ?? getPreferredRate(),
    pitch: options?.pitch ?? getPreferredPitch(),
    voiceURI: options?.voiceURI || getPreferredVoiceURI() || undefined,
  };

  speakFrenchText(
    text,
    speechOptions,
    () => {
      speakingButtons.set(buttonId, false);
      if (onEnd) onEnd();
      processSpeechQueue(buttonId);
    },
    (error: Error) => {
      speakingButtons.set(buttonId, false);
      if (onError) onError(error);
      processSpeechQueue(buttonId);
    }
  );
};

const playPreRenderedAudio = (
  audioUrl: string,
  text: string,
  lang: string | undefined,
  options: SpeechOptions | undefined,
  buttonId: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void => {
  try {
    if (currentActivePlayback) {
      const prev = currentActivePlayback;
      currentActivePlayback = null;
      if (prev.timerId) clearTimeout(prev.timerId);
      try {
        prev.audio.pause();
        prev.audio.currentTime = 0;
      } catch {
        // Ignore pause errors
      }
      speakingButtons.set(prev.buttonId, false);
      if (prev.onEnd) {
        try {
          prev.onEnd();
        } catch {
          // Ignore callback errors
        }
      }
    }

    const audio = new Audio(audioUrl);
    let isCleanedUp = false;

    const activePlayback: ActivePlayback = {
      audio,
      buttonId,
      onEnd,
      timerId: null,
    };
    currentActivePlayback = activePlayback;

    const completePlayback = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;

      if (activePlayback.timerId) {
        clearTimeout(activePlayback.timerId);
        activePlayback.timerId = null;
      }

      if (currentActivePlayback === activePlayback) {
        currentActivePlayback = null;
      }

      speakingButtons.set(buttonId, false);
      if (onEnd) {
        try {
          onEnd();
        } catch {
          // Ignore callback errors
        }
      }
      processSpeechQueue(buttonId);
    };

    if (options?.rate && options.rate > 0 && options.rate !== 1.0) {
      const targetRate = options.rate;
      audio.addEventListener(
        'loadedmetadata',
        () => {
          try {
            audio.playbackRate = targetRate;
          } catch {
            // Ignore rate errors
          }
        },
        { once: true }
      );
    }

    audio.addEventListener('ended', completePlayback, { once: true });

    audio.addEventListener(
      'error',
      () => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        if (activePlayback.timerId) clearTimeout(activePlayback.timerId);
        if (currentActivePlayback === activePlayback) {
          currentActivePlayback = null;
        }
        fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
      },
      { once: true }
    );

    const startSafetyTimer = () => {
      const durationSec = isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 3.0;
      const timeoutMs = Math.max(2000, Math.round(durationSec * 1000) + 500);
      if (!activePlayback.timerId && !isCleanedUp) {
        activePlayback.timerId = setTimeout(() => {
          if (!isCleanedUp && currentActivePlayback === activePlayback) {
            completePlayback();
          }
        }, timeoutMs);
      }
    };

    audio.addEventListener('loadedmetadata', startSafetyTimer, { once: true });
    setTimeout(() => {
      if (!activePlayback.timerId && !isCleanedUp) {
        startSafetyTimer();
      }
    }, 600);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        if (activePlayback.timerId) clearTimeout(activePlayback.timerId);
        if (currentActivePlayback === activePlayback) {
          currentActivePlayback = null;
        }
        fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
      });
    }
  } catch {
    fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
  }
};

const processSpeechQueue = async (buttonId: string): Promise<void> => {
  if (
    speakingButtons.get(buttonId) ||
    !speechQueues.has(buttonId) ||
    speechQueues.get(buttonId)?.length === 0
  ) {
    return;
  }

  speakingButtons.set(buttonId, true);

  const buttonQueue = speechQueues.get(buttonId) || [];
  const queueItem = buttonQueue.shift();
  speechQueues.set(buttonId, buttonQueue);

  if (!queueItem) {
    speakingButtons.set(buttonId, false);
    return;
  }

  const { text, lang, options, onEnd, onError } = queueItem;

  try {
    const useLocal = options?.useLocalAudio !== false;
    const localAudioUrl = useLocal ? getLocalAudioUrl(text, options?.category) : null;

    if (localAudioUrl) {
      playPreRenderedAudio(localAudioUrl, text, lang, options, buttonId, onEnd, onError);
    } else {
      fallbackToSpeechSynthesis(text, lang, options, buttonId, onEnd, onError);
    }
  } catch (error) {
    speakingButtons.set(buttonId, false);
    if (onError) onError(error);
    processSpeechQueue(buttonId);
  }
};

export const speak = (
  text: string,
  lang = 'fr-FR',
  buttonId: string,
  onEnd?: () => void,
  onError?: (err: unknown) => void,
  options?: SpeechOptions
): void => {
  if (!speechQueues.has(buttonId)) {
    speechQueues.set(buttonId, []);
  }
  const buttonQueue = speechQueues.get(buttonId) || [];
  buttonQueue.push({ text, lang, options, onEnd, onError });
  speechQueues.set(buttonId, buttonQueue);
  processSpeechQueue(buttonId);
};

export const cancelAllSpeech = (): void => {
  if (currentActivePlayback) {
    const prev = currentActivePlayback;
    currentActivePlayback = null;
    if (prev.timerId) clearTimeout(prev.timerId);
    try {
      prev.audio.pause();
      prev.audio.currentTime = 0;
    } catch {
      // Ignore pause errors
    }
    speakingButtons.set(prev.buttonId, false);
    if (prev.onEnd) {
      try {
        prev.onEnd();
      } catch {
        // Ignore callback errors
      }
    }
  }

  speechQueues.clear();
  speakingButtons.clear();

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

export {
  unlockIOSAudio,
  getLocalAudioUrl,
  getFrenchVoices,
  setPreferredVoice,
  setPreferredAccent,
  setPreferredRate,
  getPreferredAccent,
  getPreferredRate,
  getPreferredVoiceURI,
  getBestFrenchVoice,
  getFrenchVoiceInstallInstructions,
  isNeuralVoice,
};

const speechUtils = {
  unlockIOSAudio,
  isSpeechSupported,
  speak,
  initVoices,
  cancelAllSpeech,
  getLocalAudioUrl,
  getFrenchVoices,
  setPreferredVoice,
  getPreferredVoiceURI,
  getBestFrenchVoice,
  getFrenchVoiceInstallInstructions,
  isNeuralVoice,
};

export default speechUtils;
