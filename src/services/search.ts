// Search service for artists and venues
// Using Spotify API for artists, Google Places for venues

import { API_CONFIG } from '../config/api';
import { spotifyService } from './spotify';

interface SearchResult {
  id: string;
  name: string;
  subtitle?: string;
}

interface ArtistSearchResult extends SearchResult {
  image?: string;
  listeners?: number;
}

interface VenueSearchResult extends SearchResult {
  address?: string;
  city?: string;
  country?: string;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
}

class SearchService {
  private spotifyClientId = API_CONFIG.SPOTIFY_CLIENT_ID;
  private spotifyClientSecret = API_CONFIG.SPOTIFY_CLIENT_SECRET;
  private googlePlacesApiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;

  // For development, we'll use mock data until you get API keys
  private useMockData = Boolean(API_CONFIG.USE_MOCK_DATA);

  // Simple cache for venue searches to prevent duplicate API calls
  private venueSearchCache = new Map<string, { results: VenueSearchResult[], timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Mock artist data for development
  private mockArtists = [
    { id: '1', name: 'The Beatles', subtitle: 'Rock Band' },
    { id: '2', name: 'Queen', subtitle: 'Rock Band' },
    { id: '3', name: 'Led Zeppelin', subtitle: 'Rock Band' },
    { id: '4', name: 'Pink Floyd', subtitle: 'Progressive Rock' },
    { id: '5', name: 'The Rolling Stones', subtitle: 'Rock Band' },
    { id: '6', name: 'U2', subtitle: 'Rock Band' },
    { id: '7', name: 'Coldplay', subtitle: 'Alternative Rock' },
    { id: '8', name: 'Radiohead', subtitle: 'Alternative Rock' },
    { id: '9', name: 'Arctic Monkeys', subtitle: 'Indie Rock' },
    { id: '10', name: 'The Strokes', subtitle: 'Indie Rock' },
    { id: '11', name: 'Foo Fighters', subtitle: 'Rock Band' },
    { id: '12', name: 'Red Hot Chili Peppers', subtitle: 'Funk Rock' },
    { id: '13', name: 'Nirvana', subtitle: 'Grunge' },
    { id: '14', name: 'Pearl Jam', subtitle: 'Grunge' },
    { id: '15', name: 'Soundgarden', subtitle: 'Grunge' },
    { id: '16', name: 'Metallica', subtitle: 'Heavy Metal' },
    { id: '17', name: 'Iron Maiden', subtitle: 'Heavy Metal' },
    { id: '18', name: 'Black Sabbath', subtitle: 'Heavy Metal' },
    { id: '19', name: 'AC/DC', subtitle: 'Hard Rock' },
    { id: '20', name: 'Guns N\' Roses', subtitle: 'Hard Rock' },
    { id: '21', name: 'Aerosmith', subtitle: 'Hard Rock' },
    { id: '22', name: 'Van Halen', subtitle: 'Hard Rock' },
    { id: '23', name: 'Def Leppard', subtitle: 'Hard Rock' },
    { id: '24', name: 'Bon Jovi', subtitle: 'Hard Rock' },
    { id: '25', name: 'Journey', subtitle: 'Rock Band' },
    { id: '26', name: 'Boston', subtitle: 'Rock Band' },
    { id: '27', name: 'Kansas', subtitle: 'Progressive Rock' },
    { id: '28', name: 'Yes', subtitle: 'Progressive Rock' },
    { id: '29', name: 'Genesis', subtitle: 'Progressive Rock' },
    { id: '30', name: 'Rush', subtitle: 'Progressive Rock' },
    // Add more contemporary artists
    { id: '31', name: 'Taylor Swift', subtitle: 'Pop' },
    { id: '32', name: 'Ed Sheeran', subtitle: 'Pop' },
    { id: '33', name: 'Adele', subtitle: 'Pop' },
    { id: '34', name: 'Drake', subtitle: 'Hip Hop' },
    { id: '35', name: 'Kendrick Lamar', subtitle: 'Hip Hop' },
    { id: '36', name: 'Beyoncé', subtitle: 'R&B' },
    { id: '37', name: 'Rihanna', subtitle: 'Pop' },
    { id: '38', name: 'Lady Gaga', subtitle: 'Pop' },
    { id: '39', name: 'Bruno Mars', subtitle: 'Pop' },
    { id: '40', name: 'Justin Bieber', subtitle: 'Pop' },
    { id: '41', name: 'Post Malone', subtitle: 'Hip Hop' },
    { id: '42', name: 'Billie Eilish', subtitle: 'Pop' },
    { id: '43', name: 'Dua Lipa', subtitle: 'Pop' },
    { id: '44', name: 'The Weeknd', subtitle: 'R&B' },
    { id: '45', name: 'Ariana Grande', subtitle: 'Pop' },
    { id: '46', name: 'Travis Scott', subtitle: 'Hip Hop' },
    { id: '47', name: 'J. Cole', subtitle: 'Hip Hop' },
    { id: '48', name: 'Eminem', subtitle: 'Hip Hop' },
    { id: '49', name: 'Jay-Z', subtitle: 'Hip Hop' },
    { id: '50', name: 'Kanye West', subtitle: 'Hip Hop' },
    // Add some electronic/dance artists
    { id: '51', name: 'Daft Punk', subtitle: 'Electronic' },
    { id: '52', name: 'Calvin Harris', subtitle: 'Electronic' },
    { id: '53', name: 'David Guetta', subtitle: 'Electronic' },
    { id: '54', name: 'Skrillex', subtitle: 'Dubstep' },
    { id: '55', name: 'Deadmau5', subtitle: 'Electronic' },
    { id: '56', name: 'Fisher', subtitle: 'House' },
    { id: '57', name: 'Chris Lake', subtitle: 'House' },
    { id: '58', name: 'Dom Dolla', subtitle: 'House' },
    { id: '59', name: 'John Summit', subtitle: 'House' },
    { id: '60', name: 'Fred again..', subtitle: 'Electronic' },
  ];

  // Mock venue data for development
  private mockVenues = [
    // Major US Arenas
    { id: '1', name: 'Madison Square Garden', subtitle: 'New York, NY' },
    { id: '2', name: 'Staples Center', subtitle: 'Los Angeles, CA' },
    { id: '3', name: 'United Center', subtitle: 'Chicago, IL' },
    { id: '4', name: 'American Airlines Arena', subtitle: 'Miami, FL' },
    { id: '5', name: 'TD Garden', subtitle: 'Boston, MA' },
    { id: '6', name: 'Wells Fargo Center', subtitle: 'Philadelphia, PA' },
    { id: '7', name: 'Barclays Center', subtitle: 'Brooklyn, NY' },
    { id: '8', name: 'Oracle Arena', subtitle: 'Oakland, CA' },
    { id: '9', name: 'Smoothie King Center', subtitle: 'New Orleans, LA' },
    { id: '10', name: 'Amway Center', subtitle: 'Orlando, FL' },
    { id: '11', name: 'Toyota Center', subtitle: 'Houston, TX' },
    { id: '12', name: 'American Airlines Center', subtitle: 'Dallas, TX' },
    { id: '13', name: 'Pepsi Center', subtitle: 'Denver, CO' },
    { id: '14', name: 'Moda Center', subtitle: 'Portland, OR' },
    { id: '15', name: 'KeyArena', subtitle: 'Seattle, WA' },
    { id: '16', name: 'Target Center', subtitle: 'Minneapolis, MN' },
    { id: '17', name: 'Quicken Loans Arena', subtitle: 'Cleveland, OH' },
    { id: '18', name: 'Little Caesars Arena', subtitle: 'Detroit, MI' },
    { id: '19', name: 'PPG Paints Arena', subtitle: 'Pittsburgh, PA' },
    { id: '20', name: 'Capital One Arena', subtitle: 'Washington, DC' },
    
    // Canadian Arenas
    { id: '21', name: 'Scotiabank Arena', subtitle: 'Toronto, ON' },
    { id: '22', name: 'Bell Centre', subtitle: 'Montreal, QC' },
    { id: '23', name: 'Rogers Arena', subtitle: 'Vancouver, BC' },
    { id: '24', name: 'Saddledome', subtitle: 'Calgary, AB' },
    { id: '25', name: 'Rexall Place', subtitle: 'Edmonton, AB' },
    
    // UK Arenas
    { id: '26', name: 'O2 Arena', subtitle: 'London, UK' },
    { id: '27', name: 'Manchester Arena', subtitle: 'Manchester, UK' },
    { id: '28', name: 'Birmingham Arena', subtitle: 'Birmingham, UK' },
    { id: '29', name: 'SSE Hydro', subtitle: 'Glasgow, UK' },
    { id: '30', name: 'Cardiff Arena', subtitle: 'Cardiff, UK' },
    
    // Popular Concert Venues
    { id: '31', name: 'Red Rocks Amphitheatre', subtitle: 'Morrison, CO' },
    { id: '32', name: 'Hollywood Bowl', subtitle: 'Los Angeles, CA' },
    { id: '33', name: 'Gorge Amphitheatre', subtitle: 'George, WA' },
    { id: '34', name: 'Shoreline Amphitheatre', subtitle: 'Mountain View, CA' },
    { id: '35', name: 'Jones Beach Theater', subtitle: 'Wantagh, NY' },
    { id: '36', name: 'Merriweather Post Pavilion', subtitle: 'Columbia, MD' },
    { id: '37', name: 'Alpine Valley Music Theatre', subtitle: 'East Troy, WI' },
    { id: '38', name: 'Blossom Music Center', subtitle: 'Cuyahoga Falls, OH' },
    { id: '39', name: 'Deer Creek Music Center', subtitle: 'Noblesville, IN' },
    { id: '40', name: 'Riverbend Music Center', subtitle: 'Cincinnati, OH' },
    
    // Stadiums
    { id: '41', name: 'MetLife Stadium', subtitle: 'East Rutherford, NJ' },
    { id: '42', name: 'AT&T Stadium', subtitle: 'Arlington, TX' },
    { id: '43', name: 'SoFi Stadium', subtitle: 'Inglewood, CA' },
    { id: '44', name: 'Hard Rock Stadium', subtitle: 'Miami Gardens, FL' },
    { id: '45', name: 'Gillette Stadium', subtitle: 'Foxborough, MA' },
    { id: '46', name: 'Lincoln Financial Field', subtitle: 'Philadelphia, PA' },
    { id: '47', name: 'Soldier Field', subtitle: 'Chicago, IL' },
    { id: '48', name: 'Arrowhead Stadium', subtitle: 'Kansas City, MO' },
    { id: '49', name: 'Lambeau Field', subtitle: 'Green Bay, WI' },
    { id: '50', name: 'CenturyLink Field', subtitle: 'Seattle, WA' },
    
    // International Stadiums
    { id: '51', name: 'Wembley Stadium', subtitle: 'London, UK' },
    { id: '52', name: 'Twickenham Stadium', subtitle: 'London, UK' },
    { id: '53', name: 'Old Trafford', subtitle: 'Manchester, UK' },
    { id: '54', name: 'Stade de France', subtitle: 'Paris, France' },
    { id: '55', name: 'Allianz Arena', subtitle: 'Munich, Germany' },
    { id: '56', name: 'Santiago Bernabéu', subtitle: 'Madrid, Spain' },
    { id: '57', name: 'Camp Nou', subtitle: 'Barcelona, Spain' },
    { id: '58', name: 'San Siro', subtitle: 'Milan, Italy' },
    { id: '59', name: 'Olympic Stadium', subtitle: 'Berlin, Germany' },
    { id: '60', name: 'Maracanã Stadium', subtitle: 'Rio de Janeiro, Brazil' },
    
    // More Popular Venues
    { id: '61', name: 'Radio City Music Hall', subtitle: 'New York, NY' },
    { id: '62', name: 'Carnegie Hall', subtitle: 'New York, NY' },
    { id: '63', name: 'The Ryman Auditorium', subtitle: 'Nashville, TN' },
    { id: '64', name: 'The Grand Ole Opry', subtitle: 'Nashville, TN' },
    { id: '65', name: 'The Fillmore', subtitle: 'San Francisco, CA' },
    { id: '66', name: 'The Greek Theatre', subtitle: 'Los Angeles, CA' },
    { id: '67', name: 'The Wiltern', subtitle: 'Los Angeles, CA' },
    { id: '68', name: 'The Hollywood Palladium', subtitle: 'Los Angeles, CA' },
    { id: '69', name: 'The Troubadour', subtitle: 'Los Angeles, CA' },
    { id: '70', name: 'The Bluebird Cafe', subtitle: 'Nashville, TN' },
    { id: '71', name: 'The 9:30 Club', subtitle: 'Washington, DC' },
    { id: '72', name: 'The Black Cat', subtitle: 'Washington, DC' },
    { id: '73', name: 'The Metro', subtitle: 'Chicago, IL' },
    { id: '74', name: 'The Empty Bottle', subtitle: 'Chicago, IL' },
    { id: '75', name: 'The Hideout', subtitle: 'Chicago, IL' },
    { id: '76', name: 'The Bottom Lounge', subtitle: 'Chicago, IL' },
    { id: '77', name: 'The Aragon Ballroom', subtitle: 'Chicago, IL' },
    { id: '78', name: 'The Riviera Theatre', subtitle: 'Chicago, IL' },
    { id: '79', name: 'The Vic Theatre', subtitle: 'Chicago, IL' },
    { id: '80', name: 'The Thalia Hall', subtitle: 'Chicago, IL' },
    { id: '81', name: 'The Lincoln Hall', subtitle: 'Chicago, IL' },
    { id: '82', name: 'The Schubas Tavern', subtitle: 'Chicago, IL' },
    { id: '83', name: 'The Subterranean', subtitle: 'Chicago, IL' },
    { id: '84', name: 'The Beat Kitchen', subtitle: 'Chicago, IL' },
    { id: '85', name: 'The Empty Bottle', subtitle: 'Chicago, IL' },
    
    // Brooklyn/NYC Venues
    { id: '86', name: 'Brooklyn Steel', subtitle: 'Brooklyn, NY' },
    { id: '87', name: 'Warsaw', subtitle: 'Brooklyn, NY' },
    { id: '88', name: 'Music Hall of Williamsburg', subtitle: 'Brooklyn, NY' },
    { id: '89', name: 'Brooklyn Bowl', subtitle: 'Brooklyn, NY' },
    { id: '90', name: 'Red Hook Grain Terminal', subtitle: 'Brooklyn, NY' },
    { id: '91', name: 'Red Hook Winery', subtitle: 'Brooklyn, NY' },
    { id: '92', name: 'Red Hook Ball Fields', subtitle: 'Brooklyn, NY' },
    { id: '93', name: 'Grain Terminal', subtitle: 'Brooklyn, NY' },
    { id: '94', name: 'Red Hook Pier', subtitle: 'Brooklyn, NY' },
    { id: '95', name: 'Red Hook Container Terminal', subtitle: 'Brooklyn, NY' },
    { id: '96', name: 'The Hideout', subtitle: 'Chicago, IL' },
    { id: '97', name: 'The Bottom Lounge', subtitle: 'Chicago, IL' },
    { id: '98', name: 'The Aragon Ballroom', subtitle: 'Chicago, IL' },
    { id: '99', name: 'The Riviera Theatre', subtitle: 'Chicago, IL' },
    { id: '100', name: 'The Vic Theatre', subtitle: 'Chicago, IL' },
    // Sports venues
    { id: '101', name: 'Sports Illustrated Arena', subtitle: 'New York, NY' },
    { id: '102', name: 'Madison Square Garden', subtitle: 'New York, NY' },
    { id: '103', name: 'Barclays Center', subtitle: 'Brooklyn, NY' },
    { id: '104', name: 'Yankee Stadium', subtitle: 'Bronx, NY' },
    { id: '105', name: 'Citi Field', subtitle: 'Queens, NY' },
    { id: '106', name: 'MetLife Stadium', subtitle: 'East Rutherford, NJ' },
    { id: '107', name: 'Red Bull Arena', subtitle: 'Harrison, NJ' },
    { id: '108', name: 'Prudential Center', subtitle: 'Newark, NJ' },
    // More real venues
    { id: '109', name: 'Arthur Ashe Stadium', subtitle: 'Queens, NY' },
    { id: '110', name: 'Citi Field', subtitle: 'Queens, NY' },
    { id: '111', name: 'MetLife Stadium', subtitle: 'East Rutherford, NJ' },
    { id: '112', name: 'Red Bull Arena', subtitle: 'Harrison, NJ' },
    { id: '113', name: 'Yankee Stadium', subtitle: 'Bronx, NY' },
    { id: '114', name: 'Radio City Music Hall', subtitle: 'New York, NY' },
    { id: '115', name: 'Carnegie Hall', subtitle: 'New York, NY' },
    { id: '116', name: 'Lincoln Center', subtitle: 'New York, NY' },
    { id: '117', name: 'Apollo Theater', subtitle: 'New York, NY' },
    { id: '118', name: 'Beacon Theatre', subtitle: 'New York, NY' },
    { id: '119', name: 'Terminal 5', subtitle: 'New York, NY' },
    { id: '120', name: 'Webster Hall', subtitle: 'New York, NY' },
  ];

  async searchArtists(query: string): Promise<ArtistSearchResult[]> {
    console.log('🔍 Searching artists for:', query);
    console.log('🔧 Using mock data:', this.useMockData);
    console.log('🔑 Spotify Client ID:', this.spotifyClientId);
    
    // Check if we have valid Spotify credentials (not placeholder)
    const hasValidSpotifyCredentials = this.spotifyClientId && 
                                    this.spotifyClientSecret &&
                                    this.spotifyClientId !== 'YOUR_SPOTIFY_CLIENT_ID' && 
                                    this.spotifyClientSecret !== 'YOUR_SPOTIFY_CLIENT_SECRET' &&
                                    this.spotifyClientId.length > 10 &&
                                    this.spotifyClientSecret.length > 10;
    
    // Force real APIs - ignore mock data setting
    if (!hasValidSpotifyCredentials) {
      console.log('📋 Using mock artist data');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(' ').filter(word => word.length > 0);
      
      const filtered = this.mockArtists.filter(artist => {
        const nameLower = artist.name.toLowerCase();
        const subtitleLower = artist.subtitle?.toLowerCase() || '';
        
        // Check if any query word matches the name or subtitle
        return queryWords.some(word => 
          nameLower.includes(word) || subtitleLower.includes(word)
        );
      });
      
      // Sort results by relevance
      const sorted = filtered.sort((a, b) => {
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        
        // Exact matches first
        if (aNameLower === queryLower) return -1;
        if (bNameLower === queryLower) return 1;
        
        // Starts with query
        if (aNameLower.startsWith(queryLower)) return -1;
        if (bNameLower.startsWith(queryLower)) return 1;
        
        // Alphabetical order
        return aNameLower.localeCompare(bNameLower);
      });
      
      console.log('📋 Mock results:', sorted.length, 'artists found');
      return sorted.slice(0, 10); // Limit to 10 results
    }

    console.log('🌐 Using real Spotify API');
    // Real Spotify API implementation
    try {
      const token = await spotifyService.getAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('📡 Spotify API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch artists from Spotify');
      }
      
      const data = await response.json();
      console.log('📡 Spotify API response data:', data);
      
      const artists = data.artists?.items || [];
      
      const results = artists.map((artist: any) => ({
        id: artist.id,
        name: artist.name,
        subtitle: artist.genres?.slice(0, 2).join(', ') || undefined,
        image: artist.images?.[0]?.url,
        listeners: artist.popularity || 0
      }));
      
      console.log('🌐 Real Spotify API results:', results.length, 'artists found');
      return results;
    } catch (error) {
      console.error('❌ Error searching artists:', error);
      return [];
    }
  }

