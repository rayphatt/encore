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
2. Start development servers (frontend and backend together):
   ```bash
   npm run dev:all
   ```
   
   > **Note for PowerShell users:** The '&&' operator does not work in PowerShell. The 'dev:all' script uses a cross-platform solution and should work in all shells.

3. Build for production:
   ```bash
   npm run build
   ```
