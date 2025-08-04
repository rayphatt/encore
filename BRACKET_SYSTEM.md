# Bracket-Based Ranking System

## Overview

The concert ranking app now uses a bracket-based system similar to Beli's approach. This ensures that users compare concerts within similar quality ranges, making the ranking process more intuitive and accurate.

## How It Works

### 1. Bracket Selection
When adding a new concert, users first choose which bracket their concert belongs to:
- **Good** (7.0-10.0): Concerts you really enjoyed
- **Ok** (5.0-6.9): Concerts that were decent  
- **Bad** (0.0-4.9): Concerts you didn't enjoy

### 2. Smart Comparison
- The system primarily compares concerts within the same bracket
- If there aren't enough concerts in the same bracket, it includes concerts from adjacent brackets
- This prevents comparing a "Bad" concert against a "Good" concert, which would be meaningless

### 3. Rating Calculation
- Ratings are calculated within bracket boundaries
- A "Good" concert will never get rated below 7.0
- A "Bad" concert will never get rated above 4.9
- This ensures logical consistency

## Technical Implementation

### Bracket Boundaries
```typescript
Good: 7.0 - 10.0
Ok:   5.0 - 6.9  
Bad:  0.0 - 4.9
```

### Components
- `BracketSelection.tsx`: UI for selecting concert bracket
- `RankingComparison.tsx`: Updated to filter comparisons by bracket
- `ratingColors.ts`: Added bracket utility functions

### Data Structure
Concerts now include a `bracket` field:
```typescript
interface Concert {
  // ... other fields
  bracket?: 'Good' | 'Ok' | 'Bad';
}
```

## User Experience Flow

1. **Add Concert**: User fills out concert details
2. **Choose Bracket**: User selects Good/Ok/Bad
3. **Compare**: System shows comparisons within the same bracket
4. **Calculate Rating**: Final rating is calculated within bracket boundaries
5. **Save**: Concert is saved with both rating and bracket

## Benefits

- **More Accurate Rankings**: Users compare similar quality concerts
- **Logical Consistency**: Ratings stay within meaningful ranges
- **Better UX**: Easier to make meaningful comparisons
- **Scalable**: Works well as users add more concerts

## Future Enhancements

- Dynamic bracket boundaries based on user's concert distribution
- Cross-bracket comparisons when users consistently rank outside their chosen bracket
- Bracket visualization in the UI
- Bracket-based filtering and sorting 