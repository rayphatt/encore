# Encore - Personal Concert Ranking App

Encore is a simple web application that lets users rank and keep track of concerts they've attended. The core focus is on providing a personal concert ranking system with global rankings to showcase the best concerts of all time.

## Core MVP Features

### Implemented ✅
- Basic UI components (Button, Input, Card)
- Responsive layout foundation

### MVP Tasks 🎯
1. User Management
   - [ ] Simple signup/login (email only)
   - [ ] Basic user profile to store concert rankings

2. Concert Management
   - [ ] Add concert to personal list
     - Concert name
     - Artist
     - Date attended
     - Venue
     - Personal rating
   - [ ] Edit concert details
   - [ ] Delete concert from list
   - [ ] View personal concert list

3. Ranking System
   - [ ] Rate concerts (e.g., 1-10 scale)
   - [ ] Add personal notes/memories
   - [ ] View concerts sorted by rating
   - [ ] Basic filtering (by date, rating)
   - [ ] Global rankings view showing top-rated concerts
     - Average rating across all users
     - Total number of ratings
     - Unique concert identification by artist, venue, and date

## Project Structure

```
src/
  ├── components/
  │   ├── Auth/         # Basic auth components
  │   ├── Concerts/     # Concert ranking components
  │   ├── Layout/       # Basic layout components
  │   └── UI/           # Reusable UI components
  ├── contexts/         # User/Concert context
  ├── hooks/            # Custom hooks
  └── utils/           # Helper functions
```

## Development Priorities

### Phase 1: Core Features
- [ ] Create "Add Concert" form
- [ ] Implement concert list view
- [ ] Add rating functionality
- [ ] Set up basic data persistence
- [ ] Implement global rankings

### Phase 2: User Management
- [ ] Implement basic auth
- [ ] Create user profile
- [ ] Add data association with user

### Phase 3: Refinement
- [ ] Add sorting/filtering
- [ ] Improve UI/UX
- [ ] Basic error handling
- [ ] Data validation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables (optional but recommended):
   ```bash
   # Windows PowerShell
   .\setup-env.ps1
   
   # Or manually create .env file with your API keys
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

The following environment variables can be configured in your `.env` file:

### Required for Enhanced Features
- `VITE_SPOTIFY_CLIENT_ID` - Your Spotify Client ID (for direct artist links)
- `VITE_SPOTIFY_CLIENT_SECRET` - Your Spotify Client Secret (for direct artist links)

### Optional
- `VITE_LASTFM_API_KEY` - Last.fm API key (for artist search)
- `VITE_GOOGLE_PLACES_API_KEY` - Google Places API key (for venue search)
- `VITE_USE_MOCK_DATA` - Set to `false` to use real APIs (default: `true`)

### Future Monetization
- Ticketmaster affiliate links can be added later for revenue generation

> **Security Note:** Environment files (`.env`, `.env.production`) are automatically excluded from Git to keep your API keys secure.
