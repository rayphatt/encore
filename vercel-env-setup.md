# Vercel Environment Variables Setup

## Google Places API Key Setup

The Google Places API key is not being loaded in production. You need to add it to your Vercel environment variables:

### Option 1: Vercel Dashboard (Recommended)
1. Go to your Vercel dashboard
2. Select your "encore" project
3. Go to "Settings" → "Environment Variables"
4. Add a new variable:
   - **Name**: `VITE_GOOGLE_PLACES_API_KEY`
   - **Value**: `AIzaSyBdnS_HpUFLRAeOwAm439vlC3VhA2vky5w`
   - **Environment**: Production, Preview, Development
5. Click "Save"
6. Redeploy your project

### Option 2: Vercel CLI
```bash
vercel env add VITE_GOOGLE_PLACES_API_KEY
# Enter: AIzaSyBdnS_HpUFLRAeOwAm439vlC3VhA2vky5w
```

### Option 3: Add to vercel.json
Add this to your vercel.json:
```json
{
  "env": {
    "VITE_GOOGLE_PLACES_API_KEY": "AIzaSyBdnS_HpUFLRAeOwAm439vlC3VhA2vky5w"
  }
}
```

## After Setup
Once you've added the environment variable, redeploy your project and the Google Places API should work properly. 