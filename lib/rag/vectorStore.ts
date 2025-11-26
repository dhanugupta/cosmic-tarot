/**
 * Vector Store for storing and retrieving embeddings
 * Uses a simple in-memory store for now (can be upgraded to a proper vector DB)
 */

import fs from 'fs/promises';
import path from 'path';

export interface Embedding {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    source: string;
    page?: number;
    chunkIndex: number;
  };
}

export interface SearchResult {
  text: string;
  score: number;
  metadata: Embedding['metadata'];
}

class VectorStore {
  private embeddings: Embedding[] = [];
  private storePath: string;

  constructor(storePath: string) {
    this.storePath = storePath;
  }

  /**
   * Load embeddings from disk
   */
  async load(): Promise<void> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    try {
      if (isDevelopment) {
        console.log(`\n📦 === LOADING EMBEDDINGS FROM DISK ===`);
        console.log(`  Store path: ${this.storePath}`);
      }
      
      // Check if directory exists
      try {
        await fs.access(this.storePath);
      } catch (accessError) {
        if (isDevelopment) {
          console.log(`  ⚠️  Directory does not exist: ${this.storePath}`);
          console.log(`  → Creating directory...`);
        }
        await fs.mkdir(this.storePath, { recursive: true });
        if (isDevelopment) {
          console.log(`  ✅ Directory created`);
        }
        return; // No files to load if directory didn't exist
      }
      
      const files = await fs.readdir(this.storePath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      if (isDevelopment) {
        console.log(`  Found ${jsonFiles.length} embedding file(s): ${jsonFiles.join(', ')}`);
      }
      
      if (jsonFiles.length === 0) {
        if (isDevelopment) {
          console.log(`  ⚠️  No JSON files found in ${this.storePath}`);
        }
        return;
      }
      
      let totalLoaded = 0;
      for (const file of jsonFiles) {
        const filePath = path.join(this.storePath, file);
        
        if (isDevelopment) {
          console.log(`  → Reading file: ${file}`);
        }
        
        const data = await fs.readFile(filePath, 'utf-8');
        
        if (isDevelopment) {
          console.log(`    File size: ${data.length} characters`);
        }
        
        let embeddings: Embedding[];
        try {
          const parsed = JSON.parse(data);
          
          if (isDevelopment) {
            console.log(`    Parsed successfully: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
            console.log(`    Length: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
          }
          
          // Handle both array and object formats
          if (Array.isArray(parsed)) {
            embeddings = parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
            if (isDevelopment) {
              console.log(`    ⚠️  File is not an array, checking structure...`);
              console.log(`    Keys: ${Object.keys(parsed).join(', ')}`);
            }
            // Try to find embeddings array in the object
            if ('embeddings' in parsed && Array.isArray(parsed.embeddings)) {
              embeddings = parsed.embeddings;
            } else {
              throw new Error(`Invalid format: expected array or object with 'embeddings' array`);
            }
          } else {
            throw new Error(`Invalid format: expected array or object, got ${typeof parsed}`);
          }
          
          if (embeddings.length === 0) {
            if (isDevelopment) {
              console.log(`    ⚠️  Array is empty`);
            }
            continue;
          }
          
          // Validate embedding structure
          const firstEmbedding = embeddings[0];
          if (!firstEmbedding || !firstEmbedding.embedding || !Array.isArray(firstEmbedding.embedding)) {
            if (isDevelopment) {
              console.log(`    ⚠️  Invalid embedding structure in file`);
              console.log(`    First item keys: ${firstEmbedding ? Object.keys(firstEmbedding).join(', ') : 'null'}`);
            }
            continue;
          }
          
          this.embeddings.push(...embeddings);
          totalLoaded += embeddings.length;
          
          if (isDevelopment) {
            console.log(`  ✅ Loaded ${embeddings.length} embeddings from ${file}`);
            console.log(`    Sample embedding dimensions: ${firstEmbedding.embedding.length}`);
          }
        } catch (parseError) {
          if (isDevelopment) {
            console.error(`    ❌ Failed to parse JSON from ${file}:`, parseError);
            console.error(`    Error details:`, parseError instanceof Error ? parseError.message : String(parseError));
          } else {
            console.error(`Failed to parse embeddings from ${file}:`, parseError);
          }
          continue; // Skip this file and continue with others
        }
      }
      
      if (isDevelopment) {
        console.log(`  📊 Total embeddings loaded: ${this.embeddings.length} (from ${totalLoaded} in files)`);
        if (this.embeddings.length === 0) {
          console.log(`  ⚠️  WARNING: No embeddings were successfully loaded!`);
        }
        console.log(`✅ === EMBEDDINGS LOADED ===\n`);
      } else {
        console.log(`Loaded ${this.embeddings.length} embeddings from disk`);
      }
    } catch (error) {
      if (isDevelopment) {
        console.error(`  ❌ Error loading embeddings:`, error);
        if (error instanceof Error) {
          console.error(`  Error message: ${error.message}`);
          console.error(`  Error stack: ${error.stack}`);
        }
      } else {
        console.warn('No existing embeddings found, starting fresh:', error);
      }
    }
  }

  /**
   * Save embeddings to disk
   */
  async save(): Promise<void> {
    try {
      await fs.mkdir(this.storePath, { recursive: true });
      
      // Group by source
      const bySource = new Map<string, Embedding[]>();
      for (const emb of this.embeddings) {
        const source = emb.metadata.source;
        if (!bySource.has(source)) {
          bySource.set(source, []);
        }
        bySource.get(source)!.push(emb);
      }
      
      // Save each source as a separate file
      for (const [source, embeddings] of bySource.entries()) {
        const filename = source.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
        const filePath = path.join(this.storePath, filename);
        await fs.writeFile(filePath, JSON.stringify(embeddings, null, 2));
      }
      
      console.log(`Saved ${this.embeddings.length} embeddings to disk`);
    } catch (error) {
      console.error('Error saving embeddings:', error);
      throw error;
    }
  }

  /**
   * Add embeddings to store
   */
  addEmbeddings(embeddings: Embedding[]): void {
    this.embeddings.push(...embeddings);
  }

  /**
   * Search for similar embeddings using cosine similarity
   */
  async search(queryEmbedding: number[], topK: number = 5): Promise<SearchResult[]> {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log(`    → Vector store search:`);
      console.log(`      - Query embedding dimensions: ${queryEmbedding.length}`);
      console.log(`      - Total embeddings in store: ${this.embeddings.length}`);
      console.log(`      - Top K requested: ${topK}`);
    }
    
    if (this.embeddings.length === 0) {
      if (isDevelopment) {
        console.log(`      ⚠️  No embeddings in store, returning empty results`);
      }
      return [];
    }

    if (isDevelopment) {
      console.log(`      → Computing cosine similarity for ${this.embeddings.length} embeddings...`);
    }
    
    const scores = this.embeddings.map(emb => ({
      text: emb.text,
      score: cosineSimilarity(queryEmbedding, emb.embedding),
      metadata: emb.metadata,
    }));

    if (isDevelopment) {
      const maxScore = Math.max(...scores.map(s => s.score));
      const minScore = Math.min(...scores.map(s => s.score));
      const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
      console.log(`      → Similarity scores computed:`);
      console.log(`        - Max score: ${maxScore.toFixed(4)}`);
      console.log(`        - Min score: ${minScore.toFixed(4)}`);
      console.log(`        - Avg score: ${avgScore.toFixed(4)}`);
    }

    // Sort by score (highest first) and return top K
    const filtered = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(result => result.score > 0.5); // Only return relevant results
    
    if (isDevelopment) {
      console.log(`      → After filtering (score > 0.5): ${filtered.length} results`);
      if (filtered.length < topK) {
        console.log(`      ⚠️  Only ${filtered.length} results above similarity threshold (0.5)`);
      }
    }

    return filtered;
  }

  /**
   * Get embeddings count
   */
  getCount(): number {
    return this.embeddings.length;
  }

  /**
   * Clear all embeddings
   */
  clear(): void {
    this.embeddings = [];
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

// Singleton instance
const vectorStore = new VectorStore(
  path.join(process.cwd(), 'knowledge-base', 'embeddings')
);

export default vectorStore;

