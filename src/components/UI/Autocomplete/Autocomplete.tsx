import React, { useState, useEffect, useRef } from 'react';
import styles from './Autocomplete.module.css';

interface AutocompleteOption {
  id: string;
  name: string;
  subtitle?: string;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  placeholder: string;
  label: string;
  options: AutocompleteOption[];
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
  minChars?: number;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  label,
  options,
  isLoading = false,
  error,
  disabled = false,
  minChars = 2
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showDropdown = value.length >= minChars && (options.length > 0 || isLoading);

  useEffect(() => {
    setIsOpen(showDropdown);
    setHighlightedIndex(-1);
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < options.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          handleSelect(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (option: AutocompleteOption) => {
    onSelect(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    // Only show dropdown if user is actively typing (value changed recently)
    // Don't auto-open dropdown just because of focus
  };

  return (
    <div className={styles.autocompleteContainer}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.input} ${error ? styles.error : ''}`}
        />
        {isLoading && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {isOpen && (
        <div ref={dropdownRef} className={styles.dropdown}>
          {isLoading ? (
            <div className={styles.loadingItem}>
              <div className={styles.spinner}></div>
              <span>Searching...</span>
            </div>
          ) : options.length > 0 ? (
            options.map((option, index) => (
              <div
                key={`${option.id}-${index}`}
                className={`${styles.option} ${
                  index === highlightedIndex ? styles.highlighted : ''
                }`}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className={styles.optionName}>{option.name}</div>
                {option.subtitle && (
                  <div className={styles.optionSubtitle}>{option.subtitle}</div>
                )}
              </div>
            ))
          ) : value.length >= minChars ? (
            <div className={styles.noResults}>No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Autocomplete; 