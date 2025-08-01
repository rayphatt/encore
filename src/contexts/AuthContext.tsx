import React, { createContext, useContext, useState, useEffect } from 'react';
import { firebaseAuthService, User } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = firebaseAuthService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleError = (error: unknown) => {
    let message = 'An error occurred';
    
    if (error instanceof Error) {
      // Handle Firebase Auth error codes
      if (error.message.includes('auth/')) {
        const errorCode = error.message.match(/auth\/([^)]+)/)?.[1];
        switch (errorCode) {
          case 'email-already-in-use':
            message = 'An account with this email already exists. Please try logging in instead.';
            break;
          case 'invalid-email':
            message = 'Please enter a valid email address.';
            break;
          case 'weak-password':
            message = 'Password should be at least 6 characters long.';
            break;
          case 'user-not-found':
            message = 'No account found with this email. Please check your email or sign up.';
            break;
          case 'wrong-password':
            message = 'Incorrect password. Please try again.';
            break;
          case 'too-many-requests':
            message = 'Too many failed attempts. Please try again later.';
            break;
          case 'network-request-failed':
            message = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            message = 'Authentication failed. Please try again.';
        }
      } else {
        message = error.message;
      }
    }
    
    setError(message);
    throw error;
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseAuthService.login(email, password);
      // User will be set by the auth state listener
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, phone: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseAuthService.register(email, password, name, phone);
      // User will be set by the auth state listener
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await firebaseAuthService.logout();
      // User will be cleared by the auth state listener
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 