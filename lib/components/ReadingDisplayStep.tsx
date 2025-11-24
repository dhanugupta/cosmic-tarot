import React from 'react';
import type { TarotCard, TarotReading } from '@/lib/types';
import TarotCardComponent from '@/lib/components/TarotCard';
import { getCardImagePath } from '@/lib/utils/cardUtils';

interface ReadingDisplayStepProps {
  reading: TarotReading;
  past: TarotCard | null;
  present: TarotCard | null;
  future: TarotCard | null;
  onStartNewReading: () => void;
}

export default function ReadingDisplayStep({
  reading,
  past,
  present,
  future,
  onStartNewReading,
}: ReadingDisplayStepProps) {
  return (
    <div className="reading-container fade-in">
      {/* Begin New Reading Button at Top */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button className="cosmic-button cosmic-button-primary" onClick={onStartNewReading}>
          Begin New Reading ✨
        </button>
      </div>

      <div className="reading-greeting" dangerouslySetInnerHTML={{ __html: reading.greeting }}></div>

      <div className="mystical-divider"></div>

      {/* Past Card and Interpretation */}
      <div className="reading-section">
        <div className="reading-section-title">✦ Past: {reading.past.card} ✦</div>
        <div className="reading-section-layout">
          <div className="reading-card-container">
            {past && (
              <TarotCardComponent
                imageSrc={getCardImagePath(past)}
                name={past.name}
                description={past.meaning_up}
                cardLabel="Past"
                reversed={past.reversed || false}
                revealed={true}
                size="small"
              />
            )}
          </div>
          <div className="reading-text-container">
            <div className="reading-section-content" dangerouslySetInnerHTML={{ __html: reading.past.interpretation }}></div>
          </div>
        </div>
      </div>

      {/* Present Card and Interpretation */}
      <div className="reading-section">
        <div className="reading-section-title">✦ Present: {reading.present.card} ✦</div>
        <div className="reading-section-layout">
          <div className="reading-card-container">
            {present && (
              <TarotCardComponent
                imageSrc={getCardImagePath(present)}
                name={present.name}
                description={present.meaning_up}
                cardLabel="Present"
                reversed={present.reversed || false}
                revealed={true}
                size="small"
              />
            )}
          </div>
          <div className="reading-text-container">
            <div className="reading-section-content" dangerouslySetInnerHTML={{ __html: reading.present.interpretation }}></div>
          </div>
        </div>
      </div>

      {/* Future Card and Interpretation */}
      <div className="reading-section">
        <div className="reading-section-title">✦ Future: {reading.future.card} ✦</div>
        <div className="reading-section-layout">
          <div className="reading-card-container">
            {future && (
              <TarotCardComponent
                imageSrc={getCardImagePath(future)}
                name={future.name}
                description={future.meaning_up}
                cardLabel="Future"
                reversed={future.reversed || false}
                revealed={true}
                size="small"
              />
            )}
          </div>
          <div className="reading-text-container">
            <div className="reading-section-content" dangerouslySetInnerHTML={{ __html: reading.future.interpretation }}></div>
          </div>
        </div>
      </div>

      <div className="mystical-divider"></div>

      <div className="reading-section" style={{ background: 'rgba(251, 191, 36, 0.1)', borderLeftColor: 'var(--cosmic-gold)' }}>
        <div className="reading-section-title" style={{ color: 'var(--cosmic-gold)' }}>
          Combined Meaning
        </div>
        <div className="reading-section-content" dangerouslySetInnerHTML={{ __html: reading.combined_meaning }}></div>
      </div>

      <div className="reading-closing" dangerouslySetInnerHTML={{ __html: reading.closing_message }}></div>
    </div>
  );
}

