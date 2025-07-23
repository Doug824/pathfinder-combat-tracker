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
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-8 max-w-4xl mx-auto">
      {/* Fantasy Form Header */}
      <div className="text-center mb-8 border-b-2 border-amber-700/30 pb-6">
        <h2 className="text-3xl font-fantasy font-bold text-ornate-gold flex items-center justify-center gap-3">
          <span className="text-4xl">🛡️</span>
          {character ? 'Forge Your Hero' : 'Create New Hero'}
        </h2>
        <p className="text-amber-200/70 mt-2">Shape the legend of your character</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Character Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-amber-300 font-fantasy font-semibold">
            Hero Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={characterData.name}
            onChange={handleChange}
            required
            className="input-fantasy w-full"
            placeholder="Enter your hero's name"
          />
        </div>
        
        {/* Basic Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="level" className="block text-amber-300 font-fantasy font-semibold">
              Level
            </label>
            <input
              type="number"
              id="level"
              name="level"
              min="1"
              max="30"
              value={characterData.level}
              onChange={handleChange}
              className="input-fantasy w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="characterClass" className="block text-amber-300 font-fantasy font-semibold">
              Class
            </label>
            <input
              type="text"
              id="characterClass"
              name="characterClass"
              value={characterData.characterClass}
              onChange={handleChange}
              className="input-fantasy w-full"
              placeholder="Fighter, Wizard, Rogue..."
            />
          </div>
        </div>
        
        {/* Race and Size Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="race" className="block text-amber-300 font-fantasy font-semibold">
              Race
            </label>
            <input
              type="text"
              id="race"
              name="race"
              value={characterData.race}
              onChange={handleChange}
              className="input-fantasy w-full"
              placeholder="Human, Elf, Dwarf..."
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="size" className="block text-amber-300 font-fantasy font-semibold">
              Size
            </label>
            <select
              id="size"
              name="size"
              value={characterData.size}
              onChange={handleChange}
              className="input-fantasy w-full"
            >
              {sizeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Alignment */}
        <div className="space-y-2">
          <label htmlFor="alignment" className="block text-amber-300 font-fantasy font-semibold">
            Alignment
          </label>
          <select
            id="alignment"
            name="alignment"
            value={characterData.alignment}
            onChange={handleChange}
            className="input-fantasy w-full"
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
        
        {/* Ability Scores */}
        <div className="mt-8">
          <h3 className="text-2xl font-fantasy font-bold text-amber-300 mb-4 flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            Ability Scores
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(characterData.stats).map(([stat, value]) => (
              <div key={stat} className="bg-black/40 rounded-lg p-4 border border-amber-700/30">
                <label 
                  htmlFor={`stat-${stat}`} 
                  className="block text-amber-200 font-fantasy font-semibold text-center mb-2"
                >
                  {stat.charAt(0).toUpperCase() + stat.slice(1)}
                </label>
                <input
                  type="number"
                  id={`stat-${stat}`}
                  value={value}
                  onChange={(e) => handleStatChange(stat, e.target.value)}
                  className="input-fantasy w-full text-center text-xl font-bold"
                  min="1"
                  max="50"
                />
                <div className="text-center text-amber-400/70 text-sm mt-1">
                  Modifier: {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex gap-4 justify-center mt-8 pt-6 border-t-2 border-amber-700/30">
          <button type="submit" className="btn-primary px-8 py-3">
            {character ? 'Update Hero' : 'Create Hero'}
          </button>
          <button 
            type="button" 
            className="px-8 py-3 bg-gray-700/70 hover:bg-gray-600/70 text-amber-200 font-fantasy font-semibold rounded-lg border-2 border-gray-600/50 transition-all" 
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterForm;