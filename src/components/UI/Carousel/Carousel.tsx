import React, { useState, useRef, useEffect } from 'react';
import styles from './Carousel.module.css';

interface MediaItem {
  file?: File;
  url?: string;
  type: 'image' | 'video';
}

interface CarouselProps {
  items: MediaItem[];
  onItemClick?: (item: MediaItem, index: number) => void;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ items, onItemClick, className }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };

  const handleItemClick = (item: MediaItem, index: number) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  const handleCarouselClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          // Ensure video is loaded before playing
          if (videoRef.current.readyState >= 2) {
            videoRef.current.play().catch(error => {
              console.error('Video play error:', error);
              setIsPlaying(false);
            });
            setIsPlaying(true);
          } else {
            // Wait for video to load
            videoRef.current.addEventListener('canplay', () => {
              videoRef.current?.play().catch(error => {
                console.error('Video play error:', error);
                setIsPlaying(false);
              });
              setIsPlaying(true);
            }, { once: true });
          }
        }
      } catch (error) {
        console.error('Video play error:', error);
        setIsPlaying(false);
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  // Reset video state when current item changes
  useEffect(() => {
    setIsPlaying(false);
  }, [currentIndex]);

  if (items.length === 0) return null;

  console.log('Carousel items:', items.length, items);
  console.log('Current index:', currentIndex);

  const currentItem = items[currentIndex];
  if (!currentItem) {
    console.warn('Carousel: currentItem is undefined', { currentIndex, items });
    return null;
  }

  // Note: We're always using grid layout now, so these variables aren't needed
  // but keeping them for potential future use
  const isVideo = currentItem.type === 'video';
  const mediaUrl = currentItem.file ? URL.createObjectURL(currentItem.file) : currentItem.url;

  return (
    <div className={`${styles.carousel} ${className || ''}`} onClick={handleCarouselClick}>
      <div className={styles.carouselContainer}>
        {/* Main content */}
        <div className={styles.carouselContent}>
          {/* Always show grid layout for consistent sizing */}
          <div 
            className={`${styles.mediaGrid} ${items.length === 1 ? styles.singleItem : ''}`}
            style={items.length === 1 ? {
              backgroundColor: 'rgba(0, 255, 0, 0.5)',
              border: '3px solid green',
              gridTemplateColumns: 'repeat(auto-fill, 150px)',
              justifyContent: 'start',
              height: 'auto',
              minHeight: '150px',
              gap: '8px'
            } : {}}
          >
            {items.map((item, index) => {
              const itemUrl = item.file ? URL.createObjectURL(item.file) : item.url;
              const isItemVideo = item.type === 'video';
              
              return (
                <div 
                  key={index} 
                  className={styles.gridItem}
                  style={items.length === 1 ? {
                    width: '150px',
                    height: '150px',
                    borderRadius: '8px'
                  } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCurrentIndex(index);
                    handleItemClick(item, index);
                  }}
                >
                  {isItemVideo ? (
                    <div className={styles.gridVideoContainer}>
                      <video
                        src={itemUrl}
                        className={styles.gridVideo}
                        muted
                        preload="metadata"
                        playsInline
                      />
                      <div className={styles.gridPlayButton}>▶</div>
                    </div>
                  ) : (
                    <img 
                      src={itemUrl} 
                      alt={`Media ${index + 1}`} 
                      className={styles.gridImage}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* No dots indicator needed for grid layout */}
    </div>
  );
};

export default Carousel; 