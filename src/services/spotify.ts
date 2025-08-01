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

interface SpotifyArtistInfo {
  id: string;
  name: string;
  imageUrl: string | null;
  spotifyUrl: string;
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
      console.log('🔐 Spotify: Getting access token...');
      console.log('🔐 Spotify: Client ID:', this.clientId);
      console.log('🔐 Spotify: Client Secret length:', this.clientSecret?.length || 0);
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
        },
        body: 'grant_type=client_credentials'
      });

      console.log('🔐 Spotify: Token response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔐 Spotify: Token error response:', errorText);
        throw new Error(`Failed to get Spotify access token: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('🔐 Spotify: Token response data:', data);
      
      this.accessToken = data.access_token as string;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Expire 1 minute early
      
      console.log('🔐 Spotify: Access token obtained successfully');
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
      
      // Skip if no credentials (but allow even with mock data enabled)
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

  async getArtistInfo(artistName: string): Promise<SpotifyArtistInfo | null> {
    try {
      console.log('🔍 Spotify: Getting artist info for:', artistName);
      
      // Skip if no credentials (but allow even with mock data enabled)
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
      
      if (data.artists.items.length > 0) {
        const artist = data.artists.items[0];
        const imageUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : null;
        const spotifyUrl = `https://open.spotify.com/artist/${artist.id}`;
        
        console.log('🔍 Spotify: Found artist:', artist.name, 'with ID:', artist.id);
        
        return {
          id: artist.id,
          name: artist.name,
          imageUrl,
          spotifyUrl
        };
      }

      console.log('🔍 Spotify: No artist found');
      return null;
    } catch (error) {
      console.error('Error getting artist info from Spotify:', error);
      return null;
    }
  }

  // Cache for artist info to avoid repeated API calls
  private artistInfoCache = new Map<string, SpotifyArtistInfo | null>();

  async getArtistInfoCached(artistName: string): Promise<SpotifyArtistInfo | null> {
    const cacheKey = artistName.toLowerCase().trim();
    
    if (this.artistInfoCache.has(cacheKey)) {
      return this.artistInfoCache.get(cacheKey) || null;
    }

    const artistInfo = await this.getArtistInfo(artistName);
    this.artistInfoCache.set(cacheKey, artistInfo);
    
    return artistInfo;
  }
}

export const spotifyService = new SpotifyService(); 