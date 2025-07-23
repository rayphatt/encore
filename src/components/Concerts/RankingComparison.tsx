import React, { useState } from 'react';
import styles from './RankingComparison.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import { getRatingColor, getRatingBackgroundColor } from '../../utils/ratingColors';

interface Concert {
  id: number;
  artist: string;
  venue: string;
  location: string;
  date: string;
  rating?: number;
  images?: string[];
}

interface RankingComparisonProps {
  newConcert: Concert;
  existingConcerts: Concert[];
  onComplete: (finalRating: number) => void;
  onCancel: () => void;
  isEarlyConcert?: boolean; // New prop to indicate if this is 2nd or 3rd concert
}

const RankingComparison: React.FC<RankingComparisonProps> = ({
  newConcert,
  existingConcerts,
  onComplete,
  onCancel,
  isEarlyConcert = false,
}) => {
  const [currentComparison, setCurrentComparison] = useState<number>(0);
  const [betterThan, setBetterThan] = useState<number[]>([]);
  const [worseThan, setWorseThan] = useState<number[]>([]);
  
  const sortedConcerts = [...existingConcerts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const totalComparisons = Math.min(5, existingConcerts.length);
  
  const calculateRating = () => {
    if (betterThan.length === 0 && worseThan.length === 0) {
      return 7.0; // Default rating if no comparisons made
    }

    const betterRatings = betterThan.map(id => 
      existingConcerts.find(c => c.id === id)?.rating || 0
    );
    const worseRatings = worseThan.map(id => 
      existingConcerts.find(c => c.id === id)?.rating || 0
    );

    if (betterRatings.length === 0) {
      return Math.min(...worseRatings) - 0.5;
    }
    if (worseRatings.length === 0) {
      return Math.max(...betterRatings) + 0.5;
    }

    const avgBetter = betterRatings.reduce((a, b) => a + b, 0) / betterRatings.length;
    const avgWorse = worseRatings.reduce((a, b) => a + b, 0) / worseRatings.length;
    return (avgBetter + avgWorse) / 2;
  };

  const handleComparison = (isBetter: boolean) => {
    const currentConcert = sortedConcerts[currentComparison];
    if (isBetter) {
      setBetterThan([...betterThan, currentConcert.id]);
    } else {
      setWorseThan([...worseThan, currentConcert.id]);
    }

    if (currentComparison + 1 < totalComparisons) {
      setCurrentComparison(prev => prev + 1);
    } else {
      const finalRating = calculateRating();
      onComplete(Number(finalRating.toFixed(1)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (existingConcerts.length === 0) {
    onComplete(7.0); // Default rating for first concert
    return null;
  }

  const comparisonConcert = sortedConcerts[currentComparison];
  const concertNumber = existingConcerts.length + 1;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {isEarlyConcert 
          ? `Rank Your ${concertNumber === 2 ? 'Second' : 'Third'} Concert!`
          : 'Which concert was better?'
        }
      </h2>
      <p className={styles.subtitle}>
        {isEarlyConcert 
          ? `Compare this concert with your previous one to establish your rating scale.`
          : `${currentComparison + 1} of ${totalComparisons}`
        }
      </p>

      <div className={styles.comparisonCards}>
        <Card 
          className={styles.concertCard}
          clickable
          onClick={() => handleComparison(true)}
        >
          <h3>{newConcert.artist}</h3>
          <div>
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

        <Card 
          className={styles.concertCard}
          clickable
          onClick={() => handleComparison(false)}
        >
          <h3>{comparisonConcert.artist}</h3>
          <div>
            <p>{comparisonConcert.venue}</p>
            <p>{comparisonConcert.location}</p>
            <p>{formatDate(comparisonConcert.date)}</p>
          </div>
          <div 
            className={styles.rating}
            style={{
              backgroundColor: comparisonConcert.rating ? getRatingBackgroundColor(comparisonConcert.rating) : 'var(--color-border)',
              color: comparisonConcert.rating ? getRatingColor(comparisonConcert.rating) : 'var(--color-text-light)'
            }}
          >
            Rating: {comparisonConcert.rating?.toFixed(1)}
          </div>
          {comparisonConcert.images?.[0] && (
            <div className={styles.imageContainer}>
              <img src={comparisonConcert.images[0]} alt={`${comparisonConcert.artist} concert`} />
            </div>
          )}
        </Card>
      </div>

      <Button 
        secondary 
        onClick={() => {
          if (currentComparison + 1 < totalComparisons) {
            setCurrentComparison(prev => prev + 1);
          } else {
            const finalRating = calculateRating();
            onComplete(Number(finalRating.toFixed(1)));
          }
        }}
        className={styles.skipButton}
      >
        Too Hard
      </Button>
    </div>
  );
};

export default RankingComparison; 