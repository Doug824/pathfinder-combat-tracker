import React from 'react';
import './Notes.css';

const NotesFilters = ({ 
  filters, 
  onFiltersChange, 
  availableTags, 
  userRole 
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: 'all',
      category: '',
      tag: '',
      search: ''
    });
  };

  const getFilterOptions = () => {
    const options = [
      { value: 'all', label: 'All Notes' },
      { value: 'personal', label: 'Personal Notes' },
      { value: 'shared', label: 'Shared Notes' }
    ];

    if (userRole === 'dm') {
      options.push({ value: 'dm', label: 'DM Notes' });
    }

    return options;
  };

  const getCategoryOptions = () => [
    { value: '', label: 'All Categories' },
    { value: 'npcs', label: 'NPCs', icon: '👤' },
    { value: 'locations', label: 'Locations', icon: '🏰' },
    { value: 'items', label: 'Items', icon: '⚔️' },
    { value: 'quests', label: 'Quests', icon: '📜' },
    { value: 'lore', label: 'Lore', icon: '📚' },
    { value: 'organizations', label: 'Organizations', icon: '🏛️' },
    { value: 'events', label: 'Events', icon: '⚡' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const hasActiveFilters = filters.type !== 'all' || filters.category || filters.tag || filters.search;

  return (
    <div className="notes-filters">
      <div className="filters-row">
        <div className="filter-group">
          <label htmlFor="type-filter">Type:</label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="filter-select"
          >
            {getFilterOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            {getCategoryOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.icon ? `${option.icon} ${option.label}` : option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="tag-filter">Tag:</label>
          <select
            id="tag-filter"
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search-filter">Search:</label>
          <input
            id="search-filter"
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search notes..."
            className="filter-input"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="clear-filters-button"
          >
            Clear Filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          {filters.type !== 'all' && (
            <span className="filter-chip">
              Type: {filters.type}
              <button onClick={() => handleFilterChange('type', 'all')}>×</button>
            </span>
          )}
          {filters.tag && (
            <span className="filter-chip">
              Tag: {filters.tag}
              <button onClick={() => handleFilterChange('tag', '')}>×</button>
            </span>
          )}
          {filters.search && (
            <span className="filter-chip">
              Search: "{filters.search}"
              <button onClick={() => handleFilterChange('search', '')}>×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NotesFilters;