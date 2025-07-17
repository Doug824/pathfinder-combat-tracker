import React, { useState } from 'react';
import { getCampaignIcon, getCharacterIcon, getStoryIcon, getItemIcon, getSessionIcon } from '../../utils/epicIcons';
import './Notes.css';

const NotesSidebar = ({ 
  notes, 
  selectedCategory, 
  selectedSubcategory, 
  onCategorySelect,
  userRole 
}) => {
  const [expandedCategories, setExpandedCategories] = useState({
    world: true,
    people: true,
    story: true,
    knowledge: false,
    items: false,
    sessions: false
  });

  const categoryStructure = {
    world: {
      name: 'World & Locations',
      icon: getCampaignIcon('world'),
      subcategories: {
        regions: 'Regions',
        cities: 'Cities & Towns',
        dungeons: 'Dungeons & Lairs',
        planes: 'Planes & Realms'
      }
    },
    people: {
      name: 'People',
      icon: getCharacterIcon('player'),
      subcategories: {
        npcs: 'NPCs',
        allies: 'Allies',
        enemies: 'Enemies',
        organizations: 'Organizations'
      }
    },
    story: {
      name: 'Story',
      icon: getStoryIcon('main'),
      subcategories: {
        main: 'Main Quest',
        side: 'Side Quests',
        events: 'Events',
        mysteries: 'Mysteries'
      }
    },
    knowledge: {
      name: 'Knowledge',
      icon: getCampaignIcon('library'),
      subcategories: {
        lore: 'Lore',
        history: 'History',
        magic: 'Magic',
        culture: 'Culture'
      }
    },
    items: {
      name: 'Items',
      icon: getItemIcon('treasure'),
      subcategories: {
        magic: 'Magic Items',
        treasure: 'Treasure',
        objects: 'Important Objects'
      }
    },
    sessions: {
      name: 'Sessions',
      icon: getSessionIcon('session'),
      subcategories: {
        notes: 'Session Notes',
        combat: 'Combat Records',
        decisions: 'Decisions'
      }
    }
  };

  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const getNotesCount = (category, subcategory = null) => {
    if (subcategory) {
      return notes.filter(note => 
        note.category === category && note.subcategory === subcategory
      ).length;
    }
    return notes.filter(note => note.category === category).length;
  };

  const getAllNotesCount = () => {
    return notes.length;
  };

  const getPersonalNotesCount = () => {
    return notes.filter(note => note.type === 'personal').length;
  };

  const getSharedNotesCount = () => {
    return notes.filter(note => note.type === 'shared').length;
  };

  const getDMNotesCount = () => {
    return notes.filter(note => note.type === 'dm').length;
  };

  return (
    <div className="notes-sidebar">
      <div className="sidebar-header">
        <h3>Campaign Notes</h3>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-item-group">
          <div 
            className={`sidebar-item ${!selectedCategory ? 'active' : ''}`}
            onClick={() => onCategorySelect(null, null)}
          >
            <span className="sidebar-icon">📝</span>
            <span className="sidebar-text">All Notes</span>
            <span className="sidebar-count">({getAllNotesCount()})</span>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">By Type</div>
        <div className="sidebar-item-group">
          <div 
            className={`sidebar-item ${selectedCategory === 'type' && selectedSubcategory === 'personal' ? 'active' : ''}`}
            onClick={() => onCategorySelect('type', 'personal')}
          >
            <span className="sidebar-icon">👤</span>
            <span className="sidebar-text">Personal</span>
            <span className="sidebar-count">({getPersonalNotesCount()})</span>
          </div>
          <div 
            className={`sidebar-item ${selectedCategory === 'type' && selectedSubcategory === 'shared' ? 'active' : ''}`}
            onClick={() => onCategorySelect('type', 'shared')}
          >
            <span className="sidebar-icon">👥</span>
            <span className="sidebar-text">Shared</span>
            <span className="sidebar-count">({getSharedNotesCount()})</span>
          </div>
          {userRole === 'dm' && (
            <div 
              className={`sidebar-item ${selectedCategory === 'type' && selectedSubcategory === 'dm' ? 'active' : ''}`}
              onClick={() => onCategorySelect('type', 'dm')}
            >
              <span className="sidebar-icon">🎲</span>
              <span className="sidebar-text">DM Only</span>
              <span className="sidebar-count">({getDMNotesCount()})</span>
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">By Category</div>
        {Object.entries(categoryStructure).map(([categoryKey, category]) => (
          <div key={categoryKey} className="sidebar-category">
            <div 
              className={`sidebar-item expandable ${selectedCategory === categoryKey && !selectedSubcategory ? 'active' : ''}`}
              onClick={() => onCategorySelect(categoryKey, null)}
            >
              <button 
                className="expand-button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(categoryKey);
                }}
              >
                {expandedCategories[categoryKey] ? '▼' : '▶'}
              </button>
              <span className="sidebar-icon">{category.icon}</span>
              <span className="sidebar-text">{category.name}</span>
              <span className="sidebar-count">({getNotesCount(categoryKey)})</span>
            </div>
            
            {expandedCategories[categoryKey] && (
              <div className="sidebar-subcategories">
                {Object.entries(category.subcategories).map(([subKey, subName]) => (
                  <div 
                    key={subKey}
                    className={`sidebar-item subcategory ${selectedCategory === categoryKey && selectedSubcategory === subKey ? 'active' : ''}`}
                    onClick={() => onCategorySelect(categoryKey, subKey)}
                  >
                    <span className="sidebar-text">{subName}</span>
                    <span className="sidebar-count">({getNotesCount(categoryKey, subKey)})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesSidebar;