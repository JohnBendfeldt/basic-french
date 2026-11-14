import React, { useState, useEffect, useRef } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { speak, initVoices, unlockIOSAudio } from '../utils/speech';

interface PronunciationButtonProps {
  text: string;
  lang?: string;
  label?: string;
  className?: string;
  useLocalAudio?: boolean;
  isAlphabet?: boolean;
  audioCategory?:
    | 'alphabet'
    | 'words'
    | 'phrases'
    | 'numbers'
    | 'time'
    | 'examples'
    | 'basicPhrases'
    | 'commonWords';
  rate?: number;
}

const PronunciationButton: React.FC<PronunciationButtonProps> = ({
  text,
  lang = 'fr-FR',
  label,
  className,
  audioCategory,
  useLocalAudio = true,
  rate = 1.0,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const buttonId = useRef(`btn-${Math.random().toString(36).substring(2, 9)}`);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const init = async () => {
      try {
        await initVoices();
        if (isMounted.current) {
          setInitialized(true);
        }
      } catch (err) {
        console.error('Error initializing speech in button:', err);
        if (isMounted.current) {
          setInitialized(true);
        }
      }
    };

    init();

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    setIsPlaying(false);
  }, [text]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (isPlaying) {
      timer = setTimeout(() => {
        if (isMounted.current) {
          setIsPlaying(false);
        }
      }, 4000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying || !text) return;

    unlockIOSAudio();
    setIsPlaying(true);

    speak(
      text,
      lang,
      buttonId.current,
      () => {
        if (isMounted.current) {
          setIsPlaying(false);
        }
      },
      () => {
        if (isMounted.current) {
          setIsPlaying(false);
        }
      },
      { rate, category: audioCategory, useLocalAudio }
    );
  };

  return (
    <button
      type="button"
      className={`pronunciation-button ${isPlaying ? 'playing' : ''} ${className || ''}`}
      onClick={handleSpeak}
      disabled={isPlaying || !initialized}
      title={isPlaying ? 'Speaking...' : label || `Pronounce "${text}"`}
      aria-label={isPlaying ? 'Speaking...' : label || `Pronounce "${text}"`}
      data-button-id={buttonId.current}
    >
      <FaVolumeUp className={isPlaying ? 'pulse-animation' : ''} aria-hidden="true" />
    </button>
  );
};

export default PronunciationButton;
