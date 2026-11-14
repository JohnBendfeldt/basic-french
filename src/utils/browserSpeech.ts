/**
 * Native Browser Speech Synthesis for Basic French (basicfrench.org)
 * Provides fallback French speech synthesis (fr-FR / fr-CA) when offline or
 * when a custom phrase is not in the pre-rendered neural MP3 manifest.
 */

export type FrenchAccent = 'fr-FR' | 'fr-CA';

export interface SpeechOptions {
  accent?: FrenchAccent;
  rate?: number;
  pitch?: number;
  voiceURI?: string;
  category?: string;
  useLocalAudio?: boolean;
}

let currentAccent: FrenchAccent = 'fr-FR';
let currentRate = 0.95;
let currentPitch = 1.0;
let currentVoiceURI: string | null = null;

const failedVoiceURIs = new Set<string>();
let activeUtterance: SpeechSynthesisUtterance | null = null;
let isAudioContextUnlocked = false;

export const unlockIOSAudio = (): void => {
  if (typeof window === 'undefined') return;
  try {
    if ('audioSession' in navigator && (navigator as any).audioSession) {
      (navigator as any).audioSession.type = 'playback';
    }
  } catch {
    // Ignore audioSession errors
  }

  if (!isAudioContextUnlocked) {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        try {
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        } catch {
          // Ignore buffer start errors
        }
      }
      isAudioContextUnlocked = true;
    } catch {
      // Ignore context errors
    }
  }
};

export const isSpeechSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isNeuralVoice = (voice: SpeechSynthesisVoice): boolean => {
  const n = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  return (
    n.includes('natural') ||
    n.includes('neural') ||
    n.includes('online') ||
    n.includes('premium') ||
    n.includes('enhanced') ||
    n.includes('denise') ||
    n.includes('henri') ||
    n.includes('eloise') ||
    n.includes('sylvie') ||
    n.includes('amelie') ||
    n.includes('amélie') ||
    n.includes('thomas') ||
    n.includes('audrey')
  );
};

export const scoreFrenchVoice = (
  voice: SpeechSynthesisVoice,
  preferredAccent: FrenchAccent = 'fr-FR'
): number => {
  const lang = (voice.lang || '').toLowerCase().replace('_', '-');
  const name = voice.name.toLowerCase();
  if (!lang.startsWith('fr') && !name.includes('french') && !name.includes('français')) {
    return -1;
  }
  if (failedVoiceURIs.has(voice.voiceURI)) {
    return 1;
  }

  let score = 50;
  if (lang === preferredAccent.toLowerCase()) score += 25;
  else if (lang.startsWith('fr')) score += 15;

  if (isNeuralVoice(voice)) score += 40;
  // Prefer male French voices to stay consistent with studio fr-FR-HenriNeural recordings
  if (
    name.includes('henri') ||
    name.includes('thomas') ||
    name.includes('rémy') ||
    name.includes('remy') ||
    name.includes('daniel') ||
    name.includes('alain') ||
    name.includes('paul') ||
    name.includes('claude')
  ) {
    score += 8;
  }
  if (name.includes('google')) score += 20;
  if (voice.localService) score += 5;

  return score;
};

export const getFrenchVoices = (): SpeechSynthesisVoice[] => {
  if (!isSpeechSupported()) return [];
  const voices = window.speechSynthesis.getVoices() || [];
  return voices
    .filter(v => scoreFrenchVoice(v, currentAccent) > 0)
    .sort((a, b) => scoreFrenchVoice(b, currentAccent) - scoreFrenchVoice(a, currentAccent));
};

export const getBestFrenchVoice = (
  accent: FrenchAccent = currentAccent
): SpeechSynthesisVoice | null => {
  if (!isSpeechSupported()) return null;
  const voices = window.speechSynthesis.getVoices() || [];

  if (currentVoiceURI && !failedVoiceURIs.has(currentVoiceURI)) {
    const chosen = voices.find(v => v.voiceURI === currentVoiceURI);
    if (chosen) return chosen;
  }

  const ranked = voices
    .filter(v => scoreFrenchVoice(v, accent) > 0)
    .sort((a, b) => scoreFrenchVoice(b, accent) - scoreFrenchVoice(a, accent));

  return ranked[0] || null;
};

