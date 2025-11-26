#!/usr/bin/env node
/**
 * Script to process knowledge base PDFs and generate embeddings
 * Usage: npm run process-knowledge-base
 */

import { processKnowledgeBase, initializeRAG } from '../lib/rag/ragService';

async function main() {
  console.log('🔮 Starting knowledge base processing...\n');
  
  try {
    // Initialize RAG system
    await initializeRAG();
    
    // Process all PDFs
    await processKnowledgeBase();
    
    console.log('\n✅ Knowledge base processing complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error processing knowledge base:', error);
    process.exit(1);
  }
}

main();

