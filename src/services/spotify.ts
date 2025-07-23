import { API_CONFIG } from '../config/api';

interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
}

interface SpotifySearchResponse {
  artists: {
    items: SpotifyArtist[];
  };
}

class SpotifyService {
  private clientId = API_CONFIG.SPOTIFY_CLIENT_ID;
  private clientSecret = API_CONFIG.SPOTIFY_CLIENT_SECRET;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error('Failed to get Spotify access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token as string;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 minute early
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify access token:', error);
      throw error;
    }
  }

  async getArtistImage(artistName: string): Promise<string | null> {
    try {
      console.log('🔍 Spotify: Searching for artist:', artistName);
      console.log('🔍 Spotify: Client ID length:', this.clientId?.length);
      console.log('🔍 Spotify: Client Secret length:', this.clientSecret?.length);
      
      // Skip if using mock data
      if (API_CONFIG.USE_MOCK_DATA) {
        console.log('🔍 Spotify: Using mock data, skipping');
        return null;
      }

      // Skip if no credentials
      if (this.clientId === 'YOUR_SPOTIFY_CLIENT_ID' || this.clientSecret === 'YOUR_SPOTIFY_CLIENT_SECRET') {
        console.log('🔍 Spotify: No credentials provided, skipping');
        return null;
      }

      const token = await this.getAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search Spotify artists');
      }

      const data: SpotifySearchResponse = await response.json();
      
      console.log('🔍 Spotify: Found', data.artists.items.length, 'artists');
      
      if (data.artists.items.length > 0) {
        const artist = data.artists.items[0];
        console.log('🔍 Spotify: Artist found:', artist.name);
        console.log('🔍 Spotify: Artist images:', artist.images?.length || 0);
        
        // Return the largest image (first in the array)
        if (artist.images && artist.images.length > 0) {
          console.log('🔍 Spotify: Returning image URL:', artist.images[0].url);
          return artist.images[0].url;
        }
      }

      console.log('🔍 Spotify: No image found for artist');
      return null;
    } catch (error) {
      console.error('Error getting artist image from Spotify:', error);
      return null;
    }
  }

  // Cache for artist images to avoid repeated API calls
  private imageCache = new Map<string, string | null>();

  async getArtistImageCached(artistName: string): Promise<string | null> {
    const cacheKey = artistName.toLowerCase().trim();
    
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey) || null;
    }

    const imageUrl = await this.getArtistImage(artistName);
    this.imageCache.set(cacheKey, imageUrl);
    
    return imageUrl;
  }
}

export const spotifyService = new SpotifyService(); 