import React, { useState, useEffect } from 'react';
import './Campaign.css';

const CreatureEditor = ({ creature, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'humanoid',
    size: 'medium',
    challenge_rating: '1',
    armor_class: 10,
    hit_points: 10,
    speed: '30 ft.',
    stats: {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    },
    abilities: [],
    actions: [],
    description: '',
    tags: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');

  const isEditing = !!creature;

  useEffect(() => {
    if (creature) {
      setFormData({
        name: creature.name || '',
        type: creature.type || 'humanoid',
        size: creature.size || 'medium',
        challenge_rating: creature.challenge_rating || '1',
        armor_class: creature.armor_class || 10,
        hit_points: creature.hit_points || 10,
        speed: creature.speed || '30 ft.',
        stats: {
          str: creature.stats?.str || 10,
          dex: creature.stats?.dex || 10,
          con: creature.stats?.con || 10,
          int: creature.stats?.int || 10,
          wis: creature.stats?.wis || 10,
          cha: creature.stats?.cha || 10
        },
        abilities: creature.abilities || [],
        actions: creature.actions || [],
        description: creature.description || '',
        tags: creature.tags || []
      });
    }
  }, [creature]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatChange = (stat, value) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: parseInt(value) || 10
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Failed to save creature');
    } finally {
      setLoading(false);
    }
  };

  const creatureTypes = [
    'aberration', 'beast', 'celestial', 'construct', 'dragon', 
    'elemental', 'fey', 'fiend', 'giant', 'humanoid', 
    'monstrosity', 'ooze', 'plant', 'undead'
  ];

  const creatureSizes = [
    'tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'
  ];

  const challengeRatings = [
    '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '30'
  ];

  return (
    <div className="creature-editor-overlay">
      <div className="creature-editor">
        <div className="editor-header">
          <h2>{isEditing ? 'Edit Creature' : 'Add New Creature'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="creature-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  disabled={loading}
                >
                  {creatureTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="size">Size</label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  disabled={loading}
                >
                  {creatureSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Combat Statistics</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="challenge_rating">Challenge Rating</label>
                <select
                  id="challenge_rating"
                  value={formData.challenge_rating}
                  onChange={(e) => handleChange('challenge_rating', e.target.value)}
                  disabled={loading}
                >
                  {challengeRatings.map(cr => (
                    <option key={cr} value={cr}>CR {cr}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="armor_class">Armor Class</label>
                <input
                  type="number"
                  id="armor_class"
                  value={formData.armor_class}
                  onChange={(e) => handleChange('armor_class', parseInt(e.target.value))}
                  min="1"
                  max="30"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="hit_points">Hit Points</label>
                <input
                  type="number"
                  id="hit_points"
                  value={formData.hit_points}
                  onChange={(e) => handleChange('hit_points', parseInt(e.target.value))}
                  min="1"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="speed">Speed</label>
                <input
                  type="text"
                  id="speed"
                  value={formData.speed}
                  onChange={(e) => handleChange('speed', e.target.value)}
                  placeholder="30 ft."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ability Scores</h3>
            <div className="stats-grid">
              {Object.entries(formData.stats).map(([stat, value]) => (
                <div key={stat} className="stat-input">
                  <label>{stat.toUpperCase()}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    min="1"
                    max="30"
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Tags</h3>
            <div className="tags-input">
              <div className="tag-input-row">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={loading || !newTag.trim()}
                >
                  Add Tag
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="current-tags">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag-item">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Description</h3>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="save-button"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Creature' : 'Add Creature')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatureEditor;