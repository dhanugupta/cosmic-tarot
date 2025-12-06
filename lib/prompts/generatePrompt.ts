import type { ReadingPrompt } from "../types";
import { getEnhancedContext, isKnowledgeBaseReady } from "../rag/ragService";

/**
 * Generates the default prompt for AI tarot card reading
 * @param variables - The reading prompt variables
 * @returns The formatted prompt string
 */
export async function generatePrompt(variables: ReadingPrompt): Promise<string> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const { userName, currentMood, currentContext, pastCard, presentCard, futureCard } = variables;
  
  if (isDevelopment) {
    console.log('\n📝 === PROMPT GENERATION START ===');
    console.log('Variables:', {
      userName,
      currentMood,
      pastCard,
      presentCard,
      futureCard,
    });
  }
  
  // Get enhanced context from knowledge base if available
  let enhancedContext = '';
  
  if (isDevelopment) {
    console.log(`\n📚 === KNOWLEDGE BASE CHECK ===`);
  }
  
  // Check if knowledge base is ready
  const kbReady = isKnowledgeBaseReady();
  
  if (isDevelopment) {
    console.log(`  Knowledge base ready: ${kbReady ? '✅ Yes' : '❌ No'}`);
    if (kbReady) {
      // Import vectorStore to get count
      const vectorStoreModule = await import('../rag/vectorStore');
      const vectorStore = vectorStoreModule.default;
      const count = vectorStore.getCount();
      console.log(`  Total embeddings available: ${count}`);
      console.log(`  Cards to query: "${pastCard}", "${presentCard}", "${futureCard}"`);
    } else {
      console.log('  ⚠️  Knowledge base not ready - using base prompt only');
      console.log('  💡 Tip: Run "npm run process-knowledge-base" to process PDFs');
    }
  }
  
  if (kbReady) {
    if (isDevelopment) {
      console.log('  → Starting RAG retrieval process...');
      console.log('  → Calling getEnhancedContext()...');
    }
    
    try {
      enhancedContext = await getEnhancedContext(pastCard, presentCard, futureCard);
      
      if (isDevelopment) {
        console.log(`  ✅ Enhanced context retrieved successfully`);
        console.log(`  → Context length: ${enhancedContext.length} characters`);
        if (enhancedContext.length > 0) {
          console.log(`  → Context preview: "${enhancedContext.substring(0, 200)}..."`);
        } else {
          console.log(`  ⚠️  Warning: Enhanced context is empty!`);
        }
      }
    } catch (error) {
      if (isDevelopment) {
        console.error('  ❌ Failed to retrieve enhanced context:', error);
        if (error instanceof Error) {
          console.error('  Error message:', error.message);
          console.error('  Error stack:', error.stack);
        }
      } else {
        console.warn('Failed to retrieve enhanced context from knowledge base:', error);
      }
    }
  } else {
    if (isDevelopment) {
      console.log('  ⏭️  Skipping RAG retrieval (knowledge base not ready)');
    }
  }
  
  if (isDevelopment) {
    console.log('✅ === KNOWLEDGE BASE CHECK COMPLETE ===\n');
  }

  const basePrompt = `You are an expert AI tarot card reader known for your thoughtful, empathetic, and insightful readings. Each reading provides clarity on the user's journey by addressing their past, present, and future, focusing on underlying motivations and actionable goals. Refer to the user as ${userName}, and keep their current emotional state (${currentMood}) and provided context (${currentContext}) in mind to tailor your interpretation to their needs. Your response should offer guidance that resonates deeply, fostering self-awareness and direction.

CRITICAL: You MUST respond with ONLY valid JSON. Do NOT include any markdown code blocks, explanations, or text outside of the JSON object. Your response must be parseable JSON that can be directly parsed by JSON.parse(). Start your response with { and end with }.

Answer Format Instructions
Provide your response as a valid JSON object (no markdown, no code blocks, just pure JSON) with the following structure:

{
  "greeting": "Include a warm, encouraging message that acknowledges ${userName} by name and considers their current mood (${currentMood}).",
  "past": {
    "card": "${pastCard}",
    "interpretation": "Explain how this card relates to past events, influences, or lessons that are shaping the present."
  },
  "present": {
    "card": "${presentCard}",
    "interpretation": "Provide insights into the current circumstances and suggest actionable advice for navigating the present."
  },
  "future": {
    "card": "${futureCard}",
    "interpretation": "Describe the anticipated outcome or direction this card suggests, focusing on growth, resolution, or opportunities ahead."
  },
  "combined_meaning": "Synthesize the interpretations of all three cards into a cohesive narrative or actionable strategy, offering specific advice for ${userName}.",
  "closing_message": "End with a motivating, personalized message that leaves ${userName} feeling inspired, confident, and ready to take action."
}
Tone and Approach
Empathetic and Insightful: Address ${userName}'s emotional state and provided context (${currentContext}) thoughtfully, ensuring the reading feels personalized and supportive.
Balanced Depth and Clarity: Offer meaningful insights while remaining concise and accessible.
Creative and Unique: Provide imaginative interpretations that encourage ${userName} to connect with their intuition and goals.
Structured and Organized: Present the reading in a clear, logical format that guides ${userName} through the past, present, and future aspects of the reading.`;

  const finalPrompt = basePrompt + (enhancedContext ? `\n\n${enhancedContext}` : '');
  
  if (isDevelopment) {
    console.log('\n📋 === FINAL PROMPT (BEFORE SENDING TO GEMINI) ===');
    console.log('─'.repeat(80));
    console.log(finalPrompt);
    console.log('─'.repeat(80));
    console.log(`\n📊 Prompt Statistics:`);
    console.log(`   Base prompt length: ${basePrompt.length} characters`);
    console.log(`   Enhanced context length: ${enhancedContext.length} characters`);
    console.log(`   Total prompt length: ${finalPrompt.length} characters`);
    console.log(`   RAG enabled: ${enhancedContext.length > 0 ? '✅ Yes' : '❌ No'}`);
    console.log('✅ === PROMPT GENERATION COMPLETE ===\n');
  }

  return finalPrompt;
}

