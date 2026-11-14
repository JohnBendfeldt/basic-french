import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Phrases from '../components/Phrases';
import NumbersAndTime from '../components/NumbersAndTime';
import frenchData from '../data/frenchData';

describe('Phrases Flashcards & NumbersAndTime Sub-Tabs', () => {
  it('supports Tap to reveal, keyboard Enter/Space toggle, and Reveal All / Hide All', () => {
    const sample = frenchData.basicPhrases.slice(0, 3);
    render(<Phrases data={sample} title="Basic French Phrases" contentType="phrases" />);

    expect(screen.getByRole('heading', { name: 'Basic French Phrases' })).toBeInTheDocument();

    // Initially translations are hidden
    const firstPhrase = sample[0];
    expect(screen.queryByText(firstPhrase.translation)).not.toBeInTheDocument();

    const revealBtn = screen.getByRole('button', {
      name: new RegExp(`Reveal translation for ${firstPhrase.phrase}`, 'i'),
    });
    fireEvent.click(revealBtn);

    expect(screen.getByText(firstPhrase.translation)).toBeInTheDocument();
    expect(screen.getByText(firstPhrase.pronunciation)).toBeInTheDocument();

    // Hide via keyboard Enter
    const hideWrap = screen.getByRole('button', {
      name: new RegExp(`Hide translation for ${firstPhrase.phrase}`, 'i'),
    });
    fireEvent.keyDown(hideWrap, { key: 'Enter' });
    expect(screen.queryByText(firstPhrase.translation)).not.toBeInTheDocument();

    // Reveal All & Hide All
    const revealAllBtn = screen.getByRole('button', { name: /Reveal all basic french phrases/i });
    fireEvent.click(revealAllBtn);
    for (const item of sample) {
      expect(screen.getByText(item.translation)).toBeInTheDocument();
    }

    const hideAllBtn = screen.getByRole('button', { name: /Hide all basic french phrases/i });
    fireEvent.click(hideAllBtn);
    expect(screen.queryByText(firstPhrase.translation)).not.toBeInTheDocument();
  });

  it('renders NumbersAndTime vigesimal counting guide and switches cleanly to Telling Time rules', () => {
    const onTabChange = vi.fn();
    const { rerender } = render(
      <NumbersAndTime
        numbersData={frenchData.numbers.slice(0, 5)}
        timeData={frenchData.time.slice(0, 4)}
        activeTab="numbers"
        onTabChange={onTabChange}
      />
    );

    expect(screen.getByRole('heading', { name: /French Counting Tips \(70, 80 & 90\)/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /French Numbers \(0–1,000\)/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Telling Time/i }));
    expect(onTabChange).toHaveBeenCalledWith('time');

    rerender(
      <NumbersAndTime
        numbersData={frenchData.numbers.slice(0, 5)}
        timeData={frenchData.time.slice(0, 4)}
        activeTab="time"
        onTabChange={onTabChange}
      />
    );

    expect(screen.getByRole('heading', { name: /French Time Grammar Rules/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Telling Time & Time Phrases/i })).toBeInTheDocument();
  });
});
