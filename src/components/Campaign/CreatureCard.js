import React, { useState } from 'react';
import './Campaign.css';

const CreatureCard = ({ creature, userRole, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const canEdit = userRole === 'dm';
  const canDelete = userRole === 'dm';

  const getTypeIcon = (type) => {
    const icons = {
      'dragon': '🐉',
      'humanoid': '👤',
      'beast': '🐺',
      'undead': '💀',
      'fiend': '👹',
      'celestial': '😇',
      'fey': '🧚',
      'elemental': '🔥',
      'construct': '🤖',
      'plant': '🌱',
      'ooze': '💧',
      'giant': '🏔️',
      'monstrosity': '🦅',
      'aberration': '🐙'
    };
    return icons[type?.toLowerCase()] || '❓';
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
    if (crNum <= 5) return '#FFC107';
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
    <div className="creature-card">
      <div className="creature-header">
        <div className="creature-title">
          <div className="creature-icon">
            {getTypeIcon(creature.type)}
          </div>
          <div className="creature-name-section">
            <h3 className="creature-name">{creature.name}</h3>
            <div className="creature-subtitle">
              {creature.size && (
                <span 
                  className="creature-size"
                  style={{ color: getSizeColor(creature.size) }}
                >
                  {creature.size}
                </span>
              )}
              {creature.type && (
                <span className="creature-type">
                  {creature.type}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="creature-actions">
          {creature.challenge_rating && (
            <span 
              className="creature-cr"
              style={{ backgroundColor: getCRColor(creature.challenge_rating) }}
            >
              CR {creature.challenge_rating}
            </span>
          )}
          
          {(canEdit || canDelete) && (
            <div className="actions-dropdown-container">
              <button 
                className="actions-button"
                onClick={() => setShowActions(!showActions)}
              >
                ⋮
              </button>
              {showActions && (
                <div className="actions-dropdown">
                  {canEdit && (
                    <button onClick={() => onEdit(creature)}>
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button 
                      onClick={() => onDelete(creature.id)}
                      className="delete-action"
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

      <div className="creature-stats">
        <div className="basic-stats">
          {creature.armor_class && (
            <div className="stat-item">
              <span className="stat-label">AC</span>
              <span className="stat-value">{creature.armor_class}</span>
            </div>
          )}
          {creature.hit_points && (
            <div className="stat-item">
              <span className="stat-label">HP</span>
              <span className="stat-value">{creature.hit_points}</span>
            </div>
          )}
          {creature.speed && (
            <div className="stat-item">
              <span className="stat-label">Speed</span>
              <span className="stat-value">{creature.speed}</span>
            </div>
          )}
        </div>

      </div>

      {creature.stats && (
        <div className="ability-scores">
          {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => (
            creature.stats[stat] && (
              <div key={stat} className="ability-score">
                <span className="ability-name">{stat.toUpperCase()}</span>
                <span className="ability-value">{creature.stats[stat]}</span>
                <span className="ability-modifier">{formatStatModifier(creature.stats[stat])}</span>
              </div>
            )
          ))}
        </div>
      )}

      {creature.tags && creature.tags.length > 0 && (
        <div className="creature-tags">
          {creature.tags.map(tag => (
            <span key={tag} className="creature-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {(creature.abilities?.length > 0 || creature.actions?.length > 0) && (
        <div className="creature-expandable">
          <button 
            className="expand-button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '▼' : '▶'} {expanded ? 'Hide' : 'Show'} Details
          </button>
          
          {expanded && (
            <div className="creature-details">
              {creature.abilities && creature.abilities.length > 0 && (
                <div className="abilities-section">
                  <h4>Abilities</h4>
                  {creature.abilities.map((ability, index) => (
                    <div key={index} className="ability-item">
                      <strong>{ability.name}</strong>
                      <p>{ability.description}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {creature.actions && creature.actions.length > 0 && (
                <div className="actions-section">
                  <h4>Actions</h4>
                  {creature.actions.map((action, index) => (
                    <div key={index} className="action-item">
                      <strong>{action.name}</strong>
                      <p>{action.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {creature.description && (
        <div className="creature-description">
          <p>{creature.description}</p>
        </div>
      )}

      {creature.sourceFile && (
        <div className="creature-source">
          <small>Source: {creature.sourceFile.name}</small>
        </div>
      )}
    </div>
  );
};

export default CreatureCard;