# RAG Implementation Details

## Overview

The RAG (Retrieval-Augmented Generation) system enhances tarot card readings by retrieving relevant information from a knowledge base of PDF documents and adding it to the AI prompt.

## Architecture Flow

```
1. PDF Processing → 2. Embedding Generation → 3. Vector Storage → 4. Retrieval → 5. Prompt Enhancement
```

## Step-by-Step Implementation

### 1. PDF Processing (`lib/rag/pdfProcessor.ts`)

**What it does:**
- Extracts text from PDF files in `knowledge-base/pdfs/`
- Splits text into chunks (~1000 characters with 200 char overlap)
- Preserves metadata (source file, page number, chunk index)

**Example:**
```typescript
const processedPDF = await processPDF('knowledge-base/pdfs/tarot-guide.pdf');
// Returns: { filename, chunks: [{ text, page, source, chunkIndex }], totalPages }
```

### 2. Embedding Generation (`lib/rag/embeddings.ts`)

**What it does:**
- Converts text chunks into vector embeddings
- Uses OpenAI embeddings if `OPENAI_API_KEY` is set (recommended)
- Falls back to simple hash-based embeddings if OpenAI is unavailable

**Embedding Options:**

**Option A: OpenAI Embeddings (Recommended)**
```typescript
// Uses text-embedding-3-small model
// Returns: 1536-dimensional vector
const embedding = await generateEmbedding("The Magician card represents...");
```

**Option B: Simple Hash Embeddings (Fallback)**
```typescript
// Uses word-based hashing
// Returns: 384-dimensional vector
// Less accurate but works without API key
```

### 3. Vector Storage (`lib/rag/vectorStore.ts`)

**What it does:**
- Stores embeddings in memory and on disk
- Implements cosine similarity search
- Returns top-K most relevant chunks

**Storage Structure:**
```typescript
interface Embedding {
  id: string;                    // "filename-chunkIndex"
  text: string;                  // Original chunk text
  embedding: number[];           // Vector representation
  metadata: {
    source: string;              // PDF filename
    page?: number;               // Page number
    chunkIndex: number;          // Chunk position
  };
}
```

**Search Example:**
```typescript
const queryEmbedding = await generateEmbedding("The Magician");
const results = await vectorStore.search(queryEmbedding, topK: 5);
// Returns: [{ text, score, metadata }, ...]
```

### 4. Retrieval (`lib/rag/ragService.ts`)

**What it does:**
- Takes card names (e.g., "The Magician", "Two of Cups")
- Generates query embeddings for each card
- Searches vector store for relevant chunks
- Combines results into context

**Code:**
```typescript
export async function retrieveCardKnowledge(cardNames: string[]): Promise<CardKnowledge[]> {
  const results: CardKnowledge[] = [];
  
  for (const cardName of cardNames) {
    // 1. Create query embedding
    const queryEmbedding = await generateEmbedding(cardName);
    
    // 2. Search for similar chunks (top 5)
    const searchResults = await vectorStore.search(queryEmbedding, 5);
    
    // 3. Combine into context
    const context = searchResults
      .map(result => result.text)
      .join('\n\n');
    
    results.push({
      cardName,
      relevantChunks: searchResults,
      context: context || `No specific knowledge found for ${cardName}.`,
    });
  }
  
  return results;
}
```

### 5. Prompt Enhancement (`lib/prompts/generatePrompt.ts`)

**What it does:**
- Checks if knowledge base is ready
- Retrieves enhanced context for the three cards
- Appends context to the base prompt

**Code:**
```typescript
export async function generatePrompt(variables: ReadingPrompt): Promise<string> {
  const { userName, currentMood, currentContext, pastCard, presentCard, futureCard } = variables;
  
  // Get enhanced context from knowledge base if available
  let enhancedContext = '';
  if (isKnowledgeBaseReady()) {
    try {
      enhancedContext = await getEnhancedContext(pastCard, presentCard, futureCard);
    } catch (error) {
      console.warn('Failed to retrieve enhanced context:', error);
    }
  }

  // Base prompt
  const basePrompt = `You are an expert AI tarot card reader...`;
  
  // Append enhanced context
  return basePrompt + (enhancedContext ? `\n\n${enhancedContext}` : '');
}
```

