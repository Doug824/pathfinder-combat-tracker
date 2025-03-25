import React, { useState, useEffect } from 'react';

const CharacterForm = ({ character, onSaveCharacter, onCancel }) => {
  const [characterData, setCharacterData] = useState({
    id: character?.id || null,
    name: character?.name || '',
    level: character?.level || 1,
    characterClass: character?.characterClass || '',
    race: character?.race || '',
    alignment: character?.alignment || '',
    stats: character?.stats || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    buffs: character?.buffs || [],
    gear: character?.gear || [] // Add gear array to character data
  });
  
  // State for new gear item form
  const [newGearItem, setNewGearItem] = useState({
    name: '',
    slot: 'head',
    bonusType: 'enhancement',
    effects: { 
      strength: 0, 
      dexterity: 0, 
      constitution: 0, 
      intelligence: 0, 
      wisdom: 0, 
      charisma: 0,
      bab: 0,
      ac: 0
    }
  });
  
  // Equipment slots based on Pathfinder rules
  const equipmentSlots = [
    { value: 'head', label: 'Head' },
    { value: 'headband', label: 'Headband' },
    { value: 'eyes', label: 'Eyes' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'neck', label: 'Neck' },
    { value: 'chest', label: 'Chest' },
    { value: 'body', label: 'Body' },
    { value: 'armor', label: 'Armor' },
    { value: 'belt', label: 'Belt' },
    { value: 'wrists', label: 'Wrists' },
    { value: 'hands', label: 'Hands' },
    { value: 'ring1', label: 'Ring 1' },
    { value: 'ring2', label: 'Ring 2' },
    { value: 'feet', label: 'Feet' },
    { value: 'weapon', label: 'Weapon' },
    { value: 'shield', label: 'Shield' },
    { value: 'other', label: 'Other' }
  ];
  
  // Bonus types - same as in BuffTracker
  const bonusTypes = [
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'luck', label: 'Luck' },
    { value: 'sacred', label: 'Sacred' },
    { value: 'profane', label: 'Profane' },
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacterData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStatChange = (stat, value) => {
    setCharacterData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: parseInt(value) || 0
      }
    }));
  };
  
  const handleAddGear = () => {
    if (newGearItem.name.trim() === '') return;
    
    // Create a copy of the gear item with a unique ID
    const gearToAdd = { 
      ...newGearItem, 
      id: Date.now() 
    };
    
    // Update character data with new gear
    const updatedGear = [...characterData.gear, gearToAdd];
    setCharacterData(prev => ({
      ...prev,
      gear: updatedGear
    }));
    
    // Reset form
    setNewGearItem({
      name: '',
      slot: 'head',
      bonusType: 'enhancement',
      effects: { 
        strength: 0, 
        dexterity: 0, 
        constitution: 0, 
        intelligence: 0, 
        wisdom: 0, 
        charisma: 0,
        bab: 0,
        ac: 0
      }
    });
  };
  
  const handleRemoveGear = (gearId) => {
    const updatedGear = characterData.gear.filter(item => item.id !== gearId);
    setCharacterData(prev => ({
      ...prev,
      gear: updatedGear
    }));
  };
  
  const handleGearChange = (field, value) => {
    setNewGearItem(prev => ({ ...prev, [field]: value }));
  };
  
  const handleGearEffectChange = (stat, value) => {
    setNewGearItem(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [stat]: parseInt(value) || 0
      }
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveCharacter(characterData);
  };
  
  return (
    <div className="character-form-container">
      <h2>{character ? 'Edit Character' : 'Create New Character'}</h2>
      <form onSubmit={handleSubmit} className="character-form">
        <div className="form-group">
          <label htmlFor="name">Character Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={characterData.name}
            onChange={handleChange}
            required
            className="form-control"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="level">Level</label>
            <input
              type="number"
              id="level"
              name="level"
              min="1"
              max="20"
              value={characterData.level}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="characterClass">Class</label>
            <input
              type="text"
              id="characterClass"
              name="characterClass"
              value={characterData.characterClass}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="race">Race</label>
            <input
              type="text"
              id="race"
              name="race"
              value={characterData.race}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="alignment">Alignment</label>
            <select
              id="alignment"
              name="alignment"
              value={characterData.alignment}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Alignment</option>
              <option value="LG">Lawful Good</option>
              <option value="NG">Neutral Good</option>
              <option value="CG">Chaotic Good</option>
              <option value="LN">Lawful Neutral</option>
              <option value="N">True Neutral</option>
              <option value="CN">Chaotic Neutral</option>
              <option value="LE">Lawful Evil</option>
              <option value="NE">Neutral Evil</option>
              <option value="CE">Chaotic Evil</option>
            </select>
          </div>
        </div>
        
        <h3>Base Attributes</h3>
        <div className="form-row attributes-row">
          {Object.entries(characterData.stats).map(([stat, value]) => (
            <div key={stat} className="form-group stat-input">
              <label htmlFor={`stat-${stat}`}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
              <input
                type="number"
                id={`stat-${stat}`}
                value={value}
                onChange={(e) => handleStatChange(stat, e.target.value)}
                className="form-control"
              />
            </div>
          ))}
        </div>
        
        {/* Gear Section */}
        <h3>Equipment & Gear</h3>
        <div className="gear-section">
          <div className="active-gear">
            {characterData.gear.length === 0 ? (
              <p>No gear equipped. Add gear items below.</p>
            ) : (
              <div className="gear-list">
                {characterData.gear.map(item => (
                  <div key={item.id} className="gear-card">
                    <div className="gear-card-header">
                      <h4>{item.name}</h4>
                      <button 
                        type="button" 
                        className="remove-gear-btn"
                        onClick={() => handleRemoveGear(item.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="gear-meta">
                      <span>Slot: {equipmentSlots.find(slot => slot.value === item.slot)?.label}</span>
                      <span>Type: {item.bonusType.charAt(0).toUpperCase() + item.bonusType.slice(1)}</span>
                    </div>
                    <div className="gear-effects">
                      {Object.entries(item.effects)
                        .filter(([_, value]) => value !== 0)
                        .map(([stat, value]) => (
                          <span key={stat} className="gear-stat">
                            {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value > 0 ? '+' : ''}{value}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="new-gear-form">
            <h4>Add New Gear</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  value={newGearItem.name}
                  onChange={(e) => handleGearChange('name', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Equipment Slot</label>
                <select
                  value={newGearItem.slot}
                  onChange={(e) => handleGearChange('slot', e.target.value)}
                  className="form-control"
                >
                  {equipmentSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Bonus Type</label>
                <select
                  value={newGearItem.bonusType}
                  onChange={(e) => handleGearChange('bonusType', e.target.value)}
                  className="form-control"
                >
                  {bonusTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <h4>Stat Bonuses</h4>
            <div className="gear-stats-container">
              {/* First row: strength, dexterity, constitution */}
              <div className="form-row gear-stats-row">
                {['strength', 'dexterity', 'constitution'].map(stat => (
                  <div key={stat} className="form-group gear-stat-input">
                    <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                    <input 
                      type="number" 
                      value={newGearItem.effects[stat]}
                      onChange={(e) => handleGearEffectChange(stat, e.target.value)}
                      className="form-control"
                    />
                  </div>
                ))}
              </div>
              
              {/* Second row: intelligence, wisdom, charisma */}
              <div className="form-row gear-stats-row">
                {['intelligence', 'wisdom', 'charisma'].map(stat => (
                  <div key={stat} className="form-group gear-stat-input">
                    <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                    <input 
                      type="number" 
                      value={newGearItem.effects[stat]}
                      onChange={(e) => handleGearEffectChange(stat, e.target.value)}
                      className="form-control"
                    />
                  </div>
                ))}
              </div>
              
              {/* Third row: BAB and AC */}
              <div className="form-row gear-stats-row combat-row">
                <div className="form-group gear-stat-input">
                  <label>BAB</label>
                  <input 
                    type="number" 
                    value={newGearItem.effects.bab}
                    onChange={(e) => handleGearEffectChange('bab', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group gear-stat-input">
                  <label>Armor Class</label>
                  <input 
                    type="number" 
                    value={newGearItem.effects.ac}
                    onChange={(e) => handleGearEffectChange('ac', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={handleAddGear} 
              className="add-gear-button"
            >
              Add Item
            </button>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">Save Character</button>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;