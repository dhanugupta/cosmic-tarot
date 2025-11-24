import React from 'react';
import type { TarotCard } from '@/lib/types';
import TarotCardComponent from '@/lib/components/TarotCard';
import { getCardImagePath } from '@/lib/utils/cardUtils';

interface CardDrawingStepProps {
  userName: string;
  past: TarotCard | null;
  present: TarotCard | null;
  future: TarotCard | null;
  cardsRevealed: boolean[];
  remainingReadings: number;
  onDrawCard: (position: 'past' | 'present' | 'future') => void;
  onBack: () => void;
}

export default function CardDrawingStep({
  userName,
  past,
  present,
  future,
  cardsRevealed,
  remainingReadings,
  onDrawCard,
  onBack,
}: CardDrawingStepProps) {
  const allCardsDrawn = past && present && future;

  return (
    <div className="fade-in">
      <div className="cosmic-form-section" style={{ marginBottom: '2rem' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--cosmic-gold)', fontFamily: "'Cinzel', serif", marginBottom: '1rem' }}>
          Focus Your Energy, <span className="username">{userName}</span> ✦
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '1rem', fontStyle: 'italic', color: 'var(--cosmic-text)', fontSize: '1.1rem' }}>
          Close your eyes, take a deep breath, and think about the question or situation you seek guidance on.
        </p>
        <p style={{ textAlign: 'center', color: 'var(--cosmic-light-purple)', fontSize: '1rem', marginTop: '1rem' }}>
          Click on each card to draw them one by one.
        </p>
        {/* Reading limit indicator */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem', 
          padding: '0.75rem', 
          background: 'rgba(107, 70, 193, 0.2)', 
          borderRadius: '8px',
          border: '1px solid rgba(167, 139, 250, 0.3)'
        }}>
          <p style={{ color: 'var(--cosmic-gold)', fontSize: '0.9rem', margin: 0 }}>
            📖 Readings remaining today: <strong>{remainingReadings} of 3</strong>
          </p>
        </div>
      </div>

      <div className="cards-section">
        <div className="cards-container">
          {/* Past Card */}
          <div 
            className={`card-slot ${cardsRevealed[0] ? 'revealed' : ''} ${!past ? 'clickable' : ''}`}
            onClick={() => {
              if (!past) {
                onDrawCard('past');
              }
            }}
            style={{ cursor: !past ? 'pointer' : 'default' }}
          >
            <TarotCardComponent
              imageSrc={past ? getCardImagePath(past) : '/images/img.png'}
              name={past?.name}
              description={past?.meaning_up}
              cardLabel="Past"
              reversed={past?.reversed || false}
              revealed={cardsRevealed[0]}
            />
          </div>

          {/* Present Card */}
          <div 
            className={`card-slot ${cardsRevealed[1] ? 'revealed' : ''} ${!present && past ? 'clickable' : ''}`}
            onClick={() => {
              if (!present && past) {
                onDrawCard('present');
              }
            }}
            style={{ cursor: !present && past ? 'pointer' : 'default', opacity: !past ? 0.5 : 1 }}
          >
            <TarotCardComponent
              imageSrc={present ? getCardImagePath(present) : '/images/img.png'}
              name={present?.name}
              description={present?.meaning_up}
              cardLabel="Present"
              reversed={present?.reversed || false}
              revealed={cardsRevealed[1]}
            />
          </div>

          {/* Future Card */}
          <div 
            className={`card-slot ${cardsRevealed[2] ? 'revealed' : ''} ${!future && past && present ? 'clickable' : ''}`}
            onClick={() => {
              if (!future && past && present) {
                onDrawCard('future');
              }
            }}
            style={{ cursor: !future && past && present ? 'pointer' : 'default', opacity: !past || !present ? 0.5 : 1 }}
          >
            <TarotCardComponent
              imageSrc={future ? getCardImagePath(future) : '/images/img.png'}
              name={future?.name}
              description={future?.meaning_up}
              cardLabel="Future"
              reversed={future?.reversed || false}
              revealed={cardsRevealed[2]}
            />
          </div>
        </div>

        {allCardsDrawn && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'var(--cosmic-gold)', fontSize: '1.1rem', marginBottom: '1rem' }}>
              All cards have been drawn! Preparing your reading...
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="cosmic-button" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

