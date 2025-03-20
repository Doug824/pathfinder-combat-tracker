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
    buffs: character?.buffs || []
  });
  
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
        
        <div className="form-actions">
          <button type="submit" className="btn-save">Save Character</button>
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;