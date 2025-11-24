# Migration from SvelteKit to Next.js

## Summary

The Cosmic Tarot application has been successfully migrated from SvelteKit to Next.js 14.

## Changes Made

### 1. Project Structure
- **Old**: `src/routes/` (SvelteKit routing)
- **New**: `app/` (Next.js App Router)

### 2. API Routes
- **Old**: `src/routes/api/predict/+server.ts`
- **New**: `app/api/predict/route.ts`
- Uses Next.js `NextRequest` and `NextResponse` instead of SvelteKit's `RequestHandler`

### 3. Components
- **Old**: Svelte components (`.svelte` files)
- **New**: React components (`.tsx` files)
- Converted `TarotCard.svelte` → `TarotCard.tsx` with CSS modules

### 4. State Management
- **Old**: Svelte stores (`writable`)
- **New**: React hooks (`useState`, `useEffect`)

### 5. Styling
- **Old**: Global CSS imported in components
- **New**: Global CSS in `app/globals.css`, component styles in CSS modules

### 6. Configuration
- Updated `package.json` with Next.js dependencies
- Created `next.config.js`
- Updated `tsconfig.json` for Next.js
- Excluded old `src/` directory from TypeScript compilation

## File Structure

```
cosmic-tarot/
├── app/
│   ├── api/
│   │   └── predict/
│   │       └── route.ts          # API route
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page component
├── lib/
│   ├── components/
│   │   ├── TarotCard.tsx          # React component
│   │   └── TarotCard.module.css   # Component styles
│   ├── prompts/
│   │   └── generatePrompt.ts      # Unchanged
│   ├── types/
│   │   └── index.ts               # Unchanged
│   └── utils/
│       └── cardUtils.ts           # Unchanged
├── public/
│   ├── data/
│   │   └── tarot-cards.json       # Card data
│   └── images/                    # Static images
└── package.json                    # Updated dependencies
```

## Environment Variables

Create a `.env.local` file:
```
GEMINI_API_KEY=your_api_key_here
```

## Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Key Differences

1. **Routing**: Next.js uses file-based routing in the `app/` directory
2. **Components**: React instead of Svelte
3. **API Routes**: Next.js route handlers instead of SvelteKit endpoints
4. **State**: React hooks instead of Svelte stores
5. **Styling**: CSS modules for component styles, global CSS for app-wide styles

## Notes

- The old `src/` directory is excluded from builds but kept for reference
- All functionality has been preserved in the migration
- The cosmic/divine UI theme remains unchanged
- All types and utilities remain compatible

