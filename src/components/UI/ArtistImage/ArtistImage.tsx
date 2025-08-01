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
        console.log('🖼️ ArtistImage: Fetching image for:', artistName);
        const url = await spotifyService.getArtistImageCached(artistName);
        console.log('🖼️ ArtistImage: Got URL:', url);
        
        if (url) {
          // Test if the image loads successfully
          const img = new Image();
          const timeout = setTimeout(() => {
            console.log('🖼️ ArtistImage: Image load timeout, using placeholder');
            setHasError(true);
            setIsLoading(false);
          }, 5000); // 5 second timeout
          
          img.onload = () => {
            console.log('🖼️ ArtistImage: Image loaded successfully');
            clearTimeout(timeout);
            setImageUrl(url);
            setIsLoading(false);
          };
          img.onerror = () => {
            console.log('🖼️ ArtistImage: Image failed to load, using placeholder');
            clearTimeout(timeout);
            setHasError(true);
            setIsLoading(false);
          };
          img.src = url;
        } else {
          console.log('🖼️ ArtistImage: No URL returned, using placeholder');
          setHasError(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching artist image:', error);
        setHasError(true);
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
        {hasError && (
          <div className={styles.errorTooltip}>
            <span>Image unavailable</span>
          </div>
        )}
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