## Complete Prompt Structure

### Base Prompt (Without RAG)
```
You are an expert AI tarot card reader known for your thoughtful, empathetic, and insightful readings. Each reading provides clarity on the user's journey by addressing their past, present, and future, focusing on underlying motivations and actionable goals. Refer to the user as {userName}, and keep their current emotional state ({currentMood}) and provided context ({currentContext}) in mind to tailor your interpretation to their needs. Your response should offer guidance that resonates deeply, fostering self-awareness and direction.

CRITICAL: You MUST respond with ONLY valid JSON. Do NOT include any markdown code blocks, explanations, or text outside of the JSON object. Your response must be parseable JSON that can be directly parsed by JSON.parse(). Start your response with { and end with }.

Answer Format Instructions
Provide your response as a valid JSON object (no markdown, no code blocks, just pure JSON) with the following structure:

{
  "greeting": "Include a warm, encouraging message that acknowledges {userName} by name and considers their current mood ({currentMood}).",
  "past": {
    "card": "{pastCard}",
    "interpretation": "Explain how this card relates to past events, influences, or lessons that are shaping the present."
  },
  "present": {
    "card": "{presentCard}",
    "interpretation": "Provide insights into the current circumstances and suggest actionable advice for navigating the present."
  },
  "future": {
    "card": "{futureCard}",
    "interpretation": "Describe the anticipated outcome or direction this card suggests, focusing on growth, resolution, or opportunities ahead."
  },
  "combined_meaning": "Synthesize the interpretations of all three cards into a cohesive narrative or actionable strategy, offering specific advice for {userName}.",
  "closing_message": "End with a motivating, personalized message that leaves {userName} feeling inspired, confident, and ready to take action."
}

Tone and Approach
Empathetic and Insightful: Address {userName}'s emotional state and provided context ({currentContext}) thoughtfully, ensuring the reading feels personalized and supportive.
Balanced Depth and Clarity: Offer meaningful insights while remaining concise and accessible.
Creative and Unique: Provide imaginative interpretations that encourage {userName} to connect with their intuition and goals.
Structured and Organized: Present the reading in a clear, logical format that guides {userName} through the past, present, and future aspects of the reading.
```

### Enhanced Prompt (With RAG)
```
[Base Prompt Above]

## Additional Card Knowledge from Knowledge Base:

### The Magician:
[Retrieved text chunk 1 about The Magician from PDF]
[Retrieved text chunk 2 about The Magician from PDF]
[Retrieved text chunk 3 about The Magician from PDF]
[Retrieved text chunk 4 about The Magician from PDF]
[Retrieved text chunk 5 about The Magician from PDF]

### Two of Cups:
[Retrieved text chunk 1 about Two of Cups from PDF]
[Retrieved text chunk 2 about Two of Cups from PDF]
[Retrieved text chunk 3 about Two of Cups from PDF]
[Retrieved text chunk 4 about Two of Cups from PDF]
[Retrieved text chunk 5 about Two of Cups from PDF]

### The Sun:
[Retrieved text chunk 1 about The Sun from PDF]
[Retrieved text chunk 2 about The Sun from PDF]
[Retrieved text chunk 3 about The Sun from PDF]
[Retrieved text chunk 4 about The Sun from PDF]
[Retrieved text chunk 5 about The Sun from PDF]
```

## Example: Complete Flow

### Input
```typescript
{
  userName: "Sarah",
  currentMood: "Seeking Guidance",
  currentContext: "The user is seeking guidance through tarot cards.",
  pastCard: "The Magician",
  presentCard: "Two of Cups",
  futureCard: "The Sun"
}
```

