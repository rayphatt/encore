import React, { useState } from 'react';
import styles from './OnboardingModal.module.css';
import Modal from '../UI/Modal/Modal';
import Button from '../UI/Button/Button';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen, 
  onComplete, 
  onSkip 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Encore! 🎵",
      content: "Track and rank every concert you've ever seen using our unique bracket system.",
      image: "🎵"
    },
    {
      title: "How Ranking Works",
      content: "Choose Good (7-10), Ok (5-6.9), or Bad (0-4.9) for each concert, then compare them to build your perfect ranking.",
      image: "🏆"
    },
    {
      title: "Add Your First Concert",
      content: "Start by adding a concert you've been to. Include photos, videos, and memories to make it special.",
      image: "📸"
    },
    {
      title: "Compare & Rank",
      content: "We'll ask you to compare concerts to determine their exact position in your ranking. It's like a tournament bracket!",
      image: "⚖️"
    },
    {
      title: "You're All Set!",
      content: "Start building your concert collection and see how your rankings compare to others worldwide.",
      image: "🎉"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleComplete = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal isOpen={isOpen} onClose={handleSkip}>
      <div className={styles.onboarding}>
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`${styles.step} ${index <= currentStep ? styles.active : ''}`}
              />
            ))}
          </div>
          <button className={styles.skipButton} onClick={handleSkip}>
            Skip
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.image}>
            {currentStepData.image}
          </div>
          <h2 className={styles.title}>{currentStepData.title}</h2>
          <p className={styles.description}>{currentStepData.content}</p>
        </div>

        <div className={styles.actions}>
          {!isLastStep ? (
            <Button onClick={handleNext} className={styles.nextButton}>
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete} className={styles.completeButton}>
              Get Started!
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal; 