import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Quiz from '../components/Quiz';
import * as speechModule from '../utils/speech';
import { LOCAL_STORAGE_WORDS_KEY } from '../services/progressService';

describe('French Quiz Accent Bar, Forgiving Grading, Audio & 5/5 Mastery', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inserts French accented characters via the Accent Bar, opens Accent Tips, and shows accent diff on unaccented answers', async () => {
    // Force English -> French question direction by pre-mastering the FR -> EN question ID
    localStorage.setItem(
      LOCAL_STORAGE_WORDS_KEY,
      JSON.stringify({
        'basicPhrases-Ça va-fr-to-en': {
          userId: 'guest_user',
          category: 'basicPhrases',
          wordId: 'basicPhrases-Ça va-fr-to-en',
          prompt: 'Ça va',
          answer: 'How is it going',
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
          basicPhrases: [
            {
              phrase: 'Ça va',
              translation: 'How is it going',
              pronunciation: 'sah vah',
            },
          ],
        }}
      />
    );

    expect(await screen.findByText('How do you say this in French?')).toBeInTheDocument();

    // Open and inspect French Accent Marks Guide popover
    const guideBtn = screen.getByRole('button', { name: /French accent guide/i });
    fireEvent.click(guideBtn);
    expect(screen.getByRole('note', { name: /French accent tips/i })).toBeInTheDocument();
    expect(screen.getByText(/Cédille/i)).toBeInTheDocument();

    // Click quick-insert button for ç
    const cedilleBtn = screen.getByRole('button', { name: 'Insert ç' });
    fireEvent.click(cedilleBtn);
    const input = screen.getByLabelText('Quiz answer input') as HTMLInputElement;
    expect(input.value).toBe('ç');

    // Now type unaccented "ca va" and submit with Enter to verify accent forgiveness + diff highlight
    fireEvent.change(input, { target: { value: 'ca va' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(await screen.findByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText(/Correct French spelling with accents:/i)).toBeInTheDocument();
  });

  it('triggers Play Audio (1.0x) and Slow (0.7x) French audio buttons and celebrates 5/5 Word Mastered', async () => {
    const speakSpy = vi.spyOn(speechModule, 'speak').mockImplementation((_t, _l, _id, onEnd) => {
      if (onEnd) onEnd();
    });

    // Seed word at masteryLevel 4 so one more correct answer promotes it to 5/5 Mastered!
    localStorage.setItem(
      LOCAL_STORAGE_WORDS_KEY,
      JSON.stringify({
        'numbers-soixante-dix-fr-to-en': {
          userId: 'guest_user',
          category: 'numbers',
          wordId: 'numbers-soixante-dix-fr-to-en',
          prompt: 'soixante-dix',
          answer: '70',
          timesCorrect: 4,
          timesIncorrect: 0,
          lastTestedAt: '2026-11-13T00:00:00Z',
          masteryLevel: 4,
        },
        'numbers-soixante-dix-en-to-fr': {
          userId: 'guest_user',
          category: 'numbers',
          wordId: 'numbers-soixante-dix-en-to-fr',
          prompt: '70',
          answer: 'soixante-dix',
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
          numbers: [
            {
              phrase: 'soixante-dix',
              translation: '70',
              pronunciation: 'swah-sahnt-dees',
            },
          ],
        }}
      />
    );

    expect(await screen.findByText('soixante-dix')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Play audio$/i }));
    expect(speakSpy).toHaveBeenCalledWith(
      'soixante-dix',
      'fr-FR',
      'quiz-audio-controller',
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ rate: 1.0, category: 'numbers' })
    );

    fireEvent.click(screen.getByRole('button', { name: /Play audio slowly at 0\.7x speed/i }));
    expect(speakSpy).toHaveBeenCalledWith(
      'soixante-dix',
      'fr-FR',
      'quiz-audio-controller',
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ rate: 0.7, category: 'numbers' })
    );

    const input = screen.getByLabelText('Quiz answer input');
    fireEvent.change(input, { target: { value: 'seventy' } });
    fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

    await waitFor(() => {
      expect(screen.getByText(/Word Mastered \(5\/5\)!/i)).toBeInTheDocument();
    });

    speakSpy.mockRestore();
  });
});
