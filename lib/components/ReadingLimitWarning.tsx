import React from 'react';
import { getTodayReadingCount } from '@/lib/utils/readingLimit';

interface ReadingLimitWarningProps {
  error: string;
  onDismiss: () => void;
}

export default function ReadingLimitWarning({ error, onDismiss }: ReadingLimitWarningProps) {
  return (
    <div className="reading-limit-warning fade-in">
      <div className="warning-content">
        <h3>✨ Daily Reading Limit Reached ✨</h3>
        <p>{error}</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
          You have used {getTodayReadingCount()} of 3 readings today.
        </p>
        <button 
          className="cosmic-button" 
          onClick={onDismiss}
          style={{ marginTop: '1rem' }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

