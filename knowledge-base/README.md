# Tarot Card Knowledge Base

This folder contains the knowledge base for the RAG (Retrieval-Augmented Generation) system that enhances AI readings with detailed tarot card information.

## Structure

```
knowledge-base/
├── pdfs/              # PDF files about tarot cards
├── embeddings/        # Generated vector embeddings (auto-generated)
├── chunks/           # Text chunks from PDFs (auto-generated)
└── README.md         # This file
```

## Adding PDF Files

1. Place your PDF files in the `pdfs/` folder
2. Run the processing script to extract text and create embeddings:
   ```bash
   npm run process-knowledge-base
   ```

## Supported Formats

- PDF files (`.pdf`)
- More formats can be added in the future

## How It Works

1. **PDF Processing**: PDFs are parsed and text is extracted
2. **Chunking**: Text is split into manageable chunks
3. **Embedding**: Each chunk is converted to a vector embedding
4. **Storage**: Embeddings are stored for fast retrieval
5. **Retrieval**: When generating a reading, relevant card information is retrieved and added to the prompt

## Usage

The RAG system automatically enhances readings by:
- Retrieving relevant information about drawn cards
- Adding context to the AI prompt
- Providing more accurate and detailed interpretations

