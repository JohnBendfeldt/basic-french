import React, { useState, useEffect, useId } from 'react';
import { PhraseItem } from '../types/index';
import PronunciationButton from './PronunciationButton';
import { FaSyncAlt } from 'react-icons/fa';

interface PhraseCardProps {
  phrase?: string;
  translation?: string;
  pronunciation: string;
  isRevealed: boolean;
  onToggleReveal: () => void;
  animationKey?: number;
  contentType?: 'phrases' | 'words' | 'numbers' | 'time';
  icon?: string;
}

const PhraseCard: React.FC<PhraseCardProps> = ({
  phrase,
  translation,
  pronunciation,
  isRevealed,
  onToggleReveal,
  contentType = 'phrases',
  icon,
}) => {
  const detailsId = useId();
  const targetPhrase = phrase || '';
  const englishMeaning = translation || '';
  const unitLabel =
    contentType === 'words'
      ? 'word'
      : contentType === 'numbers'
        ? 'number'
        : contentType === 'time'
          ? 'time phrase'
          : 'phrase';

  return (
    <div className={`phrase-card ${isRevealed ? 'phrase-revealed' : 'phrase-hidden'}`}>
      <div className="phrase-header">
        <div className="phrase-title-group">
          {icon && (
            <span className="phrase-icon-badge" aria-hidden="true">
              {icon}
            </span>
          )}
          <h3 className="phrase-target phrase-text" lang="fr">
            {targetPhrase}
          </h3>
        </div>
        <PronunciationButton
          text={targetPhrase}
          label={`Pronounce ${unitLabel} ${targetPhrase}`}
          className="phrase-pronunciation"
          audioCategory={contentType}
          useLocalAudio={true}
        />
      </div>
      <div className="phrase-content">
        {isRevealed && (
          <div
            id={detailsId}
            className="phrase-revealed-wrap"
            onClick={onToggleReveal}
          >
            <div className="phrase-revealed-body">
              <p className="english phrase-definition" lang="en">
                {englishMeaning}
              </p>
              <p className="pronunciation">
                <span className="pronunciation-label">Pronunciation:</span> {pronunciation}
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          className={isRevealed ? 'phrase-hide-btn card-hide-cue' : 'phrase-reveal-btn'}
          aria-expanded={isRevealed}
          aria-controls={isRevealed ? detailsId : undefined}
          aria-describedby={isRevealed ? detailsId : undefined}
          aria-label={
            isRevealed
              ? `Tap to hide — Hide translation for ${targetPhrase}`
              : `Tap to reveal — Reveal translation for ${targetPhrase}`
          }
          onClick={onToggleReveal}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleReveal();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === ' ') {
              e.preventDefault();
            }
          }}
        >
          <FaSyncAlt className={`cue-icon ${isRevealed ? 'mini' : ''}`} aria-hidden="true" />
          <span>{isRevealed ? 'Tap to hide' : 'Tap to reveal'}</span>
        </button>
      </div>
    </div>
  );
};

interface PhrasesProps {
  data: PhraseItem[];
  title: string;
  contentType?: 'phrases' | 'words' | 'numbers' | 'time';
}

const Phrases: React.FC<PhrasesProps> = ({
  data,
  title,
  contentType = 'phrases',
}) => {
  const [revealedCards, setRevealedCards] = useState<boolean[]>(
    new Array(data.length).fill(false)
  );

  useEffect(() => {
    setRevealedCards(new Array(data.length).fill(false));
  }, [data, title]);

  const toggleReveal = (index: number) => {
    setRevealedCards(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const allRevealed = revealedCards.length > 0 && revealedCards.every(Boolean);

  const toggleAll = () => {
    const nextState = !allRevealed;
    setRevealedCards(new Array(data.length).fill(nextState));
  };

  return (
    <div className="section">
      <div className="phrases-header-section">
        <h2>{title}</h2>
        <p className="phrases-subtitle">
          Tap any card to reveal its English translation and French pronunciation
        </p>
        <div className="phrases-toggle-container">
          <button
            type="button"
            className="study-toggle-btn"
            onClick={toggleAll}
            aria-pressed={allRevealed}
            aria-label={
              allRevealed
                ? `Hide all ${title.toLowerCase()}`
                : `Reveal all ${title.toLowerCase()}`
            }
          >
            <FaSyncAlt
              className={`toggle-btn-icon ${allRevealed ? 'rotated' : ''}`}
              aria-hidden="true"
            />
            <span>{allRevealed ? 'Hide All' : 'Reveal All'}</span>
          </button>
        </div>
      </div>

      <div className="phrases-container">
        {data.map((item, index) => (
          <PhraseCard
            key={`${contentType}-${index}-${item.phrase}`}
            phrase={item.phrase}
            translation={item.translation}
            pronunciation={item.pronunciation}
            icon={item.icon}
            isRevealed={Boolean(revealedCards[index])}
            onToggleReveal={() => toggleReveal(index)}
            contentType={contentType}
          />
        ))}
      </div>
    </div>
  );
};

export default Phrases;
