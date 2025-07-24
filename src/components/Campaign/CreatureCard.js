import React, { useState } from 'react';
import { getCreatureIcon } from '../../utils/epicIcons';
import OrnatePanel, { OrnateButton } from '../OrnatePanel';
import './Campaign.css';

const CreatureCard = ({ creature, userRole, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const canEdit = userRole === 'dm';
  const canDelete = userRole === 'dm';

  const getTypeIcon = (type) => {
    return getCreatureIcon(type);
  };

  const getSizeColor = (size) => {
    const colors = {
      'tiny': '#4CAF50',
      'small': '#8BC34A',
      'medium': '#FFC107',
      'large': '#FF9800',
      'huge': '#FF5722',
      'gargantuan': '#9C27B0'
    };
    return colors[size?.toLowerCase()] || '#666';
  };

  const getCRColor = (cr) => {
    const crNum = parseCR(cr);
    if (crNum <= 1) return '#4CAF50';
    if (crNum <= 5) return '#2196F3';
    if (crNum <= 10) return '#FF9800';
    if (crNum <= 20) return '#FF5722';
    return '#9C27B0';
  };

  const parseCR = (crString) => {
    if (!crString) return 0;
    if (crString.includes('/')) {
      const [num, den] = crString.split('/');
      return parseInt(num) / parseInt(den);
    }
    return parseInt(crString) || 0;
  };

  const formatStatModifier = (stat) => {
    if (!stat) return '+0';
    const modifier = Math.floor((stat - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <OrnatePanel variant="default" className="h-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className="text-4xl">
            {getTypeIcon(creature.type)}
          </div>
          <div>
            <h3 className="text-xl font-fantasy font-bold text-yellow-300 uppercase tracking-wider">{creature.name}</h3>
            <div className="flex gap-2 text-sm">
              {creature.size && (
                <span 
                  className="font-fantasy"
                  style={{ color: getSizeColor(creature.size) }}
                >
                  {creature.size}
                </span>
              )}
              {creature.type && (
                <span className="text-amber-200 font-fantasy">
                  {creature.type}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          {creature.challenge_rating && (
            <span 
              className="px-3 py-1 rounded-md text-xs font-fantasy uppercase tracking-wider font-bold text-white"
              style={{ backgroundColor: getCRColor(creature.challenge_rating) }}
            >
              CR {creature.challenge_rating}
            </span>
          )}
          
          {(canEdit || canDelete) && (
            <div className="relative">
              <button 
                className="text-yellow-300 hover:text-yellow-100 text-2xl p-1 rounded transition-colors duration-300"
                onClick={() => setShowActions(!showActions)}
              >
                ⋮
              </button>
              {showActions && (
                <div className="absolute right-0 top-8 bg-gradient-to-b from-amber-900/95 to-amber-950/95 border-2 border-amber-700/50 rounded-lg shadow-lg z-10 min-w-32">
                  {canEdit && (
                    <button 
                      onClick={() => onEdit(creature)}
                      className="w-full text-left px-4 py-2 text-yellow-200 hover:bg-amber-700/30 rounded-t-lg transition-colors duration-300 font-fantasy uppercase tracking-wider text-sm"
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={() => onDelete(creature.id)}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-b-lg transition-colors duration-300 font-fantasy uppercase tracking-wider text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {creature.armor_class && (
          <div className="bg-black/60 rounded-md border-2 border-amber-700/50 p-2 text-center">
            <span className="block text-xs text-amber-200 font-fantasy uppercase tracking-wider">AC</span>
            <span className="text-lg font-bold text-yellow-300">{creature.armor_class}</span>
          </div>
        )}
        {creature.hit_points && (
          <div className="bg-black/60 rounded-md border-2 border-amber-700/50 p-2 text-center">
            <span className="block text-xs text-amber-200 font-fantasy uppercase tracking-wider">HP</span>
            <span className="text-lg font-bold text-yellow-300">{creature.hit_points}</span>
          </div>
        )}
        {creature.speed && (
          <div className="bg-black/60 rounded-md border-2 border-amber-700/50 p-2 text-center">
            <span className="block text-xs text-amber-200 font-fantasy uppercase tracking-wider">Speed</span>
            <span className="text-lg font-bold text-yellow-300">{creature.speed}</span>
          </div>
        )}
      </div>

      {creature.stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => (
            creature.stats[stat] && (
              <div key={stat} className="bg-black/40 rounded-md border border-amber-700/30 p-2 text-center">
                <span className="block text-xs text-amber-200 font-fantasy uppercase tracking-wider">{stat}</span>
                <span className="text-sm font-bold text-yellow-300">{creature.stats[stat]}</span>
                <span className="text-xs text-amber-200 ml-1">({formatStatModifier(creature.stats[stat])})</span>
              </div>
            )
          ))}
        </div>
      )}

      {creature.tags && creature.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {creature.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-amber-900/40 border border-amber-700/50 rounded-md text-xs text-amber-200 font-fantasy uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      )}

      {(creature.abilities?.length > 0 || creature.actions?.length > 0) && (
        <div className="border-t border-amber-700/30 pt-4">
          <button 
            className="w-full text-center text-amber-200 hover:text-yellow-300 font-fantasy uppercase tracking-wider text-sm transition-colors duration-300"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'} {expanded ? 'Hide' : 'Show'} Details
          </button>
          
          {expanded && (
            <div className="mt-4 space-y-4">
              {creature.abilities && creature.abilities.length > 0 && (
                <div>
                  <h4 className="text-yellow-300 font-fantasy uppercase tracking-wider text-sm mb-2">Abilities</h4>
                  {creature.abilities.map((ability, index) => (
                    <div key={index} className="mb-2">
                      <strong className="text-amber-200">{ability.name}:</strong>
                      <p className="text-amber-100 text-sm">{ability.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {creature.actions && creature.actions.length > 0 && (
                <div>
                  <h4 className="text-yellow-300 font-fantasy uppercase tracking-wider text-sm mb-2">Actions</h4>
                  {creature.actions.map((action, index) => (
                    <div key={index} className="mb-2">
                      <strong className="text-amber-200">{action.name}:</strong>
                      <p className="text-amber-100 text-sm">{action.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {creature.description && (
        <div className="border-t border-amber-700/30 pt-4 mt-4">
          <p className="text-amber-200 text-sm">{creature.description}</p>
        </div>
      )}

      {creature.sourceFile && (
        <div className="mt-4 text-center">
          <small className="text-amber-300 font-fantasy text-xs">Source: {creature.sourceFile.name}</small>
        </div>
      )}
    </OrnatePanel>
  );
};

export default CreatureCard;