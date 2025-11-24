import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="loading-screen fade-in">
      <div className="crystal-ball-container">
        <div className="crystal-ball">
          <div className="crystal-ball-glow"></div>
          <div className="crystal-ball-inner">
            <div className="mystical-energy"></div>
            <div className="mystical-energy"></div>
            <div className="mystical-energy"></div>
          </div>
        </div>
        <p className="loading-message">The cosmic energies are aligning...</p>
        <p className="loading-submessage">Your reading is being revealed by the divine forces</p>
      </div>

      <div className="ad-container">
        <div className="ad-banner">
          <h3 className="ad-title">✨ Unlock Deeper Mystical Insights ✨</h3>
          <p className="ad-text">Discover your destiny with our premium tarot readings, personalized daily guidance, and exclusive cosmic wisdom.</p>
          <button 
            className="cosmic-button cosmic-button-primary"
            onClick={() => window.open('https://example.com', '_blank')}
          >
            Explore Premium Features
          </button>
        </div>
      </div>
    </div>
  );
}

