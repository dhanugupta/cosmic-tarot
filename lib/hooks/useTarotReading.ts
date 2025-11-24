import { useState, useEffect, useCallback } from 'react';
import type { TarotCard, TarotReading } from '@/lib/types';
import { drawSingleCard, formatCardName } from '@/lib/utils/cardUtils';
import { 
  canPerformReading, 
  getRemainingReadings, 
  recordReading, 
  getTodayReadingCount,
  formatTimeUntilNextReading
} from '@/lib/utils/readingLimit';

interface UseTarotReadingReturn {
  // State
  cards: TarotCard[];
  availableCards: TarotCard[];
  currentStep: number;
  userName: string;
  responseReading: TarotReading | null;
  isLoading: boolean;
  past: TarotCard | null;
  present: TarotCard | null;
  future: TarotCard | null;
  cardsRevealed: boolean[];
  remainingReadings: number;
  readingLimitError: string | null;
  
  // Actions
  setUserName: (name: string) => void;
  setCurrentStep: (step: number) => void;
  drawCard: (position: 'past' | 'present' | 'future') => void;
  startNewReading: () => void;
  setReadingLimitError: (error: string | null) => void;
}

export function useTarotReading(): UseTarotReadingReturn {
  const [cards, setCards] = useState<TarotCard[]>([]);
  const [availableCards, setAvailableCards] = useState<TarotCard[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [userName, setUserName] = useState('');
  const [responseReading, setResponseReading] = useState<TarotReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [past, setPast] = useState<TarotCard | null>(null);
  const [present, setPresent] = useState<TarotCard | null>(null);
  const [future, setFuture] = useState<TarotCard | null>(null);
  const [cardsRevealed, setCardsRevealed] = useState([false, false, false]);
  const [remainingReadings, setRemainingReadings] = useState(getRemainingReadings());
  const [readingLimitError, setReadingLimitError] = useState<string | null>(null);

  // Load cards on mount
  useEffect(() => {
    async function loadCards() {
      try {
        const response = await fetch('/data/tarot-cards.json');
        if (!response.ok) {
          throw new Error('Failed to fetch tarot cards');
        }
        const data = await response.json();
        setCards(data);
        setAvailableCards([...data]);
      } catch (error) {
        console.error('Error loading tarot cards:', error);
      }
    }
    loadCards();
    
    // Update remaining readings on mount and check daily reset
    setRemainingReadings(getRemainingReadings());
    
    // Check for daily reset every minute
    const interval = setInterval(() => {
      setRemainingReadings(getRemainingReadings());
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  // Highlight username in text
  const highlightUsername = useCallback((text: string, name: string) => {
    if (!name) return text;
    const regex = new RegExp(`(${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="username">$1</span>');
  }, []);

  // Generate AI reading
  const generateAIReadingWithCards = useCallback(async (
    pastCard: TarotCard,
    presentCard: TarotCard,
    futureCard: TarotCard
  ) => {
    // Check reading limit before proceeding
    if (!canPerformReading()) {
      const timeUntil = formatTimeUntilNextReading();
      setReadingLimitError(
        timeUntil 
          ? `You have reached your daily limit of 3 readings. Please try again in ${timeUntil}.`
          : 'You have reached your daily limit of 3 readings. Please try again tomorrow.'
      );
      setIsLoading(false);
      return;
    }

    setReadingLimitError(null);
    setIsLoading(true);
    const pastCardName = formatCardName(pastCard);
    const presentCardName = formatCardName(presentCard);
    const futureCardName = formatCardName(futureCard);

    const prompt = {
      past: pastCardName,
      present: presentCardName,
      future: futureCardName,
      userName: userName,
      currentMood: 'Seeking Guidance',
      currentContext: 'The user is seeking guidance through tarot cards.',
      currentReadingType: '',
    };

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const responseData = await response.json();

      // Check if the API returned an error
      if (!response.ok || responseData.error) {
        const errorMessage = responseData.error || `HTTP error! status: ${response.status}`;
        console.error('API Error:', errorMessage);
        alert(`Failed to generate reading: ${errorMessage}`);
        return;
      }

      // Check if we have the text field
      if (!responseData.text) {
        console.error('No text in response:', responseData);
        alert('Invalid response from server. Please try again.');
        return;
      }

      // Parse the JSON response
      try {
        let parsedReading;
        if (typeof responseData.text === 'string') {
          try {
            parsedReading = JSON.parse(responseData.text);
          } catch (e) {
            const formatted = responseData.text.replace(/\\n/g, '').replace(/\n/g, '');
            parsedReading = JSON.parse(formatted);
          }
        } else {
          parsedReading = responseData.text;
        }
        
        // Validate the reading structure
        if (!parsedReading.greeting || !parsedReading.past || !parsedReading.present || !parsedReading.future) {
          console.error('Invalid reading structure:', parsedReading);
          alert('The reading format is invalid. Please try again.');
          return;
        }

        // Check if reading is complete
        if (!parsedReading.combined_meaning || !parsedReading.closing_message) {
          console.warn('Reading appears incomplete:', {
            hasCombinedMeaning: !!parsedReading.combined_meaning,
            hasClosingMessage: !!parsedReading.closing_message
          });
          if (!parsedReading.combined_meaning) {
            parsedReading.combined_meaning = 'The reading was incomplete. Please try generating a new reading for the full interpretation.';
          }
          if (!parsedReading.closing_message) {
            parsedReading.closing_message = 'Thank you for seeking guidance through the cards.';
          }
        }

        // Apply username highlighting
        parsedReading.greeting = highlightUsername(parsedReading.greeting, userName);
        parsedReading.past.interpretation = highlightUsername(parsedReading.past.interpretation, userName);
        parsedReading.present.interpretation = highlightUsername(parsedReading.present.interpretation, userName);
        parsedReading.future.interpretation = highlightUsername(parsedReading.future.interpretation, userName);
        parsedReading.combined_meaning = highlightUsername(parsedReading.combined_meaning, userName);
        parsedReading.closing_message = highlightUsername(parsedReading.closing_message, userName);

        // Update remaining readings from server response
        if (responseData.remaining !== undefined) {
          setRemainingReadings(responseData.remaining);
          recordReading();
        }

        setResponseReading(parsedReading);
        setCurrentStep(3);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        if (parseError instanceof SyntaxError) {
          alert('The AI response was incomplete or malformed. This may happen if the response was too long. Please try again.');
        } else {
          alert('Failed to parse reading response. The AI may have returned invalid JSON. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching AI reading:', error);
      if (error instanceof Error) {
        alert(`Failed to generate reading: ${error.message}`);
      } else {
        alert('Failed to generate reading. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userName, highlightUsername]);

  // Draw a card
  const drawCard = useCallback((position: 'past' | 'present' | 'future') => {
    if (availableCards.length === 0) {
      alert('No more cards available. Please start a new reading.');
      return;
    }

    const deck = [...availableCards];
    const drawnCard = drawSingleCard(deck);
    
    setAvailableCards(deck);

    let newPast = past;
    let newPresent = present;
    let newFuture = future;

    if (position === 'past') {
      newPast = drawnCard;
      setPast(drawnCard);
      setCardsRevealed([true, cardsRevealed[1], cardsRevealed[2]]);
    } else if (position === 'present') {
      newPresent = drawnCard;
      setPresent(drawnCard);
      setCardsRevealed([cardsRevealed[0], true, cardsRevealed[2]]);
    } else if (position === 'future') {
      newFuture = drawnCard;
      setFuture(drawnCard);
      setCardsRevealed([cardsRevealed[0], cardsRevealed[1], true]);
    }

    // Auto-advance to reading if all cards are drawn
    if (position === 'future' && newPast && newPresent && newFuture) {
      setTimeout(() => {
        generateAIReadingWithCards(newPast!, newPresent!, newFuture!);
      }, 1000);
    }
  }, [availableCards, past, present, future, cardsRevealed, generateAIReadingWithCards]);

  // Start new reading
  const startNewReading = useCallback(() => {
    if (!canPerformReading()) {
      const timeUntil = formatTimeUntilNextReading();
      setReadingLimitError(
        timeUntil 
          ? `You have reached your daily limit of 3 readings. Please try again in ${timeUntil}.`
          : 'You have reached your daily limit of 3 readings. Please try again tomorrow.'
      );
      return;
    }
    
    setCurrentStep(1);
    setUserName('');
    setResponseReading(null);
    setPast(null);
    setPresent(null);
    setFuture(null);
    setCardsRevealed([false, false, false]);
    setAvailableCards([...cards]);
    setReadingLimitError(null);
    setRemainingReadings(getRemainingReadings());
  }, [cards]);

  return {
    // State
    cards,
    availableCards,
    currentStep,
    userName,
    responseReading,
    isLoading,
    past,
    present,
    future,
    cardsRevealed,
    remainingReadings,
    readingLimitError,
    
    // Actions
    setUserName,
    setCurrentStep,
    drawCard,
    startNewReading,
    setReadingLimitError,
  };
}

