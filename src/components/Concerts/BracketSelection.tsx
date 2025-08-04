import React from 'react';
import styles from './BracketSelection.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import { Bracket, getBracketDescription, getBracketColor } from '../../utils/ratingColors';
import { Concert } from '../../types/concert';

interface BracketSelectionProps {
  newConcert: Concert;
  onBracketSelected: (bracket: Bracket) => void;
  onCancel: () => void;
}

const BracketSelection: React.FC<BracketSelectionProps> = ({
  newConcert,
  onBracketSelected,
  onCancel,
}) => {
  const brackets: Bracket[] = ['Good', 'Ok', 'Bad'];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>How was this concert?</h2>
      <p className={styles.subtitle}>
        Choose a category to help us rank it against similar concerts.
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

      <div className={styles.bracketOptions}>
        {brackets.map((bracket) => (
          <Card
            key={bracket}
            className={styles.bracketCard}
            clickable
            onClick={() => onBracketSelected(bracket)}
          >
            <div 
              className={styles.bracketHeader}
              style={{ color: getBracketColor(bracket) }}
            >
              <h3>{bracket}</h3>
            </div>
            <p className={styles.bracketDescription}>
              {getBracketDescription(bracket)}
            </p>
          </Card>
        ))}
      </div>

      <div className={styles.actions}>
        <Button secondary onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default BracketSelection; 