  async searchVenues(query: string): Promise<VenueSearchResult[]> {
    console.log('🏟️ Searching venues for:', query);
    
    // Prevent empty or very short queries
    if (!query || query.trim().length < 2) {
      console.log('🏟️ Query too short, returning empty results');
      return [];
    }
    
    // Check cache first
    const cached = this.venueSearchCache.get(query);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('🏟️ Using cached venue results for:', query);
      return cached.results;
    }
    
    // Check if we should use mock data
    console.log('🔧 Using mock data:', this.useMockData);
    if (this.useMockData) {
      console.log('🔧 Using mock venue data');
      return this.searchVenuesMock(query);
    }
    
    // Use real API
    console.log('🌐 Using real venue API');
    const results = await this.searchVenuesReal(query);
    console.log('🌐 Real API returned', results.length, 'venues');
    
    // Add custom venue option if no results found
    if (results.length === 0 && query.trim().length > 0) {
      console.log('🌐 No venues found, adding custom venue option');
      results.push({
        id: 'custom-venue',
        name: `"${query}" (Custom Venue)`,
        location: 'Click to add this venue',
        latitude: null,
        longitude: null
      });
    }
    
    // Cache the results
    const cacheEntry = { results, timestamp: Date.now() };
    this.venueSearchCache.set(query, cacheEntry);
    
