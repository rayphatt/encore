import React, { useState, useEffect } from 'react';
import styles from './ArtistImage.module.css';
import { spotifyService } from '../../../services/spotify';

interface ArtistImageProps {
  artistName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const ArtistImage: React.FC<ArtistImageProps> = ({ 
  artistName, 
  size = 'medium',
  className = ''
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchArtistImage = async () => {
      if (!artistName.trim()) return;
      
      setIsLoading(true);
      setHasError(false);
      
      try {
        const url = await spotifyService.getArtistImageCached(artistName);
        setImageUrl(url);
      } catch (error) {
        console.error('Error fetching artist image:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtistImage();
  }, [artistName]);

  const sizeClass = styles[size];
  const containerClass = `${styles.artistImage} ${sizeClass} ${className}`;

  if (isLoading) {
    return (
      <div className={`${containerClass} ${styles.loading}`}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (hasError || !imageUrl) {
    return (
      <div className={`${containerClass} ${styles.placeholder}`}>
        <span className={styles.placeholderText}>
          {artistName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={containerClass} style={{ width: 'fit-content', height: 'fit-content' }}>
      <img 
        src={imageUrl} 
        alt={`${artistName} profile`}
        className={styles.image}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default ArtistImage; 