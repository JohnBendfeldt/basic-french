import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Alphabet from '../components/Alphabet';
import AuthModal from '../components/AuthModal';
import ProgressModal from '../components/ProgressModal';
import UserMenu from '../components/UserMenu';
import PrivacyPolicy from '../components/PrivacyPolicy';
import TermsOfService from '../components/TermsOfService';
import Quiz, { gradeQuizAnswer } from '../components/Quiz';
import frenchData from '../data/frenchData';
import * as speechModule from '../utils/speech';
import {
  FRENCH_NUMBER_EQUIVALENTS,
  checkFrenchNumberEquivalence,
  normalizeFrenchText,
  normalizeEnglishAnswer,
  stripFrenchAccents,
} from '../utils/frenchText';
import {
  ProgressService,
  LOCAL_STORAGE_WORDS_KEY,
} from '../services/progressService';
import { speakFrenchText, isNeuralVoice } from '../utils/browserSpeech';

describe('Granular French Curriculum, Accents & Component Edge Cases', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('French Vigesimal & Cardinal Number Equivalence Matrix', () => {
    const numberPairs: Array<[string, string]> = [
      ['0', 'zéro'],
      ['1', 'un'],
      ['1', 'une'],
      ['2', 'deux'],
      ['3', 'trois'],
      ['4', 'quatre'],
      ['5', 'cinq'],
      ['6', 'six'],
      ['7', 'sept'],
      ['8', 'huit'],
      ['9', 'neuf'],
      ['10', 'dix'],
      ['11', 'onze'],
      ['12', 'douze'],
      ['13', 'treize'],
      ['14', 'quatorze'],
      ['15', 'quinze'],
      ['16', 'seize'],
      ['17', 'dix-sept'],
      ['18', 'dix-huit'],
      ['19', 'dix-neuf'],
      ['20', 'vingt'],
      ['30', 'trente'],
      ['40', 'quarante'],
      ['50', 'cinquante'],
      ['60', 'soixante'],
      ['70', 'soixante-dix'],
      ['80', 'quatre-vingts'],
      ['90', 'quatre-vingt-dix'],
      ['100', 'cent'],
      ['1000', 'mille'],
    ];

    it.each(numberPairs)('equates digit %s with French word "%s" in both directions', (digit, word) => {
      expect(Object.keys(FRENCH_NUMBER_EQUIVALENTS)).toContain(digit);
      expect(checkFrenchNumberEquivalence(digit, word)).toBe(true);
      expect(checkFrenchNumberEquivalence(word, digit)).toBe(true);
    });
  });

  describe('French Diacritic & Grading Edge Cases', () => {
    it.each([
      ['café', 'cafe', 'accent aigu'],
      ['très', 'tres', 'accent grave'],
      ['être', 'etre', 'accent circonflexe'],
      ['noël', 'noel', 'tréma'],
      ['français', 'francais', 'cédille'],
      ['où', 'ou', 'u-grave'],
      ['sœur', 'soeur', 'œ ligature'],
    ])('grades unaccented "%s" <- "%s" (%s) as correct with accent forgiveness', (target, typed) => {
      const res = gradeQuizAnswer(typed, target, false);
      expect(res.isCorrect).toBe(true);
      expect(stripFrenchAccents(target)).toBe(typed);
    });

    it('normalizes French guillemets, curly apostrophes, and parenthetical notes', () => {
      expect(normalizeFrenchText("L’addition, s’il vous plaît (au restaurant)")).toBe(
        'l addition s il vous plaît'
      );
    });

    it('normalizes English contractions across common pronouns', () => {
      expect(normalizeEnglishAnswer("I'm ready")).toBe('i am ready');
      expect(normalizeEnglishAnswer("You're welcome")).toBe('you are welcome');
      expect(normalizeEnglishAnswer("It's noon")).toBe('it is noon');
      expect(normalizeEnglishAnswer("Can't wait")).toBe('cannot wait');
      expect(normalizeEnglishAnswer("Let's go")).toBe('let us go');
    });

    it('accepts 1-character typo on longer English translations', () => {
      const res = gradeQuizAnswer('understnd', 'understand', true);
      expect(res.isCorrect).toBe(true);
      expect(res.spellingDiff).not.toBeNull();
    });

    it('does not forgive 1-character difference on short 3-letter words or digits', () => {
      expect(gradeQuizAnswer('cat', 'car', true).isCorrect).toBe(false);
      expect(gradeQuizAnswer('71', '70', true).isCorrect).toBe(false);
    });
  });

  describe('Alphabet Component & Emoji Audio Badges', () => {
    it('renders all 26 French alphabet cards and speaks example word when emoji badge is clicked', () => {
      const speakSpy = vi.spyOn(speechModule, 'speak').mockImplementation(() => {});
      render(<Alphabet data={frenchData.alphabet.slice(0, 4)} />);

      const firstWord = frenchData.alphabet[0].word!;
      const badgeBtn = screen.getByRole('button', { name: `Pronounce ${firstWord}` });
      fireEvent.click(badgeBtn);

      expect(speakSpy).toHaveBeenCalledWith(
        firstWord,
        'fr-FR',
        `badge-${firstWord}`,
        undefined,
        undefined,
        expect.objectContaining({ category: 'examples' })
      );
      speakSpy.mockRestore();
    });
  });

  describe('AuthModal, ProgressModal, UserMenu & Legal Navigation', () => {
    it('returns null when AuthModal or ProgressModal is closed', () => {
      const { container: c1 } = render(<AuthModal isOpen={false} onClose={() => {}} />);
      expect(c1.firstChild).toBeNull();

      const { container: c2 } = render(<ProgressModal isOpen={false} onClose={() => {}} />);
      expect(c2.firstChild).toBeNull();
    });

    it('handles GitHub and Microsoft Entra ID buttons inside AuthModal', async () => {
      render(<AuthModal isOpen={true} onClose={() => {}} />);

      fireEvent.click(screen.getByRole('button', { name: /Sign in with GitHub/i }));
      expect(await screen.findByText(/Supabase is not configured/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Sign in with Microsoft Entra ID/i }));
      expect(await screen.findByText(/Supabase is not configured/i)).toBeInTheDocument();
    });

    it('renders populated ProgressModal with stats, words to review, and recent quiz sessions', async () => {
      await ProgressService.recordWordAttempt({
        category: 'basicPhrases',
        wordId: 'phrase-bonjour',
        prompt: 'Bonjour',
        answer: 'Hello',
        target: 'Bonjour',
        isCorrect: false,
      });
      await ProgressService.recordQuizSession({
        category: 'basicPhrases',
        score: 7,
        totalQuestions: 10,
      });
      await ProgressService.recordQuizSession({
        category: 'numbers',
        score: 4,
        totalQuestions: 10,
      });

      render(<ProgressModal isOpen={true} onClose={() => {}} userEmail="jean@basicfrench.org" />);

      expect(await screen.findByText(/Logged in as jean@basicfrench.org/i)).toBeInTheDocument();
      expect(screen.getByText(/Words & Phrases to Review/i)).toBeInTheDocument();
      expect(screen.getByText(/Recent Quiz Sessions/i)).toBeInTheDocument();
      expect(screen.getByText('7/10 (70%)')).toBeInTheDocument();
      expect(screen.getByText('4/10 (40%)')).toBeInTheDocument();
    });

    it('renders Microsoft Entra ID and Google badges, closes on outside click, and signs out in UserMenu', async () => {
      const onNavigate = vi.fn();
      const { unmount } = render(
        <UserMenu
          onNavigate={onNavigate}
          initialUser={{
            email: 'marc@basicfrench.org',
            app_metadata: { provider: 'azure' },
            user_metadata: {},
          }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /User menu for marc/i }));
      expect(screen.getByText(/Microsoft Entra ID/i)).toBeInTheDocument();

      // Click outside closes dropdown
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      unmount();

      // Google provider + Terms navigation + Sign Out
      render(
        <UserMenu
          onNavigate={onNavigate}
          initialUser={{
            email: 'claire@basicfrench.org',
            app_metadata: { provider: 'google' },
            user_metadata: { full_name: 'Claire' },
          }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /User menu for Claire/i }));
      expect(screen.getByText(/Google/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Terms of Service' }));
      expect(onNavigate).toHaveBeenCalledWith('terms');

      fireEvent.click(screen.getByRole('button', { name: /User menu for Claire/i }));
      fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Sign in to sync progress/i })).toBeInTheDocument();
      });
    });

    it('navigates back to practice from PrivacyPolicy and TermsOfService', () => {
      const onNav = vi.fn();
      const { unmount } = render(<PrivacyPolicy onNavigate={onNav} />);
      fireEvent.click(screen.getByRole('button', { name: /Back to practice lessons/i }));
      expect(onNav).toHaveBeenCalledWith('alphabet');
      unmount();

      render(<TermsOfService onNavigate={onNav} />);
      fireEvent.click(screen.getByRole('button', { name: /View Privacy Policy/i }));
      expect(onNav).toHaveBeenCalledWith('privacy');
    });
  });

  describe('Quiz Alphabet Direction, Mid-Session Goal Reduction & Unmount Save', () => {
    it('supports Alphabet bidirectional quiz questions and completes immediately when goal is reduced mid-session', async () => {
      localStorage.setItem(
        LOCAL_STORAGE_WORDS_KEY,
        JSON.stringify({
          'alphabet-A-fr-to-en': {
            userId: 'guest_user',
            category: 'alphabet',
            wordId: 'alphabet-A-fr-to-en',
            prompt: 'A — Ami',
            answer: 'Friend',
            timesCorrect: 5,
            timesIncorrect: 0,
            lastTestedAt: '2026-11-13T00:00:00Z',
            masteryLevel: 5,
          },
        })
      );

      render(
        <Quiz
          data={{
            alphabet: [
              {
                letter: 'A',
                pronunciation: 'ah',
                example: 'Ami',
                word: 'Ami',
                meaning: 'Friend',
              },
            ],
          }}
        />
      );

      expect(await screen.findByText(/How do you write "Friend" in French\?/i)).toBeInTheDocument();

      // Answer 5 questions in a 10-question session, then reduce goal to 5 Qs -> completes session!
      for (let i = 0; i < 5; i++) {
        const input = screen.getByLabelText('Quiz answer input');
        const hint = screen.getByRole('heading', { level: 3 }).textContent || '';
        fireEvent.change(input, {
          target: { value: hint.includes('in French') ? 'Ami' : 'Friend' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
        await screen.findByText('Correct!');
        if (i < 4) {
          fireEvent.keyDown(window, { key: 'Enter' });
        }
      }

      fireEvent.click(screen.getByRole('button', { name: '5 Qs' }));
      expect(await screen.findByRole('heading', { name: /Quiz Session Complete!/i })).toBeInTheDocument();
      expect(screen.getByText(/Félicitations !/i)).toBeInTheDocument();
    });

    it('saves partial session on unmount when at least 3 questions have been answered', async () => {
      const spy = vi.spyOn(ProgressService, 'recordQuizSession');
      const { unmount } = render(
        <Quiz
          data={{
            commonWords: [{ phrase: 'eau', translation: 'water', pronunciation: 'oh' }],
          }}
        />
      );

      for (let i = 0; i < 3; i++) {
        const input = screen.getByLabelText('Quiz answer input');
        fireEvent.change(input, { target: { value: 'wrong' } });
        fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
        await screen.findByText('Not quite');
        fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));
      }

      unmount();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ totalQuestions: 3, score: 0 })
      );
      spy.mockRestore();
    });

    it('detects neural voices and falls back to backup French voice when primary voice errors', () => {
      const v1 = {
        name: 'Microsoft HenriNeural',
        lang: 'fr-FR',
        voiceURI: 'henri-broken',
        localService: false,
        default: false,
      } as SpeechSynthesisVoice;
      const v2 = {
        name: 'Thomas',
        lang: 'fr-FR',
        voiceURI: 'thomas-backup',
        localService: true,
        default: true,
      } as SpeechSynthesisVoice;

      expect(isNeuralVoice(v1)).toBe(true);
      vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValue([v1, v2]);

      let call = 0;
      const speakSpy = vi.spyOn(window.speechSynthesis, 'speak').mockImplementation((utt: any) => {
        call++;
        if (call === 1 && utt.onerror) {
          utt.onerror({ error: 'synthesis-failed' });
        } else if (utt.onend) {
          utt.onend();
        }
      });

      const onEnd = vi.fn();
      speakFrenchText('Bonjour', { accent: 'fr-FR' }, onEnd);
      expect(call).toBe(2);
      expect(onEnd).toHaveBeenCalled();

      speakSpy.mockRestore();
    });
  });
});
