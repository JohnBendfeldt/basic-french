import React, { useState, useEffect } from 'react';
import './App.css';
import Alphabet from './components/Alphabet';
import Phrases from './components/Phrases';
import NumbersAndTime from './components/NumbersAndTime';
import Navigation from './components/Navigation';
import Quiz from './components/Quiz';
import BottomNavigation from './components/BottomNavigation';
import UserMenu from './components/UserMenu';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import frenchData from './data/frenchData';
import { initVoices, cancelAllSpeech } from './utils/speech';
import { getScrollBehavior } from './utils/useModalAccessibility';

const SECTION_META: Record<string, { title: string; description: string }> = {
  alphabet: {
    title: 'French Alphabet & Phonetics | Basic French',
    description:
      'Learn the 26 letters of the French alphabet with IPA pronunciation, nasal vowels, accents, and native French audio examples.',
  },
  phrases: {
    title: 'Basic French Phrases | Basic French',
    description:
      'Learn essential French phrases for beginners with native neural audio pronunciation. Greetings, polite expressions, café orders, and travel essentials.',
  },
  numbers: {
    title: 'French Numbers (0–1,000) | Basic French',
    description:
      'Learn French numbers from 0 to 1,000 including soixante-dix, quatre-vingts, and quatre-vingt-dix with native French audio.',
  },
  time: {
    title: 'Telling Time in French | Basic French',
    description:
      'Learn how to tell time in French (Quelle heure est-il ?, midi, minuit, et quart, et demie) with grammar rules and native audio.',
  },
  words: {
    title: 'Common French Words | Basic French',
    description:
      'Build everyday French vocabulary with 240+ high-frequency words, beginner phonetic guides, and native French neural audio.',
  },
  quiz: {
    title: 'Interactive French Quiz | Basic French',
    description:
      'Test your French with adaptive spaced-repetition quizzes, an interactive French accent bar, and accent-forgiving answer grading.',
  },
  privacy: {
    title: 'Privacy Policy | Basic French',
    description:
      'Privacy Policy for Basic French (basicfrench.org). Learn how we protect your privacy, study progress, and data.',
  },
  terms: {
    title: 'Terms of Service | Basic French',
    description:
      'Terms of Service for Basic French (basicfrench.org). Free French language learning application terms and guidelines.',
  },
};

const PATH_TO_SECTION: Record<string, string> = {
  '/': 'alphabet',
  '/alphabet': 'alphabet',
  '/phrases': 'phrases',
  '/numbers': 'numbers',
  '/time': 'time',
  '/words': 'words',
  '/quiz': 'quiz',
  '/privacy': 'privacy',
  '/terms': 'terms',
};

const SECTION_TO_PATH: Record<string, string> = {
  alphabet: '/alphabet',
  phrases: '/phrases',
  numbers: '/numbers',
  time: '/time',
  words: '/words',
  quiz: '/quiz',
  privacy: '/privacy',
  terms: '/terms',
};

