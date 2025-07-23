import React, { useState, useEffect } from 'react';

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
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
      <h2 className="text-amber-400 font-fantasy font-bold text-2xl mb-6">Active Buffs & Effects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {buffs.length === 0 ? (
          <p className="text-amber-300 text-center col-span-full">No active buffs</p>
        ) : (
          buffs.map(buff => (
            <div key={buff.id} className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
              <h3 className="text-amber-400 font-fantasy font-bold text-lg mb-2">{buff.name}</h3>
              <div className="text-amber-300 text-sm mb-3 space-y-1">
                <div>Duration: {formatDuration(buff)}</div>
                <div>Type: {buff.bonusType.charAt(0).toUpperCase() + buff.bonusType.slice(1)}</div>
              </div>
              <div className="text-amber-100 text-sm mb-4">
                {Object.entries(buff.effects)
                  .filter(([_, value]) => value !== 0)
                  .map(([stat, value]) => (
                    <div key={stat} className="flex justify-between">
                      <span>{stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
                      <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>{value > 0 ? '+' : ''}{value}</span>
                    </div>
                  ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleRemoveBuff(buff.id)} 
                  className="bg-red-700/80 hover:bg-red-600/90 text-red-100 px-3 py-1 rounded text-sm transition-colors"
                >
                  Remove
                </button>
                {onSaveBuff && (
                  <button 
                    onClick={() => handleSaveBuff(buff)} 
                    className="bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 px-3 py-1 rounded text-sm transition-colors"
                  >
                    Save to Library
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
        <h3 className="text-amber-400 font-fantasy font-bold text-xl mb-4">Add New Buff</h3>
        <div className="mb-4">
          <div className="mb-4">
            <label className="block text-amber-300 text-sm font-medium mb-2">Name:</label>
            <input 
              type="text" 
              value={newBuff.name}
              onChange={(e) => handleBuffChange('name', e.target.value)}
              className="input-fantasy w-full"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">Duration:</label>
            <div className="flex gap-2">
              {newBuff.durationType !== 'permanent' && (
                <input 
                  type="number" 
                  min="1"
                  value={newBuff.duration}
                  onChange={(e) => handleBuffChange('duration', parseInt(e.target.value))}
                  className="input-fantasy flex-1"
                />
              )}
              
              <select
                value={newBuff.durationType}
                onChange={(e) => handleBuffChange('durationType', e.target.value)}
                className="input-fantasy flex-1"
              >
                {durationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">Bonus Type:</label>
            <select
              value={newBuff.bonusType}
              onChange={(e) => handleBuffChange('bonusType', e.target.value)}
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
        
        <div className="space-y-6">
          <div>
            <h4 className="text-amber-400 font-fantasy font-bold text-lg mb-4">Attribute Bonuses/Penalties</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
                <div key={stat} className="flex flex-col">
                  <label className="text-amber-300 text-sm font-medium mb-1">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                  <input 
                    type="number" 
                    value={newBuff.effects[stat]}
                    onChange={(e) => handleEffectChange(stat, e.target.value)}
                    className="input-fantasy"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-amber-400 font-fantasy font-bold text-lg mb-4">Combat Bonuses/Penalties</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="text-amber-300 text-sm font-medium mb-1">Attack Bonus:</label>
                <input 
                  type="number" 
                  value={newBuff.effects.attackBonus}
                  onChange={(e) => handleEffectChange('attackBonus', e.target.value)}
                  className="input-fantasy"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-amber-300 text-sm font-medium mb-1">AC:</label>
                <input 
                  type="number" 
                  value={newBuff.effects.ac}
                  onChange={(e) => handleEffectChange('ac', e.target.value)}
                  className="input-fantasy"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-amber-300 text-sm font-medium mb-1">Fortitude:</label>
                <input 
                  type="number" 
                  value={newBuff.effects.fortitude}
                  onChange={(e) => handleEffectChange('fortitude', e.target.value)}
                  className="input-fantasy"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-amber-300 text-sm font-medium mb-1">Reflex:</label>
                <input 
                  type="number" 
                  value={newBuff.effects.reflex}
                  onChange={(e) => handleEffectChange('reflex', e.target.value)}
                  className="input-fantasy"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-amber-300 text-sm font-medium mb-1">Will:</label>
                <input 
                  type="number" 
                  value={newBuff.effects.will}
                  onChange={(e) => handleEffectChange('will', e.target.value)}
                  className="input-fantasy"
                />
              </div>
              
              <div className="flex flex-col">
                <label className="text-amber-300 text-sm font-medium mb-1">Natural Armor:</label>
                <input 
                  type="number" 
                  value={newBuff.effects.naturalArmor}
                  onChange={(e) => handleEffectChange('naturalArmor', e.target.value)}
                  className="input-fantasy"
                />
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleAddBuff} 
          className="bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 font-medium px-6 py-2 rounded transition-colors w-full mt-6"
        >
          Add Buff
        </button>
      </div>
    </div>
  );
};

export default BuffTracker;