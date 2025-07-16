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
    <div className="template-editor-overlay">
      <div className="template-editor">
        <div className="editor-header">
          <h2>{isEditing ? 'Edit Template' : 'Create New Template'}</h2>
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

        <form onSubmit={handleSubmit} className="template-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Template Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                disabled={loading}
                placeholder="e.g., Shadow Creature, Fiendish, Giant"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
                placeholder="Describe what this template does..."
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Basic Modifications</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="crModifier">Challenge Rating Modifier</label>
                <input
                  type="number"
                  id="crModifier"
                  value={formData.modifications.challengeRatingModifier}
                  onChange={(e) => handleModificationChange('challengeRatingModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="1"
                  min="-10"
                  max="10"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="hpModifier">Hit Points Modifier</label>
                <input
                  type="number"
                  id="hpModifier"
                  value={formData.modifications.hitPointsModifier}
                  onChange={(e) => handleModificationChange('hitPointsModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="acModifier">Armor Class Modifier</label>
                <input
                  type="number"
                  id="acModifier"
                  value={formData.modifications.armorClassModifier}
                  onChange={(e) => handleModificationChange('armorClassModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="1"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="speedModifier">Speed Modifier (ft)</label>
                <input
                  type="number"
                  id="speedModifier"
                  value={formData.modifications.speedModifier}
                  onChange={(e) => handleModificationChange('speedModifier', parseInt(e.target.value) || 0)}
                  disabled={loading}
                  step="5"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="typeChange">Change Type To</label>
                <select
                  id="typeChange"
                  value={formData.modifications.typeChange}
                  onChange={(e) => handleModificationChange('typeChange', e.target.value)}
                  disabled={loading}
                >
                  <option value="">No Change</option>
                  {creatureTypes.slice(1).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="sizeChange">Change Size To</label>
                <select
                  id="sizeChange"
                  value={formData.modifications.sizeChange}
                  onChange={(e) => handleModificationChange('sizeChange', e.target.value)}
                  disabled={loading}
                >
                  <option value="">No Change</option>
                  {creatureSizes.slice(1).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Ability Score Modifiers</h3>
            <div className="ability-scores-grid">
              {Object.entries(formData.modifications.abilityScoreModifiers).map(([ability, value]) => (
                <div key={ability} className="ability-modifier">
                  <label>{ability.toUpperCase()}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleAbilityScoreChange(ability, e.target.value)}
                    disabled={loading}
                    step="1"
                    min="-10"
                    max="10"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Added Abilities</h3>
            <div className="ability-input">
              <div className="form-row">
                <input
                  type="text"
                  value={newAbility.name}
                  onChange={(e) => setNewAbility(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ability name..."
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddAbility}
                  disabled={loading || !newAbility.name.trim() || !newAbility.description.trim()}
                >
                  Add Ability
                </button>
              </div>
              <textarea
                value={newAbility.description}
                onChange={(e) => setNewAbility(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ability description..."
                disabled={loading}
                rows={2}
              />
            </div>
            
            {formData.modifications.addedAbilities.length > 0 && (
              <div className="abilities-list">
                {formData.modifications.addedAbilities.map((ability, index) => (
                  <div key={index} className="ability-item">
                    <div className="ability-header">
                      <strong>{ability.name}</strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveAbility(index)}
                        disabled={loading}
                        className="remove-button"
                      >
                        ×
                      </button>
                    </div>
                    <p>{ability.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Added Actions</h3>
            <div className="action-input">
              <div className="form-row">
                <input
                  type="text"
                  value={newAction.name}
                  onChange={(e) => setNewAction(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Action name..."
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddAction}
                  disabled={loading || !newAction.name.trim() || !newAction.description.trim()}
                >
                  Add Action
                </button>
              </div>
              <textarea
                value={newAction.description}
                onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Action description..."
                disabled={loading}
                rows={2}
              />
            </div>
            
            {formData.modifications.addedActions.length > 0 && (
              <div className="actions-list">
                {formData.modifications.addedActions.map((action, index) => (
                  <div key={index} className="action-item">
                    <div className="action-header">
                      <strong>{action.name}</strong>
                      <button
                        type="button"
                        onClick={() => handleRemoveAction(index)}
                        disabled={loading}
                        className="remove-button"
                      >
                        ×
                      </button>
                    </div>
                    <p>{action.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Added Tags</h3>
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
            
            {formData.modifications.addedTags.length > 0 && (
              <div className="current-tags">
                {formData.modifications.addedTags.map(tag => (
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
              {loading ? 'Saving...' : (isEditing ? 'Update Template' : 'Create Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateEditor;