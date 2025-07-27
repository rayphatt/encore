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

  const currentItem = items[currentIndex];
  if (!currentItem) {
    console.warn('Carousel: currentItem is undefined', { currentIndex, items });
    return null;
  }

  const isVideo = currentItem.type === 'video';
  const mediaUrl = currentItem.file ? URL.createObjectURL(currentItem.file) : currentItem.url;

  return (
    <div className={`${styles.carousel} ${className || ''}`} onClick={handleCarouselClick}>
      <div className={styles.carouselContainer}>
        {/* Previous button */}
        {items.length > 1 && (
          <button 
            className={`${styles.carouselButton} ${styles.prevButton}`}
            onClick={prevSlide}
            aria-label="Previous"
          >
            ‹
          </button>
        )}

        {/* Main content */}
        <div className={styles.carouselContent}>
          {items.length === 1 ? (
            // Single item - show full size
            isVideo ? (
              <div className={styles.videoContainer}>
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  className={styles.video}
                  onEnded={handleVideoEnded}
                  onError={(e) => console.error('Video error:', e)}
                  onLoadStart={() => console.log('Video loading started')}
                  onCanPlay={() => console.log('Video can play')}
                  muted
                  loop
                  preload="metadata"
                  playsInline
                  webkit-playsinline="true"
                />
                <button 
                  className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                  onClick={handleVideoPlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
              </div>
            ) : (
              <img 
                src={mediaUrl} 
                alt="Carousel item" 
                className={styles.image}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleItemClick(currentItem, currentIndex);
                }}
              />
            )
          ) : (
            // Multiple items - show grid
            <div className={styles.mediaGrid}>
              {items.map((item, index) => {
                const itemUrl = item.file ? URL.createObjectURL(item.file) : item.url;
                const isItemVideo = item.type === 'video';
                
                return (
                  <div 
                    key={index} 
                    className={styles.gridItem}
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
          )}
        </div>

        {/* Next button */}
        {items.length > 1 && (
          <button 
            className={`${styles.carouselButton} ${styles.nextButton}`}
            onClick={nextSlide}
            aria-label="Next"
          >
            ›
          </button>
        )}
      </div>

      {/* Dots indicator */}
      {items.length > 1 && (
        <div className={styles.dots}>
          {items.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel; 