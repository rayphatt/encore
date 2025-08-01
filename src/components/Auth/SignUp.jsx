import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';
import { useAuth } from '../../contexts/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, user } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Clear form error when auth error changes
  useEffect(() => {
    if (error) {
      setFormError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('Input change - name:', name, 'value:', value, 'type:', typeof name); // More detailed debug
    setFormData(prev => {
      console.log('Previous state:', prev); // Debug previous state
      const newState = {
        ...prev,
        [name]: value
      };
      console.log('New state:', newState); // Debug new state
      return newState;
    });
    // Clear form error when user starts typing
    if (formError) {
      setFormError('');
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setFormError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setFormError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone number is required');
      return false;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateForm()) {
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        `${formData.firstName} ${formData.lastName}`,
        formData.phone
      );
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error will be handled by the useEffect watching the error state
      console.error('Registration failed:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.authContainer}>
        <Card className={styles.authCard}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Creating your account...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      {console.log('Current formData:', formData)} {/* Debug log */}
      <Card className={styles.authCard}>
        <div className={styles.header}>
          <h1>Join Encore</h1>
          <p>Start ranking your concert memories in seconds</p>
        </div>

        {formError && (
          <div className={styles.error}>
            <div className={styles.errorIcon}>⚠️</div>
            <div className={styles.errorContent}>
              <p className={styles.errorTitle}>Sign Up Failed</p>
              <p className={styles.errorMessage}>{formError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameRow}>
            <Input
              label="First Name"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="John"
              required
              error={formError && !formData.firstName.trim() ? 'First name is required' : ''}
              disabled={isLoading}
            />
            <Input
              label="Last Name"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Doe"
              required
              error={formError && !formData.lastName.trim() ? 'Last name is required' : ''}
              disabled={isLoading}
            />
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="john@example.com"
            required
            error={formError && !formData.email.trim() ? 'Email is required' : ''}
            disabled={isLoading}
          />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="(555) 123-4567"
            required
            error={formError && !formData.phone.trim() ? 'Phone is required' : ''}
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a password"
            required
            error={formError && formData.password.length < 6 ? 'Password must be at least 6 characters' : ''}
            disabled={isLoading}
          />

          <Button 
            type="submit" 
            fullWidth
            disabled={isLoading}
          >
            Create Account
          </Button>
        </form>

        <p className={styles.switchPrompt}>
          Already have an account?{' '}
          <a href="/login" className={styles.link}>
            Sign in
          </a>
        </p>
      </Card>
    </div>
  );
};

export default SignUp; 