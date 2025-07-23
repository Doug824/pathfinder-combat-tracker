import React, { useState, useEffect } from 'react';
import './Campaign.css';

const TemplateEditor = ({ template, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modifications: {
      challengeRatingModifier: 0,
      hitPointsModifier: 0,
      armorClassModifier: 0,
      speedModifier: 0,
      typeChange: '',
      sizeChange: '',
      abilityScoreModifiers: {
        str: 0,
        dex: 0,
        con: 0,
        int: 0,
        wis: 0,
        cha: 0
      },
      addedAbilities: [],
      addedActions: [],
      addedTags: []
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newAbility, setNewAbility] = useState({ name: '', description: '' });
  const [newAction, setNewAction] = useState({ name: '', description: '' });
  const [newTag, setNewTag] = useState('');

  const isEditing = !!template;

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        description: template.description || '',
        modifications: {
          challengeRatingModifier: template.modifications?.challengeRatingModifier || 0,
          hitPointsModifier: template.modifications?.hitPointsModifier || 0,
          armorClassModifier: template.modifications?.armorClassModifier || 0,
          speedModifier: template.modifications?.speedModifier || 0,
          typeChange: template.modifications?.typeChange || '',
          sizeChange: template.modifications?.sizeChange || '',
          abilityScoreModifiers: {
            str: template.modifications?.abilityScoreModifiers?.str || 0,
            dex: template.modifications?.abilityScoreModifiers?.dex || 0,
            con: template.modifications?.abilityScoreModifiers?.con || 0,
            int: template.modifications?.abilityScoreModifiers?.int || 0,
            wis: template.modifications?.abilityScoreModifiers?.wis || 0,
            cha: template.modifications?.abilityScoreModifiers?.cha || 0
          },
          addedAbilities: template.modifications?.addedAbilities || [],
          addedActions: template.modifications?.addedActions || [],
          addedTags: template.modifications?.addedTags || []
        }
      });
    }
  }, [template]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      modifications: {
        ...prev.modifications,
        [field]: value
      }
    }));
  };

  const handleAbilityScoreChange = (ability, value) => {
    setFormData(prev => ({
      ...prev,
      modifications: {
        ...prev.modifications,
        abilityScoreModifiers: {
          ...prev.modifications.abilityScoreModifiers,
          [ability]: parseInt(value) || 0
        }
      }
    }));
  };

  const handleAddAbility = () => {
    if (newAbility.name.trim() && newAbility.description.trim()) {
      setFormData(prev => ({
        ...prev,
        modifications: {
          ...prev.modifications,
          addedAbilities: [...prev.modifications.addedAbilities, { ...newAbility }]
        }
      }));
      setNewAbility({ name: '', description: '' });
    }
  };

  const handleRemoveAbility = (index) => {
    setFormData(prev => ({
      ...prev,
      modifications: {
        ...prev.modifications,
        addedAbilities: prev.modifications.addedAbilities.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddAction = () => {
    if (newAction.name.trim() && newAction.description.trim()) {
      setFormData(prev => ({
        ...prev,
        modifications: {
          ...prev.modifications,
          addedActions: [...prev.modifications.addedActions, { ...newAction }]
        }
      }));
      setNewAction({ name: '', description: '' });
    }
  };

  const handleRemoveAction = (index) => {
    setFormData(prev => ({
      ...prev,
      modifications: {
        ...prev.modifications,
        addedActions: prev.modifications.addedActions.filter((_, i) => i !== index)
      }
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.modifications.addedTags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        modifications: {
          ...prev.modifications,
          addedTags: [...prev.modifications.addedTags, newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      modifications: {
        ...prev.modifications,
        addedTags: prev.modifications.addedTags.filter(tag => tag !== tagToRemove)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const creatureTypes = [
    '', 'aberration', 'beast', 'celestial', 'construct', 'dragon', 
    'elemental', 'fey', 'fiend', 'giant', 'humanoid', 
    'monstrosity', 'ooze', 'plant', 'undead'
  ];

  const creatureSizes = [
    '', 'tiny', 'small', 'medium', 'large', 'huge', 'gargantuan'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-amber-700/30 sticky top-0 bg-black/60 backdrop-blur-md z-10">
          <h2 className="text-3xl font-fantasy font-bold text-amber-400">{isEditing ? 'Edit Template' : 'Create New Template'}</h2>
          <button 
            className="text-amber-300 hover:text-amber-100 text-3xl leading-none transition-colors duration-300"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-900/60 border border-red-700/50 rounded-lg p-4 m-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6 mb-6">
            <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Basic Information</h3>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-amber-300 font-fantasy font-semibold mb-2">Template Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., Shadow Creature, Fiendish, Giant"
                className="input-fantasy w-full"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-amber-300 font-fantasy font-semibold mb-2">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
                placeholder="Describe what this template does..."
                rows={3}
                className="input-fantasy w-full resize-none"
              />
            </div>
          </div>

          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6 mb-6">
            <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Basic Modifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="crModifier" className="block text-amber-300 font-fantasy font-semibold mb-2">Challenge Rating Modifier</label>
                <input
                  type="number"
                  id="crModifier"
                  value={formData.modifications.challengeRatingModifier}
                  onChange={(e) => handleModificationChange('challengeRatingModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="1"
                  min="-10"
                  max="10"
                  className="input-fantasy w-full"
                />
              </div>
              
              <div>
                <label htmlFor="hpModifier" className="block text-amber-300 font-fantasy font-semibold mb-2">Hit Points Modifier</label>
                <input
                  type="number"
                  id="hpModifier"
                  value={formData.modifications.hitPointsModifier}
                  onChange={(e) => handleModificationChange('hitPointsModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="1"
                  className="input-fantasy w-full"
                />
              </div>
              
              <div>
                <label htmlFor="acModifier" className="block text-amber-300 font-fantasy font-semibold mb-2">Armor Class Modifier</label>
                <input
                  type="number"
                  id="acModifier"
                  value={formData.modifications.armorClassModifier}
                  onChange={(e) => handleModificationChange('armorClassModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="1"
                  className="input-fantasy w-full"
                />
              </div>
              
              <div>
                <label htmlFor="speedModifier" className="block text-amber-300 font-fantasy font-semibold mb-2">Speed Modifier (ft)</label>
                <input
                  type="number"
                  id="speedModifier"
                  value={formData.modifications.speedModifier}
                  onChange={(e) => handleModificationChange('speedModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="5"
                  className="input-fantasy w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="typeChange" className="block text-amber-300 font-fantasy font-semibold mb-2">Change Type To</label>
                <select
                  id="typeChange"
                  value={formData.modifications.typeChange}
                  onChange={(e) => handleModificationChange('typeChange', e.target.value)}
                  disabled={loading}
                  className="input-fantasy w-full"
                >
                  <option value="">No Change</option>
                  {creatureTypes.slice(1).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="sizeChange" className="block text-amber-300 font-fantasy font-semibold mb-2">Change Size To</label>
                <select
                  id="sizeChange"
                  value={formData.modifications.sizeChange}
                  onChange={(e) => handleModificationChange('sizeChange', e.target.value)}
                  disabled={loading}
                  className="input-fantasy w-full"
                >
                  <option value="">No Change</option>
                  {creatureSizes.slice(1).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6 mb-6">
            <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Ability Score Modifiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(formData.modifications.abilityScoreModifiers).map(([ability, value]) => (
                <div key={ability} className="bg-black/30 rounded border border-amber-700/20 p-3">
                  <label className="block text-amber-400 font-fantasy font-semibold text-sm mb-2 text-center">{ability.toUpperCase()}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleAbilityScoreChange(ability, e.target.value)}
                    disabled={loading}
                    step="1"
                    min="-10"
                    max="10"
                    className="input-fantasy w-full text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6 mb-6">
            <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Added Abilities</h3>
            <div className="bg-black/30 rounded border border-amber-700/20 p-4 mb-4">
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={newAbility.name}
                  onChange={(e) => setNewAbility(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ability name..."
                  disabled={loading}
                  className="input-fantasy flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddAbility}
                  disabled={loading || !newAbility.name.trim() || !newAbility.description.trim()}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  ➕ Add Ability
                </button>
              </div>
              <textarea
                value={newAbility.description}
                onChange={(e) => setNewAbility(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ability description..."
                disabled={loading}
                rows={2}
                className="input-fantasy w-full resize-none"
              />
            </div>
            
            {formData.modifications.addedAbilities.length > 0 && (
              <div className="space-y-3">
                {formData.modifications.addedAbilities.map((ability, index) => (
                  <div key={index} className="bg-emerald-900/30 border border-emerald-600/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-emerald-300 font-fantasy">{ability.name}</strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveAbility(index)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 w-6 h-6 rounded-full hover:bg-red-900/50 transition-all duration-200 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-emerald-200 text-sm">{ability.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6 mb-6">
            <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Added Actions</h3>
            <div className="bg-black/30 rounded border border-amber-700/20 p-4 mb-4">
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={newAction.name}
                  onChange={(e) => setNewAction(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Action name..."
                  disabled={loading}
                  className="input-fantasy flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddAction}
                  disabled={loading || !newAction.name.trim() || !newAction.description.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-200 disabled:opacity-50"
                >
                  ⚔️ Add Action
                </button>
              </div>
              <textarea
                value={newAction.description}
                onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Action description..."
                disabled={loading}
                rows={2}
                className="input-fantasy w-full resize-none"
              />
            </div>
            
            {formData.modifications.addedActions.length > 0 && (
              <div className="space-y-3">
                {formData.modifications.addedActions.map((action, index) => (
                  <div key={index} className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-blue-300 font-fantasy">{action.name}</strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveAction(index)}
                        disabled={loading}
                        className="text-red-400 hover:text-red-300 w-6 h-6 rounded-full hover:bg-red-900/50 transition-all duration-200 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-blue-200 text-sm">{action.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6 mb-6">
            <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Added Tags</h3>
            <div className="flex gap-3 mb-4">
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
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-200 disabled:opacity-50"
              >
                🏷️ Add Tag
              </button>
            </div>
            
            {formData.modifications.addedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.modifications.addedTags.map(tag => (
                  <span key={tag} className="bg-purple-700/60 text-purple-100 px-3 py-1 rounded-full text-sm font-fantasy flex items-center gap-2">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="text-purple-200 hover:text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-amber-700/30">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-700/80 hover:bg-gray-600/90 text-gray-100 px-6 py-3 rounded-lg font-fantasy font-semibold transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-fantasy font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateEditor;