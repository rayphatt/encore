import React, { useState, useEffect } from 'react';
import styles from './RankingComparison.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import { getRatingColor, getRatingBackgroundColor, Bracket, getBracketFromRating, getBracketBoundaries } from '../../utils/ratingColors';
import { Concert } from '../../types/concert';

interface RankingComparisonProps {
  newConcert: Concert;
  existingConcerts: Concert[];
  selectedBracket: Bracket;
  onComplete: (finalRating: number) => void;
  onCancel: () => void;
  isEarlyConcert?: boolean;
}

const RankingComparison: React.FC<RankingComparisonProps> = ({
  newConcert,
  existingConcerts,
  selectedBracket,
  onComplete,
  onCancel,
  isEarlyConcert = false,
}) => {
  console.log('🎯 RankingComparison rendered with:', {
    newConcert: newConcert.artist,
    selectedBracket,
    existingConcertsCount: existingConcerts.length,
    isEarlyConcert
  });
  
  const [currentComparison, setCurrentComparison] = useState<number>(0);
  const [betterThan, setBetterThan] = useState<string[]>([]);
  const [worseThan, setWorseThan] = useState<string[]>([]);
  const [comparisonConcerts, setComparisonConcerts] = useState<Concert[]>([]);
  
  // Filter concerts by bracket and sort by rating
  useEffect(() => {
    const bracketConcerts = existingConcerts.filter(concert => {
      const concertBracket = concert.bracket || getBracketFromRating(concert.rating || 0);
      return concertBracket === selectedBracket;
    });
    
    // If not enough concerts in the same bracket, include concerts from adjacent brackets
    let finalComparisonConcerts = [...bracketConcerts];
    
    if (finalComparisonConcerts.length < 3) {
      const allConcerts = [...existingConcerts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      const additionalConcerts = allConcerts.filter(concert => 
        !finalComparisonConcerts.some(c => c.id === concert.id)
      );
      finalComparisonConcerts = [...finalComparisonConcerts, ...additionalConcerts.slice(0, 3 - finalComparisonConcerts.length)];
    }
    
    setComparisonConcerts(finalComparisonConcerts);
  }, [existingConcerts, selectedBracket]);
  
  const totalComparisons = Math.min(5, comparisonConcerts.length);
  
  const calculateRating = () => {
    if (betterThan.length === 0 && worseThan.length === 0) {
      // Default to middle of bracket if no comparisons made
      const { min, max } = getBracketBoundaries(selectedBracket);
      return (min + max) / 2;
    }

    const betterRatings = betterThan.map(id => 
      comparisonConcerts.find(c => c.id === id)?.rating || 0
    );
    const worseRatings = worseThan.map(id => 
      comparisonConcerts.find(c => c.id === id)?.rating || 0
    );

    const { min, max } = getBracketBoundaries(selectedBracket);

    if (betterRatings.length === 0) {
      return Math.max(min, Math.min(...worseRatings) - 0.5);
    }
    if (worseRatings.length === 0) {
      return Math.min(max, Math.max(...betterRatings) + 0.5);
    }

    const avgBetter = betterRatings.reduce((a, b) => a + b, 0) / betterRatings.length;
    const avgWorse = worseRatings.reduce((a, b) => a + b, 0) / worseRatings.length;
    const calculatedRating = (avgBetter + avgWorse) / 2;
    
    // Ensure rating stays within bracket boundaries
    return Math.max(min, Math.min(max, calculatedRating));
  };

  const handleComparison = (isBetter: boolean) => {
    const currentConcert = comparisonConcerts[currentComparison];
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

  if (comparisonConcerts.length === 0) {
    // If no concerts to compare against, use bracket boundaries to calculate a default rating
    const { min, max } = getBracketBoundaries(selectedBracket);
    const defaultRating = (min + max) / 2;
    onComplete(Number(defaultRating.toFixed(1)));
    return null;
  }

  const comparisonConcert = comparisonConcerts[currentComparison];
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