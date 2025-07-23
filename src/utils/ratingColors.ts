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