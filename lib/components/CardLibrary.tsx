import React, { useState, useEffect, useMemo } from 'react';
import type { TarotCard } from '@/lib/types';
import TarotCardComponent from '@/lib/components/TarotCard';
import { getCardImagePath } from '@/lib/utils/cardUtils';

interface CardLibraryProps {
  onCardClick?: (card: TarotCard) => void;
}

export default function CardLibrary({ onCardClick }: CardLibraryProps) {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'major' | 'minor'>('all');
  const [filterSuit, setFilterSuit] = useState<string>('all');

  useEffect(() => {
    async function loadCards() {
      try {
        const response = await fetch('/data/tarot-cards.json');
        if (!response.ok) {
          throw new Error('Failed to fetch tarot cards');
        }
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error('Error loading tarot cards:', error);
      }
    }
    loadCards();
  }, []);

  // Get unique suits from cards
  const suits = useMemo(() => {
    const suitSet = new Set<string>();
    cards.forEach(card => {
      if (card.type === 'minor' && card.name_short) {
        const suit = card.name_short.substring(0, 2).toUpperCase();
        if (suit === 'CU') suitSet.add('Cups');
        else if (suit === 'WA') suitSet.add('Wands');
        else if (suit === 'SW') suitSet.add('Swords');
        else if (suit === 'PE') suitSet.add('Pentacles');
      }
    });
    return Array.from(suitSet).sort();
  }, [cards]);

  // Filter and search cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // Type filter
      if (filterType === 'major' && card.type !== 'major') return false;
      if (filterType === 'minor' && card.type !== 'minor') return false;

      // Suit filter
      if (filterType === 'minor' && filterSuit !== 'all') {
        const suit = card.name_short?.substring(0, 2).toUpperCase();
        const suitMap: Record<string, string> = {
          'CU': 'Cups',
          'WA': 'Wands',
          'SW': 'Swords',
          'PE': 'Pentacles'
        };
        if (suitMap[suit || ''] !== filterSuit) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          card.name.toLowerCase().includes(query) ||
          card.meaning_up.toLowerCase().includes(query) ||
          card.meaning_rev.toLowerCase().includes(query) ||
          card.desc.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [cards, filterType, filterSuit, searchQuery]);

  const handleCardClick = (card: TarotCard) => {
    setSelectedCard(card);
    if (onCardClick) {
      onCardClick(card);
    }
  };

  if (selectedCard) {
    return (
      <CardDetail
        card={selectedCard}
        onBack={() => setSelectedCard(null)}
      />
    );
  }

  return (
    <div className="card-library-container fade-in">
      <div className="card-library-header">
        <h2 style={{ 
          textAlign: 'center', 
          color: 'var(--cosmic-gold)', 
          fontFamily: "'Cinzel', serif",
          marginBottom: '1rem'
        }}>
          ✦ Tarot Card Library ✦
        </h2>
        <p style={{ 
          textAlign: 'center', 
          color: 'var(--cosmic-text)', 
          marginBottom: '2rem',
          fontStyle: 'italic'
        }}>
          Explore the wisdom and meanings of each tarot card
        </p>

        {/* Search and Filters */}
        <div className="card-library-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search cards by name or meaning..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cosmic-input"
              style={{ width: '100%', maxWidth: '500px' }}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Type:</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as 'all' | 'major' | 'minor');
                setFilterSuit('all');
              }}
              className="cosmic-select"
            >
              <option value="all">All Cards</option>
              <option value="major">Major Arcana</option>
              <option value="minor">Minor Arcana</option>
            </select>

            {filterType === 'minor' && (
              <>
                <label className="filter-label" style={{ marginLeft: '1rem' }}>Suit:</label>
                <select
                  value={filterSuit}
                  onChange={(e) => setFilterSuit(e.target.value)}
                  className="cosmic-select"
                >
                  <option value="all">All Suits</option>
                  {suits.map(suit => (
                    <option key={suit} value={suit}>{suit}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1rem',
          color: 'var(--cosmic-light-purple)',
          fontSize: '0.9rem'
        }}>
          Showing {filteredCards.length} of {cards.length} cards
        </div>
      </div>

      {/* Cards Grid */}
      <div className="card-library-grid">
        {filteredCards.map((card) => (
          <div
            key={card.name_short}
            className="card-library-item"
            onClick={() => handleCardClick(card)}
          >
            <TarotCardComponent
              imageSrc={getCardImagePath(card)}
              name={card.name}
              description={card.meaning_up}
              cardLabel={card.name}
              reversed={false}
              revealed={true}
              size="normal"
            />
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: 'var(--cosmic-text)'
        }}>
          <p>No cards found matching your search.</p>
          <button
            className="cosmic-button"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterSuit('all');
            }}
            style={{ marginTop: '1rem' }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

interface CardDetailProps {
  card: TarotCard;
  onBack: () => void;
}

function CardDetail({ card, onBack }: CardDetailProps) {
  return (
    <div className="card-detail-container fade-in">
      <button
        className="cosmic-button"
        onClick={onBack}
        style={{ marginBottom: '2rem' }}
      >
        ← Back to Library
      </button>

      <div className="card-detail-content">
        <div className="card-detail-image">
          <TarotCardComponent
            imageSrc={getCardImagePath(card)}
            name={card.name}
            description={card.desc}
            cardLabel={card.type === 'major' ? 'Major Arcana' : card.name_short}
            reversed={false}
            revealed={true}
            size="normal"
          />
        </div>

        <div className="card-detail-info">
          <h2 style={{ 
            color: 'var(--cosmic-gold)', 
            fontFamily: "'Cinzel', serif",
            marginBottom: '1rem'
          }}>
            {card.name}
          </h2>

          <div className="card-detail-badge">
            {card.type === 'major' ? 'Major Arcana' : `Minor Arcana - ${card.name_short}`}
          </div>

          <div className="card-detail-section">
            <h3 className="card-detail-section-title">✦ Upright Meaning ✦</h3>
            <p className="card-detail-text">{card.meaning_up}</p>
          </div>

          <div className="card-detail-section">
            <h3 className="card-detail-section-title">✦ Reversed Meaning ✦</h3>
            <p className="card-detail-text">{card.meaning_rev}</p>
          </div>

          <div className="card-detail-section">
            <h3 className="card-detail-section-title">✦ Description ✦</h3>
            <p className="card-detail-text">{card.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

