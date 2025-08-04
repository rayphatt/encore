import { Bracket } from '../utils/ratingColors';

export interface Concert {
  id: string;
  userId?: string;
  artist: string;
  venue: string;
  location: string;
  date: string;
  rating?: number;
  bracket?: Bracket;
  notes?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Aggregate fields for global rankings
  totalRatings?: number;
  averageRating?: number;
  // Additional fields for the app
  additionalArtists?: string[];
} 