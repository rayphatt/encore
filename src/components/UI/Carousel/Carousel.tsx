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
  const [playingVideos, setPlayingVideos] = useState<{ [key: number]: boolean }>({});
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

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

  const handleVideoPlay = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    
    const videoRef = videoRefs.current[index];
    if (videoRef) {
      try {
        if (playingVideos[index]) {
          videoRef.pause();
          setPlayingVideos(prev => ({ ...prev, [index]: false }));
        } else {
          // Ensure video is loaded before playing
          if (videoRef.readyState >= 2) {
            videoRef.play().catch(error => {
              console.error('Video play error:', error);
              setPlayingVideos(prev => ({ ...prev, [index]: false }));
            });
            setPlayingVideos(prev => ({ ...prev, [index]: true }));
          } else {
            // Wait for video to load
            videoRef.addEventListener('canplay', () => {
              videoRef.play().catch(error => {
                console.error('Video play error:', error);
                setPlayingVideos(prev => ({ ...prev, [index]: false }));
              });
              setPlayingVideos(prev => ({ ...prev, [index]: true }));
            }, { once: true });
          }
        }
      } catch (error) {
        console.error('Video play error:', error);
        setPlayingVideos(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  const handleVideoEnded = (index: number) => {
    setPlayingVideos(prev => ({ ...prev, [index]: false }));
  };

  const handleVideoPause = (index: number) => {
    setPlayingVideos(prev => ({ ...prev, [index]: false }));
  };

  // Reset video state when current item changes
  useEffect(() => {
    setPlayingVideos({});
  }, [currentIndex]);

  if (items.length === 0) return null;

  console.log('Carousel items:', items.length, items);
  console.log('Current index:', currentIndex);
  console.log('Is single item:', items.length === 1);
  console.log('Single item class:', items.length === 1 ? styles.singleItem : '');
  
  // Debug video detection
  items.forEach((item, index) => {
    if (item.type === 'video') {
      console.log(`Item ${index} is video:`, item);
    } else {
      console.log(`Item ${index} is image:`, item);
    }
  });

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
            className={`${styles.mediaGrid} ${items.length <= 5 ? styles.singleItem : ''}`}
            style={items.length <= 5 ? {
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
              const isVideoPlaying = playingVideos[index];
              
              return (
                <div 
                  key={index} 
                  className={styles.gridItem}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    ...(items.length <= 5 ? {
                      width: '150px',
                      height: '150px'
                    } : {})
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.overflow = 'visible';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.overflow = 'hidden';
                  }}
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
                        ref={(el) => {
                          videoRefs.current[index] = el;
                        }}
                        src={itemUrl}
                        className={styles.gridVideo}
                        muted
                        preload="metadata"
                        playsInline
                        onEnded={() => handleVideoEnded(index)}
                        onPause={() => handleVideoPause(index)}
                        style={{
                          borderRadius: '8px',
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <button
                        className={`${styles.gridPlayButton} ${isVideoPlaying ? styles.playing : ''}`}
                        onClick={(e) => handleVideoPlay(e, index)}
                      >
                        {isVideoPlaying ? '⏸' : '▶'}
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.overflow = 'visible';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.overflow = 'hidden';
                    }}>
                      <img 
                        src={itemUrl} 
                        alt={`Media ${index + 1}`} 
                        className={styles.gridImage}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </div>
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