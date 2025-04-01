import React, { useState } from 'react';
import BasicStats from '../components/CharacterSheet/BasicStats';
import { getSizeDisplayName } from '../utils/sizeUtils'; // Import the utility function

const CharacterSetup = ({ 
  character, 
  onUpdateCharacter, 
  onStatsChange, 
  onGearChange, 
  stats, 
  gear 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [characterData, setCharacterData] = useState({
    name: character?.name || '',
    level: character?.level || 1,
    characterClass: character?.characterClass || '',
    race: character?.race || '',
    alignment: character?.alignment || '',
    size: character?.size || 'medium',
    baseAttackBonus: character?.baseAttackBonus || 0,
    baseFortitude: character?.baseFortitude || 0,
    baseReflex: character?.baseReflex || 0,
    baseWill: character?.baseWill || 0
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
      attackBonus: 0,
      fortitude: 0,
      reflex: 0,
      will: 0,
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
  
  // Pathfinder size categories
  const sizeOptions = [
    { value: 'fine', label: 'Fine' },
    { value: 'diminutive', label: 'Diminutive' },
    { value: 'tiny', label: 'Tiny' },
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'huge', label: 'Huge' },
    { value: 'gargantuan', label: 'Gargantuan' },
    { value: 'colossal', label: 'Colossal' }
  ];
  
  // Bonus types - same as in BuffTracker
  const bonusTypes = [
    { value: 'enhancement', label: 'Enhancement' },
    { value: 'luck', label: 'Luck' },
    { value: 'sacred', label: 'Sacred' },
    { value: 'profane', label: 'Profane' },
    { value: 'alchemical', label: 'Alchemical' },
    { value: 'resistance', label:  'Resistance' },
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
  
  // Handle character detail changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacterData(prev => ({
      ...prev,
      [name]: name.startsWith('base') ? parseInt(value) || 0 : value
    }));
  };
  
  // Save character details
  const handleSaveDetails = () => {
    if (character) {
      onUpdateCharacter({
        ...character,
        ...characterData
      });
    }
    setIsEditing(false);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setCharacterData({
      name: character?.name || '',
      level: character?.level || 1,
      characterClass: character?.characterClass || '',
      race: character?.race || '',
      size: character?.size || 'medium',
      alignment: character?.alignment || '',
      baseAttackBonus: character?.baseAttackBonus || 0,
      baseFortitude: character?.baseFortitude || 0,
      baseReflex: character?.baseReflex || 0,
      baseWill: character?.baseWill || 0
    });
    setIsEditing(false);
  };
  
  // Handle gear changes
  const handleAddGear = () => {
    if (newGearItem.name.trim() === '') return;
    
    // Create a copy of the gear item with a unique ID
    const gearToAdd = { 
      ...newGearItem, 
      id: Date.now() 
    };
    
    // Update character data with new gear
    const updatedGear = [...gear, gearToAdd];
    onGearChange(updatedGear);
    
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
        attackBonus: 0,
        fortitude: 0,
        reflex: 0,
        will: 0,
        ac: 0
      }
    });
  };
  
  const handleRemoveGear = (gearId) => {
    const updatedGear = gear.filter(item => item.id !== gearId);
    onGearChange(updatedGear);
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
  
  return (
    <div className="character-setup">
      <section className="setup-section character-details">
        <div className="section-header">
          <h2>Character Details</h2>
          {!isEditing ? (
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Details
            </button>
          ) : (
            <div className="edit-controls">
              <button className="save-button" onClick={handleSaveDetails}>Save</button>
              <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="character-form">
            <div className="form-group">
              <label htmlFor="name">Character Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={characterData.name}
                onChange={handleChange}
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
                  max="30"
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
                <label htmlFor="size">Size</label>
                <select
                  id="size"
                  name="size"
                  value={characterData.size}
                  onChange={handleChange}
                  className="form-control"
                >
                  {sizeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
            
            <h3>Class Base Values</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="baseAttackBonus">Base Attack Bonus</label>
                <input
                  type="number"
                  id="baseAttackBonus"
                  name="baseAttackBonus"
                  value={characterData.baseAttackBonus}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            
            <h4>Base Saving Throws</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="baseFortitude">Fortitude</label>
                <input
                  type="number"
                  id="baseFortitude"
                  name="baseFortitude"
                  value={characterData.baseFortitude}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="baseReflex">Reflex</label>
                <input
                  type="number"
                  id="baseReflex"
                  name="baseReflex"
                  value={characterData.baseReflex}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="baseWill">Will</label>
                <input
                  type="number"
                  id="baseWill"
                  name="baseWill"
                  value={characterData.baseWill}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="character-display">
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{character?.name || 'Unnamed'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Level:</span>
              <span className="detail-value">{character?.level || 1}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Class:</span>
              <span className="detail-value">{character?.characterClass || 'None'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Race:</span>
              <span className="detail-value">{character?.race || 'None'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Size:</span>
              <span className="detail-value">{getSizeDisplayName(character?.size) || 'Medium'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Alignment:</span>
              <span className="detail-value">{character?.alignment || 'None'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">BAB:</span>
              <span className="detail-value">{character?.baseAttackBonus || 0}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Base Saves:</span>
              <span className="detail-value">
                Fort: {character?.baseFortitude || 0}, 
                Ref: {character?.baseReflex || 0}, 
                Will: {character?.baseWill || 0}
              </span>
            </div>
          </div>
        )}
      </section>
      
      <section className="setup-section base-stats">
        <h2>Base Attributes</h2>
        <BasicStats 
          onStatsChange={onStatsChange}
          initialStats={stats}
          buffs={[]}
          gear={[]}
        />
      </section>
      
      <section className="setup-section equipment">
        <h2>Equipment & Gear</h2>
        <div className="gear-section">
          <div className="active-gear">
            {gear.length === 0 ? (
              <p>No gear equipped. Add gear items below.</p>
            ) : (
              <div className="gear-list">
                {gear.map(item => (
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
            <h3>Add New Gear</h3>
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
            
            <h4>Attribute Bonuses</h4>
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
              
              <h4>Combat Bonuses</h4>
              {/* Combat values: Attack bonus, AC */}
              <div className="form-row gear-stats-row combat-row">
                <div className="form-group gear-stat-input">
                  <label>Attack Bonus</label>
                  <input 
                    type="number" 
                    value={newGearItem.effects.attackBonus}
                    onChange={(e) => handleGearEffectChange('attackBonus', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group gear-stat-input">
                  <label>AC</label>
                  <input 
                    type="number" 
                    value={newGearItem.effects.ac}
                    onChange={(e) => handleGearEffectChange('ac', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              
              {/* Saving throws: fortitude, reflex, will */}
              <div className="form-row gear-stats-row">
                <div className="form-group gear-stat-input">
                  <label>Fortitude</label>
                  <input 
                    type="number" 
                    value={newGearItem.effects.fortitude}
                    onChange={(e) => handleGearEffectChange('fortitude', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group gear-stat-input">
                  <label>Reflex</label>
                  <input 
                    type="number" 
                    value={newGearItem.effects.reflex}
                    onChange={(e) => handleGearEffectChange('reflex', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group gear-stat-input">
                  <label>Will</label>
                  <input 
                    type="number" 
                    value={newGearItem.effects.will}
                    onChange={(e) => handleGearEffectChange('will', e.target.value)}
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
      </section>
    </div>
  );
};

export default CharacterSetup;