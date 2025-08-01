import React from 'react';
import styles from './ConcertDetails.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import { getRatingColor, getRatingBackgroundColor } from '../../utils/ratingColors';
import ArtistImage from '../UI/ArtistImage/ArtistImage';
import ArtistLinks from '../UI/ArtistLinks/ArtistLinks';

const ConcertDetails = ({ concert, onClose, onEdit }) => {
  if (!concert) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.overlay}>
      <Card className={styles.detailsCard}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.artistHeader}>
              <ArtistImage artistName={concert.artist} size="large" className={styles.artistImageContainer} />
              <div className={styles.artistInfo}>
                <div className={styles.artistNameRow}>
                  <h2>{concert.artist}</h2>
                  <ArtistLinks artistName={concert.artist} />
                </div>
                {concert.notes && (concert.notes.includes('Other Artists:') || concert.notes.includes('Openers:')) && (
                  <p className={styles.openers}>
                    <strong>Other Artists:</strong> {concert.notes.includes('Other Artists:') ? concert.notes.split('Other Artists:')[1] : concert.notes.split('Openers:')[1]}
                  </p>
                )}
              </div>
            </div>
            <div 
              className={styles.rating}
              style={{
                backgroundColor: concert.rating ? getRatingBackgroundColor(concert.rating) : 'var(--color-border)',
                color: concert.rating ? getRatingColor(concert.rating) : 'var(--color-text-light)'
              }}
            >
              <span className={styles.ratingValue}>
                {concert.rating ? concert.rating.toFixed(1) : 'No rating'}
              </span>
              <span className={styles.ratingLabel}>/ 10.0</span>
            </div>
          </div>
          <Button secondary onClick={onClose}>Close</Button>
        </div>

        <div className={styles.content}>
          <div className={styles.mainInfo}>
            <div className={styles.infoGroup}>
              <label>Venue</label>
              <p>{concert.venue}</p>
            </div>
            <div className={styles.infoGroup}>
              <label>Date</label>
              <p>{formatDate(concert.date)}</p>
            </div>
          </div>

          <div className={styles.notesSection}>
            <label>Notes</label>
            {concert.notes && (
              <>
                {(concert.notes.includes('Other Artists:') || concert.notes.includes('Openers:')) ? (
                  <p className={styles.notes}>
                    {concert.notes.includes('Other Artists:') ? concert.notes.split('\n\nOther Artists:')[0] : concert.notes.split('\n\nOpeners:')[0]}
                  </p>
                ) : (
                  <p className={styles.notes}>{concert.notes}</p>
                )}
              </>
            )}
          </div>

          <div className={styles.mediaSection}>
            <h3>Photos & Memories</h3>
            {concert.images && concert.images.length > 0 ? (
              <div className={styles.photoGallery}>
                {concert.images.map((image, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img 
                      src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                      alt={`Concert photo ${index + 1}`} 
                    />
                  </div>
                ))}
                <Button 
                  secondary 
                  fullWidth
                  onClick={() => onEdit(concert)}
                  className={styles.addMorePhotos}
                >
                  <span className={styles.uploadIcon}>+</span>
                  Add More Photos
                </Button>
              </div>
            ) : (
              <div className={styles.uploadArea}>
                <Button 
                  secondary 
                  fullWidth
                  onClick={() => onEdit(concert)}
                >
                  <span className={styles.uploadIcon}>+</span>
                  Add Photos
                </Button>
              </div>
            )}
          </div>

          <div className={styles.setlistSection}>
            <h3>Setlist</h3>
            <p className={styles.placeholder}>
              Add songs you remember from the concert
            </p>
            <Button secondary fullWidth>Add Setlist</Button>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => onEdit(concert)}>Edit Concert</Button>
          <Button secondary>Share Memory</Button>
        </div>
      </Card>
    </div>
  );
};

export default ConcertDetails; 