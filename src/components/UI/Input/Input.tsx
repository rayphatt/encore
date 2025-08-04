import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  id?: string;
  name?: string; // Add name prop
  label?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  name, // Add name to destructuring
  label,
  type = 'text',
  value,
  placeholder,
  disabled = false,
  error,
  onChange,
  onBlur,
  required = false,
  className,
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const inputClasses = [
    styles.input,
    type === 'textarea' && styles.textarea,
    error && styles.error,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputContainer}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && ' *'}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          className={inputClasses}
          rows={4}
        />
      ) : (
        <input
          id={inputId}
          name={name} // Add name attribute to input
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          className={inputClasses}
        />
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default Input; 