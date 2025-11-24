/**
 * Type definitions for the Cosmic Tarot application
 */

/**
 * Represents a tarot card with all its properties
 */
export interface TarotCard {
  name: string;
  image: string;
  type: string;
  meaning_up: string;
  meaning_rev: string;
  desc: string;
  name_short: string;
  reversed: boolean;
  value?: string;
  value_int?: number;
}

/**
 * Represents a card interpretation from an AI reading
 */
export interface CardInterpretation {
  card: string;
  interpretation: string;
}

/**
 * Complete response data from an AI tarot reading
 */
export interface TarotReading {
  greeting: string;
  past: CardInterpretation;
  present: CardInterpretation;
  future: CardInterpretation;
  combined_meaning: string;
  closing_message: string;
}

/**
 * User input for generating a tarot reading
 */
export interface ReadingPrompt {
  userName: string;
  currentMood: string;
  currentContext: string;
  pastCard: string;
  presentCard: string;
  futureCard: string;
  currentReadingType?: string;
}

/**
 * Mood options for the reading
 */
export type Mood = 
  | "Joyful"
  | "Calm"
  | "Anxious"
  | "Motivated"
  | "Melancholy"
  | "Irritated"
  | "Unspecified Feelings";

/**
 * Mood ID to description mapping
 */
export const MOOD_DESCRIPTIONS: Record<number, Mood> = {
  1: "Joyful",
  2: "Calm",
  3: "Anxious",
  4: "Motivated",
  5: "Melancholy",
  6: "Irritated",
  7: "Unspecified Feelings",
} as const;

