import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  type?: 'text' | 'title' | 'avatar' | 'image' | 'button';
  lines?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  type = 'text', 
  lines = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'title':
        return <div className={`${styles.skeleton} ${styles.title} ${className}`} />;
      case 'avatar':
        return <div className={`${styles.skeleton} ${styles.avatar} ${className}`} />;
      case 'image':
        return <div className={`${styles.skeleton} ${styles.image} ${className}`} />;
      case 'button':
        return <div className={`${styles.skeleton} ${styles.button} ${className}`} />;
      case 'text':
      default:
        return (
          <div className={styles.textContainer}>
            {Array.from({ length: lines }, (_, index) => (
              <div 
                key={index} 
                className={`${styles.skeleton} ${styles.text} ${className}`}
                style={{ 
                  width: index === lines - 1 ? '60%' : '100%' 
                }}
              />
            ))}
          </div>
        );
    }
  };

  return renderSkeleton();
};

export default Skeleton; 