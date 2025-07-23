import React, { useState } from 'react';
import styles from './FirstConcertRating.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import { getRatingColor, getRatingLabel } from '../../utils/ratingColors';

interface Concert {
  id: string;
  artist: string;
  venue: string;
  location: string;
  date: string;
  rating?: number;
  images?: string[];
}

interface FirstConcertRatingProps {
  newConcert: Concert;
  onComplete: (finalRating: number) => void;
  onCancel: () => void;
  concertNumber?: number; // 1, 2, or 3 for the first three concerts
}

const FirstConcertRating: React.FC<FirstConcertRatingProps> = ({
  newConcert,
  onComplete,
  onCancel,
  concertNumber = 1,
}) => {
  const [rating, setRating] = useState(7.0);

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRating(parseFloat(e.target.value));
  };

  const handleSubmit = () => {
    onComplete(rating);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Remove the local getRatingLabel function since we're importing it from utils

  const getTitle = () => {
    switch (concertNumber) {
      case 1:
        return 'Rate Your First Concert!';
      case 2:
        return 'Rate Your Second Concert!';
      case 3:
        return 'Rate Your Third Concert!';
      default:
        return 'Rate Your Concert!';
    }
  };

  const getSubtitle = () => {
    switch (concertNumber) {
      case 1:
        return 'Since this is your first concert, you can set your own rating on a 10.0 scale.';
      case 2:
        return 'Rate this concert on a 10.0 scale to help establish your rating system.';
      case 3:
        return 'Rate this concert on a 10.0 scale. After this, you\'ll rank concerts against each other.';
      default:
        return 'Rate this concert on a 10.0 scale.';
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{getTitle()}</h2>
      <p className={styles.subtitle}>
        {getSubtitle()}
      </p>

      <Card className={styles.concertCard}>
        <h3>{newConcert.artist}</h3>
        <div className={styles.concertDetails}>
          <p>{newConcert.venue}</p>
          <p>{newConcert.location}</p>
          <p>{formatDate(newConcert.date)}</p>
        </div>
        {newConcert.images?.[0] && (
          <div className={styles.imageContainer}>
            <img src={newConcert.images[0]} alt={`${newConcert.artist} concert`} />
          </div>
        )}
      </Card>

      <div className={styles.ratingSection}>
        <div className={styles.ratingDisplay}>
          <span 
            className={styles.ratingValue}
            style={{ color: getRatingColor(rating) }}
          >
            {rating.toFixed(1)}
          </span>
          <span className={styles.ratingLabel}>{getRatingLabel(rating)}</span>
        </div>
        
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={rating}
            onChange={handleRatingChange}
            className={styles.ratingSlider}
          />
          <div className={styles.sliderMarks}>
            <span>0</span>
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
            <span>10</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Save Rating
        </Button>
      </div>
    </div>
  );
};

export default FirstConcertRating; 