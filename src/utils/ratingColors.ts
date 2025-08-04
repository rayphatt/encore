// Rating color utility functions
export const getRatingColor = (rating: number): string => {
  if (rating >= 7.0) return 'var(--color-success)'; // Green for high scores
  if (rating >= 5.0) return 'var(--color-warning)'; // Yellow for medium scores
  return 'var(--color-error)'; // Red for low scores
};

export const getRatingBackgroundColor = (rating: number): string => {
  if (rating >= 7.0) return 'var(--color-success-light)'; // Light green background
  if (rating >= 5.0) return 'var(--color-warning-light)'; // Light yellow background
  return 'var(--color-error-light)'; // Light red background
};

export const getRatingLabel = (rating: number): string => {
  if (rating >= 9.0) return 'Incredible!';
  if (rating >= 8.5) return 'Amazing!';
  if (rating >= 8.0) return 'Excellent!';
  if (rating >= 7.5) return 'Great!';
  if (rating >= 7.0) return 'Good';
  if (rating >= 6.0) return 'Okay';
  if (rating >= 5.0) return 'Average';
  if (rating >= 4.0) return 'Not great';
  if (rating >= 3.0) return 'Poor';
  if (rating >= 2.0) return 'Bad';
  return 'Terrible';
};

// Bracket utility functions
export type Bracket = 'Good' | 'Ok' | 'Bad';

export const getBracketFromRating = (rating: number): Bracket => {
  if (rating >= 7.0) return 'Good';
  if (rating >= 5.0) return 'Ok';
  return 'Bad';
};

export const getBracketBoundaries = (bracket: Bracket): { min: number; max: number } => {
  switch (bracket) {
    case 'Good':
      return { min: 7.0, max: 10.0 };
    case 'Ok':
      return { min: 5.0, max: 6.9 };
    case 'Bad':
      return { min: 0.0, max: 4.9 };
    default:
      return { min: 0.0, max: 10.0 };
  }
};

export const getBracketDescription = (bracket: Bracket): string => {
  switch (bracket) {
    case 'Good':
      return 'Concerts you really enjoyed (7.0-10.0)';
    case 'Ok':
      return 'Concerts that were decent (5.0-6.9)';
    case 'Bad':
      return 'Concerts you didn\'t enjoy (0.0-4.9)';
    default:
      return '';
  }
};

export const getBracketColor = (bracket: Bracket): string => {
  switch (bracket) {
    case 'Good':
      return 'var(--color-success)';
    case 'Ok':
      return 'var(--color-warning)';
    case 'Bad':
      return 'var(--color-error)';
    default:
      return 'var(--color-text)';
  }
}; 