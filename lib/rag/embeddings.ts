/**
 * Embedding generation using Google Gemini API
 * Falls back to simple text matching if embeddings are not available
 */

import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Generate embedding for text using Google Gemini
 * Note: Gemini doesn't have a direct embeddings API, so we'll use a workaround
 * or use OpenAI embeddings if available
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log(`\n  🔮 === GENERATING EMBEDDING ===`);
    console.log(`  Text: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    console.log(`  Text length: ${text.length} characters`);
  }
  
  // Option 1: Use OpenAI embeddings (if API key is available)
  if (process.env.OPENAI_API_KEY) {
    if (isDevelopment) {
      console.log(`  → Method: OpenAI embeddings API`);
    }
    const embedding = await generateOpenAIEmbedding(text);
    if (isDevelopment) {
      console.log(`  ✅ Embedding generated: ${embedding.length} dimensions`);
      console.log(`  → Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}, ...]`);
    }
    return embedding;
  }

  // Option 2: Use a simple hash-based embedding (fallback)
  // This is not ideal but works for basic similarity
  if (isDevelopment) {
    console.log(`  → Method: Hash-based embeddings (fallback - no OpenAI API key)`);
  }
  const embedding = generateSimpleEmbedding(text);
  if (isDevelopment) {
    console.log(`  ✅ Embedding generated: ${embedding.length} dimensions`);
    console.log(`  → Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}, ...]`);
  }
  return embedding;
}

/**
 * Generate embedding using OpenAI API
 */
async function generateOpenAIEmbedding(text: string): Promise<number[]> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    if (isDevelopment) {
      console.log(`    → Calling OpenAI embeddings API...`);
    }
    
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (isDevelopment) {
      console.log(`    ✅ OpenAI API response received`);
      console.log(`    → Model: ${data.model || 'unknown'}`);
      console.log(`    → Usage: ${data.usage?.total_tokens || 'unknown'} tokens`);
    }
    
    return data.data[0].embedding;
  } catch (error) {
    if (isDevelopment) {
      console.warn(`    ⚠️  OpenAI embedding failed:`, error instanceof Error ? error.message : error);
      console.log(`    → Falling back to hash-based embeddings`);
    } else {
      console.warn('OpenAI embedding failed, using fallback:', error);
    }
    return generateSimpleEmbedding(text);
  }
}

/**
 * Generate a simple embedding using text hashing
 * This is a fallback method - not as good as real embeddings but functional
 */
function generateSimpleEmbedding(text: string, dimensions: number = 384): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(dimensions).fill(0);
  
  // Simple hash-based embedding
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Distribute hash across dimensions
    const index = Math.abs(hash) % dimensions;
    embedding[index] += 1 / (1 + Math.abs(hash % 10));
  }
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  
  return embedding;
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Process in batches to avoid rate limits
  const batchSize = 10;
  const embeddings: number[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    embeddings.push(...batchEmbeddings);
    
    // Small delay to avoid rate limits
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return embeddings;
}

