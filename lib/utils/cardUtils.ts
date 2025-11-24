import type { TarotCard } from "../types";

/**
 * Formats a card name with reversal indicator
 * @param card - The tarot card
 * @returns Formatted card name string
 */
export function formatCardName(card: TarotCard): string {
  return card.reversed ? `${card.name} (Reversed)` : card.name;
}

/**
 * Gets the image path for a tarot card
 * @param card - The tarot card
 * @returns Image path string
 */
export function getCardImagePath(card: TarotCard): string {
  return `/images/tarot-cards/${card.name_short}.jpg`;
}

/**
 * Randomly determines if a card should be reversed
 * @param probability - Probability of reversal (0-1), defaults to 0.5
 * @returns True if card should be reversed
 */
export function shouldReverseCard(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Draws a single random card from a deck without replacement
 * @param deck - Array of cards to draw from (will be modified)
 * @returns The drawn card with random reversal
 */
export function drawSingleCard(deck: TarotCard[]): TarotCard {
  if (deck.length === 0) {
    throw new Error('Deck is empty');
  }
  
  const randomIndex = Math.floor(Math.random() * deck.length);
  const card = deck.splice(randomIndex, 1)[0];
  
  return { ...card, reversed: shouldReverseCard() };
}

/**
 * Draws random cards from a deck without replacement
 * @param deck - Array of cards to draw from
 * @param count - Number of cards to draw
 * @returns Array of drawn cards
 */
export function drawRandomCards(deck: TarotCard[], count: number): TarotCard[] {
  const shuffled = [...deck];
  const drawn: TarotCard[] = [];

  for (let i = 0; i < count && shuffled.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * shuffled.length);
    drawn.push(shuffled.splice(randomIndex, 1)[0]);
  }

  return drawn;
}

/**
 * Draws three cards (past, present, future) with random reversals
 * @param deck - Array of cards to draw from
 * @returns Object with past, present, and future cards
 */
export function drawThreeCardSpread(deck: TarotCard[]): {
  past: TarotCard;
  present: TarotCard;
  future: TarotCard;
} {
  const cards = drawRandomCards(deck, 3);
  
  return {
    past: { ...cards[0], reversed: shouldReverseCard() },
    present: { ...cards[1], reversed: shouldReverseCard() },
    future: { ...cards[2], reversed: shouldReverseCard() },
  };
}
