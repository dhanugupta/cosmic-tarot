/**
 * RAG Service - Main service for Retrieval-Augmented Generation
 */

import path from 'path';
import fs from 'fs/promises';
import { processPDF, processAllPDFs, type ProcessedPDF } from './pdfProcessor';
import { generateEmbedding, generateEmbeddings } from './embeddings';
import vectorStore, { type Embedding, type SearchResult } from './vectorStore';

export interface CardKnowledge {
  cardName: string;
  relevantChunks: SearchResult[];
  context: string;
}

/**
 * Initialize the RAG system
 * Automatically processes knowledge base if no embeddings are found
 */
export async function initializeRAG(): Promise<void> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    if (isDevelopment) {
      console.log('\n🚀 === INITIALIZING RAG SYSTEM ===');
    }
    
    // Load existing embeddings
    await vectorStore.load();
    
    let count = vectorStore.getCount();
    
    // If no embeddings found, automatically process the knowledge base
    if (count === 0) {
      if (isDevelopment) {
        console.log('⚠️  No embeddings found.');
        console.log('🔄 Automatically processing knowledge base...');
      } else {
        console.log('No embeddings found. Processing knowledge base...');
      }
      
      try {
        await processKnowledgeBase();
        // Reload embeddings after processing
        await vectorStore.load();
        count = vectorStore.getCount();
        
        if (isDevelopment) {
          console.log(`✅ Knowledge base processed successfully!`);
        }
      } catch (error) {
        if (isDevelopment) {
          console.error('❌ Failed to process knowledge base:', error);
          console.log('💡 You can manually run: npm run process-knowledge-base');
        } else {
          console.error('Failed to process knowledge base:', error);
        }
        // Continue even if processing fails - the app can still work without RAG
      }
    }
    
    if (isDevelopment) {
      console.log(`✅ RAG system initialized with ${count} embeddings`);
      console.log('✅ === RAG INITIALIZATION COMPLETE ===\n');
    } else {
      console.log(`✅ RAG system initialized (${count} embeddings)`);
    }
  } catch (error) {
    if (isDevelopment) {
      console.error('❌ Error initializing RAG:', error);
    } else {
      console.error('Error initializing RAG:', error);
    }
  }
}

/**
 * Process and index all PDFs in the knowledge base
 */
export async function processKnowledgeBase(): Promise<void> {
  const pdfsDir = path.join(process.cwd(), 'knowledge-base', 'pdfs');
  const chunksDir = path.join(process.cwd(), 'knowledge-base', 'chunks');
  
  try {
    // Ensure directories exist
    await fs.mkdir(pdfsDir, { recursive: true });
    await fs.mkdir(chunksDir, { recursive: true });
    
    // Process all PDFs
    console.log('📚 Processing PDFs in knowledge base...');
    const processedPDFs = await processAllPDFs(pdfsDir);
    
    if (processedPDFs.length === 0) {
      console.log('⚠️  No PDFs found in knowledge-base/pdfs/');
      return;
    }
    
    // Generate embeddings for all chunks
    console.log('🔮 Generating embeddings...');
    const allChunks = processedPDFs.flatMap(pdf => pdf.chunks);
    
    // Generate embeddings
    const texts = allChunks.map(chunk => chunk.text);
    const embeddings = await generateEmbeddings(texts);
    
    // Create embedding objects
    const embeddingObjects: Embedding[] = allChunks.map((chunk, index) => ({
      id: `${chunk.source}-${chunk.chunkIndex}`,
      text: chunk.text,
      embedding: embeddings[index],
      metadata: {
        source: chunk.source,
        page: chunk.page,
        chunkIndex: chunk.chunkIndex,
      },
    }));
    
    // Add to vector store
    vectorStore.clear(); // Clear old embeddings
    vectorStore.addEmbeddings(embeddingObjects);
    
    // Save to disk
    await vectorStore.save();
    
    // Save chunks to disk for reference
    for (const pdf of processedPDFs) {
      const chunksFile = path.join(chunksDir, pdf.filename.replace('.pdf', '.json'));
      await fs.writeFile(chunksFile, JSON.stringify(pdf.chunks, null, 2));
    }
    
    console.log(`✅ Processed ${processedPDFs.length} PDFs, ${allChunks.length} chunks, ${embeddings.length} embeddings`);
  } catch (error) {
    console.error('Error processing knowledge base:', error);
    throw error;
  }
}

/**
 * Retrieve relevant knowledge for tarot cards
 */
export async function retrieveCardKnowledge(cardNames: string[]): Promise<CardKnowledge[]> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const results: CardKnowledge[] = [];
  
  if (isDevelopment) {
    console.log('\n🔍 === RAG RETRIEVAL START ===');
    console.log(`📋 Querying for ${cardNames.length} cards:`, cardNames);
  }
  
  for (const cardName of cardNames) {
    if (isDevelopment) {
      console.log(`\n🔮 Processing card: "${cardName}"`);
      console.log(`  → Step 1: Generating query embedding for card name...`);
    }
    
    // Create query embedding for the card name
    const queryEmbedding = await generateEmbedding(cardName);
    
    if (isDevelopment) {
      console.log(`  ✅ Embedding generated (${queryEmbedding.length} dimensions)`);
    }
    
    // Search for similar chunks
    if (isDevelopment) {
      console.log(`  → Searching vector store for top 5 similar chunks...`);
    }
    const searchResults = await vectorStore.search(queryEmbedding, 5);
    
    if (isDevelopment) {
      console.log(`  ✅ Found ${searchResults.length} relevant chunks`);
      searchResults.forEach((result, idx) => {
        console.log(`     [${idx + 1}] Score: ${result.score.toFixed(3)} | Source: ${result.metadata.source} | Text preview: "${result.text.substring(0, 100)}..."`);
      });
    }
    
    // Combine relevant chunks into context
    const context = searchResults
      .map(result => result.text)
      .join('\n\n');
    
    if (isDevelopment) {
      console.log(`  ✅ Context assembled (${context.length} characters)`);
    }
    
    results.push({
      cardName,
      relevantChunks: searchResults,
      context: context || `No specific knowledge found for ${cardName}.`,
    });
  }
  
  if (isDevelopment) {
    console.log('\n✅ === RAG RETRIEVAL COMPLETE ===\n');
  }
  
  return results;
}

/**
 * Get enhanced context for a reading
 */
export async function getEnhancedContext(
  pastCard: string,
  presentCard: string,
  futureCard: string
): Promise<string> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log('\n📚 === RAG ENHANCED CONTEXT GENERATION ===');
    console.log(`  Cards: Past="${pastCard}", Present="${presentCard}", Future="${futureCard}"`);
    console.log(`  → Calling retrieveCardKnowledge()...`);
  }
  
  const cardKnowledge = await retrieveCardKnowledge([pastCard, presentCard, futureCard]);
  
  if (isDevelopment) {
    console.log(`  ✅ Retrieved knowledge for ${cardKnowledge.length} cards`);
  }
  
  let enhancedContext = '\n\n## Additional Card Knowledge from Knowledge Base:\n\n';
  
  for (const knowledge of cardKnowledge) {
    if (knowledge.relevantChunks.length > 0) {
      enhancedContext += `### ${knowledge.cardName}:\n`;
      enhancedContext += knowledge.context + '\n\n';
      
      if (isDevelopment) {
        console.log(`✅ Added context for "${knowledge.cardName}" (${knowledge.context.length} chars)`);
      }
    } else {
      if (isDevelopment) {
        console.log(`⚠️  No context found for "${knowledge.cardName}"`);
      }
    }
  }
  
  if (isDevelopment) {
    console.log(`\n📝 Enhanced context length: ${enhancedContext.length} characters`);
    console.log('✅ === ENHANCED CONTEXT GENERATED ===\n');
  }
  
  return enhancedContext;
}

/**
 * Check if knowledge base is initialized
 */
export function isKnowledgeBaseReady(): boolean {
  const count = vectorStore.getCount();
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log(`  🔍 isKnowledgeBaseReady() check: ${count} embeddings found`);
  }
  
  return count > 0;
}

