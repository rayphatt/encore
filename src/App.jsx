import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './components/Home/Home';
// Placeholder imports for new pages
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Profile from './components/Profile/Profile';
// Legal pages
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import TermsOfService from './components/Legal/TermsOfService';
import CookiePolicy from './components/Legal/CookiePolicy';
// Route protection components
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import PublicRoute from './components/PublicRoute/PublicRoute';
// Error handling and onboarding
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import OnboardingModal from './components/Onboarding/OnboardingModal';
import { useAuth } from './contexts/AuthContext';

// Simple landing page component
const Landing = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: '2rem',
    textAlign: 'center'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵 Encore</h1>
    <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px' }}>
      Your personal concert memory collection. Rank and remember every amazing show you've seen.
    </p>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button 
        onClick={() => window.location.href = '/signup'}
        style={{
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Get Started
      </button>
      <button 
        onClick={() => window.location.href = '/login'}
        style={{
          padding: '12px 24px',
          fontSize: '1rem',
          backgroundColor: 'transparent',
          color: '#007bff',
          border: '2px solid #007bff',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        Sign In
      </button>
    </div>
  </div>
);

function App() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user should see onboarding
  useEffect(() => {
    if (user) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <ErrorBoundary>
      <MainLayout>
        <Routes>
          {/* Protected routes - require authentication */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Public routes - redirect authenticated users */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } />
          
          {/* Legal pages - always accessible */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
        </Routes>

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      </MainLayout>
    </ErrorBoundary>
  );
}

export default App;