    console.log('🌐 Using real API results:', results.length, 'venues found');
    return results;
  }

  private async searchVenuesReal(query: string): Promise<VenueSearchResult[]> {
    console.log('🌐 Real API: Starting venue search for:', query);
    
    // Prevent excessive API calls for very short queries
    if (!query || query.trim().length < 2) {
      console.log('🌐 Real API: Query too short, skipping search');
      return [];
    }
    
    // Check cache first
    const cached = this.venueSearchCache.get(query);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('🌐 Using cached venue results for:', query);
      return cached.results;
    }

    // Collect results from multiple sources
    const allVenues: VenueSearchResult[] = [];
    
    try {
      // 1. First try database (fastest)
      console.log('🌐 Database: Searching...');
      const databaseVenues = await this.searchVenuesDatabase(query);
      console.log('🌐 Database: Found', databaseVenues.length, 'venues');
      allVenues.push(...databaseVenues);
      
      // 2. Then try Nominatim (free, no CORS issues)
      console.log('🌐 Nominatim: Searching...');
      const nominatimVenues = await this.searchVenuesNominatim(query);
      console.log('🌐 Nominatim: Found', nominatimVenues.length, 'venues');
      allVenues.push(...nominatimVenues);
      
      // 3. Skip Google Places in browser due to CORS issues
      // Google Places API requires server-side calls or a proxy
      console.log('🌐 Google Places: Skipping (CORS issues in browser)');
      
    } catch (error) {
      console.log('🌐 Real API: Error during search:', error);
    }
    
    // Remove duplicates and sort by relevance
    const uniqueVenues = this.removeDuplicateVenues(allVenues);
    const sortedVenues = this.sortVenuesByRelevance(uniqueVenues, query);
    
    console.log('🌐 Real API: Total unique venues found:', sortedVenues.length);
    const cacheEntry = { results: sortedVenues, timestamp: Date.now() };
    this.venueSearchCache.set(query, cacheEntry);
    return sortedVenues.slice(0, 10); // Limit to 10 results
  }

  private async searchVenuesGooglePlaces(query: string): Promise<VenueSearchResult[]> {
    // Try both sources for the API key
    const apiKey = this.googlePlacesApiKey || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    console.log('🌐 Google Places: API key check -', apiKey ? 'SET' : 'NOT SET');
    if (!apiKey || apiKey === 'YOUR_GOOGLE_PLACES_API_KEY') {
      console.log('🌐 Google Places: No API key available - Get one at https://developers.google.com/maps/documentation/places/web-service/get-api-key');
      return [];
    }

    try {
      console.log('🌐 Google Places: Searching for venues:', query);
      
      // Note: Google Places API has CORS restrictions for client-side calls
      // This will likely fail in the browser, but we'll try anyway
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=establishment&key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        return [];
      }
      
      const results = data.results.slice(0, 5).map((place: any) => ({
        id: place.place_id,
        name: place.name,
        location: place.formatted_address,
        latitude: place.geometry?.location?.lat || null,
        longitude: place.geometry?.location?.lng || null
      }));
      
      console.log('🌐 Google Places: Found', results.length, 'venues');
      return results;
    } catch (error) {
      console.log('🌐 Google Places: CORS or API error (expected in browser):', (error as Error).message);
      return [];
    }
  }

  private async searchVenuesNominatim(query: string): Promise<VenueSearchResult[]> {
    try {
      console.log('🌐 Nominatim: Searching for venues:', query);
      
      // Use fewer, more targeted search strategies for better performance
      const searchStrategies = [
        // Strategy 1: Direct search with the exact query
        query,
        // Strategy 2: Add common venue terms for better results
        `${query} stadium`,
        `${query} arena`,
        `${query} theater`,
        `${query} amphitheater`
      ];
      
      const allResults: VenueSearchResult[] = [];
      
      for (const searchTerm of searchStrategies) {
        try {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm)}&format=json&limit=3&addressdetails=1&extratags=1`;
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'EncoreApp/1.0'
            }
          });
          
          if (!response.ok) {
            console.log(`🌐 Nominatim: Failed for "${searchTerm}" - ${response.status}`);
            continue;
          }
          
          const data = await response.json();
          
          // Add a delay between requests to respect rate limits
          if (searchTerm !== searchStrategies[searchStrategies.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          if (Array.isArray(data) && data.length > 0) {
            const filtered = data.filter((item: any) => {
              const name = item.name?.toLowerCase() || '';
              const displayName = item.display_name?.toLowerCase() || '';
              const searchLower = query.toLowerCase();
              
              // Check if the venue name contains the search query
              const matchesQuery = name.includes(searchLower) || displayName.includes(searchLower);
              
              // Prioritize venues and entertainment locations
              const isVenueType = displayName.includes('stadium') || 
                                 displayName.includes('arena') || 
                                 displayName.includes('theater') || 
                                 displayName.includes('amphitheater') || 
                                 displayName.includes('concert') || 
                                 displayName.includes('music') ||
                                 displayName.includes('venue');
              
              return matchesQuery && isVenueType;
            });
            
            const results = filtered.map((item: any) => ({
              id: `nominatim_${item.place_id}`,
              name: item.name || item.display_name.split(',')[0],
              location: item.display_name,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon)
            }));
            
            allResults.push(...results);
          }
        } catch (error) {
          console.log(`🌐 Nominatim: Error for "${searchTerm}":`, error);
          continue;
        }
      }
      
      // Remove duplicates and limit results
      const uniqueResults = this.removeDuplicateVenues(allResults);
      console.log('🌐 Nominatim: Found', uniqueResults.length, 'unique venues');
      return uniqueResults.slice(0, 5); // Limit to 5 results from Nominatim
      
    } catch (error) {
      console.log('🌐 Nominatim: Search failed:', error);
      return [];
    }
  }

  private async searchVenuesDatabase(query: string): Promise<VenueSearchResult[]> {
    // Search through our mock venue database for real venues
    const searchLower = query.toLowerCase();
    const results: VenueSearchResult[] = [];
    
    // Prevent excessive results for very short queries
    if (searchLower.length < 2) {
      return results;
    }
    
    // Search through mock venues for matches
    for (const venue of this.mockVenues) {
      const venueName = venue.name.toLowerCase();
      const venueLocation = venue.subtitle?.toLowerCase() || '';
      
      // Check if the venue name or location contains the search query
      if (venueName.includes(searchLower) || venueLocation.includes(searchLower)) {
        // Prevent adding the same venue multiple times
        const existingVenue = results.find(r => r.name === venue.name);
        if (!existingVenue) {
          results.push({
            id: venue.id,
            name: venue.name,
            location: venue.subtitle || 'Unknown location',
            latitude: null,
            longitude: null
          });
        }
      }
    }
    
    console.log('🌐 Database: Found', results.length, 'venues');
    return results;
  }

  private async searchVenuesSuggestions(query: string): Promise<VenueSearchResult[]> {
    // Only show custom venue option when no real venues are found
    const suggestions: VenueSearchResult[] = [];
    
    // Add a "custom venue" option
    suggestions.push({
      id: 'custom-venue',
      name: `"${query}" (Custom Venue)`,
      location: 'Click to add this as a custom venue',
      latitude: null,
      longitude: null
    });
    
    return suggestions;
  }

  private removeDuplicateVenues(venues: VenueSearchResult[]): VenueSearchResult[] {
    const seen = new Set<string>();
    const uniqueVenues: VenueSearchResult[] = [];
    
    for (const venue of venues) {
      // Create a more robust key that includes both name and location
      const key = `${venue.name.toLowerCase().trim()}_${venue.location?.toLowerCase().trim() || ''}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVenues.push(venue);
      } else {
        console.log('🌐 Duplicate venue removed:', venue.name);
      }
    }
    
    console.log('🌐 Removed duplicates:', venues.length - uniqueVenues.length, 'duplicates');
    return uniqueVenues;
  }

  private sortVenuesByRelevance(venues: VenueSearchResult[], query: string): VenueSearchResult[] {
    const searchLower = query.toLowerCase();
    
    return venues.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match gets highest priority
      if (aName === searchLower && bName !== searchLower) return -1;
      if (bName === searchLower && aName !== searchLower) return 1;
      
      // Starts with query gets second priority
      if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
      if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;
      
      // Contains query gets third priority
      if (aName.includes(searchLower) && !bName.includes(searchLower)) return -1;
      if (bName.includes(searchLower) && !aName.includes(searchLower)) return 1;
      
      // Alphabetical order for ties
      return aName.localeCompare(bName);
    });
  }

  private async searchVenuesMock(query: string): Promise<VenueSearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(word => word.length > 0);
    
    const filtered = this.mockVenues.filter(venue => {
      const nameLower = venue.name.toLowerCase();
      const subtitleLower = venue.subtitle?.toLowerCase() || '';
      
      // Check if any query word matches the name or subtitle
      return queryWords.some(word => 
        nameLower.includes(word) || subtitleLower.includes(word)
      );
    });
    
    // Sort results by relevance
    const sorted = filtered.sort((a, b) => {
      const aNameLower = a.name.toLowerCase();
      const bNameLower = b.name.toLowerCase();
      
      // Exact matches first
      if (aNameLower === queryLower) return -1;
      if (bNameLower === queryLower) return 1;
      
      // Starts with query
      if (aNameLower.startsWith(queryLower)) return -1;
      if (bNameLower.startsWith(queryLower)) return 1;
      
      // Alphabetical order
      return aNameLower.localeCompare(bNameLower);
    });
    
    console.log('📋 Mock results:', sorted.length, 'venues found');
    
    // If no results found and query is not empty, add "add custom venue" option
    if (sorted.length === 0 && query.trim().length > 0) {
      return [{
        id: 'custom-venue',
        name: `"${query}" (Custom Venue)`,
        subtitle: 'Click to add this venue',
        address: undefined,
        city: undefined,
        country: undefined
      }];
    }
    
    return sorted.slice(0, 10); // Limit to 10 results
  }

  // Method to create a custom venue
  createCustomVenue(venueName: string, location?: string): VenueSearchResult {
    const customId = `custom-${Date.now()}`;
    return {
      id: customId,
      name: venueName,
      subtitle: location || 'Custom Venue',
      address: undefined,
      city: location?.split(',')[0]?.trim(),
      country: location?.split(',').pop()?.trim()
    };
  }

  // Method to enable/disable mock data
  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
  }

  // Method to set API keys
  setApiKeys(spotifyClientId: string, spotifyClientSecret: string, googlePlacesKey: string) {
    this.spotifyClientId = spotifyClientId;
    this.spotifyClientSecret = spotifyClientSecret;
    this.googlePlacesApiKey = googlePlacesKey;
  }

  // Clear venue search cache
  clearVenueCache() {
    this.venueSearchCache.clear();
    console.log('🏟️ Venue search cache cleared');
  }

  // Get cache statistics
  getVenueCacheStats() {
    return {
      size: this.venueSearchCache.size,
      entries: Array.from(this.venueSearchCache.keys())
    };
  }
}

export const searchService = new SearchService();
export type { SearchResult, ArtistSearchResult, VenueSearchResult }; 