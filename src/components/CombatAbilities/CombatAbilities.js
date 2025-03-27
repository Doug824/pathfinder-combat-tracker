import React, { useState } from 'react';
import { calculateFinalStats } from '../../utils/bonusCalculator';

const CombatAbilities = ({ 
  combatAbilities, 
  onCombatAbilitiesChange, 
  baseStats, 
  buffs, 
  gear,
  character
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
    bonusType: 'untyped', // Add this line to ensure bonusType is set
    variableInput: false, // Whether this ability needs a value input when activated
    inputLabel: '', // Label for the input field (e.g., "Power Attack Penalty")
    inputMax: null, // Maximum value for the input
    inputMin: 0, // Minimum value for the input
    inputStep: 1, // Step value for the input
    inputValue: 0, // Current value of the input
    // Secondary input fields for abilities that need two inputs (like Fighting Defensively)
    hasSecondaryInput: false, 
    secondaryInputLabel: '',
    secondaryInputValue: 0,
    effects: { 
      strength: 0, 
      dexterity: 0, 
      constitution: 0, 
      intelligence: 0, 
      wisdom: 0, 
      charisma: 0, 
      attackBonus: 0, 
      ac: 0, 
      fortitude: 0,
      reflex: 0,
      will: 0,
      damage: 0,
      cmb: 0,
      cmd: 0
    }
  });
  
  // Calculate variable effects based on input value and ability name/type
  const calculateVariableEffects = (ability, inputValue) => {
    if (!ability.variableInput) return ability.effects;
    
    let updatedEffects = { ...ability.effects };
    
    // Handle Improved Power Attack (sacrifice attack for damage)
    if (ability.name === 'Improved Power Attack') {
      updatedEffects = {
        ...updatedEffects,
        attackBonus: -inputValue,  // NEGATIVE
        damage: inputValue * 2     // POSITIVE
      };
      console.log(`Improved Power Attack effects: Attack ${-inputValue}, Damage +${inputValue * 2}`);
    }
    // Handle Greater Power Attack (sacrifice damage for attack)
    else if (ability.name === 'Greater Power Attack') {
      updatedEffects = {
        ...updatedEffects,
        attackBonus: inputValue,   // POSITIVE
        damage: -inputValue        // NEGATIVE
      };
      console.log(`Greater Power Attack effects: Attack +${inputValue}, Damage ${-inputValue}`);
    }
    // Handle Combat Expertise (sacrifice attack for AC)
    else if (ability.name === 'Combat Expertise') {
      updatedEffects = {
        ...updatedEffects,
        attackBonus: -inputValue,
        ac: inputValue
      };
    }
    // Handle Fighting Defensively (configurable sacrifice of attack for AC)
    else if (ability.name === 'Fighting Defensively') {
      const acBonus = ability.secondaryInputValue || 2;
      updatedEffects = {
        ...updatedEffects,
        attackBonus: -inputValue,
        ac: acBonus
      };
    }
    // Handle Deadly Aim (sacrifice attack for damage, like Power Attack for ranged)
    else if (ability.name === 'Deadly Aim') {
      updatedEffects = {
        ...updatedEffects,
        attackBonus: -inputValue,
        damage: inputValue * 2
      };
    }
    // Generic handler for other variable abilities
    else {
      // Default to Power Attack behavior for backward compatibility
      updatedEffects = {
        ...updatedEffects,
        attackBonus: -inputValue,
        damage: inputValue * 2
      };
    }
    
    return updatedEffects;
  };
  
  // Function to check if abilities are mutually exclusive
  const checkMutuallyExclusiveAbilities = (abilities, abilityId, isActive) => {
    // Define groups of mutually exclusive abilities
    const exclusiveGroups = [
      ['Improved Power Attack', 'Greater Power Attack'], // These abilities cannot be used together
      ['Combat Expertise', 'Deadly Aim', 'Improved Power Attack', 'Greater Power Attack'] // Complex exclusion group
      // Additional groups can be added here
    ];
    
    // If we're trying to activate an ability, check for conflicts
    if (isActive) {
      // Find the ability we're trying to activate
      const targetAbility = abilities.find(a => a.id === abilityId);
      if (!targetAbility) return abilities; // Safety check
      
      // Check if this ability belongs to any exclusive group
      for (let group of exclusiveGroups) {
        if (group.includes(targetAbility.name)) {
          // This ability is part of an exclusive group
          // We need to deactivate any other active abilities in this group
          return abilities.map(ability => {
            if (ability.id !== abilityId && group.includes(ability.name) && ability.isActive) {
              // This is a different ability in the same exclusive group and it's active
              // Deactivate it
              return { ...ability, isActive: false };
            }
            return ability;
          });
        }
      }
    }
    
    // If no conflicts or we're deactivating, return abilities unchanged
    return abilities;
  };
  
  // Handle adding predefined abilities
  const handleAddPredefinedAbilities = () => {
    // Get current base attack bonus
    const bab = (finalStats.baseAttackBonus || character?.baseAttackBonus || 5);
    
    // Create predefined abilities
    const predefinedAbilities = [
      {
        name: 'Improved Power Attack',
        description: 'Sacrifice attack bonus up to your BAB to gain double that amount as damage bonus.',
        type: 'passive',
        bonusType: 'untyped',
        isActive: false,
        variableInput: true,
        inputLabel: 'Attack Penalty',
        inputMax: bab,
        inputMin: 1,
        inputStep: 1,
        inputValue: 1,
        effects: {
          attackBonus: -1,  // NEGATIVE: reduces attack
          damage: 2         // POSITIVE: increases damage
        }
      },
      {
        name: 'Greater Power Attack',
        description: 'Sacrifice damage bonus up to your BAB to gain that amount as attack bonus.',
        type: 'passive',
        bonusType: 'untyped',
        isActive: false,
        variableInput: true,
        inputLabel: 'Damage Penalty',
        inputMax: bab,
        inputMin: 1,
        inputStep: 1,
        inputValue: 1,
        effects: {
          attackBonus: 1,   // POSITIVE: increases attack
          damage: -1        // NEGATIVE: reduces damage
        }
      },
      {
        name: 'Combat Expertise',
        description: 'Trade attack bonus for AC bonus at a 1-to-1 ratio.',
        type: 'passive',
        bonusType: 'dodge',
        isActive: false,
        variableInput: true,
        inputLabel: 'Exchange Value',
        inputMax: bab,
        inputMin: 1,
        inputStep: 1,
        inputValue: 1,
        effects: {
          attackBonus: -1,
          ac: 1
        }
      },
      {
        name: 'Deadly Aim',
        description: 'For ranged attacks: sacrifice accuracy for damage.',
        type: 'passive',
        bonusType: 'untyped',
        isActive: false,
        variableInput: true,
        inputLabel: 'Attack Penalty',
        inputMax: bab,
        inputMin: 1,
        inputStep: 1,
        inputValue: 1,
        effects: {
          attackBonus: -1,
          damage: 2
        }
      },
      {
        name: 'Fighting Defensively',
        description: 'Configure penalty to attacks and dodge bonus to AC.',
        type: 'passive',
        bonusType: 'dodge',
        isActive: false,
        variableInput: true,
        inputLabel: 'Attack Penalty',
        secondaryInputLabel: 'AC Bonus',
        inputMax: 10,
        inputMin: 1,
        inputStep: 1,
        inputValue: 4,
        secondaryInputValue: 2,
        hasSecondaryInput: true,
        effects: {
          attackBonus: -4,
          ac: 2
        }
      },
      {
        name: 'Rage',
        description: '+4 STR, +4 CON, +2 Will saves, -2 AC',
        type: 'standard',
        bonusType: 'morale',
        isActive: false,
        variableInput: false,
        effects: {
          strength: 4,
          constitution: 4,
          will: 2,
          ac: -2
        }
      },
      {
        name: 'Greater Rage',
        description: '+6 STR, +6 CON, +3 Will saves, -2 AC',
        type: 'standard',
        bonusType: 'morale',
        isActive: false,
        variableInput: false,
        effects: {
          strength: 6,
          constitution: 6,
          will: 3,
          ac: -2
        }
      },
      {
        name: 'Bless',
        description: '+1 morale bonus on attack rolls and saves vs. fear',
        type: 'standard',
        bonusType: 'morale',
        isActive: false,
        variableInput: false,
        effects: {
          attackBonus: 1,
          will: 1
        }
      }
    ];
    
    // Add IDs to the predefined abilities
    const abilitiesWithIds = predefinedAbilities.map(ability => ({
      ...ability,
      id: Date.now() + Math.random().toString(36).substr(2, 9) // Ensure unique IDs
    }));
    
    // Add to existing abilities (avoiding duplicates by name)
    const existingNames = combatAbilities.map(a => a.name);
    const newAbilities = [
      ...combatAbilities,
      ...abilitiesWithIds.filter(a => !existingNames.includes(a.name))
    ];
    
    onCombatAbilitiesChange(newAbilities);
  };
  
  // Handle adding a new combat ability
  const handleAddAbility = () => {
    if (newAbility.name.trim() === '') return;
    
    // Create a copy with a unique ID
    const abilityToAdd = { 
      ...newAbility, 
      id: Date.now(),
      isActive: false,
      inputValue: newAbility.inputMin || 0,
      bonusType: newAbility.bonusType || 'untyped'
    };
    
    // If it's a variable input ability, calculate its effects based on the starting value
    if (abilityToAdd.variableInput) {
      abilityToAdd.effects = calculateVariableEffects(abilityToAdd, abilityToAdd.inputValue);
    }
    
    // Update abilities
    const updatedAbilities = [...combatAbilities, abilityToAdd];
    onCombatAbilitiesChange(updatedAbilities);
    
    // Reset form
    setNewAbility({
      name: '',
      description: '',
      type: 'standard',
      isActive: false,
      bonusType: 'untyped',
      variableInput: false,
      inputLabel: '',
      inputMax: null,
      inputMin: 0,
      inputStep: 1,
      inputValue: 0,
      hasSecondaryInput: false,
      secondaryInputLabel: '',
      secondaryInputValue: 0,
      effects: { 
        strength: 0, 
        dexterity: 0, 
        constitution: 0, 
        intelligence: 0, 
        wisdom: 0, 
        charisma: 0, 
        attackBonus: 0, 
        ac: 0, 
        fortitude: 0,
        reflex: 0,
        will: 0,
        damage: 0,
        cmb: 0,
        cmd: 0
      }
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
          inputStep: 1,
          inputValue: 0,
          hasSecondaryInput: false,
          secondaryInputLabel: '',
          secondaryInputValue: 0
        };
      }
      
      // If turning off secondary input, reset its fields
      if (field === 'hasSecondaryInput' && value === false) {
        return {
          ...prev,
          [field]: value,
          secondaryInputLabel: '',
          secondaryInputValue: 0
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
    // Check for mutually exclusive abilities
    // This function prevents activating abilities that can't be used together
    // For example, you can't use both Improved Power Attack and Greater Power Attack at the same time
    let updatedAbilities = checkMutuallyExclusiveAbilities(combatAbilities, abilityId, isActive);
    
    // Now apply the toggle and effect calculation
    updatedAbilities = updatedAbilities.map(ability => {
      if (ability.id === abilityId) {
        // Start with the current effects
        let updatedEffects = { ...ability.effects };
        
        if (isActive) {
          // We're activating the ability
          
          if (ability.variableInput) {
            // For abilities with variable inputs like Power Attack
            if (ability.hasSecondaryInput && ability.name === 'Fighting Defensively') {
              // Special handling for Fighting Defensively which has two inputs
              updatedEffects = {
                ...ability.effects,
                attackBonus: -(ability.inputValue || 4),
                ac: ability.secondaryInputValue || 2
              };
            } else if (ability.name === 'Improved Power Attack') {
              // Improved Power Attack: subtract from attack, add to damage
              updatedEffects = {
                ...ability.effects,
                attackBonus: -ability.inputValue,  // NEGATIVE: penalty to attack
                damage: ability.inputValue * 2     // POSITIVE: bonus to damage (twice the penalty)
              };
            } else if (ability.name === 'Greater Power Attack') {
              // Greater Power Attack: add to attack, subtract from damage
              updatedEffects = {
                ...ability.effects,
                attackBonus: ability.inputValue,   // POSITIVE: bonus to attack
                damage: -ability.inputValue        // NEGATIVE: penalty to damage
              };
            } else if (ability.name === 'Combat Expertise') {
              // Combat Expertise: trade attack for AC
              updatedEffects = {
                ...ability.effects,
                attackBonus: -ability.inputValue,  // NEGATIVE: penalty to attack
                ac: ability.inputValue             // POSITIVE: bonus to AC
              };
            } else if (ability.name === 'Deadly Aim') {
              // Deadly Aim: ranged version of Power Attack
              updatedEffects = {
                ...ability.effects,
                attackBonus: -ability.inputValue,  // NEGATIVE: penalty to attack
                damage: ability.inputValue * 2     // POSITIVE: bonus to damage (twice the penalty)
              };
            } else {
              // Standard calculation for other variable abilities
              updatedEffects = calculateVariableEffects(ability, ability.inputValue || 0);
            }
          }
          
          // For fixed abilities like Rage, ensure AC penalty is applied
          if (ability.name === 'Rage' || ability.name === 'Greater Rage') {
            updatedEffects = {
              ...updatedEffects,
              ac: -2 // Ensure AC penalty is set
            };
          }
        }
        
        // Return the updated ability with new active state and effects
        return { 
          ...ability, 
          isActive,
          effects: updatedEffects
        };
      }
      
      // Return unchanged for all other abilities
      return ability;
    });
    
    // Pass the updated abilities array back to the parent component
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Handle ability input change
  const handleAbilityInputChange = (abilityId, value, isSecondary = false) => {
    const numValue = parseInt(value) || 0;
    
    const updatedAbilities = combatAbilities.map(ability => {
      if (ability.id === abilityId) {
        // Special case for secondary inputs (like Fighting Defensively)
        if (isSecondary) {
          // This is a secondary input value (like AC bonus for Fighting Defensively)
          let updatedAbility = {
            ...ability,
            secondaryInputValue: numValue
          };
          
          // Special handling based on ability name
          if (ability.name === 'Improved Power Attack') {
            updatedAbility.effects = {
              ...ability.effects,
              attackBonus: -numValue,  // NEGATIVE
              damage: numValue * 2     // POSITIVE
            };
          } else if (ability.name === 'Greater Power Attack') {
            updatedAbility.effects = {
              ...ability.effects,
              attackBonus: numValue,   // POSITIVE
              damage: -numValue        // NEGATIVE
            };
          } else if (ability.name === 'Fighting Defensively') {
            updatedAbility.effects = {
              ...ability.effects,
              attackBonus: -(ability.inputValue || 4),
              ac: numValue
            };
          } else if (ability.hasSecondaryInput) {
            // Handle abilities with secondary inputs...
          } else {
            // For other abilities, use the standard calculation
            updatedAbility.effects = calculateVariableEffects(ability, numValue);
          }
          
          return updatedAbility;
        }
      }
      return ability;
    });
    
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Get whether an ability can be used (might depend on other factors like remaining uses per day)
  const getCanUseAbility = (ability) => {
    // Add logic here for abilities with limited uses
    return true;
  };
  
  return (
    <div className="combat-abilities">
      <h2>Combat Abilities</h2>
      
      <button 
        type="button"
        onClick={handleAddPredefinedAbilities}
        className="add-predefined-abilities-button"
        style={{
          marginTop: '10px',
          marginBottom: '20px',
          background: 'var(--highlight-color)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'block',
          width: '100%'
        }}
      >
        Add Common Combat Abilities
      </button>
      
      <div className="active-abilities">
        {combatAbilities.length === 0 ? (
          <p>No combat abilities defined. Add abilities below or use the "Add Common Combat Abilities" button.</p>
        ) : (
          <div className="abilities-list">
            {combatAbilities.map(ability => {
              const canUse = getCanUseAbility(ability);
              const effects = ability.isActive && ability.variableInput ? 
                calculateVariableEffects(ability, ability.inputValue || 0) : ability.effects;
              
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
                    <span className="ability-type">{ability.type.charAt(0).toUpperCase() + ability.type.slice(1)} Action</span>
                    <span className="ability-bonus-type">Bonus Type: {ability.bonusType.charAt(0).toUpperCase() + ability.bonusType.slice(1)}</span>
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
                          max={ability.inputMax || (finalStats.baseAttackBonus || 20)}
                          step={ability.inputStep || 1}
                          value={ability.inputValue || 0}
                          onChange={(e) => handleAbilityInputChange(ability.id, e.target.value)}
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
                              onChange={(e) => handleAbilityInputChange(ability.id, e.target.value, true)}
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
              <option value="standard">Standard Action</option>
              <option value="move">Move Action</option>
              <option value="swift">Swift Action</option>
              <option value="immediate">Immediate Action</option>
              <option value="full-round">Full-Round Action</option>
              <option value="free">Free Action</option>
              <option value="passive">Passive/Always On</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Bonus Type</label>
            <select
              value={newAbility.bonusType}
              onChange={(e) => handleAbilityChange('bonusType', e.target.value)}
              className="form-control"
            >
              <option value="untyped">Untyped</option>
              <option value="enhancement">Enhancement</option>
              <option value="morale">Morale</option>
              <option value="competence">Competence</option>
              <option value="luck">Luck</option>
              <option value="sacred">Sacred</option>
              <option value="profane">Profane</option>
              <option value="dodge">Dodge</option>
              <option value="circumstance">Circumstance</option>
              <option value="insight">Insight</option>
              <option value="resistance">Resistance</option>
              <option value="size">Size</option>
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
            
            <div className="form-row">
              <div className="form-group variable-input-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={newAbility.hasSecondaryInput}
                    onChange={(e) => handleAbilityChange('hasSecondaryInput', e.target.checked)}
                  />
                  Has Secondary Input (e.g., for Fighting Defensively)
                </label>
              </div>
            </div>
            
            {newAbility.hasSecondaryInput && (
              <div className="form-row">
                <div className="form-group">
                  <label>Secondary Input Label</label>
                  <input
                    type="text"
                    value={newAbility.secondaryInputLabel}
                    onChange={(e) => handleAbilityChange('secondaryInputLabel', e.target.value)}
                    className="form-control"
                    placeholder="e.g., AC Bonus"
                  />
                </div>
                <div className="form-group">
                  <label>Default Value</label>
                  <input
                    type="number"
                    value={newAbility.secondaryInputValue}
                    onChange={(e) => handleAbilityChange('secondaryInputValue', parseInt(e.target.value) || 0)}
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
          
          <h4>Combat Effects</h4>
          <div className="form-row effects-row">
            <div className="form-group">
              <label>Attack</label>
              <input
                type="number"
                value={newAbility.effects.attackBonus}
                onChange={(e) => handleEffectChange('attackBonus', e.target.value)}
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
          
          <div className="form-row effects-row">
            <div className="form-group">
              <label>CMB</label>
              <input
                type="number"
                value={newAbility.effects.cmb}
                onChange={(e) => handleEffectChange('cmb', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>CMD</label>
              <input
                type="number"
                value={newAbility.effects.cmd}
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
                value={newAbility.effects.fortitude}
                onChange={(e) => handleEffectChange('fortitude', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Reflex</label>
              <input
                type="number"
                value={newAbility.effects.reflex}
                onChange={(e) => handleEffectChange('reflex', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Will</label>
              <input
                type="number"
                value={newAbility.effects.will}
                onChange={(e) => handleEffectChange('will', e.target.value)}
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