const hasOwn = (obj: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const getSectionFromPath = (): string => {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return hasOwn(PATH_TO_SECTION, path) ? PATH_TO_SECTION[path] : 'alphabet';
};

const updateMeta = (section: string) => {
  const safeSection = hasOwn(SECTION_META, section) ? section : 'alphabet';
  const meta = SECTION_META[safeSection];
  const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const canonicalUrl =
    currentPath === '/' && safeSection === 'alphabet'
      ? 'https://basicfrench.org/'
      : `https://basicfrench.org${hasOwn(SECTION_TO_PATH, section) ? SECTION_TO_PATH[section] : '/alphabet'}`;

  document.title = meta.title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', meta.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', meta.title);
  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (twitterDesc) twitterDesc.setAttribute('content', meta.description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', canonicalUrl);
  }
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(getSectionFromPath);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [speechInitialized, setSpeechInitialized] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      const section = getSectionFromPath();
      setActiveSection(section);
      updateMeta(section);
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
    };
    window.addEventListener('popstate', onPopState);
    updateMeta(activeSection);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as any);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const initSpeech = async () => {
      try {
        await initVoices();
        setSpeechInitialized(true);
      } catch (err) {
        console.error('Failed to initialize speech:', err);
        setSpeechInitialized(true);
      }
    };

    initSpeech();
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    (installPrompt as any).userChoice.then(() => {
      setInstallPrompt(null);
    });
  };

  const handleSectionChange = (section: string) => {
    cancelAllSpeech();

    document.querySelectorAll('audio').forEach(audio => {
      try {
        audio.pause();
      } catch (e) {
        console.warn('Error pausing audio:', e);
      }
    });

    const newPath = hasOwn(SECTION_TO_PATH, section) ? SECTION_TO_PATH[section] : '/alphabet';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ section }, '', newPath);
    }
    updateMeta(section);

    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: getScrollBehavior() });
  };

  const renderActiveSection = () => {
    if (!speechInitialized) {
      return (
        <div className="section loading-section" role="status" aria-live="polite">
          <h2>Loading French Audio</h2>
          <p className="loading-message">Initializing French voice capabilities. This may take a moment...</p>
          <div className="loading-spinner" aria-hidden="true"></div>
        </div>
      );
    }

    switch (activeSection) {
      case 'alphabet':
        return <Alphabet data={frenchData.alphabet} />;
      case 'phrases':
        return (
          <Phrases
            data={frenchData.basicPhrases}
            title="Basic French Phrases"
            contentType="phrases"
          />
        );
      case 'numbers':
      case 'time':
        return (
          <NumbersAndTime
            numbersData={frenchData.numbers}
            timeData={frenchData.time}
            activeTab={activeSection === 'time' ? 'time' : 'numbers'}
            onTabChange={(tab) => handleSectionChange(tab)}
          />
        );
      case 'words':
        return (
          <Phrases
            data={frenchData.commonWords}
            title="Common French Words"
            contentType="words"
          />
        );
      case 'quiz':
        return (
          <Quiz
            data={{
              alphabet: frenchData.alphabet,
              basicPhrases: frenchData.basicPhrases,
              numbers: frenchData.numbers,
              time: frenchData.time,
              commonWords: frenchData.commonWords,
            }}
          />
        );
      case 'privacy':
        return <PrivacyPolicy onNavigate={handleSectionChange} />;
      case 'terms':
        return <TermsOfService onNavigate={handleSectionChange} />;
      default:
        return <Alphabet data={frenchData.alphabet} />;
    }
  };

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header>
        <div className="header-content">
          <h1>
            <button
              type="button"
              className="brand-home-button"
              onClick={() => handleSectionChange('alphabet')}
              title="Return to alphabet lessons"
            >
              <svg
                className="app-emblem french-emblem french-flag"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <defs>
                  <linearGradient id="frEmblemBg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="50%" stopColor="#1e1b4b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="frGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="60%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#frEmblemBg)" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />
                <g transform="translate(5, 5)">
                  <defs>
                    <clipPath id="frFlagClip">
                      <rect x="0" y="0" width="13" height="9" rx="2" />
                    </clipPath>
                  </defs>
                  <rect x="-0.5" y="-0.5" width="14" height="10" rx="2.5" fill="rgba(0, 0, 0, 0.45)" />
                  <rect x="0" y="0" width="13" height="9" rx="2" fill="#ffffff" />
                  <g clipPath="url(#frFlagClip)">
                    <rect x="0" y="0" width="4.33" height="9" fill="#0055a5" />
                    <rect x="4.33" y="0" width="4.34" height="9" fill="#ffffff" />
                    <rect x="8.67" y="0" width="4.33" height="9" fill="#ef4135" />
                  </g>
                  <rect x="0" y="0" width="13" height="9" rx="2" fill="none" stroke="#ffffff" strokeWidth="0.8" />
                </g>
                <g transform="translate(0, 3)">
                  <path d="M24 13L8 20.5L24 28L40 20.5L24 13Z" fill="url(#frGoldGrad)" />
                  <path
                    d="M14 24.5V32C14 35.5 18 38 24 38C30 38 34 35.5 34 32V24.5"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path d="M40 21V30.5" stroke="url(#frGoldGrad)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="40" cy="31.5" r="1.5" fill="url(#frGoldGrad)" />
                </g>
              </svg>
              <span className="brand-title-group">
                <span className="brand-title-main">Basic French</span>
                <span className="brand-parent-tag">by Basic Language School</span>
              </span>
            </button>
          </h1>
          <div className="header-actions">
            <a
              href="https://basiclanguage.school"
              target="_blank"
              rel="noopener noreferrer"
              className="header-action-btn language-hub-pill"
              title="15+ Languages — Explore Basic Language School"
              aria-label="15+ Languages — Explore 15+ world languages on Basic Language School"
            >
              <span aria-hidden="true">🌐</span>
              <span className="hub-pill-text">15+ Languages</span>
            </a>
            {installPrompt && (
              <button type="button" onClick={handleInstallClick} className="install-button">
                Install App
              </button>
            )}
            <UserMenu onNavigate={handleSectionChange} />
          </div>
        </div>
        <Navigation
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
        />
      </header>

      <main id="main-content" tabIndex={-1}>
        {renderActiveSection()}
      </main>

      <BottomNavigation
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
      />

      <footer>
        <p>
          © {new Date().getFullYear()} Basic French · Part of{' '}
          <a
            href="https://basiclanguage.school"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Basic Language School
          </a>{' '}
          ·{' '}
          <a
            href="/privacy"
            className="footer-link"
            onClick={(e) => {
              e.preventDefault();
              handleSectionChange('privacy');
            }}
          >
            Privacy Policy
          </a>{' '}
          ·{' '}
          <a
            href="/terms"
            className="footer-link"
            onClick={(e) => {
              e.preventDefault();
              handleSectionChange('terms');
            }}
          >
            Terms of Service
          </a>{' '}
          ·{' '}
          <a
            href="https://github.com/JohnBendfeldt/basic-french"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
