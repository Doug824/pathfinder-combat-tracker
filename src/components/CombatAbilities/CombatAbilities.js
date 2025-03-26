import React, { useState } from 'react';
import { calculateFinalStats } from '../../utils/bonusCalculator';

const CombatAbilities = ({ 
  combatAbilities, 
  onCombatAbilitiesChange, 
  baseStats, 
  buffs, 
  gear 
}) => {
  // Calculate base values including gear and permanent buffs
  const { finalStats } = calculateFinalStats(
    baseStats, 
    buffs.filter(buff => buff.durationType === 'permanent' || buff.duration === null), 
    gear
  );
  
  // State for new ability form
  const [newAbility, setNewAbility] = useState({
    name: '',
    description: '',
    type: 'standard', // standard, swift, move, full-round, etc.
    isActive: false,
    variableInput: false, // Whether this ability needs a value input when activated
    inputLabel: '', // Label for the input field (e.g., "Power Attack Penalty")
    inputMax: null, // Maximum value for the input
    inputMin: 0, // Minimum value for the input
    inputStep: 1, // Step value for the input
    effects: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0, bab: 0, ac: 0, damage: 0 }
  });
  
  // State for ability activation inputs
  const [abilityInputs, setAbilityInputs] = useState({});
  
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
  
  // Helper function to determine if field should be shown for the input type
  const showForInputType = (fieldName) => {
    if (!newAbility.variableInput) return false;
    
    if (fieldName === 'inputLabel') return true;
    if (fieldName === 'inputMax') return true;
    if (fieldName === 'inputMin') return true;
    if (fieldName === 'inputStep') return true;
    
    return false;
  };
  
  // Handle adding a new combat ability
  const handleAddAbility = () => {
    if (newAbility.name.trim() === '') return;
    
    // Create a copy with a unique ID
    const abilityToAdd = { 
      ...newAbility, 
      id: Date.now(),
      isActive: false
    };
    
    // Update abilities
    const updatedAbilities = [...combatAbilities, abilityToAdd];
    onCombatAbilitiesChange(updatedAbilities);
    
    // Reset form
    setNewAbility({
      name: '',
      description: '',
      type: 'standard',
      isActive: false,
      variableInput: false,
      inputLabel: '',
      inputMax: null,
      inputMin: 0,
      inputStep: 1,
      effects: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0, bab: 0, ac: 0, damage: 0 }
    });
  };
  
  // Handle removing a combat ability
  const handleRemoveAbility = (abilityId) => {
    const updatedAbilities = combatAbilities.filter(ability => ability.id !== abilityId);
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Handle form field changes
  const handleAbilityChange = (field, value) => {
    setNewAbility(prev => {
      // If turning off variable input, reset related fields
      if (field === 'variableInput' && value === false) {
        return {
          ...prev,
          [field]: value,
          inputLabel: '',
          inputMax: null,
          inputMin: 0,
          inputStep: 1
        };
      }
      
      return { ...prev, [field]: value };
    });
  };
  
  // Handle effect changes
  const handleEffectChange = (stat, value) => {
    setNewAbility(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [stat]: parseInt(value) || 0
      }
    }));
  };
  
  // Handle activation/deactivation of an ability
  const handleToggleAbility = (abilityId, isActive) => {
    const updatedAbilities = combatAbilities.map(ability => {
      if (ability.id === abilityId) {
        return { ...ability, isActive };
      }
      return ability;
    });
    
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Handle ability input change
  const handleAbilityInputChange = (abilityId, value) => {
    const numValue = parseInt(value) || 0;
    setAbilityInputs(prev => ({
      ...prev,
      [abilityId]: numValue
    }));
    
    // Recalculate effects based on the input value
    const ability = combatAbilities.find(a => a.id === abilityId);
    if (ability && ability.variableInput) {
      // This would need logic specific to abilities like Power Attack
      // where the effect scales with the input value
    }
  };
  
  // Calculate the current effects of an ability
  const calculateAbilityEffects = (ability) => {
    if (!ability.isActive) return ability.effects;
    
    if (ability.variableInput) {
      const inputValue = abilityInputs[ability.id] || 0;
      
      // Example: Power Attack - For every point of BAB sacrificed, gain twice that in damage
      if (ability.name.toLowerCase().includes('power attack')) {
        return {
          ...ability.effects,
          bab: -inputValue,
          damage: inputValue * 2
        };
      }
      
      // Default for other variable abilities - just return effects as is
      return ability.effects;
    }
    
    return ability.effects;
  };
  
  // Get whether an ability can be used (might depend on other factors like remaining uses per day)
  const getCanUseAbility = (ability) => {
    // Add logic here for abilities with limited uses
    return true;
  };
  
  return (
    <div className="combat-abilities">
      <h2>Combat Abilities</h2>
      
      <div className="active-abilities">
        {combatAbilities.length === 0 ? (
          <p>No combat abilities defined. Add abilities below.</p>
        ) : (
          <div className="abilities-list">
            {combatAbilities.map(ability => {
              const canUse = getCanUseAbility(ability);
              const effects = calculateAbilityEffects(ability);
              
              return (
                <div key={ability.id} className={`ability-card ${ability.isActive ? 'active' : ''}`}>
                  <div className="ability-header">
                    <h3>{ability.name}</h3>
                    <button 
                      className="remove-ability-btn"
                      onClick={() => handleRemoveAbility(ability.id)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="ability-meta">
                    <span className="ability-type">{actionTypes.find(t => t.value === ability.type)?.label}</span>
                  </div>
                  
                  {ability.description && (
                    <div className="ability-description">
                      {ability.description}
                    </div>
                  )}
                  
                  <div className="ability-effects">
                    {Object.entries(effects)
                      .filter(([_, value]) => value !== 0)
                      .map(([stat, value]) => (
                        <span key={stat} className="ability-effect">
                          {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value > 0 ? '+' : ''}{value}
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
                          max={ability.inputMax || (finalStats.bab || 20)}
                          step={ability.inputStep || 1}
                          value={abilityInputs[ability.id] || 0}
                          onChange={(e) => handleAbilityInputChange(ability.id, e.target.value)}
                          disabled={!ability.isActive}
                        />
                      </div>
                    )}
                    
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={ability.isActive}
                        onChange={(e) => handleToggleAbility(ability.id, e.target.checked)}
                        disabled={!canUse}
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-label">{ability.isActive ? 'Active' : 'Inactive'}</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="new-ability-form">
        <h3>Add New Combat Ability</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label>Ability Name</label>
            <input
              type="text"
              value={newAbility.name}
              onChange={(e) => handleAbilityChange('name', e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Action Type</label>
            <select
              value={newAbility.type}
              onChange={(e) => handleAbilityChange('type', e.target.value)}
              className="form-control"
            >
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newAbility.description}
              onChange={(e) => handleAbilityChange('description', e.target.value)}
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
                checked={newAbility.variableInput}
                onChange={(e) => handleAbilityChange('variableInput', e.target.checked)}
              />
              Variable Input (e.g., Power Attack)
            </label>
          </div>
        </div>
        
        {newAbility.variableInput && (
          <div className="variable-input-settings">
            <div className="form-row">
              <div className="form-group">
                <label>Input Label</label>
                <input
                  type="text"
                  value={newAbility.inputLabel}
                  onChange={(e) => handleAbilityChange('inputLabel', e.target.value)}
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
                  value={newAbility.inputMin}
                  onChange={(e) => handleAbilityChange('inputMin', parseInt(e.target.value) || 0)}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label>Max Value</label>
                <input
                  type="number"
                  value={newAbility.inputMax || ''}
                  onChange={(e) => handleAbilityChange('inputMax', e.target.value ? parseInt(e.target.value) : null)}
                  className="form-control"
                  placeholder="BAB"
                />
              </div>
              
              <div className="form-group">
                <label>Step</label>
                <input
                  type="number"
                  value={newAbility.inputStep}
                  onChange={(e) => handleAbilityChange('inputStep', parseInt(e.target.value) || 1)}
                  className="form-control"
                  min="1"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="ability-effects-form">
          <h4>Ability Effects</h4>
          
          <div className="form-row effects-row">
            <div className="form-group">
              <label>STR</label>
              <input
                type="number"
                value={newAbility.effects.strength}
                onChange={(e) => handleEffectChange('strength', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>DEX</label>
              <input
                type="number"
                value={newAbility.effects.dexterity}
                onChange={(e) => handleEffectChange('dexterity', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>CON</label>
              <input
                type="number"
                value={newAbility.effects.constitution}
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
                value={newAbility.effects.intelligence}
                onChange={(e) => handleEffectChange('intelligence', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>WIS</label>
              <input
                type="number"
                value={newAbility.effects.wisdom}
                onChange={(e) => handleEffectChange('wisdom', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>CHA</label>
              <input
                type="number"
                value={newAbility.effects.charisma}
                onChange={(e) => handleEffectChange('charisma', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
          
          <div className="form-row effects-row">
            <div className="form-group">
              <label>BAB</label>
              <input
                type="number"
                value={newAbility.effects.bab}
                onChange={(e) => handleEffectChange('bab', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>AC</label>
              <input
                type="number"
                value={newAbility.effects.ac}
                onChange={(e) => handleEffectChange('ac', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Damage</label>
              <input
                type="number"
                value={newAbility.effects.damage}
                onChange={(e) => handleEffectChange('damage', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={handleAddAbility}
          className="add-ability-button"
        >
          Add Ability
        </button>
      </div>
    </div>
  );
};

export default CombatAbilities;