### Step 1: RAG Retrieval
```typescript
// Query embeddings generated for each card
const magicianEmbedding = await generateEmbedding("The Magician");
const twoOfCupsEmbedding = await generateEmbedding("Two of Cups");
const sunEmbedding = await generateEmbedding("The Sun");

// Vector search returns top 5 relevant chunks
const magicianChunks = await vectorStore.search(magicianEmbedding, 5);
// Returns chunks like:
// - "The Magician represents skill, willpower, and the ability to manifest..."
// - "In the upright position, The Magician indicates..."
// - etc.
```

### Step 2: Context Assembly
```typescript
const enhancedContext = `
## Additional Card Knowledge from Knowledge Base:

### The Magician:
The Magician represents skill, willpower, and the ability to manifest one's desires. This card shows a figure with one hand pointing to the heavens and the other to the earth, symbolizing the connection between the spiritual and material worlds. The Magician has all the tools needed to succeed laid out before him...

### Two of Cups:
The Two of Cups represents partnership, connection, and mutual attraction. This card often appears when two people are coming together in harmony, whether in romance, friendship, or business. The imagery shows two figures exchanging cups, symbolizing the sharing of emotions and the beginning of a meaningful relationship...

### The Sun:
The Sun card represents joy, success, and enlightenment. This is one of the most positive cards in the tarot deck, indicating a period of happiness, clarity, and achievement. The Sun shines brightly, suggesting that obstacles have been overcome and a new day has dawned...
`;
```

### Step 3: Final Prompt Sent to AI
```
You are an expert AI tarot card reader...

[Base prompt continues...]

## Additional Card Knowledge from Knowledge Base:

### The Magician:
The Magician represents skill, willpower, and the ability to manifest one's desires...

### Two of Cups:
The Two of Cups represents partnership, connection, and mutual attraction...

### The Sun:
The Sun card represents joy, success, and enlightenment...
```

## Integration Points

### 1. API Route (`app/api/predict/route.ts`)
```typescript
export async function POST(request: NextRequest) {
  // Initialize RAG on first request
  await initializeRAG();
  
  // Generate prompt (includes RAG context if available)
  const promptText = await generatePrompt({
    userName: prompt.userName,
    currentMood: prompt.currentMood,
    currentContext: prompt.currentContext,
    pastCard: prompt.past,
    presentCard: prompt.present,
    futureCard: prompt.future,
  });
  
  // Send to Gemini API
  const response = await model.generateContent(promptText);
}
```

### 2. Prompt Generation (`lib/prompts/generatePrompt.ts`)
```typescript
export async function generatePrompt(variables: ReadingPrompt): Promise<string> {
  // Check if RAG is ready
  if (isKnowledgeBaseReady()) {
    // Retrieve enhanced context
    enhancedContext = await getEnhancedContext(
      pastCard, 
      presentCard, 
      futureCard
    );
  }
  
  // Append to base prompt
  return basePrompt + enhancedContext;
}
```

## Benefits

1. **More Accurate Readings**: AI has access to detailed card information from authoritative sources
2. **Consistent Interpretations**: Knowledge base ensures consistent card meanings
3. **Deeper Insights**: Can reference specific symbolism, historical context, and nuanced meanings
4. **Scalable**: Easy to add more PDFs to expand knowledge base

## Current Status

- ✅ PDF processing implemented
- ✅ Embedding generation (OpenAI + fallback)
- ✅ Vector storage and search
- ✅ RAG retrieval integrated
- ✅ Prompt enhancement working
- ⚠️ Requires knowledge base to be processed first (`npm run process-knowledge-base`)

## Usage

1. **Add PDFs**: Place PDF files in `knowledge-base/pdfs/`
2. **Process**: Run `npm run process-knowledge-base`
3. **Automatic**: RAG automatically enhances readings when knowledge base is ready

## Debugging

Check if RAG is working:
```bash
curl http://localhost:3000/api/knowledge-base/process
# Returns: { "ready": true, "message": "Knowledge base is ready" }
```

Check console logs:
- `✅ RAG system initialized` - RAG loaded successfully
- `Loaded X embeddings from disk` - Embeddings loaded
- `Failed to retrieve enhanced context` - RAG retrieval failed (but reading continues)

