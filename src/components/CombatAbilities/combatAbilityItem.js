import React, { useState } from 'react';
import SelectWrapper from '../common/SelectWrapper';

const CombatAbilityItem = ({ 
  ability, 
  onRemove, 
  onUpdate,
  onToggle,
  character,
  baseStats
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAbility, setEditedAbility] = useState({ ...ability });
  
  // Action types for combat abilities
  const actionTypes = [
    { value: 'standard', label: 'Standard Action' },
    { value: 'move', label: 'Move Action' },
    { value: 'swift', label: 'Swift Action' },
    { value: 'immediate', label: 'Immediate Action' },
    { value: 'full-round', label: 'Full-Round Action' },
    { value: 'free', label: 'Free Action' },
    { value: 'passive', label: 'Passive/Always On' }
  ];
  
  // Bonus types
  const bonusTypes = [
    { value: 'untyped', label: 'Untyped' },
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'morale', label: 'Morale' },
    { value: 'competence', label: 'Competence' },
    { value: 'luck', label: 'Luck' },
    { value: 'sacred', label: 'Sacred' },
    { value: 'profane', label: 'Profane' },
    { value: 'dodge', label: 'Dodge' },
    { value: 'circumstance', label: 'Circumstance' },
    { value: 'insight', label: 'Insight' },
    { value: 'resistance', label: 'Resistance' },
    { value: 'size', label: 'Size' }
  ];
  
  // Handle changes to the ability properties
  const handleChange = (field, value) => {
    setEditedAbility(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle changes to effect values
  const handleEffectChange = (stat, value) => {
    setEditedAbility(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [stat]: parseInt(value) || 0
      }
    }));
  };
  
  // Toggle checkbox fields
  const handleToggleField = (field) => {
    setEditedAbility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Save changes
  const handleSave = () => {
    onUpdate(editedAbility);
    setIsEditing(false);
  };
  
  // Cancel editing
  const handleCancel = () => {
    setEditedAbility({ ...ability });
    setIsEditing(false);
  };
  
  // Format modifier for display (+X or -X)
  const formatModifier = (value) => {
    return value >= 0 ? `+${value}` : value;
  };
  
  // Display mode (not editing)
  if (!isEditing) {
    return (
      <div className={`ability-card ${ability.isActive ? 'active' : ''}`}>
        <div className="ability-header">
          <h3>{ability.name}</h3>
          <div className="ability-actions">
            <button 
              type="button" 
              className="edit-ability-btn"
              onClick={() => setIsEditing(true)}
              title="Edit Ability"
            >
              ✎
            </button>
            <button 
              type="button" 
              className="remove-ability-btn"
              onClick={() => onRemove(ability.id)}
              title="Remove Ability"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="ability-meta">
          <span className="ability-type">{ability.type.charAt(0).toUpperCase() + ability.type.slice(1)} Action</span>
          <span className="ability-bonus-type">Bonus Type: {ability.bonusType.charAt(0).toUpperCase() + ability.bonusType.slice(1)}</span>
        </div>
        
        {ability.description && (
          <div className="ability-description">
            {ability.description}
          </div>
        )}
        
        <div className="ability-effects">
          {Object.entries(ability.effects)
            .filter(([_, value]) => value !== 0)
            .map(([stat, value]) => (
              <span key={stat} className="ability-effect">
                {stat.charAt(0).toUpperCase() + stat.slice(1)}: {formatModifier(value)}
              </span>
            ))}
        </div>
        
        <div className="ability-controls">
          {ability.variableInput && (
            <div className="ability-input">
              <label htmlFor={`ability-input-${ability.id}`}>
                {ability.inputLabel || 'Value:'}
              </label>
              <input
                id={`ability-input-${ability.id}`}
                type="number"
                min={ability.inputMin || 0}
                max={ability.inputMax || (character?.baseAttackBonus || 20)}
                step={ability.inputStep || 1}
                value={ability.inputValue || 0}
                onChange={(e) => onUpdate({
                  ...ability,
                  inputValue: parseInt(e.target.value) || 0
                })}
                disabled={!ability.isActive}
              />
              
              {/* Secondary input for abilities that need it, like Fighting Defensively */}
              {ability.hasSecondaryInput && (
                <div style={{ marginTop: '5px' }}>
                  <label htmlFor={`ability-secondary-input-${ability.id}`}>
                    {ability.secondaryInputLabel || 'Secondary Value:'}
                  </label>
                  <input
                    id={`ability-secondary-input-${ability.id}`}
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    value={ability.secondaryInputValue || 2}
                    onChange={(e) => onUpdate({
                      ...ability,
                      secondaryInputValue: parseInt(e.target.value) || 0
                    })}
                    disabled={!ability.isActive}
                    style={{ marginLeft: '5px' }}
                  />
                </div>
              )}
            </div>
          )}
          
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={ability.isActive}
              onChange={() => onToggle(ability.id)}
            />
            <span className="toggle-slider">
              <span className="toggle-label active">Active</span>
              <span className="toggle-label inactive">Inactive</span>
            </span>
          </label>
        </div>
      </div>
    );
  }
  
  // Edit mode
  return (
    <div className="ability-card editing">
      <div className="ability-header">
        <h3>Edit {ability.name}</h3>
        <div className="ability-actions">
          <button 
            type="button" 
            className="save-ability-btn"
            onClick={handleSave}
            title="Save Changes"
          >
            ✓
          </button>
          <button 
            type="button" 
            className="cancel-ability-btn"
            onClick={handleCancel}
            title="Cancel Editing"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="edit-ability-form">
        <div className="form-row">
          <div className="form-group">
            <label>Ability Name</label>
            <input
              type="text"
              value={editedAbility.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Action Type</label>
            <SelectWrapper>
              <select
                value={editedAbility.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="form-control"
              >
                {actionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
          
          <div className="form-group">
            <label>Bonus Type</label>
            <SelectWrapper>
              <select
                value={editedAbility.bonusType}
                onChange={(e) => handleChange('bonusType', e.target.value)}
                className="form-control"
              >
                {bonusTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={editedAbility.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="form-control"
              rows="2"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group variable-input-toggle">
            <label>
              <input
                type="checkbox"
                checked={editedAbility.variableInput}
                onChange={() => handleToggleField('variableInput')}
              />
              Variable Input (e.g., Power Attack)
            </label>
          </div>
        </div>
        
        {editedAbility.variableInput && (
          <div className="variable-input-settings">
            <div className="form-row">
              <div className="form-group">
                <label>Input Label</label>
                <input
                  type="text"
                  value={editedAbility.inputLabel || ''}
                  onChange={(e) => handleChange('inputLabel', e.target.value)}
                  className="form-control"
                  placeholder="e.g., Power Attack Penalty"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Min Value</label>
                <input
                  type="number"
                  value={editedAbility.inputMin || 0}
                  onChange={(e) => handleChange('inputMin', parseInt(e.target.value) || 0)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Max Value</label>
                <input
                  type="number"
                  value={editedAbility.inputMax || ''}
                  onChange={(e) => handleChange('inputMax', e.target.value ? parseInt(e.target.value) : null)}
                  className="form-control"
                  placeholder="BAB"
                />
              </div>
              
              <div className="form-group">
                <label>Step</label>
                <input
                  type="number"
                  value={editedAbility.inputStep || 1}
                  onChange={(e) => handleChange('inputStep', parseInt(e.target.value) || 1)}
                  className="form-control"
                  min="1"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group variable-input-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={editedAbility.hasSecondaryInput}
                    onChange={() => handleToggleField('hasSecondaryInput')}
                  />
                  Has Secondary Input (e.g., for Fighting Defensively)
                </label>
              </div>
            </div>
            
            {editedAbility.hasSecondaryInput && (
              <div className="form-row">
                <div className="form-group">
                  <label>Secondary Input Label</label>
                  <input
                    type="text"
                    value={editedAbility.secondaryInputLabel || ''}
                    onChange={(e) => handleChange('secondaryInputLabel', e.target.value)}
                    className="form-control"
                    placeholder="e.g., AC Bonus"
                  />
                </div>
                <div className="form-group">
                  <label>Default Value</label>
                  <input
                    type="number"
                    value={editedAbility.secondaryInputValue || 0}
                    onChange={(e) => handleChange('secondaryInputValue', parseInt(e.target.value) || 0)}
                    className="form-control"
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="ability-effects-form">
          <h4>Attribute Effects</h4>
          
          <div className="form-row effects-row">
            <div className="form-group">
              <label>STR</label>
              <input
                type="number"
                value={editedAbility.effects.strength || 0}
                onChange={(e) => handleEffectChange('strength', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>DEX</label>
              <input
                type="number"
                value={editedAbility.effects.dexterity || 0}
                onChange={(e) => handleEffectChange('dexterity', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>CON</label>
              <input
                type="number"
                value={editedAbility.effects.constitution || 0}
                onChange={(e) => handleEffectChange('constitution', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-row effects-row">
            <div className="form-group">
              <label>INT</label>
              <input
                type="number"
                value={editedAbility.effects.intelligence || 0}
                onChange={(e) => handleEffectChange('intelligence', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>WIS</label>
              <input
                type="number"
                value={editedAbility.effects.wisdom || 0}
                onChange={(e) => handleEffectChange('wisdom', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>CHA</label>
              <input
                type="number"
                value={editedAbility.effects.charisma || 0}
                onChange={(e) => handleEffectChange('charisma', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
          
          <h4>Combat Effects</h4>
          <div className="form-row effects-row">
            <div className="form-group">
              <label>Attack</label>
              <input
                type="number"
                value={editedAbility.effects.attackBonus || 0}
                onChange={(e) => handleEffectChange('attackBonus', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>AC</label>
              <input
                type="number"
                value={editedAbility.effects.ac || 0}
                onChange={(e) => handleEffectChange('ac', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Damage</label>
              <input
                type="number"
                value={editedAbility.effects.damage || 0}
                onChange={(e) => handleEffectChange('damage', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-row effects-row">
            <div className="form-group">
              <label>CMB</label>
              <input
                type="number"
                value={editedAbility.effects.cmb || 0}
                onChange={(e) => handleEffectChange('cmb', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>CMD</label>
              <input
                type="number"
                value={editedAbility.effects.cmd || 0}
                onChange={(e) => handleEffectChange('cmd', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
          
          <h4>Saving Throw Effects</h4>
          <div className="form-row effects-row">
            <div className="form-group">
              <label>Fortitude</label>
              <input
                type="number"
                value={editedAbility.effects.fortitude || 0}
                onChange={(e) => handleEffectChange('fortitude', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Reflex</label>
              <input
                type="number"
                value={editedAbility.effects.reflex || 0}
                onChange={(e) => handleEffectChange('reflex', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Will</label>
              <input
                type="number"
                value={editedAbility.effects.will || 0}
                onChange={(e) => handleEffectChange('will', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatAbilityItem;