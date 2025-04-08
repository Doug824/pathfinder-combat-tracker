import React, { useState } from 'react';

const CharacterForm = ({ character, onSaveCharacter, onCancel }) => {
  const [characterData, setCharacterData] = useState({
    id: character?.id || null,
    name: character?.name || '',
    level: character?.level || 1,
    characterClass: character?.characterClass || '',
    race: character?.race || '',
    alignment: character?.alignment || '',
    size: character?.size || 'medium', // Default to medium size
    stats: character?.stats || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    }
  });
  
  // Size categories
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacterData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleStatChange = (stat, value) => {
    const numValue = parseInt(value) || 10;
    
    setCharacterData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [stat]: numValue
      }
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Log the data being sent to make sure stats are included
    console.log("Submitting character data:", characterData);
    
    // Create a clean copy with proper types for all values and ensure stats are included
    const dataToSave = {
      ...characterData,
      level: parseInt(characterData.level) || 1,
      // Explicitly include stats to make sure they're not lost
      stats: {
        strength: parseInt(characterData.stats.strength) || 10,
        dexterity: parseInt(characterData.stats.dexterity) || 10,
        constitution: parseInt(characterData.stats.constitution) || 10,
        intelligence: parseInt(characterData.stats.intelligence) || 10,
        wisdom: parseInt(characterData.stats.wisdom) || 10,
        charisma: parseInt(characterData.stats.charisma) || 10
      }
    };
    
    // Call the save function with the cleaned data
    onSaveCharacter(dataToSave);
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
        </div>
        
        <div className="form-row">
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
              <option value="Lawful Good">Lawful Good</option>
              <option value="Neutral Good">Neutral Good</option>
              <option value="Chaotic Good">Chaotic Good</option>
              <option value="Lawful Neutral">Lawful Neutral</option>
              <option value="True Neutral">True Neutral</option>
              <option value="Chaotic Neutral">Chaotic Neutral</option>
              <option value="Lawful Evil">Lawful Evil</option>
              <option value="Neutral Evil">Neutral Evil</option>
              <option value="Chaotic Evil">Chaotic Evil</option>
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
        
        <div className="form-actions">
          <button type="submit" className="btn-save">Save Character</button>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;