/**
 * PDF Processor for extracting text from PDF files
 */

import fs from 'fs/promises';
import path from 'path';

export interface PDFChunk {
  text: string;
  page?: number;
  source: string;
  chunkIndex: number;
}

export interface ProcessedPDF {
  filename: string;
  chunks: PDFChunk[];
  totalPages: number;
}

/**
 * Process a PDF file and extract text chunks
 */
export async function processPDF(filePath: string): Promise<ProcessedPDF> {
  try {
    // Check if file exists
    await fs.access(filePath);
    
    const filename = path.basename(filePath);
    
    // Read file as buffer
    const fileBuffer = await fs.readFile(filePath);
    
    // Extract text using pdfjs-dist (Mozilla's PDF.js - most reliable PDF parser)
    const text = await extractTextFromPDF(fileBuffer);
    
    // Split into chunks
    const chunks = splitIntoChunks(text, filename);
    
    return {
      filename,
      chunks,
      totalPages: chunks.length > 0 ? Math.max(...chunks.map(c => c.page || 1)) : 0,
    };
  } catch (error) {
    console.error(`Error processing PDF ${filePath}:`, error);
    throw error;
  }
}

/**
 * Extract text from PDF buffer using pdfjs-dist (Mozilla's PDF.js)
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Polyfill browser APIs that pdfjs-dist needs
    if (typeof globalThis.DOMMatrix === 'undefined') {
      globalThis.DOMMatrix = class DOMMatrix {
        constructor(init?: string | number[]) {
          if (typeof init === 'string') {
            // Simple matrix parsing (a, b, c, d, e, f)
            const values = init.match(/matrix\(([^)]+)\)/)?.[1]?.split(',').map(Number) || [1, 0, 0, 1, 0, 0];
            this.a = values[0] ?? 1;
            this.b = values[1] ?? 0;
            this.c = values[2] ?? 0;
            this.d = values[3] ?? 1;
            this.e = values[4] ?? 0;
            this.f = values[5] ?? 0;
          } else {
            this.a = 1;
            this.b = 0;
            this.c = 0;
            this.d = 1;
            this.e = 0;
            this.f = 0;
          }
        }
        a: number = 1;
        b: number = 0;
        c: number = 0;
        d: number = 1;
        e: number = 0;
        f: number = 0;
        static fromMatrix() { return new DOMMatrix(); }
      } as any;
    }
    if (typeof globalThis.ImageData === 'undefined') {
      globalThis.ImageData = class ImageData {
        constructor(
          public data: Uint8ClampedArray | number,
          public width?: number,
          public height?: number
        ) {
          if (typeof data === 'number') {
            // First arg is width, second is height
            this.width = data;
            this.height = width || 0;
            this.data = new Uint8ClampedArray((this.width || 0) * (this.height || 0) * 4);
          } else {
            this.data = data;
            this.width = width || 0;
            this.height = height || 0;
          }
        }
      } as any;
    }
    if (typeof globalThis.Path2D === 'undefined') {
      globalThis.Path2D = class Path2D {
        addPath() {}
        arc() {}
        arcTo() {}
        bezierCurveTo() {}
        closePath() {}
        ellipse() {}
        lineTo() {}
        moveTo() {}
        quadraticCurveTo() {}
        rect() {}
      } as any;
    }
    
    // Use pdfjs-dist - Mozilla's PDF.js library (most reliable)
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      verbosity: 0, // 0 = errors, 1 = warnings, 5 = infos
    });
    
    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('PDF parsing failed with pdfjs-dist:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    // Fallback: return empty string
    return '';
  }
}

/**
 * Split text into chunks for embedding
 */
function splitIntoChunks(text: string, source: string, chunkSize: number = 1000, overlap: number = 200): PDFChunk[] {
  const chunks: PDFChunk[] = [];
  const sentences = text.split(/[.!?]+\s+/);
  
  let currentChunk = '';
  let chunkIndex = 0;
  let page = 1;
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push({
        text: currentChunk.trim(),
        page,
        source,
        chunkIndex: chunkIndex++,
      });
      
      // Start new chunk with overlap
      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-Math.floor(overlap / 10));
      currentChunk = overlapWords.join(' ') + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
    
    // Simple page detection (if text contains page markers)
    if (sentence.match(/\n\n/)) {
      page++;
    }
  }
  
  // Add remaining chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      page,
      source,
      chunkIndex: chunkIndex,
    });
  }
  
  return chunks;
}

/**
 * Process all PDFs in a directory
 */
export async function processAllPDFs(directory: string): Promise<ProcessedPDF[]> {
  try {
    const files = await fs.readdir(directory);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));
    
    const results: ProcessedPDF[] = [];
    
    for (const file of pdfFiles) {
      const filePath = path.join(directory, file);
      try {
        const processed = await processPDF(filePath);
        results.push(processed);
        console.log(`✅ Processed ${file}: ${processed.chunks.length} chunks`);
      } catch (error) {
        console.error(`❌ Failed to process ${file}:`, error);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error);
    return [];
  }
}

