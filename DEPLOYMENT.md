# Deployment Guide

## GitHub Pages Deployment

The application is configured to deploy to GitHub Pages using static export.

### Important Notes

⚠️ **API Routes Limitation**: GitHub Pages only serves static files. The `/api/predict` route will **not work** with static export.

### Options for API Routes

1. **Deploy API Separately**: Deploy the API to a platform that supports serverless functions:
   - [Vercel](https://vercel.com) - Recommended for Next.js apps
   - [Netlify](https://netlify.com) - Supports Next.js with API routes
   - [Railway](https://railway.app) - Full Next.js support
   - [Render](https://render.com) - Next.js support

2. **Use External API**: Move the API logic to a separate service and call it from the frontend

3. **Client-Side Only**: If possible, move API logic to client-side (not recommended for API keys)

### Current Configuration

- **Output Directory**: `out/` (for static export)
- **Build Command**: `npm run build`
- **Static Export**: Enabled when `GITHUB_ACTIONS=true`

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy.yml`) is configured to:
1. Build the Next.js app with static export
2. Upload the `out/` directory as artifacts
3. Deploy to GitHub Pages

### Environment Variables

Make sure to set these secrets in GitHub:
- `GEMINI_API_KEY` - Your Google Gemini API key

### Alternative: Deploy to Vercel (Recommended)

For full Next.js support including API routes:

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

Vercel provides:
- ✅ Full Next.js support (API routes work)
- ✅ Automatic deployments
- ✅ Environment variables
- ✅ Custom domains
- ✅ Analytics

