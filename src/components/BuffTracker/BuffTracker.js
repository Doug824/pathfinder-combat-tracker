import React, { useState, useEffect } from 'react';
import './BuffTracker.css';

const BuffTracker = ({ onBuffsChange, initialBuffs, onSaveBuff }) => {
  const [buffs, setBuffs] = useState(initialBuffs || []);
  
  // Update buffs when initialBuffs changes (e.g., when selecting a different character)
  useEffect(() => {
    if (initialBuffs) {
      setBuffs(initialBuffs);
    }
  }, [initialBuffs]);
  
  const [newBuff, setNewBuff] = useState({
    name: '',
    duration: 1,
    durationType: 'rounds',
    bonusType: 'enhancement', // Default bonus type
    effects: { 
      strength: 0, 
      dexterity: 0, 
      constitution: 0, 
      intelligence: 0, 
      wisdom: 0, 
      charisma: 0,
      attackBonus: 0,
      fortitude: 0,
      reflex: 0,
      will: 0,
      ac: 0,
      naturalArmor: 0,
    }
  });
  
  // Duration type options for the dropdown
  const durationTypes = [
    { value: 'rounds', label: 'Rounds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'permanent', label: 'Permanent' }
  ];
  
  // Bonus type options
  const bonusTypes = [
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'luck', label: 'Luck' },
    { value: 'sacred', label: 'Sacred' },
    { value: 'profane', label: 'Profane' },
    { value: 'resistance', label: 'Resistance' },
    { value: 'alchemical', label: 'Alchemical' },
    { value: 'armor', label: 'Armor' },
    { value: 'competence', label: 'Competence' },
    { value: 'circumstance', label: 'Circumstance' },
    { value: 'deflection', label: 'Deflection' },
    { value: 'dodge', label: 'Dodge' },
    { value: 'inherent', label: 'Inherent' },
    { value: 'insight', label: 'Insight' },
    { value: 'morale', label: 'Morale' },
    { value: 'natural', label: 'Natural Armor' },
    { value: 'shield', label: 'Shield' },
    { value: 'size', label: 'Size' },
    { value: 'trait', label: 'Trait' },
    { value: 'untyped', label: 'Untyped' }
  ];
  
  const handleAddBuff = () => {
    if (newBuff.name.trim() === '') return;
    
    // Create a copy of the buff with a unique ID
    const buffToAdd = { 
      ...newBuff, 
      id: Date.now(),
      // Set duration to null if permanent
      duration: newBuff.durationType === 'permanent' ? null : newBuff.duration 
    };
    
    const updatedBuffs = [...buffs, buffToAdd];
    setBuffs(updatedBuffs);
    onBuffsChange(updatedBuffs);
    
    // Reset form
    setNewBuff({
      name: '',
      duration: 1,
      durationType: 'rounds',
      bonusType: 'enhancement',
      effects: { 
        strength: 0, 
        dexterity: 0, 
        constitution: 0, 
        intelligence: 0, 
        wisdom: 0, 
        charisma: 0,
        attackBonus: 0,
        fortitude: 0,
        reflex: 0,
        will: 0,
        ac: 0
      }
    });
  };
  
  const handleRemoveBuff = (buffId) => {
    const updatedBuffs = buffs.filter(buff => buff.id !== buffId);
    setBuffs(updatedBuffs);
    onBuffsChange(updatedBuffs);
  };
  
  const handleBuffChange = (field, value) => {
    setNewBuff(prev => ({ ...prev, [field]: value }));
  };
  
  const handleEffectChange = (stat, value) => {
    setNewBuff(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [stat]: parseInt(value) || 0
      }
    }));
  };
  
  // Format the duration for display
  const formatDuration = (buff) => {
    if (buff.durationType === 'permanent' || buff.duration === null) {
      return 'Permanent';
    }
    return `${buff.duration} ${buff.durationType}`;
  };
  
  // New function to handle saving a buff to the library
  const handleSaveBuff = (buff) => {
    if (onSaveBuff) {
      // Create a copy suitable for saving in the library
      const buffToSave = {
        ...buff,
        id: `saved-${Date.now()}`,
        category: 'Custom', // Default category
        description: `${buff.bonusType.charAt(0).toUpperCase() + buff.bonusType.slice(1)} bonus` // Simple description
      };
      
      // Call the handler provided by the parent
      onSaveBuff(buffToSave);
    } else {
      console.warn("Cannot save buff: onSaveBuff function not provided");
    }
  };
  
  return (
    <div className="buff-tracker">
      <h2>Active Buffs & Effects</h2>
      
      <div className="active-buffs card-grid-layout">
        {buffs.length === 0 ? (
          <p>No active buffs</p>
        ) : (
          buffs.map(buff => (
            <div key={buff.id} className="buff-card">
              <h3>{buff.name}</h3>
              <div className="buff-meta">
                <span>Duration: {formatDuration(buff)}</span>
                <span>Type: {buff.bonusType.charAt(0).toUpperCase() + buff.bonusType.slice(1)}</span>
              </div>
              <div className="buff-effects">
                {Object.entries(buff.effects)
                  .filter(([_, value]) => value !== 0)
                  .map(([stat, value]) => (
                    <p key={stat}>
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value > 0 ? '+' : ''}{value}
                    </p>
                  ))}
              </div>
              <div className="buff-actions">
                <button onClick={() => handleRemoveBuff(buff.id)} className="remove-buff-btn">Remove</button>
                {onSaveBuff && (
                  <button onClick={() => handleSaveBuff(buff)} className="save-buff-btn">Save to Library</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="new-buff-form">
        <h3>Add New Buff</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Name:</label>
            <input 
              type="text" 
              value={newBuff.name}
              onChange={(e) => handleBuffChange('name', e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group" style={{ flex: '1', maxWidth: '200px' }}>
            <label>Duration:</label>
            <div className="duration-container">
              {newBuff.durationType !== 'permanent' && (
                <input 
                  type="number" 
                  min="1"
                  value={newBuff.duration}
                  onChange={(e) => handleBuffChange('duration', parseInt(e.target.value))}
                  className="duration-input form-control"
                />
              )}
              
              <select
                value={newBuff.durationType}
                onChange={(e) => handleBuffChange('durationType', e.target.value)}
                className="duration-type-select form-control"
              >
                {durationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group" style={{ flex: '1', maxWidth: '200px' }}>
            <label>Bonus Type:</label>
            <select
              value={newBuff.bonusType}
              onChange={(e) => handleBuffChange('bonusType', e.target.value)}
              className="bonus-type-select form-control"
            >
              {bonusTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="stat-effects">
          <h4>Attribute Bonuses/Penalties</h4>
          <div className="effects-grid">
            {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
              <div key={stat} className="stat-effect-row">
                <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                <input 
                  type="number" 
                  value={newBuff.effects[stat]}
                  onChange={(e) => handleEffectChange(stat, e.target.value)}
                  className="form-control"
                />
              </div>
            ))}
          </div>
          
          <h4>Combat Bonuses/Penalties</h4>
          <div className="effects-grid">
            <div className="stat-effect-row">
              <label>Attack Bonus:</label>
              <input 
                type="number" 
                value={newBuff.effects.attackBonus}
                onChange={(e) => handleEffectChange('attackBonus', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="stat-effect-row">
              <label>AC:</label>
              <input 
                type="number" 
                value={newBuff.effects.ac}
                onChange={(e) => handleEffectChange('ac', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="stat-effect-row">
              <label>Fortitude:</label>
              <input 
                type="number" 
                value={newBuff.effects.fortitude}
                onChange={(e) => handleEffectChange('fortitude', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="stat-effect-row">
              <label>Reflex:</label>
              <input 
                type="number" 
                value={newBuff.effects.reflex}
                onChange={(e) => handleEffectChange('reflex', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="stat-effect-row">
              <label>Will:</label>
              <input 
                type="number" 
                value={newBuff.effects.will}
                onChange={(e) => handleEffectChange('will', e.target.value)}
                className="form-control"
              />
            </div>
            
            <div className="stat-effect-row">
              <label>Natural Armor:</label>
              <input 
                type="number" 
                value={newBuff.effects.naturalArmor}
                onChange={(e) => handleEffectChange('naturalArmor', e.target.value)}
                className="form-control"
              />
            </div>
          </div>
        </div>
        
        <button onClick={handleAddBuff} className="add-buff-button">
          Add Buff
        </button>
      </div>
    </div>
  );
};

export default BuffTracker;