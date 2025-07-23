const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('./knexfile').development);
const bcrypt = require('bcryptjs');
const axios = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockConcerts = [
  {
    id: '1',
    artist: "Taylor Swift",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    date: "2023-08-07",
    rating: 9.8,
    totalRatings: 1250,
    notes: "Amazing show!",
    images: ["https://picsum.photos/800/600"]
  },
  {
    id: '2',
    artist: "Beyoncé",
    venue: "MetLife Stadium",
    location: "East Rutherford, NJ",
    date: "2023-07-29",
    rating: 9.7,
    totalRatings: 980,
    notes: "Incredible performance",
    images: ["https://picsum.photos/800/600"]
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '2h' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Validation middleware
const validateConcert = (req, res, next) => {
  const { artist, venue, date } = req.body;
  
  if (!artist || !venue || !date) {
    return res.status(400).json({
      message: 'Missing required fields: artist, venue, and date are required'
    });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }

  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.get('/api/concerts/global', (req, res) => {
  res.json(mockConcerts);
});

app.get('/api/concerts/my', (req, res) => {
  res.json(mockConcerts);
});

app.post('/api/concerts', validateConcert, (req, res) => {
  try {
    const { artist, venue, location, date, notes } = req.body;
    
    // Use provided location or derive from venue name as fallback
    const finalLocation = location || (venue.includes(',') ? venue : `${venue}, Unknown City`);
    
    const newConcert = {
      id: Date.now().toString(),
      artist,
      venue,
      location: finalLocation,
      date,
      notes: notes || '',
      rating: 7.0,
      totalRatings: 1,
      images: []
    };

    mockConcerts.unshift(newConcert); // Add to beginning of array
    res.status(201).json(newConcert);
  } catch (error) {
    console.error('Error creating concert:', error);
    res.status(500).json({
      message: 'Failed to create concert',
      error: error.message
    });
  }
});

app.patch('/api/concerts/:id/rating', (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (typeof rating !== 'number' || rating < 0 || rating > 10) {
      return res.status(400).json({
        message: 'Rating must be a number between 0 and 10'
      });
    }
    
    const concert = mockConcerts.find(c => c.id === id);
    if (!concert) {
      return res.status(404).json({ message: 'Concert not found' });
    }

    concert.rating = rating;
    res.json(concert);
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      message: 'Failed to update rating',
      error: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Name, email, phone, and password are required' });
  }
  try {
    const existing = await knex('users').where({ email }).first();
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [id] = await knex('users').insert({ name, email, password: hashedPassword, phone });
    const user = await knex('users').where({ id }).first();
    const token = generateToken(user);
    res.status(201).json({ user: { id: user.id, name, email, phone }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await knex('users').where({ email }).first();
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user);
    res.json({ user: { id: user.id, name: user.name, email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await knex('users').where({ id: req.user.id }).first();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // For stateless JWT, just respond OK
  res.json({ message: 'Logged out' });
});

// Venue search proxy endpoint
app.get('/api/venues/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        message: 'Query parameter is required and must be at least 2 characters' 
      });
    }

    const googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googlePlacesApiKey) {
      return res.status(500).json({ 
        message: 'Google Places API key not configured' 
      });
    }

    console.log('🔍 Calling Google Places API with query:', `${query} venue concert hall`);
    
    // Call Google Places API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: `${query} venue concert hall`,
          key: googlePlacesApiKey,
          type: 'establishment'
        }
      }
    );

    console.log('📡 Google Places API response status:', response.data.status);
    console.log('📡 Google Places API results count:', response.data.results?.length || 0);
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', response.data);
      
      // Check if it's an API key restriction error
      if (response.data.error_message && response.data.error_message.includes('referer restrictions')) {
        console.log('🔄 API key has referer restrictions, falling back to mock data');
        
        // Return mock venue data instead of error
        const mockVenues = [
          {
            id: 'mock-1',
            name: 'Madison Square Garden',
            subtitle: 'New York, NY',
            address: '4 Pennsylvania Plaza, New York, NY 10001',
            city: 'New York',
            country: 'United States'
          },
          {
            id: 'mock-2',
            name: 'Staples Center',
            subtitle: 'Los Angeles, CA',
            address: '1111 S Figueroa St, Los Angeles, CA 90015',
            city: 'Los Angeles',
            country: 'United States'
          },
          {
            id: 'mock-3',
            name: 'O2 Arena',
            subtitle: 'London, UK',
            address: 'Peninsula Square, London SE10 0DX, UK',
            city: 'London',
            country: 'United Kingdom'
          },
          {
            id: 'mock-4',
            name: 'Red Rocks Amphitheatre',
            subtitle: 'Morrison, CO',
            address: '18300 W Alameda Pkwy, Morrison, CO 80465',
            city: 'Morrison',
            country: 'United States'
          },
          {
            id: 'mock-5',
            name: 'Royal Albert Hall',
            subtitle: 'London, UK',
            address: 'Kensington Gore, South Kensington, London SW7 2AP, UK',
            city: 'London',
            country: 'United Kingdom'
          },
          {
            id: 'mock-6',
            name: 'Wembley Stadium',
            subtitle: 'London, UK',
            address: 'London HA9 0WS, UK',
            city: 'London',
            country: 'United Kingdom'
          },
          {
            id: 'mock-7',
            name: 'MetLife Stadium',
            subtitle: 'East Rutherford, NJ',
            address: '1 MetLife Stadium Dr, East Rutherford, NJ 07073',
            city: 'East Rutherford',
            country: 'United States'
          },
          {
            id: 'mock-8',
            name: 'SoFi Stadium',
            subtitle: 'Inglewood, CA',
            address: '1000 S Prairie Ave, Inglewood, CA 90301',
            city: 'Inglewood',
            country: 'United States'
          },
          {
            id: 'mock-9',
            name: 'Mercedes-Benz Stadium',
            subtitle: 'Atlanta, GA',
            address: '1 AMB Dr NW, Atlanta, GA 30313',
            city: 'Atlanta',
            country: 'United States'
          },
          {
            id: 'mock-10',
            name: 'AT&T Stadium',
            subtitle: 'Arlington, TX',
            address: '1 AT&T Way, Arlington, TX 76011',
            city: 'Arlington',
            country: 'United States'
          },
          {
            id: 'mock-11',
            name: 'Brooklyn Steel',
            subtitle: 'Brooklyn, NY',
            address: '319 Frost St, Brooklyn, NY 11222',
            city: 'Brooklyn',
            country: 'United States'
          },
          {
            id: 'mock-12',
            name: 'Brooklyn Paramount',
            subtitle: 'Brooklyn, NY',
            address: '445 Albee Square W, Brooklyn, NY 11201',
            city: 'Brooklyn',
            country: 'United States'
          },
          {
            id: 'mock-13',
            name: 'Barclays Center',
            subtitle: 'Brooklyn, NY',
            address: '620 Atlantic Ave, Brooklyn, NY 11217',
            city: 'Brooklyn',
            country: 'United States'
          },
          {
            id: 'mock-14',
            name: 'Brooklyn Academy of Music',
            subtitle: 'Brooklyn, NY',
            address: '30 Lafayette Ave, Brooklyn, NY 11217',
            city: 'Brooklyn',
            country: 'United States'
          }
        ];
        
        // Filter mock venues based on query
        const filteredVenues = mockVenues.filter(venue =>
          venue.name.toLowerCase().includes(query.toLowerCase()) ||
          venue.subtitle.toLowerCase().includes(query.toLowerCase())
        );
        
        console.log(`📋 Mock venue results: ${filteredVenues.length} venues found for query "${query}"`);
        return res.json(filteredVenues);
      }
      
      return res.status(500).json({ 
        message: 'Failed to search venues',
        error: response.data.error_message || response.data.status
      });
    }

    // Transform the response to match our frontend format
    const venues = (response.data.results || []).map(place => ({
      id: place.place_id,
      name: place.name,
      subtitle: place.formatted_address,
      address: place.formatted_address,
      city: place.address_components?.find(comp => 
        comp.types.includes('locality')
      )?.long_name,
      country: place.address_components?.find(comp => 
        comp.types.includes('country')
      )?.long_name
    }));

    console.log(`Found ${venues.length} venues for query: "${query}"`);
    res.json(venues);

  } catch (error) {
    console.error('Venue search error:', error);
    res.status(500).json({ 
      message: 'Failed to search venues',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('  GET    /api/concerts/global');
  console.log('  GET    /api/concerts/my');
  console.log('  POST   /api/concerts');
  console.log('  PATCH  /api/concerts/:id/rating');
  console.log('  GET    /api/venues/search');
}); 