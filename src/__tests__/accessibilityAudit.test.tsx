import React from 'react';
import fs from 'fs';
import path from 'path';
import axe from 'axe-core';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import Alphabet from '../components/Alphabet';
import Phrases from '../components/Phrases';
import NumbersAndTime from '../components/NumbersAndTime';
import Quiz from '../components/Quiz';
import AuthModal from '../components/AuthModal';
import ProgressModal from '../components/ProgressModal';
import UserMenu from '../components/UserMenu';
import PrivacyPolicy from '../components/PrivacyPolicy';
import TermsOfService from '../components/TermsOfService';
import frenchData from '../data/frenchData';
import { ProgressService } from '../services/progressService';
import { getScrollBehavior, prefersReducedMotion } from '../utils/useModalAccessibility';

const appCssPath = path.resolve(__dirname, '../App.css');
const appCssContent = fs.readFileSync(appCssPath, 'utf-8');

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoAxeViolations(target: Element | Document = document.body) {
  const results = await axe.run(target as any, {
    runOnly: {
      type: 'tag',
      values: WCAG_AA_TAGS,
    },
  });

  const formatted = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => ({ html: n.html, summary: n.failureSummary })),
  }));

  expect(formatted).toEqual([]);
}

describe('WCAG 2.1 / 2.2 Level AA Accessibility Audit & Behavioral Suite', () => {
  let styleEl: HTMLStyleElement;

  beforeAll(() => {
    document.documentElement.lang = 'en';
    styleEl = document.createElement('style');
    styleEl.textContent = appCssContent;
    document.head.appendChild(styleEl);
  });

  afterAll(() => {
    styleEl?.remove();
  });

  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
    document.body.style.overflow = '';
  });

  describe('Automated axe-core WCAG 2.1 / 2.2 AA Scans Across All Views', () => {
    it('passes axe-core on full App shell (Alphabet default view, skip link, header, nav, footer)', async () => {
      const { container } = render(<App />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /French Alphabet & Phonetics/i })).toBeInTheDocument();
      });

      await expectNoAxeViolations(container);
    }, 20000);

    it('passes axe-core on Phrases view in both unrevealed and revealed states', async () => {
      const { container } = render(
        <main id="main-content" tabIndex={-1}>
          <h1>Basic French</h1>
          <Phrases
            data={frenchData.basicPhrases.slice(0, 6)}
            title="Basic French Phrases"
            contentType="phrases"
          />
        </main>
      );

      await expectNoAxeViolations(container);

      fireEvent.click(screen.getByRole('button', { name: /Reveal all basic french phrases/i }));
      expect(screen.getByText(frenchData.basicPhrases[0].translation)).toBeInTheDocument();

      await expectNoAxeViolations(container);
    }, 15000);

    it('passes axe-core on NumbersAndTime across both Numbers and Telling Time tabs, and Common Words', async () => {
      const Wrapper = () => {
        const [tab, setTab] = React.useState<'numbers' | 'time'>('numbers');
        return (
          <main id="main-content" tabIndex={-1}>
            <h1>Basic French</h1>
            <NumbersAndTime
              numbersData={frenchData.numbers.slice(0, 4)}
              timeData={frenchData.time.slice(0, 4)}
              activeTab={tab}
              onTabChange={setTab}
            />
          </main>
        );
      };

      const { container, unmount } = render(<Wrapper />);
      await expectNoAxeViolations(container);

      fireEvent.click(screen.getByRole('tab', { name: /Telling Time/i }));
      expect(screen.getByRole('heading', { name: /French Time Grammar Rules/i })).toBeInTheDocument();
      await expectNoAxeViolations(container);
      unmount();

      const { container: wordsContainer } = render(
        <main id="main-content" tabIndex={-1}>
          <h1>Basic French</h1>
          <Phrases
            data={frenchData.commonWords.slice(0, 6)}
            title="Common French Words"
            contentType="words"
          />
        </main>
      );
      await expectNoAxeViolations(wordsContainer);
    }, 20000);

    it('passes axe-core on Quiz (FR->EN audio toolbar, EN->FR accent bar + open popover, feedback drawers, and recap)', async () => {
      // 1. Deterministic EN->FR question with Accent Bar + open Accent Tips popover + Incorrect Feedback
      const mathSpy = vi.spyOn(Math, 'random').mockReturnValue(0.95); // >= 0.5 => EN->FR
      const { container, unmount } = render(
        <main id="main-content" tabIndex={-1}>
          <h1>Basic French</h1>
          <Quiz
            data={{
              basicPhrases: [
                {
                  phrase: 'S’il vous plaît',
                  translation: 'Please',
                  pronunciation: 'seel voo pleh',
                },
              ],
            }}
          />
        </main>
      );

      expect(await screen.findByRole('region', { name: /French accent characters/i })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Accents — French accent guide/i }));
      expect(screen.getByRole('note', { name: /French accent tips/i })).toBeInTheDocument();
      await expectNoAxeViolations(container);

      // Submit incorrect answer -> audit incorrect feedback drawer
      const input = screen.getByLabelText('Quiz answer input');
      fireEvent.change(input, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
      expect(await screen.findByText('Not quite')).toBeInTheDocument();
      await expectNoAxeViolations(container);

      // Override to correct -> audit overridden correct feedback drawer
      fireEvent.click(screen.getByRole('button', { name: /I was right/i }));
      expect(await screen.findByText('Correct! (Overridden)')).toBeInTheDocument();
      await expectNoAxeViolations(container);

      unmount();
      mathSpy.mockRestore();

      // 2. Deterministic FR->EN question with Audio Toolbar + Session Recap with Missed Words
      const frSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1); // < 0.5 => FR->EN
      const { container: recapContainer } = render(
        <main id="main-content" tabIndex={-1}>
          <h1>Basic French</h1>
          <Quiz
            data={{
              commonWords: [
                { phrase: 'eau', translation: 'water', pronunciation: 'oh' },
              ],
            }}
          />
        </main>
      );

      expect(await screen.findByRole('toolbar', { name: /Audio controls/i })).toBeInTheDocument();
      await expectNoAxeViolations(recapContainer);

      // Switch to 5 Qs and complete with 1 missed + 4 correct
      fireEvent.click(screen.getByRole('button', { name: '5 Qs' }));
      for (let i = 0; i < 5; i++) {
        const qInput = screen.getByLabelText('Quiz answer input');
        const hintText = screen.getByRole('heading', { level: 3 }).textContent || '';
        const rightAnswer = hintText.includes('in French') ? 'eau' : 'water';
        fireEvent.change(qInput, { target: { value: i === 0 ? 'milk' : rightAnswer } });
        fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
        await screen.findByText(i === 0 ? 'Not quite' : 'Correct!');
        const continueBtn =
          i < 4
            ? screen.getByRole('button', { name: /Next Question/i })
            : screen.getByRole('button', { name: /Complete Quiz/i });
        fireEvent.click(continueBtn);
      }

      expect(await screen.findByRole('heading', { name: /Quiz Session Complete!/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3, name: /Words to Review from This Session/i })).toBeInTheDocument();
      await expectNoAxeViolations(recapContainer);

      frSpy.mockRestore();
    }, 25000);

    it('passes axe-core on AuthModal, ProgressModal, UserMenu (guest & open menu), PrivacyPolicy, and TermsOfService', async () => {
      await ProgressService.recordWordAttempt({
        category: 'basicPhrases',
        wordId: 'phrase-merci',
        prompt: 'Merci beaucoup',
        answer: 'Thank you very much',
        target: 'Merci beaucoup',
        isCorrect: false,
      });
      await ProgressService.recordQuizSession({
        category: 'basicPhrases',
        score: 8,
        totalQuestions: 10,
      });

      // AuthModal with error alert
      const { container: authContainer, unmount: unmountAuth } = render(
        <div>
          <AuthModal isOpen={true} onClose={() => {}} />
        </div>
      );
      fireEvent.click(screen.getByRole('button', { name: /Google Gmail — Sign in with Google/i }));
      expect(await screen.findByRole('alert')).toBeInTheDocument();
      await expectNoAxeViolations(authContainer);
      unmountAuth();

      // Populated ProgressModal
      const { container: progressContainer, unmount: unmountProgress } = render(
        <div>
          <ProgressModal isOpen={true} onClose={() => {}} userEmail="claire@basicfrench.org" />
        </div>
      );
      expect(await screen.findByText(/Words & Phrases to Review/i)).toBeInTheDocument();
      await expectNoAxeViolations(progressContainer);
      unmountProgress();

      // Logged-in UserMenu with open dropdown
      const { container: menuContainer, unmount: unmountMenu } = render(
        <header>
          <UserMenu
            onNavigate={() => {}}
            initialUser={{
              email: 'claire@basicfrench.org',
              app_metadata: { provider: 'google' },
              user_metadata: { full_name: 'Claire Martin' },
            }}
          />
        </header>
      );
      fireEvent.click(screen.getByRole('button', { name: /User menu for Claire Martin/i }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
      await expectNoAxeViolations(menuContainer);
      unmountMenu();

      // SPA PrivacyPolicy & TermsOfService
      const { container: privacyContainer, unmount: unmountPrivacy } = render(
        <main id="main-content" tabIndex={-1}>
          <h1>Basic French</h1>
          <PrivacyPolicy onNavigate={() => {}} />
        </main>
      );
      await expectNoAxeViolations(privacyContainer);
      unmountPrivacy();

      const { container: termsContainer, unmount: unmountTerms } = render(
        <main id="main-content" tabIndex={-1}>
          <h1>Basic French</h1>
          <TermsOfService onNavigate={() => {}} />
        </main>
      );
      await expectNoAxeViolations(termsContainer);
      unmountTerms();
    }, 20000);

    it('passes axe-core on static public/privacy/index.html and public/terms/index.html documents', async () => {
      for (const relPath of ['../../public/privacy/index.html', '../../public/terms/index.html']) {
        const html = fs.readFileSync(path.resolve(__dirname, relPath), 'utf-8');
        const parsed = new DOMParser().parseFromString(html, 'text/html');

        // Verify static skip link, main landmark, focus-visible styles, and underlined links
        const skip = parsed.querySelector('a.skip-link');
        expect(skip).not.toBeNull();
        expect(skip?.getAttribute('href')).toBe('#main-content');
        expect(parsed.querySelector('main#main-content')).not.toBeNull();
        expect(html).toContain(':focus-visible');
        expect(html).toContain('prefers-reduced-motion: reduce');

        // Mount into a temporary wrapper to run axe rules on body content
        const host = document.createElement('div');
        const pageStyle = document.createElement('style');
        pageStyle.textContent = parsed.querySelector('style')?.textContent || '';
        host.appendChild(pageStyle);
        Array.from(parsed.body.children).forEach((child) => {
          host.appendChild(child.cloneNode(true));
        });
        document.body.appendChild(host);

        try {
          await expectNoAxeViolations(host);
        } finally {
          host.remove();
        }
      }
    });
  });

  describe('WCAG 3.1.2 Language of Parts (lang="fr" / lang="en") Coverage', () => {
    it('tags French letters, words, phrases, grammar examples, quiz prompts/inputs/accents/recap, and review items with lang="fr"', async () => {
      // Alphabet
      const { unmount: u1 } = render(<Alphabet data={frenchData.alphabet.slice(0, 2)} />);
      expect(document.querySelector('.letter-uppercase')).toHaveAttribute('lang', 'fr');
      expect(document.querySelector('.letter-lowercase')).toHaveAttribute('lang', 'fr');
      expect(document.querySelector('.example-word')).toHaveAttribute('lang', 'fr');
      expect(document.querySelector('.example-translation')).toHaveAttribute('lang', 'en');
      u1();

      // Phrases
      const { unmount: u2 } = render(
        <Phrases data={frenchData.basicPhrases.slice(0, 2)} title="Basic French Phrases" />
      );
      expect(document.querySelector('.phrase-target')).toHaveAttribute('lang', 'fr');
      fireEvent.click(screen.getByRole('button', { name: /Reveal all/i }));
      expect(document.querySelector('.english')).toHaveAttribute('lang', 'en');
      u2();

      // NumbersAndTime
      const { unmount: u3 } = render(
        <NumbersAndTime
          numbersData={frenchData.numbers.slice(0, 2)}
          timeData={frenchData.time.slice(0, 2)}
          activeTab="time"
          onTabChange={() => {}}
        />
      );
      const frenchTimeSpans = document.querySelectorAll('.time-grammar-guide [lang="fr"]');
      expect(frenchTimeSpans.length).toBeGreaterThanOrEqual(8);
      u3();

      // Quiz EN -> FR
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.95);
      const { unmount: u4 } = render(
        <Quiz
          data={{
            basicPhrases: [{ phrase: 'Café', translation: 'Coffee', pronunciation: 'kah-fay' }],
          }}
        />
      );
      const promptEl = await screen.findByText('Coffee');
      expect(promptEl).toHaveAttribute('lang', 'en');
      const inputEl = screen.getByLabelText('Quiz answer input');
      expect(inputEl).toHaveAttribute('lang', 'fr');
      expect(document.querySelector('.accent-key-btn span')).toHaveAttribute('lang', 'fr');

      fireEvent.change(inputEl, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
      const correctWord = await screen.findByText('Café');
      expect(correctWord).toHaveAttribute('lang', 'fr');
      u4();
      spy.mockRestore();
    });
  });

  describe('Skip Link, Landmarks, Navigation Semantics & Focus Retention', () => {
    it('renders skip-link first inside .app, keyboard-operable Navigation buttons with aria-current="page", and brand-home-button', async () => {
      const { container } = render(<App />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /French Alphabet & Phonetics/i })).toBeInTheDocument();
      });

      const appRoot = container.querySelector('.app')!;
      const firstChild = appRoot.firstElementChild as HTMLAnchorElement;
      expect(firstChild).toHaveClass('skip-link');
      expect(firstChild).toHaveAttribute('href', '#main-content');

      const mainEl = container.querySelector('main#main-content');
      expect(mainEl).toHaveAttribute('tabindex', '-1');

      // Top Navigation uses <button class="nav-tab-btn"> with aria-current="page"
      const topNav = screen.getByRole('navigation', { name: /Main navigation/i });
      const alphabetNavBtn = within(topNav).getByRole('button', { name: 'Alphabet' });
      const phrasesNavBtn = within(topNav).getByRole('button', { name: 'Basic Phrases' });
      expect(alphabetNavBtn).toHaveAttribute('aria-current', 'page');
      expect(phrasesNavBtn).not.toHaveAttribute('aria-current');

      // Activate Basic Phrases via keyboard button click, then return home via brand-home-button
      phrasesNavBtn.focus();
      fireEvent.click(phrasesNavBtn);
      expect(phrasesNavBtn).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('heading', { name: /Basic French Phrases/i })).toBeInTheDocument();

      // BottomNavigation on mobile (display: flex) exposes navigation landmark, aria-current="page", and 0 axe violations
      const bottomNavEl = container.querySelector('.bottom-navigation') as HTMLElement;
      bottomNavEl.style.display = 'flex';
      const bottomNav = screen.getByRole('navigation', { name: /Bottom navigation/i });
      expect(
        within(bottomNav).getByRole('button', { name: /Switch to Phrases section/i })
      ).toHaveAttribute('aria-current', 'page');
      await expectNoAxeViolations(bottomNav);
      bottomNavEl.style.display = '';

      const brandHomeBtn = screen.getByRole('button', { name: /^Basic French/i });
      fireEvent.click(brandHomeBtn);
      expect(alphabetNavBtn).toHaveAttribute('aria-current', 'page');

      // WCAG 2.5.3 Label in Name on header 15+ Languages pill
      const hubLink = screen.getByRole('link', { name: /^15\+ Languages/i });
      expect(hubLink.textContent).toContain('15+ Languages');
    });

    it('does not remount .phrase-card on toggle, retains focus on toggle button, and exposes revealed text outside role="button"', () => {
      render(
        <Phrases
          data={[
            {
              phrase: 'Bonjour',
              translation: 'Hello / Good morning',
              pronunciation: 'bohn-zhoor',
              icon: '👋',
            },
          ]}
          title="Basic French Phrases"
        />
      );

      const cardBefore = document.querySelector('.phrase-card');
      const badge = document.querySelector('.phrase-icon-badge');
      expect(badge).toHaveAttribute('aria-hidden', 'true');
      expect(badge).not.toHaveAttribute('role');

      const toggleBtn = screen.getByRole('button', {
        name: /Tap to reveal — Reveal translation for Bonjour/i,
      });
      toggleBtn.focus();
      expect(document.activeElement).toBe(toggleBtn);
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(toggleBtn);

      const cardAfter = document.querySelector('.phrase-card');
      expect(cardAfter).toBe(cardBefore);
      expect(document.activeElement).toBe(toggleBtn);
      expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');

      const englishEl = screen.getByText('Hello / Good morning');
      expect(englishEl.closest('[role="button"]')).toBeNull();
      expect(englishEl.closest('button')).toBeNull();
    });
  });

  describe('Quiz Global Enter Non-Hijacking, Accent Bar Keyboard Focus & Roving Tablist', () => {
    it('does not hijack Enter when focused on "I was right" or other interactive controls', async () => {
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
      render(
        <Quiz
          data={{
            commonWords: [
              { phrase: 'pain', translation: 'bread', pronunciation: 'pahn' },
              { phrase: 'eau', translation: 'water', pronunciation: 'oh' },
            ],
          }}
        />
      );

      const input = await screen.findByLabelText('Quiz answer input');
      expect(input).toHaveAttribute('aria-describedby', 'quiz-question-hint quiz-question-prompt');

      fireEvent.change(input, { target: { value: 'loaf' } });
      fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));
      expect(await screen.findByText('Not quite')).toBeInTheDocument();
      expect(input).toBeDisabled();

      // Focus "I was right" and dispatch keydown Enter — global listener MUST NOT preventDefault or skip to Question 2!
      const overrideBtn = screen.getByRole('button', { name: /I was right/i });
      overrideBtn.focus();
      const keyDownEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });
      const notCancelled = overrideBtn.dispatchEvent(keyDownEvent);
      expect(notCancelled).toBe(true);
      expect(screen.getByText('1')).toBeInTheDocument(); // Still on Question 1

      // Pressing Enter on non-interactive body DOES advance to Question 2
      fireEvent.keyDown(document.body, { key: 'Enter' });
      await waitFor(() => {
        expect(screen.queryByText('Not quite')).not.toBeInTheDocument();
      });

      spy.mockRestore();
    });

    it('retains focus on .accent-key-btn during keyboard activation (detail === 0), focuses input on mouse click (detail > 0), and closes accent popover on Escape', async () => {
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.95); // EN->FR
      render(
        <Quiz
          data={{
            basicPhrases: [{ phrase: 'Café', translation: 'Coffee', pronunciation: 'kah-fay' }],
          }}
        />
      );

      const input = await screen.findByLabelText('Quiz answer input');
      const eAcuteBtn = screen.getByRole('button', { name: 'Insert é' });

      // 1. Keyboard activation (detail: 0) keeps focus on accent button
      eAcuteBtn.focus();
      expect(document.activeElement).toBe(eAcuteBtn);
      const mouseDownEvt = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      expect(eAcuteBtn.dispatchEvent(mouseDownEvt)).toBe(false); // prevented default

      fireEvent.click(eAcuteBtn, { detail: 0 });
      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('é');
      });
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      expect(document.activeElement).toBe(eAcuteBtn);

      // 2. Pointer click (detail: 1) returns focus to input
      fireEvent.click(eAcuteBtn, { detail: 1 });
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      expect(document.activeElement).toBe(input);

      // 3. Accent tips popover closes on Escape and restores focus to toggle button
      const accentToggle = screen.getByRole('button', { name: /Accents — French accent guide/i });
      fireEvent.click(accentToggle);
      expect(screen.getByRole('note', { name: /French accent tips/i })).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByRole('note', { name: /French accent tips/i })).not.toBeInTheDocument();
      expect(document.activeElement).toBe(accentToggle);

      spy.mockRestore();
    });

    it('supports ArrowRight/ArrowLeft roving tabIndex on NumbersAndTime tabs and Quiz category tabs', () => {
      const Wrapper = () => {
        const [tab, setTab] = React.useState<'numbers' | 'time'>('numbers');
        return (
          <NumbersAndTime
            numbersData={frenchData.numbers.slice(0, 2)}
            timeData={frenchData.time.slice(0, 2)}
            activeTab={tab}
            onTabChange={setTab}
          />
        );
      };

      const { unmount } = render(<Wrapper />);
      const numbersTab = screen.getByRole('tab', { name: /Numbers/i });
      const timeTab = screen.getByRole('tab', { name: /Telling Time/i });
      expect(numbersTab).toHaveAttribute('tabindex', '0');
      expect(timeTab).toHaveAttribute('tabindex', '-1');

      numbersTab.focus();
      fireEvent.keyDown(numbersTab, { key: 'ArrowRight' });
      expect(timeTab).toHaveAttribute('aria-selected', 'true');
      expect(timeTab).toHaveAttribute('tabindex', '0');
      expect(numbersTab).toHaveAttribute('tabindex', '-1');
      expect(document.activeElement).toBe(timeTab);
      unmount();

      // Quiz category tablist ArrowRight
      render(<Quiz data={frenchData} />);
      const allTab = screen.getByRole('tab', { name: /All Topics/i });
      const alphaTab = screen.getByRole('tab', { name: /Alphabet/i });
      allTab.focus();
      fireEvent.keyDown(allTab, { key: 'ArrowRight' });
      expect(alphaTab).toHaveAttribute('aria-selected', 'true');
      expect(alphaTab).toHaveAttribute('tabindex', '0');
      expect(document.activeElement).toBe(alphaTab);
    });
  });

  describe('Modals & UserMenu Focus Trap, Escape Dismissal, Focus Restoration & Scroll Lock', () => {
    it('traps Tab/Shift+Tab inside AuthModal, locks body scroll, closes on Escape, and restores focus to Sign In trigger', async () => {
      render(<UserMenu />);

      const signInTrigger = screen.getByRole('button', { name: /Sign in to sync progress/i });
      signInTrigger.focus();
      fireEvent.click(signInTrigger);

      const dialog = await screen.findByRole('dialog', { name: /Sync Your Learning Progress/i });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(document.body.style.overflow).toBe('hidden');

      const focusable = within(dialog).getAllByRole('button');
      const firstBtn = focusable[0];
      const lastBtn = focusable[focusable.length - 1];
      expect(document.activeElement).toBe(firstBtn);

      // Shift+Tab from first wraps to last
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(lastBtn);

      // Tab from last wraps to first
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      expect(document.activeElement).toBe(firstBtn);

      // Escape closes modal, unlocks scroll, and restores focus to Sign In trigger
      fireEvent.keyDown(document, { key: 'Escape' });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(document.body.style.overflow).toBe('');
      expect(document.activeElement).toBe(signInTrigger);
    });

    it('supports ArrowDown/ArrowUp/Home/End and Escape focus restore in logged-in UserMenu', () => {
      render(
        <UserMenu
          onNavigate={() => {}}
          initialUser={{
            email: 'sophie@basicfrench.org',
            app_metadata: { provider: 'github' },
            user_metadata: { full_name: 'Sophie' },
          }}
        />
      );

      const trigger = screen.getByRole('button', { name: /User menu for Sophie/i });
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'ArrowDown' });

      const menu = screen.getByRole('menu');
      const items = within(menu).getAllByRole('menuitem');
      expect(items.length).toBe(6);
      expect(document.activeElement).toBe(items[0]);

      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(items[1]);

      fireEvent.keyDown(menu, { key: 'End' });
      expect(document.activeElement).toBe(items[items.length - 1]);

      fireEvent.keyDown(menu, { key: 'Home' });
      expect(document.activeElement).toBe(items[0]);

      fireEvent.keyDown(menu, { key: 'Escape' });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('CSS Contrast, 320px Reflow, Focus Rings & Reduced Motion Guards', () => {
    it('enforces WCAG AA color tokens, visible focus outlines, 320px grid reflow, and prefers-reduced-motion in App.css and JS helpers', () => {
      expect(appCssContent).toContain('.skip-link:focus');
      expect(appCssContent).toContain('minmax(min(100%, 300px), 1fr)');
      expect(appCssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(appCssContent).toContain('#047857');
      expect(appCssContent).toContain('#15803d');
      expect(appCssContent).toContain('#475569');
      expect(appCssContent).toContain('#e0f2fe');

      // .quiz-input:focus must have a visible outline instead of outline: none
      const quizInputFocusMatch = appCssContent.match(/\.quiz-input:focus[^{]*\{[^}]*\}/);
      expect(quizInputFocusMatch).not.toBeNull();
      expect(quizInputFocusMatch![0]).not.toContain('outline: none');
      expect(quizInputFocusMatch![0]).toContain('outline:');

      // Verify JS reduced-motion helper respects matchMedia('(prefers-reduced-motion: reduce)')
      const originalMatchMedia = window.matchMedia;
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      try {
        expect(prefersReducedMotion()).toBe(true);
        expect(getScrollBehavior()).toBe('auto');
      } finally {
        window.matchMedia = originalMatchMedia;
      }
    });
  });
});
