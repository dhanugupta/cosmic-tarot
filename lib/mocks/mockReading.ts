import type { TarotReading } from '../types';

/**
 * Mock tarot reading response for development/testing
 * This is used when ENABLE_MOCK=true
 */
export function getMockReading(userName: string, pastCard: string, presentCard: string, futureCard: string): TarotReading {
  return {
    greeting: `Welcome, ${userName}. I sense you are seeking clarity and direction, and it is with a warm heart that I welcome you to this sacred space. Know that the cards are here to illuminate your path, offering insights that resonate with your spirit and empower your journey forward. Let's explore the wisdom they hold for you.`,
    past: {
      card: pastCard,
      interpretation: `In your past, ${userName}, the ${pastCard} reveals a period of significant influence that has shaped who you are today. This card speaks to foundational experiences, lessons learned, or energies that were present in your earlier journey. The wisdom from this time continues to echo in your present circumstances, offering valuable context for understanding where you are now. Reflect on how these past influences have prepared you for the current moment.`
    },
    present: {
      card: presentCard,
      interpretation: `Currently, ${userName}, the ${presentCard} illuminates your present circumstances with profound clarity. This card reflects the energies and situations you are navigating right now. It offers actionable insights into your current state, suggesting ways to align with your highest path. Pay attention to the opportunities and challenges this card reveals, as they hold keys to your immediate growth and understanding. Trust in your ability to navigate this moment with wisdom and grace.`
    },
    future: {
      card: futureCard,
      interpretation: `Looking ahead, ${userName}, the ${futureCard} offers a glimpse into the potential directions your path may take. This card suggests themes, energies, or outcomes that may emerge in your future journey. Remember that the future is not set in stone, but rather a landscape of possibilities shaped by your choices and intentions. Use this insight to align your actions with the highest potential outcomes, while remaining open to the wisdom that unfolds along the way.`
    },
    combined_meaning: `${userName}, your reading reveals a beautiful tapestry of connection between your past, present, and future. The ${pastCard} from your past has laid important foundations, the ${presentCard} illuminates your current path, and the ${futureCard} suggests the direction ahead. Together, these cards weave a narrative of growth, transformation, and alignment with your deeper purpose. The key is to honor the lessons of the past, fully engage with the present moment, and move forward with intention and trust. Your journey is one of continuous evolution, and these cards remind you that you have the wisdom and strength to navigate whatever comes your way.`,
    closing_message: `${userName}, you stand at a remarkable point of transformation. Remember the wisdom that resides within your heart and mind, for it is your truest guide. Step forward with confidence, knowing that you possess all the strength and insight needed to illuminate your unique path. The journey ahead is rich with discovery, and you are more than ready to embrace it. May these insights serve you well on your path.`
  };
}

