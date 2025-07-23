import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import Card from '../UI/Card/Card';
import Button from '../UI/Button/Button';
import Input from '../UI/Input/Input';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithApple, isLoading, error, clearError, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  const validateForm = () => {
    if (!email.trim()) {
      setFormError('Email is required');
      return false;
    }
    if (!password.trim()) {
      setFormError('Password is required');
      return false;
    }
    if (!email.includes('@')) {
      setFormError('Please enter a valid email address');
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
      await login(email, password);
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error will be handled by the useEffect watching the error state
      console.error('Login failed:', err);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'apple') {
        await loginWithApple();
      }
    } catch (err) {
      console.error(`${provider} login failed:`, err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.authContainer}>
        <Card className={styles.authCard}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Signing you in...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <Card className={styles.authCard}>
        <div className={styles.header}>
          <h1>Welcome Back!</h1>
          <p>Sign in to continue ranking your concert memories</p>
        </div>

        {formError && (
          <div className={styles.error}>
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            error={formError && !email.trim() ? 'Email is required' : ''}
            disabled={isLoading}
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            error={formError && !password.trim() ? 'Password is required' : ''}
            disabled={isLoading}
          />

          <div className={styles.options}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              Remember me
            </label>
            <a href="/forgot-password" className={styles.link}>
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            disabled={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <div className={styles.socialButtons}>
          <Button 
            secondary 
            fullWidth 
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            Continue with Google
          </Button>
          <Button 
            secondary 
            fullWidth 
            onClick={() => handleSocialLogin('apple')}
            disabled={isLoading}
          >
            Continue with Apple
          </Button>
        </div>

        <p className={styles.switchPrompt}>
          Don't have an account?{' '}
          <a href="/signup" className={styles.link}>
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
};

export default Login; 