import React, { useState } from 'react';
import { getCampaignIcon, getCharacterIcon, getStoryIcon, getItemIcon, getSessionIcon } from '../../utils/epicIcons';
import OrnatePanel from '../OrnatePanel';
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
    <OrnatePanel className="notes-sidebar">
      <div className="sidebar-header">
        <h3>Campaign Notes</h3>
      </div>

      <div className="mb-6">
        <div 
          className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-300 ${
            !selectedCategory 
              ? 'bg-dark-wood/40 border-2 border-fantasy-gold/50 text-fantasy-gold' 
              : 'bg-black/20 border-2 border-fantasy-bronze/30 text-parchment-dark hover:bg-dark-wood/20'
          }`}
          onClick={() => onCategorySelect(null, null)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📝</span>
            <span className="font-fantasy uppercase tracking-wider text-sm">All Notes</span>
          </div>
          <span className="text-xs font-bold bg-fantasy-bronze/50 px-2 py-1 rounded">({getAllNotesCount()})</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-fantasy text-fantasy-gold uppercase tracking-wider mb-3 border-b border-fantasy-bronze/30 pb-2">By Type</h4>
        <div className="space-y-2">
          <div 
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 ${
              selectedCategory === 'type' && selectedSubcategory === 'personal'
                ? 'bg-dark-wood/40 border-2 border-fantasy-gold/50 text-fantasy-gold' 
                : 'bg-black/20 border-2 border-fantasy-bronze/30 text-parchment-dark hover:bg-dark-wood/20'
            }`}
            onClick={() => onCategorySelect('type', 'personal')}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <span className="font-fantasy uppercase tracking-wider text-sm">Personal</span>
            </div>
            <span className="text-xs font-bold bg-fantasy-bronze/50 px-2 py-1 rounded">({getPersonalNotesCount()})</span>
          </div>
          <div 
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 ${
              selectedCategory === 'type' && selectedSubcategory === 'shared'
                ? 'bg-dark-wood/40 border-2 border-fantasy-gold/50 text-fantasy-gold' 
                : 'bg-black/20 border-2 border-fantasy-bronze/30 text-parchment-dark hover:bg-dark-wood/20'
            }`}
            onClick={() => onCategorySelect('type', 'shared')}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <span className="font-fantasy uppercase tracking-wider text-sm">Shared</span>
            </div>
            <span className="text-xs font-bold bg-fantasy-bronze/50 px-2 py-1 rounded">({getSharedNotesCount()})</span>
          </div>
          {userRole === 'dm' && (
            <div 
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 ${
                selectedCategory === 'type' && selectedSubcategory === 'dm'
                  ? 'bg-dark-wood/40 border-2 border-fantasy-gold/50 text-fantasy-gold' 
                  : 'bg-black/20 border-2 border-fantasy-bronze/30 text-parchment-dark hover:bg-dark-wood/20'
              }`}
              onClick={() => onCategorySelect('type', 'dm')}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎲</span>
                <span className="font-fantasy uppercase tracking-wider text-sm">DM Only</span>
              </div>
              <span className="text-xs font-bold bg-fantasy-bronze/50 px-2 py-1 rounded">({getDMNotesCount()})</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-fantasy text-fantasy-gold uppercase tracking-wider mb-3 border-b border-fantasy-bronze/30 pb-2">By Category</h4>
        {Object.entries(categoryStructure).map(([categoryKey, category]) => (
          <div key={categoryKey} className="mb-3">
            <div 
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 ${
                selectedCategory === categoryKey && !selectedSubcategory
                  ? 'bg-dark-wood/40 border-2 border-fantasy-gold/50 text-fantasy-gold' 
                  : 'bg-black/20 border-2 border-fantasy-bronze/30 text-parchment-dark hover:bg-dark-wood/20'
              }`}
              onClick={() => onCategorySelect(categoryKey, null)}
            >
              <div className="flex items-center gap-2">
                <button 
                  className="text-fantasy-gold hover:text-ornate-gold text-sm transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(categoryKey);
                  }}
                >
                  {expandedCategories[categoryKey] ? '▼' : '▶'}
                </button>
                <span className="text-lg">{category.icon}</span>
                <span className="font-fantasy uppercase tracking-wider text-sm">{category.name}</span>
              </div>
              <span className="text-xs font-bold bg-fantasy-bronze/50 px-2 py-1 rounded">({getNotesCount(categoryKey)})</span>
            </div>
            
            {expandedCategories[categoryKey] && (
              <div className="ml-4 mt-2 space-y-1">
                {Object.entries(category.subcategories).map(([subKey, subName]) => (
                  <div 
                    key={subKey}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-300 ${
                      selectedCategory === categoryKey && selectedSubcategory === subKey
                        ? 'bg-dark-wood/40 border-2 border-fantasy-gold/50 text-fantasy-gold' 
                        : 'bg-black/10 border border-fantasy-bronze/20 text-parchment-dark hover:bg-dark-wood/20'
                    }`}
                    onClick={() => onCategorySelect(categoryKey, subKey)}
                  >
                    <span className="font-fantasy uppercase tracking-wider text-xs">{subName}</span>
                    <span className="text-xs font-bold bg-fantasy-bronze/30 px-2 py-1 rounded">({getNotesCount(categoryKey, subKey)})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </OrnatePanel>
  );
};

export default NotesSidebar;