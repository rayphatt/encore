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

  const handleVideoPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
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
  const isVideo = currentItem.type === 'video';
  const mediaUrl = currentItem.file ? URL.createObjectURL(currentItem.file) : currentItem.url;

  return (
    <div className={`${styles.carousel} ${className || ''}`}>
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
          {isVideo ? (
            <div className={styles.videoContainer}>
              <video
                ref={videoRef}
                src={mediaUrl}
                className={styles.video}
                onEnded={handleVideoEnded}
                muted
                loop
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
              onClick={() => handleItemClick(currentItem, currentIndex)}
            />
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