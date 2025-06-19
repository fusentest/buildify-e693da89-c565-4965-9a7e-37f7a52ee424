
import React from 'react';
import './SearchFilters.css';

export interface SearchFiltersState {
  sender: 'all' | 'user' | 'bot';
  dateRange: 'all' | 'today' | 'week' | 'month';
  sortOrder: 'newest' | 'oldest';
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFilterChange: (filters: SearchFiltersState) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFilterChange }) => {
  const handleSenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'all' | 'user' | 'bot';
    onFilterChange({ ...filters, sender: value });
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'all' | 'today' | 'week' | 'month';
    onFilterChange({ ...filters, dateRange: value });
  };

  const handleSortOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'newest' | 'oldest';
    onFilterChange({ ...filters, sortOrder: value });
  };

  return (
    <div className="search-filters">
      <div className="filter-group">
        <label htmlFor="sender-filter">From:</label>
        <select 
          id="sender-filter" 
          value={filters.sender} 
          onChange={handleSenderChange}
        >
          <option value="all">All</option>
          <option value="user">You</option>
          <option value="bot">Bot</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="date-filter">When:</label>
        <select 
          id="date-filter" 
          value={filters.dateRange} 
          onChange={handleDateRangeChange}
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort-filter">Sort:</label>
        <select 
          id="sort-filter" 
          value={filters.sortOrder} 
          onChange={handleSortOrderChange}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
    </div>
  );
};

export default SearchFilters;