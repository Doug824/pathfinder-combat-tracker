import React, { useState } from 'react';
import { calculateFinalStats } from '../../utils/bonusCalculator';
import CombatAbilityItem from './combatAbilityItem';
import NumericInput from '../common/NumericInput';

const CombatAbilities = ({ 
  combatAbilities, 
  onCombatAbilitiesChange, 
  baseStats, 
  buffs, 
  gear,
  character
}) => {
  // Define the missing actionTypes variable
  const actionTypes = [
    { value: 'standard', label: 'Standard Action' },
    { value: 'move', label: 'Move Action' },
    { value: 'swift', label: 'Swift Action' },
    { value: 'immediate', label: 'Immediate Action' },
    { value: 'full-round', label: 'Full-Round Action' },
    { value: 'free', label: 'Free Action' },
    { value: 'passive', label: 'Passive/Always On' }
  ];
  
  // Define the missing bonusTypes variable
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
    bonusType: 'untyped', // ensure bonusType is set
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
  
  // Add the missing handleToggleField function
  const handleToggleField = (field) => {
    setNewAbility(prev => {
      // If turning off variable input, reset related fields
      if (field === 'variableInput' && prev[field] === true) {
        return {
          ...prev,
          [field]: false,
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
      if (field === 'hasSecondaryInput' && prev[field] === true) {
        return {
          ...prev,
          [field]: false,
          secondaryInputLabel: '',
          secondaryInputValue: 0
        };
      }
      
      return { ...prev, [field]: !prev[field] };
    });
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
        } else {
          // Add handling for primary input change
          let updatedAbility = {
            ...ability,
            inputValue: numValue
          };
          
          // Update effects based on the new input value
          if (ability.variableInput) {
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
            } else {
              // Use the calculateVariableEffects function for other abilities
              updatedAbility.effects = calculateVariableEffects(ability, numValue);
            }
          }
          
          return updatedAbility;
        }
      }
      return ability;
    });
    
    onCombatAbilitiesChange(updatedAbilities);
  };

  // Calculate variable effects based on input value and ability name/type
  const calculateVariableEffects = (ability, inputValue) => {
    const numValue = parseInt(inputValue) || 0;

    if (!ability.variableInput) return ability.effects;
    
    let updatedEffects = { ...ability.effects };
    
    // Handle Improved Power Attack (sacrifice attack for damage)
    if (ability.name === 'Improved Power Attack') {
      updatedEffects = {
        ...updatedEffects,
        attackBonus: -numValue,
        damage: numValue * 2
      };
    }
    // Handle Greater Power Attack (sacrifice damage for attack)
    else if (ability.name === 'Greater Power Attack') {
      updatedEffects = {
        ...updatedEffects,
        attackBonus: inputValue,   // POSITIVE
        damage: -inputValue        // NEGATIVE
      };
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
    // First check for mutually exclusive abilities
    let updatedAbilities = checkMutuallyExclusiveAbilities(combatAbilities, abilityId, isActive);
    
    // Now apply the toggle 
    updatedAbilities = updatedAbilities.map(ability => {
      if (ability.id === abilityId) {
        // If we're activating the ability and it has variable input, make sure effects are calculated
        if (isActive && ability.variableInput) {
          // Use the function we fixed above to calculate effects
          const updatedEffects = calculateVariableEffects(ability, ability.inputValue || 0);
          
          return { 
            ...ability, 
            isActive,
            effects: updatedEffects
          };
        } else {
          // For non-variable abilities or when deactivating
          return { 
            ...ability, 
            isActive
          };
        }
      }
      
      // Return unchanged for all other abilities
      return ability;
    });
    
    // Apply the changes
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  const handleUpdateAbility = (updatedAbility) => {
    const updatedAbilities = combatAbilities.map(ability => 
      ability.id === updatedAbility.id ? updatedAbility : ability
    );
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Get whether an ability can be used (might depend on other factors like remaining uses per day)
  const getCanUseAbility = (ability) => {
    // Add logic here for abilities with limited uses
    return true;
  };
  
  return (
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
      <h2 className="text-2xl font-fantasy font-bold text-amber-400 mb-6 border-b border-amber-700/30 pb-2">Combat Abilities</h2>
      
      <button 
        type="button"
        onClick={handleAddPredefinedAbilities}
        className="w-full bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 px-6 py-3 rounded-lg border border-amber-600/50 font-fantasy font-bold transition-all duration-200 shadow-lg hover:shadow-amber-500/25 mb-6"
      >
        Add Common Combat Abilities
      </button>
      
      <div className="mb-8">
        {combatAbilities.length === 0 ? (
          <p className="text-amber-200/70 text-center py-8">No combat abilities defined. Add abilities below or use the "Add Common Combat Abilities" button.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combatAbilities.map(ability => (
            <CombatAbilityItem
              key={ability.id}
              ability={ability}
              onRemove={handleRemoveAbility}
              onUpdate={handleUpdateAbility}
              onToggle={handleToggleAbility}
              character={character}
              baseStats={baseStats}
            />
          ))}
        </div>
        )}
      </div>
      
      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-6">
        <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-6 border-b border-amber-700/30 pb-2">Add New Combat Ability</h3>
        
        <div className="mb-6">
          <label className="block text-amber-300 font-fantasy font-semibold mb-2">Ability Name</label>
          <input
            type="text"
            value={newAbility.name}
            onChange={(e) => handleAbilityChange('name', e.target.value)}
            className="input-fantasy w-full"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-amber-300 font-fantasy font-semibold mb-2">Action Type</label>
            <select
              value={newAbility.type}
              onChange={(e) => handleAbilityChange('type', e.target.value)}
              className="input-fantasy w-full"
            >
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-amber-300 font-fantasy font-semibold mb-2">Bonus Type</label>
            <select
              value={newAbility.bonusType}
              onChange={(e) => handleAbilityChange('bonusType', e.target.value)}
              className="input-fantasy w-full"
            >
              {bonusTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-amber-300 font-fantasy font-semibold mb-2">Description</label>
          <textarea
            value={newAbility.description || ''}
            onChange={(e) => handleAbilityChange('description', e.target.value)}
            className="input-fantasy w-full resize-vertical"
            rows="2"
          />
        </div>
        
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer bg-black/30 rounded-lg border border-amber-700/20 p-3">
            <input
              type="checkbox"
              checked={newAbility.variableInput}
              onChange={() => handleToggleField('variableInput')}
              className="w-5 h-5 text-amber-600 bg-black/60 border-amber-700 rounded focus:ring-amber-500"
            />
            <span className="text-amber-200 font-fantasy font-semibold">Variable Input (e.g., Power Attack)</span>
          </label>
        </div>
        
        {newAbility.variableInput && (
          <div className="bg-black/30 rounded-lg border border-amber-700/20 p-4 mb-6">
            <div className="mb-4">
              <label className="block text-amber-300 font-fantasy font-semibold mb-2">Input Label</label>
              <input
                type="text"
                value={newAbility.inputLabel || ''}
                onChange={(e) => handleAbilityChange('inputLabel', e.target.value)}
                className="input-fantasy w-full"
                placeholder="e.g., Power Attack Penalty"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-amber-300 font-fantasy font-semibold mb-2">Min Value</label>
                <NumericInput
                  value={newAbility.inputMin || 0}
                  onChange={(value) => handleAbilityChange('inputMin', value)}
                  className="input-fantasy w-full"
                  min={0}
                  max={30}
                />
              </div>
              
              <div>
                <label className="block text-amber-300 font-fantasy font-semibold mb-2">Max Value</label>
                <NumericInput
                  value={newAbility.inputMax || 0}
                  onChange={(value) => handleAbilityChange('inputMax', value)}
                  className="input-fantasy w-full"
                  min={0}
                  max={30}
                />
              </div>
              
              <div>
                <label className="block text-amber-300 font-fantasy font-semibold mb-2">Step</label>
                <input
                  type="number"
                  value={newAbility.inputStep || 1}
                  onChange={(e) => handleAbilityChange('inputStep', parseInt(e.target.value) || 1)}
                  className="input-fantasy w-full"
                  min="1"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          <h4 className="text-lg font-fantasy font-bold text-amber-400 border-b border-amber-700/30 pb-2">Attribute Effects</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
              <div key={stat} className="space-y-2">
                <label className="block text-amber-300 font-fantasy font-semibold text-sm">{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                <NumericInput
                  value={newAbility.effects[stat] || 0}
                  onChange={(value) => handleEffectChange(stat, value)}
                  className="input-fantasy w-full"
                  min={-10}
                  max={40}
                />
              </div>
            ))}
          </div>
          
          <h4 className="text-lg font-fantasy font-bold text-amber-400 border-b border-amber-700/30 pb-2">Combat Effects</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">Attack</label>
              <input
                type="number"
                value={newAbility.effects.attackBonus || 0}
                onChange={(e) => handleEffectChange('attackBonus', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">AC</label>
              <input
                type="number"
                value={newAbility.effects.ac || 0}
                onChange={(e) => handleEffectChange('ac', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">Damage</label>
              <input
                type="number"
                value={newAbility.effects.damage || 0}
                onChange={(e) => handleEffectChange('damage', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">CMB</label>
              <input
                type="number"
                value={newAbility.effects.cmb || 0}
                onChange={(e) => handleEffectChange('cmb', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">CMD</label>
              <input
                type="number"
                value={newAbility.effects.cmd || 0}
                onChange={(e) => handleEffectChange('cmd', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
          </div>
          
          <h4 className="text-lg font-fantasy font-bold text-amber-400 border-b border-amber-700/30 pb-2">Saving Throw Effects</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">Fortitude</label>
              <input
                type="number"
                value={newAbility.effects.fortitude || 0}
                onChange={(e) => handleEffectChange('fortitude', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">Reflex</label>
              <input
                type="number"
                value={newAbility.effects.reflex || 0}
                onChange={(e) => handleEffectChange('reflex', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold text-sm">Will</label>
              <input
                type="number"
                value={newAbility.effects.will || 0}
                onChange={(e) => handleEffectChange('will', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
          </div>
        </div>
        
        <button 
          type="button"
          onClick={handleAddAbility}
          className="w-full bg-forest-green/80 hover:bg-forest-green/90 text-parchment-light px-6 py-3 rounded-lg border border-forest-green/50 font-fantasy font-bold transition-all duration-200 shadow-lg hover:shadow-nature-green mt-6"
        >
          Add Ability
        </button>
      </div>
    </div>
  );
};

export default CombatAbilities;