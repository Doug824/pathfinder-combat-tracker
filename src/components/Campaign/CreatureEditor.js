import React, { useState, useEffect } from 'react';

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-fantasy font-bold text-amber-400">{isEditing ? 'Edit Creature' : 'Add New Creature'}</h2>
          <button 
            className="bg-red-700/80 hover:bg-red-600/90 text-red-100 px-4 py-2 rounded-lg border border-red-600/50 font-fantasy font-semibold transition-all duration-200"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-900/80 border border-red-600/50 rounded-lg p-4 mb-6 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
            <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-amber-300 font-fantasy font-semibold">Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  disabled={loading}
                  className="input-fantasy w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="type" className="block text-amber-300 font-fantasy font-semibold">Type</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  disabled={loading}
                  className="input-fantasy w-full"
                >
                  {creatureTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="size" className="block text-amber-300 font-fantasy font-semibold">Size</label>
                <select
                  id="size"
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  disabled={loading}
                  className="input-fantasy w-full"
                >
                  {creatureSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
            <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Combat Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="challenge_rating" className="block text-amber-300 font-fantasy font-semibold">Challenge Rating</label>
                <select
                  id="challenge_rating"
                  value={formData.challenge_rating}
                  onChange={(e) => handleChange('challenge_rating', e.target.value)}
                  disabled={loading}
                  className="input-fantasy w-full"
                >
                  {challengeRatings.map(cr => (
                    <option key={cr} value={cr}>CR {cr}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="armor_class" className="block text-amber-300 font-fantasy font-semibold">Armor Class</label>
                <input
                  type="number"
                  id="armor_class"
                  value={formData.armor_class}
                  onChange={(e) => handleChange('armor_class', parseInt(e.target.value))}
                  min="1"
                  max="30"
                  disabled={loading}
                  className="input-fantasy w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="hit_points" className="block text-amber-300 font-fantasy font-semibold">Hit Points</label>
                <input
                  type="number"
                  id="hit_points"
                  value={formData.hit_points}
                  onChange={(e) => handleChange('hit_points', parseInt(e.target.value))}
                  min="1"
                  disabled={loading}
                  className="input-fantasy w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="speed" className="block text-amber-300 font-fantasy font-semibold">Speed</label>
                <input
                  type="text"
                  id="speed"
                  value={formData.speed}
                  onChange={(e) => handleChange('speed', e.target.value)}
                  placeholder="30 ft."
                  disabled={loading}
                  className="input-fantasy w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
            <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Ability Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(formData.stats).map(([stat, value]) => (
                <div key={stat} className="space-y-2">
                  <label className="block text-amber-300 font-fantasy font-semibold text-center">{stat.toUpperCase()}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    min="1"
                    max="30"
                    disabled={loading}
                    className="input-fantasy w-full text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
            <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Tags</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  disabled={loading}
                  className="input-fantasy flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={loading || !newTag.trim()}
                  className="bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 px-4 py-2 rounded-lg border border-amber-600/50 font-fantasy font-semibold transition-all duration-200"
                >
                  Add Tag
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="bg-amber-700/30 border border-amber-600/50 rounded-lg px-3 py-1 text-amber-200 flex items-center gap-2">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading}
                        className="text-amber-300 hover:text-red-300 transition-colors duration-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
            <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Description</h3>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description..."
              rows={4}
              disabled={loading}
              className="input-fantasy w-full resize-vertical"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-700/80 hover:bg-gray-600/90 text-gray-100 px-6 py-2 rounded-lg border border-gray-600/50 font-fantasy font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="bg-emerald-700/80 hover:bg-emerald-600/90 text-emerald-100 px-6 py-2 rounded-lg border border-emerald-600/50 font-fantasy font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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