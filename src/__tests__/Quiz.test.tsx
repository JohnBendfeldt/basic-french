import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Quiz from '../components/Quiz';

const singlePhraseData = {
  basicPhrases: [
    {
      phrase: 'Ça va',
      translation: 'How is it going',
      pronunciation: 'sah vah',
    },
  ],
};

describe('French Adaptive Quiz Core Flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists session goal selection (5 / 10 / 20 Qs) and filters by category tabs', () => {
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
          basicPhrases: singlePhraseData.basicPhrases,
          numbers: [{ phrase: 'soixante-dix', translation: '70', pronunciation: 'swah-sahnt-dees' }],
          time: [{ phrase: 'Il est midi', translation: 'It is noon', pronunciation: 'eel eh mee-dee' }],
          commonWords: [{ phrase: 'eau', translation: 'water', pronunciation: 'oh' }],
        }}
      />
    );

    const fiveBtn = screen.getByRole('button', { name: '5 Qs' });
    fireEvent.click(fiveBtn);
    expect(localStorage.getItem('french_quiz_goal')).toBe('5');

    // Switch category filter to Time
    const timeTab = screen.getByRole('tab', { name: 'Time' });
    fireEvent.click(timeTab);
    expect(timeTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Il est midi|It is noon/)).toBeInTheDocument();
  });

  it('completes a full 5-question quiz session, logs missed words in recap, and starts a new quiz', async () => {
    localStorage.setItem('french_quiz_goal', '5');
    render(<Quiz data={singlePhraseData} />);

    for (let q = 1; q <= 5; q++) {
      const input = screen.getByLabelText('Quiz answer input');
      const hint = screen.getByRole('heading', { level: 3 }).textContent || '';
      const isFrToEn = hint.includes('English');

      if (q === 1) {
        // Intentionally miss question 1 to verify missed-words recap
        fireEvent.change(input, { target: { value: 'wrong answer xyz' } });
      } else {
        fireEvent.change(input, {
          target: { value: isFrToEn ? 'How is it going' : 'Ça va' },
        });
      }

      fireEvent.click(screen.getByRole('button', { name: /Check Answer/i }));

      if (q === 1) {
        expect(await screen.findByText('Not quite')).toBeInTheDocument();
      } else {
        expect(await screen.findByText('Correct!')).toBeInTheDocument();
      }

      if (q < 5) {
        const nextBtn = screen.getByRole('button', { name: new RegExp(`Next Question \\(${q + 1}/5\\)`, 'i') });
        fireEvent.click(nextBtn);
      } else {
        const finishBtn = screen.getByRole('button', { name: /Complete Quiz & View Results/i });
        fireEvent.click(finishBtn);
      }
    }

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Quiz Session Complete!/i })).toBeInTheDocument();
    });

    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText(/Words to Review from This Session \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText('wrong answer xyz')).toBeInTheDocument();

    // Restart quiz from recap
    const restartBtn = screen.getByRole('button', { name: /Start Next Quiz \(5 Qs\)/i });
    fireEvent.click(restartBtn);
    expect(screen.getByLabelText('Quiz answer input')).toBeInTheDocument();
  });

  it('renders empty state gracefully when curriculum data is empty', () => {
    render(<Quiz data={{}} />);
    expect(screen.getByText(/No quiz questions available/i)).toBeInTheDocument();
  });
});
