import React from 'react';

interface PersonalizationStepProps {
  userName: string;
  remainingReadings: number;
  onUserNameChange: (name: string) => void;
  onNext: () => void;
}

export default function PersonalizationStep({ 
  userName,
  remainingReadings,
  onUserNameChange, 
  onNext 
}: PersonalizationStepProps) {
  const canProceed = userName.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canProceed) {
      onNext();
    } else {
      alert('Please enter your name first');
    }
  };

  return (
    <div className="cosmic-form-section fade-in">
      <h2 style={{ textAlign: 'center', color: 'var(--cosmic-gold)', fontFamily: "'Cinzel', serif", marginBottom: '2rem' }}>
        Welcome, Seeker of Truth
      </h2>
      <p style={{ textAlign: 'center', marginBottom: '2rem', fontStyle: 'italic', color: 'var(--cosmic-text)' }}>
        To receive a personalized reading from the cosmos, please share your name. This allows the cards to connect with your unique energy.
      </p>
      
      {/* Reading limit indicator */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem', 
        padding: '0.75rem', 
        background: 'rgba(107, 70, 193, 0.2)', 
        borderRadius: '8px',
        border: '1px solid rgba(167, 139, 250, 0.3)'
      }}>
        <p style={{ color: 'var(--cosmic-gold)', fontSize: '0.9rem', margin: 0 }}>
          📖 Readings remaining today: <strong>{remainingReadings} of 3</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input
            type="text"
            className="cosmic-input"
            placeholder="Enter the name you identify with..."
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && canProceed) {
                onNext();
              }
            }}
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="cosmic-button cosmic-button-primary"
            type="submit"
            disabled={!canProceed}
            style={{ position: 'relative', zIndex: 10 }}
          >
            Begin Your Journey →
          </button>
          {!canProceed && (
            <p style={{ marginTop: '1rem', color: 'var(--cosmic-light-purple)', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Please enter your name to continue
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

