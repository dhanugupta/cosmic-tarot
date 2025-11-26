import React from 'react';

interface NavigationTabsProps {
  activeTab: 'reading' | 'learn';
  onTabChange: (tab: 'reading' | 'learn') => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="navigation-tabs">
      <button
        className={`nav-tab ${activeTab === 'reading' ? 'active' : ''}`}
        onClick={() => onTabChange('reading')}
      >
        🔮 Get Reading
      </button>
      <button
        className={`nav-tab ${activeTab === 'learn' ? 'active' : ''}`}
        onClick={() => onTabChange('learn')}
      >
        📚 Learn Cards
      </button>
    </div>
  );
}

