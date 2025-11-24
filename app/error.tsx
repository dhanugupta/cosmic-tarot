'use client';

import React from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="cosmic-container" style={{ textAlign: 'center', padding: '3rem' }}>
      <h2 style={{ color: 'var(--cosmic-gold)', fontFamily: "'Cinzel', serif", marginBottom: '1rem' }}>
        Something went wrong!
      </h2>
      <p style={{ color: 'var(--cosmic-text)', marginBottom: '2rem' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        className="cosmic-button cosmic-button-primary"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}