export const initVoices = async (): Promise<void> => {
  if (!isSpeechSupported()) return;
  const existing = window.speechSynthesis.getVoices();
  if (existing && existing.length > 0) return;

  return new Promise(resolve => {
    let settled = false;
    const finish = () => {
      if (!settled) {
        settled = true;
        resolve();
      }
    };
    const timer = setTimeout(finish, 800);
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(timer);
        finish();
      };
    }
  });
};

export const setPreferredAccent = (accent: FrenchAccent): void => {
  currentAccent = accent;
  try {
    localStorage.setItem('basicfrench_accent', accent);
  } catch {
    // Ignore storage errors
  }
};

export const getPreferredAccent = (): FrenchAccent => currentAccent;

export const setPreferredRate = (rate: number): void => {
  const clamped = Math.min(1.5, Math.max(0.5, rate));
  currentRate = clamped;
  try {
    localStorage.setItem('basicfrench_rate', String(clamped));
  } catch {
    // Ignore storage errors
  }
};

export const getPreferredRate = (): number => currentRate;
export const getPreferredPitch = (): number => currentPitch;
export const getPreferredVoiceURI = (): string | null => currentVoiceURI;

export const setPreferredVoice = (voiceURI: string | null): void => {
  currentVoiceURI = voiceURI;
  try {
    if (voiceURI) localStorage.setItem('basicfrench_voice_uri', voiceURI);
    else localStorage.removeItem('basicfrench_voice_uri');
  } catch {
    // Ignore storage errors
  }
};

/**
 * OS-specific instructions for installing a high-quality native French voice.
 * Checks iPhone/iPad BEFORE macOS because iOS user agents include "like Mac OS X".
 */
export const getFrenchVoiceInstallInstructions = (): string => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    return 'On iPhone/iPad: Open Settings → Accessibility → Spoken Content → Voices → French, and download Amélie or Thomas (Enhanced).';
  }
  if (ua.includes('mac os')) {
    return 'On macOS: Open System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → French, and download Amélie or Thomas.';
  }
  if (ua.includes('windows')) {
    return 'On Windows: Open Settings → Time & language → Speech → Manage voices → Add voices, and install French (France).';
  }
  if (ua.includes('android')) {
    return 'On Android: Open Settings → Accessibility → Text-to-speech output → Speech Services by Google → Install voice data → French.';
  }
  return 'Install a French (fr-FR) system voice in your device Accessibility / Speech settings for offline synthesis.';
};

export const speakFrenchText = (
  text: string,
  options?: SpeechOptions,
  onEnd?: () => void,
  onError?: (err: Error) => void
): void => {
  if (!isSpeechSupported() || typeof SpeechSynthesisUtterance === 'undefined') {
    if (onError) onError(new Error('Browser speech synthesis is not supported'));
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    activeUtterance = utterance;
    (window as any).__activeUtterance = utterance;

    const accent = options?.accent || currentAccent;
    const voice = options?.voiceURI
      ? window.speechSynthesis.getVoices().find(v => v.voiceURI === options.voiceURI) || getBestFrenchVoice(accent)
      : getBestFrenchVoice(accent);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || accent;
    } else {
      utterance.lang = accent;
    }

    utterance.rate = options?.rate ?? currentRate;
    utterance.pitch = options?.pitch ?? currentPitch;

    let completed = false;
    const done = () => {
      if (completed) return;
      completed = true;
      if (activeUtterance === utterance) activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onend = done;
    utterance.onerror = (event: any) => {
      if (completed) return;
      if (event?.error === 'canceled' || event?.error === 'interrupted') {
        done();
        return;
      }
      if (voice) {
        failedVoiceURIs.add(voice.voiceURI);
        const backup = getBestFrenchVoice(accent);
        if (backup && backup.voiceURI !== voice.voiceURI) {
          completed = true;
          speakFrenchText(text, { ...options, voiceURI: backup.voiceURI }, onEnd, onError);
          return;
        }
      }
      completed = true;
      if (onError) onError(new Error(event?.error || 'Speech synthesis failed'));
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    if (onError) onError(err instanceof Error ? err : new Error(String(err)));
  }
};
