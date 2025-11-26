# RAG (Retrieval-Augmented Generation) Setup Guide

## Overview

The RAG system enhances tarot card readings by retrieving relevant information from a knowledge base of PDF documents about tarot cards. This provides the AI with deeper, more accurate knowledge when generating readings.

## Architecture

```
knowledge-base/
├── pdfs/              # Place your PDF files here
├── embeddings/        # Generated embeddings (auto-created)
└── chunks/            # Text chunks (auto-created)

lib/rag/
├── pdfProcessor.ts    # PDF text extraction
├── embeddings.ts      # Vector embedding generation
├── vectorStore.ts     # Embedding storage and retrieval
└── ragService.ts     # Main RAG service
```

## Setup Steps

### 1. Install Dependencies

```bash
npm install pdf-parse
npm install --save-dev tsx @types/pdf-parse
```

**Optional (for better embeddings):**
```bash
# If you want to use OpenAI embeddings instead of fallback
# Add OPENAI_API_KEY to your .env file
```

### 2. Add PDF Files

Place your tarot card PDF files in the `knowledge-base/pdfs/` directory:

```bash
cp your-tarot-book.pdf knowledge-base/pdfs/
```

### 3. Process the Knowledge Base

Run the processing script to extract text and generate embeddings:

```bash
npm run process-knowledge-base
```

Or use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/knowledge-base/process
```

### 4. Verify Setup

Check if the knowledge base is ready:

```bash
curl http://localhost:3000/api/knowledge-base/process
```

## How It Works

1. **PDF Processing**: PDFs are parsed and text is extracted
2. **Chunking**: Text is split into manageable chunks (~1000 characters)
3. **Embedding**: Each chunk is converted to a vector embedding
4. **Storage**: Embeddings are stored in `knowledge-base/embeddings/`
5. **Retrieval**: When generating a reading, relevant chunks are retrieved
6. **Enhancement**: Retrieved context is added to the AI prompt

## Embedding Options

### Option 1: OpenAI Embeddings (Recommended)
- **Quality**: High-quality semantic embeddings
- **Setup**: Add `OPENAI_API_KEY` to `.env`
- **Cost**: ~$0.0001 per 1K tokens

### Option 2: Simple Hash Embeddings (Fallback)
- **Quality**: Basic similarity matching
- **Setup**: No additional setup needed
- **Cost**: Free

## Integration

The RAG system is automatically integrated into the reading generation:

1. When a reading is requested, the system retrieves relevant knowledge for the three cards
2. The retrieved context is automatically added to the AI prompt
3. The AI uses this enhanced context to generate more accurate readings

## API Endpoints

### Process Knowledge Base
```bash
POST /api/knowledge-base/process
```

### Check Status
```bash
GET /api/knowledge-base/process
```

## Troubleshooting

### "pdf-parse not available"
Install the dependency:
```bash
npm install pdf-parse @types/pdf-parse
```

### "No PDFs found"
Make sure PDF files are in `knowledge-base/pdfs/` directory.

### "Embeddings not working"
- Check if `OPENAI_API_KEY` is set (for OpenAI embeddings)
- The system will fall back to simple embeddings if OpenAI is not available

### "Knowledge base not enhancing readings"
- Verify embeddings were generated: Check `knowledge-base/embeddings/` directory
- Check console logs for RAG initialization messages
- Ensure card names in PDFs match the card names used in readings

## Best Practices

1. **PDF Quality**: Use well-formatted PDFs with clear text (not scanned images)
2. **Card Names**: Ensure PDFs use the same card naming convention as your app
3. **Regular Updates**: Re-process knowledge base when adding new PDFs
4. **File Size**: Keep PDFs under 50MB for faster processing

## Future Enhancements

- [ ] Support for more file formats (DOCX, TXT, MD)
- [ ] Image-based PDF processing (OCR)
- [ ] Advanced chunking strategies
- [ ] Metadata extraction (author, date, etc.)
- [ ] Incremental updates (only process new files)
- [ ] Vector database integration (Pinecone, Weaviate, etc.)

