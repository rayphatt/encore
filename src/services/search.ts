// Search service for artists and venues
// Using free APIs: Last.fm for artists, Google Places for venues

import { API_CONFIG } from '../config/api';

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
}

class SearchService {
  private lastFmApiKey = API_CONFIG.LASTFM_API_KEY;
  private googlePlacesApiKey = API_CONFIG.GOOGLE_PLACES_API_KEY;

  // For development, we'll use mock data until you get API keys
  private useMockData = Boolean(API_CONFIG.USE_MOCK_DATA);

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
  ];

  async searchArtists(query: string): Promise<ArtistSearchResult[]> {
    console.log('🔍 Searching artists for:', query);
    console.log('🔧 Using mock data:', this.useMockData);
    console.log('🔑 Last.fm API key:', this.lastFmApiKey);
    
    if (this.useMockData) {
      console.log('📋 Using mock artist data');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filtered = this.mockArtists.filter(artist =>
        artist.name.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log('📋 Mock results:', filtered.length, 'artists found');
      return filtered.slice(0, 10); // Limit to 10 results
    }

    console.log('🌐 Using real Last.fm API');
    // Real Last.fm API implementation
    try {
      const response = await fetch(
        `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${encodeURIComponent(query)}&api_key=${this.lastFmApiKey}&format=json&limit=10`
      );
      
      console.log('📡 Last.fm API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      
      const data = await response.json();
      console.log('📡 Last.fm API response data:', data);
      
      const artists = data.results?.artistmatches?.artist || [];
      
      const results = artists.map((artist: any) => ({
        id: artist.mbid || artist.name,
        name: artist.name,
        subtitle: undefined, // Remove listener count
        image: artist.image?.[2]?.['#text'],
        listeners: parseInt(artist.listeners) || 0
      }));
      
      console.log('🌐 Real API results:', results.length, 'artists found');
      return results;
    } catch (error) {
      console.error('❌ Error searching artists:', error);
      return [];
    }
  }

  async searchVenues(query: string): Promise<VenueSearchResult[]> {
    console.log('🏟️ Searching venues for:', query);
    console.log('🔧 Using mock data:', this.useMockData);
    console.log('🔑 Google Places API key:', this.googlePlacesApiKey);
    
    if (this.useMockData) {
      console.log('📋 Using mock venue data');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filtered = this.mockVenues.filter(venue =>
        venue.name.toLowerCase().includes(query.toLowerCase()) ||
        venue.subtitle?.toLowerCase().includes(query.toLowerCase())
      );
      
      console.log('📋 Mock results:', filtered.length, 'venues found');
      return filtered.slice(0, 10); // Limit to 10 results
    }

        console.log('🌐 Using mock venue data (backend not available)');
    
    // For now, use mock data since we're not using the backend
    // In the future, this could be replaced with direct Google Places API calls
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const queryLower = query.toLowerCase();
      const queryWords = queryLower.split(' ').filter(word => word.length > 0);
      
      const filtered = this.mockVenues.filter(venue => {
        const nameLower = venue.name.toLowerCase();
        const subtitleLower = venue.subtitle?.toLowerCase() || '';
        
        return queryWords.some(word => 
          nameLower.includes(word) || subtitleLower.includes(word)
        );
      });
      
      const sorted = filtered.sort((a, b) => {
        const aNameLower = a.name.toLowerCase();
        const bNameLower = b.name.toLowerCase();
        
        if (aNameLower === queryLower) return -1;
        if (bNameLower === queryLower) return 1;
        
        if (aNameLower.startsWith(queryLower)) return -1;
        if (bNameLower.startsWith(queryLower)) return 1;
        
        return aNameLower.localeCompare(bNameLower);
      });
      
      console.log('📋 Mock venue results:', sorted.length, 'venues found');
      return sorted.slice(0, 10);
    } catch (error) {
      console.error('❌ Error searching venues:', error);
      console.log('🔄 Returning empty results due to error');
      return [];
    }
  }

  // Method to enable/disable mock data
  setUseMockData(useMock: boolean) {
    this.useMockData = useMock;
  }

  // Method to set API keys
  setApiKeys(lastFmKey: string, googlePlacesKey: string) {
    this.lastFmApiKey = lastFmKey;
    this.googlePlacesApiKey = googlePlacesKey;
    this.useMockData = false;
  }
}

export const searchService = new SearchService();
export type { SearchResult, ArtistSearchResult, VenueSearchResult }; 