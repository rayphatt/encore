import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { firebaseConcertService, Concert } from '../services/firebase';
import { useAuth } from './AuthContext';

interface ConcertContextType {
  // Concert lists
  personalConcerts: Concert[];
  globalRankings: Concert[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchPersonalConcerts: () => Promise<void>;
  fetchGlobalRankings: () => Promise<void>;
  createConcert: (data: Omit<Concert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Concert>;
  updateConcert: (id: string, data: Partial<Concert>) => Promise<Concert>;
  updateRating: (id: string, rating: number) => Promise<void>;
  deleteConcert: (id: string) => Promise<void>;
  clearError: () => void;
}

const ConcertContext = createContext<ConcertContextType | undefined>(undefined);

export const ConcertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [personalConcerts, setPersonalConcerts] = useState<Concert[]>([]);
  const [globalRankings, setGlobalRankings] = useState<Concert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'An error occurred';
    setError(message);
    throw error;
  };

  const fetchPersonalConcerts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await firebaseConcertService.getUserConcerts(user.id);
      setPersonalConcerts(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchGlobalRankings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await firebaseConcertService.getGlobalRankings();
      setGlobalRankings(data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      fetchPersonalConcerts();
    }
    fetchGlobalRankings();
  }, [fetchPersonalConcerts, fetchGlobalRankings, user]);

  const createConcert = async (data: Omit<Concert, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be logged in to create concerts');
    
    try {
      setIsLoading(true);
      setError(null);
      const newConcert = await firebaseConcertService.createConcert(user.id, data);
      setPersonalConcerts(prev => [newConcert, ...prev]);
      return newConcert;
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRating = async (id: string, rating: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseConcertService.updateConcertRating(id, rating);
      setPersonalConcerts(prev =>
        prev.map(concert => (concert.id === id ? { ...concert, rating } : concert))
      );
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConcert = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseConcertService.deleteConcert(id);
      setPersonalConcerts(prev => prev.filter(concert => concert.id !== id));
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConcert = async (id: string, data: Partial<Concert>) => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseConcertService.updateConcert(id, data);
      
      // Update local state
      setPersonalConcerts(prev =>
        prev.map(concert => (concert.id === id ? { ...concert, ...data } : concert))
      );
      
      // Return the updated concert
      const updatedConcert = personalConcerts.find(c => c.id === id);
      if (!updatedConcert) throw new Error('Concert not found');
      return { ...updatedConcert, ...data };
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    personalConcerts,
    globalRankings,
    isLoading,
    error,
    fetchPersonalConcerts,
    fetchGlobalRankings,
    createConcert,
    updateConcert,
    updateRating,
    deleteConcert,
    clearError,
  };

  return <ConcertContext.Provider value={value}>{children}</ConcertContext.Provider>;
};

export const useConcerts = () => {
  const context = useContext(ConcertContext);
  if (context === undefined) {
    throw new Error('useConcerts must be used within a ConcertProvider');
  }
  return context;
}; 