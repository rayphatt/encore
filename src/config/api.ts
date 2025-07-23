// API Configuration
// Get free API keys from:
// - Last.fm: https://www.last.fm/api/account/create
// - Google Places: https://developers.google.com/maps/documentation/places/web-service/get-api-key



// Debug environment variables
console.log('🔧 API Config Debug:');
console.log('🔧 VITE_SPOTIFY_CLIENT_ID:', import.meta.env.VITE_SPOTIFY_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('🔧 VITE_SPOTIFY_CLIENT_SECRET:', import.meta.env.VITE_SPOTIFY_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('🔧 VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);

export const API_CONFIG = {
  // Last.fm API for artist search
  LASTFM_API_KEY: import.meta.env.VITE_LASTFM_API_KEY || 'YOUR_LASTFM_API_KEY',
  
  // Google Places API for venue search
  GOOGLE_PLACES_API_KEY: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_PLACES_API_KEY',
  
  // Spotify API for artist images
  SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID',
  SPOTIFY_CLIENT_SECRET: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || 'YOUR_SPOTIFY_CLIENT_SECRET',
  
  // Feature flags - default to false (use real APIs) unless explicitly set to 'true'
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  
  // Search settings
  SEARCH_DEBOUNCE_MS: 300,
  MAX_SEARCH_RESULTS: 10,
  MIN_SEARCH_CHARS: 2,
} as const;

// Instructions for setting up real APIs:
export const API_SETUP_INSTRUCTIONS = {
  lastfm: {
    url: 'https://www.last.fm/api/account/create',
    steps: [
      '1. Go to https://www.last.fm/api/account/create',
      '2. Create a free account',
      '3. Get your API key',
      '4. Add it to your .env file as VITE_LASTFM_API_KEY=your_key_here',
    ],
    features: ['Artist search', 'Artist images', 'Listener counts']
  },
  googlePlaces: {
    url: 'https://developers.google.com/maps/documentation/places/web-service/get-api-key',
    steps: [
      '1. Go to Google Cloud Console',
      '2. Enable Places API',
      '3. Create API key',
      '4. Add it to your .env file as VITE_GOOGLE_PLACES_API_KEY=your_key_here',
    ],
    features: ['Venue search', 'Address information', 'Geolocation']
  },
  spotify: {
    url: 'https://developer.spotify.com/documentation/web-api',
    steps: [
      '1. Go to https://developer.spotify.com/dashboard',
      '2. Create a new app',
      '3. Get your Client ID and Client Secret',
      '4. Add them to your .env file as VITE_SPOTIFY_CLIENT_ID=your_id_here and VITE_SPOTIFY_CLIENT_SECRET=your_secret_here',
    ],
    features: ['Artist profile images', 'High-quality artist photos']
  }
}; 