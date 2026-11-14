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

const getSectionFromPath = (): string => {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return PATH_TO_SECTION[path] || 'alphabet';
};

const updateMeta = (section: string) => {
  const meta = SECTION_META[section] || SECTION_META.alphabet;
  document.title = meta.title;
  const descTag = document.querySelector('meta[name="description"]');
  if (descTag) descTag.setAttribute('content', meta.description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', meta.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', meta.description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `https://basicfrench.org${SECTION_TO_PATH[section] || '/alphabet'}`);
  }
};

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>(getSectionFromPath);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speechInitialized, setSpeechInitialized] = useState(false);

  useEffect(() => {
    const onPopState = () => {
      const section = getSectionFromPath();
      setActiveSection(section);
      updateMeta(section);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const closeMenu = () => {
    setMenuOpen(false);
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

    const newPath = SECTION_TO_PATH[section] || '/alphabet';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ section }, '', newPath);
    }
    updateMeta(section);

    setActiveSection(section);
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveSection = () => {
    if (!speechInitialized) {
      return (
        <div className="section loading-section">
          <h2>Loading French Audio</h2>
          <p className="loading-message">Initializing French voice capabilities. This may take a moment...</p>
          <div className="loading-spinner"></div>
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
      <header>
        <div className="header-content">
          <h1
            onClick={() => handleSectionChange('alphabet')}
            style={{ cursor: 'pointer' }}
            title="Return to French alphabet lessons"
          >
            <svg
              className="french-emblem"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Basic French logo"
              role="img"
              style={{ width: '28px', height: '28px', marginRight: '8px', verticalAlign: 'middle' }}
            >
              <defs>
                <clipPath id="frenchHeaderCircle">
                  <circle cx="18" cy="18" r="16" />
                </clipPath>
              </defs>
              <g clipPath="url(#frenchHeaderCircle)">
                <rect x="2" y="2" width="10.7" height="32" fill="#002654" />
                <rect x="12.7" y="2" width="10.6" height="32" fill="#FFFFFF" />
                <rect x="23.3" y="2" width="10.7" height="32" fill="#ED2939" />
                <circle cx="18" cy="18" r="16" fill="#0F172A" fillOpacity="0.28" />
              </g>
              <circle cx="18" cy="18" r="16.5" stroke="#FFFFFF" strokeWidth="1.8" />
              <path d="M18 9.5L8.5 14.2L18 19L27.5 14.2L18 9.5Z" fill="#FBBF24" stroke="#1E293B" strokeWidth="0.7" />
              <path
                d="M12.5 16.6V22.5C12.5 24.4 15 26.2 18 26.2C21 26.2 23.5 24.4 23.5 22.5V16.6"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M27.5 14.5V20.8" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Basic French
          </h1>
          <div className="header-actions">
            <a
              href="https://basiclanguage.school"
              target="_blank"
              rel="noopener noreferrer"
              className="header-action-btn language-hub-pill"
              title="Explore 15+ world languages on Basic Language School"
              aria-label="Explore 15+ world languages on Basic Language School"
            >
              <span aria-hidden="true">🌐</span>
              <span className="hub-pill-text">15+ Languages</span>
            </a>
            {installPrompt && (
              <button onClick={handleInstallClick} className="install-button">
                Install App
              </button>
            )}
            <UserMenu onNavigate={handleSectionChange} />
          </div>
        </div>
        <Navigation
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
          isOpen={menuOpen}
          _onClose={closeMenu}
        />
      </header>

      <main tabIndex={-1}>
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
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
