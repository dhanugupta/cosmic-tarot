import { NextRequest, NextResponse } from 'next/server';
import { processKnowledgeBase, initializeRAG } from '@/lib/rag/ragService';

/**
 * API endpoint to process the knowledge base
 * POST /api/knowledge-base/process
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize RAG system
    await initializeRAG();
    
    // Process all PDFs in the knowledge base
    await processKnowledgeBase();
    
    return NextResponse.json({ 
      success: true,
      message: 'Knowledge base processed successfully'
    });
  } catch (error) {
    console.error('Error processing knowledge base:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check knowledge base status
 */
export async function GET() {
  try {
    await initializeRAG();
    const { isKnowledgeBaseReady } = await import('@/lib/rag/ragService');
    
    return NextResponse.json({
      ready: isKnowledgeBaseReady(),
      message: isKnowledgeBaseReady() 
        ? 'Knowledge base is ready' 
        : 'Knowledge base is empty. Please process PDFs first.'
    });
  } catch (error) {
    console.error('Error checking knowledge base:', error);
    return NextResponse.json(
      { 
        ready: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

