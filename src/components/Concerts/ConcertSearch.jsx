import React, { useState } from 'react';
import styles from './ConcertSearch.module.css';
import Input from '../UI/Input/Input';
import Button from '../UI/Button/Button';

const ConcertSearch = ({ onSearch, onFilter, onSort }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    ratingMin: '',
    ratingMax: '',
    venue: ''
  });
  const [sortBy, setSortBy] = useState('date-desc');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onSort(value);
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <Input
          type="search"
          placeholder="Search by artist, venue, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit">Search</Button>
        <Button 
          type="button" 
          secondary 
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </form>

      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <h4>Date Range</h4>
            <div className={styles.dateInputs}>
              <Input
                type="date"
                label="From"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
              <Input
                type="date"
                label="To"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4>Rating Range</h4>
            <div className={styles.ratingInputs}>
              <Input
                type="number"
                label="Min"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratingMin}
                onChange={(e) => handleFilterChange('ratingMin', e.target.value)}
              />
              <Input
                type="number"
                label="Max"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratingMax}
                onChange={(e) => handleFilterChange('ratingMax', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4>Venue</h4>
            <Input
              type="text"
              placeholder="Filter by venue..."
              value={filters.venue}
              onChange={(e) => handleFilterChange('venue', e.target.value)}
            />
          </div>

          <div className={styles.filterGroup}>
            <h4>Sort By</h4>
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={handleSortChange}
            >
              <option value="date-desc">Most Recent</option>
              <option value="date-asc">Oldest First</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="artist-asc">Artist (A-Z)</option>
              <option value="artist-desc">Artist (Z-A)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcertSearch; 