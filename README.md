# Cosmic Tarot

Cosmic Tarot is a Next.js application that provides tarot card readings using AI. The ancient symbols on the cards are designed to stimulate intuition, connecting users with their higher selves or spiritual aspects.

## Overview

Cosmic Tarot aims to offer users a unique and personalized tarot reading experience. By leveraging AI, the application provides interpretations of tarot cards that are tailored to the user's input, enhancing self-awareness and creativity.

## Tech Stack

- **Frontend**: Next.js 14, React
- **Backend**: Next.js API Routes
- **Language**: TypeScript
- **AI**: Google Gemini API
- **Package Manager**: npm

## Features

- Tarot card reading
- AI-generated interpretations
- User input for personalized readings
- GEMINI model: "gemini-pro" (Generalized Multimodal Intelligence)
- TODO: LLM (Large Language Model) with ollama ai

## Getting Started
![Cosmic Tarot Components](./src/docs/cosmic-tarot-components.png)
![Cosmic Tarot](./src/docs/cosmic-tarot-ui.png)
### Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dhanugupta/cosmic-tarot.git
   cd cosmic-tarot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Google Gemini API Key (required for real API calls)
GEMINI_API_KEY=your_api_key_here

# Optional: Specify a model (defaults to gemini-2.5-flash)
# GEMINI_MODEL=gemini-1.5-pro

# Feature Flag: Enable mock mode (use mock responses instead of real API)
# Set to 'true' or '1' to enable mock mode
ENABLE_MOCK=false
```

### Development

To start the development server:

```bash
npm run dev
http://localhost:3000/
```

### Mock Mode

To test the application without making real API calls, enable mock mode:

1. Set `ENABLE_MOCK=true` in your `.env.local` file
2. Restart the development server
3. The application will use mock responses instead of calling the Gemini API

Mock mode is useful for:
- Development and testing
- Demonstrations without API costs
- UI/UX testing
- Offline development
