import React, { useState } from 'react';
import BasicStats from '../components/CharacterSheet/BasicStats';
import { getSizeDisplayName } from '../utils/sizeUtils';
import GearItem from '../components/common/GearItem';
import NumericInput from '../components/common/NumericInput';

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
      ac: 0,
      naturalArmor: 0
    }
  });
  
  // Equipment slots
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
  
  // Bonus types
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
  
  // Handle numeric input changes
  const handleNumericChange = (field, value) => {
    setCharacterData(prev => ({
      ...prev,
      [field]: parseInt(value) || 0
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
  const handleUpdateGear = (updatedItem) => {
    const updatedGear = gear.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    onGearChange(updatedGear);
  };  
  
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
      {/* Character Details Section */}
      <section className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Character Details</h2>
        </div>
        <div className="flex justify-between items-center mb-6">
          {!isEditing ? (
            <button 
              className="bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 px-6 py-2 rounded-lg border border-amber-600/50 font-fantasy font-semibold transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
              onClick={() => setIsEditing(true)}
            >
              Edit Details
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                className="bg-emerald-700/80 hover:bg-emerald-600/90 text-emerald-100 px-6 py-2 rounded-lg border border-emerald-600/50 font-fantasy font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                onClick={handleSaveDetails}
              >
                Save
              </button>
              <button 
                className="bg-red-700/80 hover:bg-red-600/90 text-red-100 px-6 py-2 rounded-lg border border-red-600/50 font-fantasy font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/25"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-amber-300 font-fantasy font-semibold">Character Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={characterData.name}
                onChange={handleChange}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="level" className="block text-amber-300 font-fantasy font-semibold">Level</label>
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
                <label htmlFor="characterClass" className="block text-amber-300 font-fantasy font-semibold">Class</label>
                <input
                  type="text"
                  id="characterClass"
                  name="characterClass"
                  value={characterData.characterClass}
                  onChange={handleChange}
                  className="input-fantasy w-full"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="race" className="block text-amber-300 font-fantasy font-semibold">Race</label>
                <input
                  type="text"
                  id="race"
                  name="race"
                  value={characterData.race}
                  onChange={handleChange}
                  className="input-fantasy w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="size" className="block text-amber-300 font-fantasy font-semibold">Size</label>
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
              
              <div className="space-y-2">
                <label htmlFor="alignment" className="block text-amber-300 font-fantasy font-semibold">Alignment</label>
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
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Class Base Values</h3>
              <div className="space-y-2">
                <label htmlFor="baseAttackBonus" className="block text-amber-300 font-fantasy font-semibold">Base Attack Bonus</label>
                <NumericInput
                  value={characterData.baseAttackBonus}
                  onChange={(value) => handleNumericChange('baseAttackBonus', value)}
                  className="input-fantasy w-full max-w-xs"
                  min={0}
                  max={20}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-lg font-fantasy font-bold text-amber-400 mb-4">Base Saving Throws</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="baseFortitude" className="block text-amber-300 font-fantasy font-semibold">Fortitude</label>
                  <NumericInput
                    value={characterData.baseFortitude}
                    onChange={(value) => handleNumericChange('baseFortitude', value)}
                    className="input-fantasy w-full"
                    min={0}
                    max={20}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="baseReflex" className="block text-amber-300 font-fantasy font-semibold">Reflex</label>
                  <NumericInput
                    value={characterData.baseReflex}
                    onChange={(value) => handleNumericChange('baseReflex', value)}
                    className="input-fantasy w-full"
                    min={0}
                    max={20}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="baseWill" className="block text-amber-300 font-fantasy font-semibold">Will</label>
                  <NumericInput
                    value={characterData.baseWill}
                    onChange={(value) => handleNumericChange('baseWill', value)}
                    className="input-fantasy w-full"
                    min={0}
                    max={20}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-20">Name:</span>
                <span className="text-amber-100 ml-4">{character?.name || 'Unnamed'}</span>
              </div>
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-20">Level:</span>
                <span className="text-amber-100 ml-4">{character?.level || 1}</span>
              </div>
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-20">Class:</span>
                <span className="text-amber-100 ml-4">{character?.characterClass || 'None'}</span>
              </div>
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-20">Race:</span>
                <span className="text-amber-100 ml-4">{character?.race || 'None'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-24">Size:</span>
                <span className="text-amber-100 ml-4">{getSizeDisplayName(character?.size) || 'Medium'}</span>
              </div>
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-24">Alignment:</span>
                <span className="text-amber-100 ml-4">{character?.alignment || 'None'}</span>
              </div>
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-24">BAB:</span>
                <span className="text-amber-100 ml-4">{character?.baseAttackBonus || 0}</span>
              </div>
              <div className="flex">
                <span className="text-amber-300 font-fantasy font-semibold w-24">Base Saves:</span>
                <span className="text-amber-100 ml-4">
                  Fort: {character?.baseFortitude || 0}, 
                  Ref: {character?.baseReflex || 0}, 
                  Will: {character?.baseWill || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>
      
      {/* Base Attributes Section */}
      <section className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Base Attributes</h2>
        </div>
        <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
          <BasicStats 
            onStatsChange={onStatsChange}
            initialStats={stats}
            buffs={[]}
            gear={[]}
          />
        </div>
      </section>
      
      {/* Equipment & Gear Section */}
      <section className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Equipment & Gear</h2>
        </div>
        <div className="space-y-6">
          <div>
            {gear.length === 0 ? (
              <p className="text-amber-200/70 text-center py-8">No gear equipped. Add gear items below.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gear.map(item => (
                  <GearItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveGear}
                    onUpdate={handleUpdateGear}
                    equipmentSlots={equipmentSlots}
                    bonusTypes={bonusTypes}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Add New Gear</h3>
            <div className="space-y-2 mb-6">
              <label className="block text-amber-300 font-fantasy font-semibold">Item Name</label>
              <input 
                type="text" 
                value={newGearItem.name}
                onChange={(e) => handleGearChange('name', e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-amber-300 font-fantasy font-semibold">Equipment Slot</label>
                <select
                  value={newGearItem.slot}
                  onChange={(e) => handleGearChange('slot', e.target.value)}
                  className="input-fantasy w-full"
                >
                  {equipmentSlots.map(slot => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-amber-300 font-fantasy font-semibold">Bonus Type</label>
                <select
                  value={newGearItem.bonusType}
                  onChange={(e) => handleGearChange('bonusType', e.target.value)}
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
              <h4 className="text-lg font-fantasy font-bold text-amber-400 mb-4">Attribute Bonuses</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(stat => (
                  <div key={stat} className="space-y-1">
                    <label className="block text-amber-300 font-fantasy text-sm font-semibold">{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                    <NumericInput 
                      value={newGearItem.effects[stat]}
                      onChange={(value) => handleGearEffectChange(stat, value)}
                      className="input-fantasy w-full"
                      min={-10}
                      max={20}
                    />
                  </div>
                ))}
              </div>
            </div>
          
            <div className="mb-6">
              <h4 className="text-lg font-fantasy font-bold text-amber-400 mb-4">Combat Bonuses</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-amber-300 font-fantasy text-sm font-semibold">Attack Bonus</label>
                  <NumericInput 
                    value={newGearItem.effects.attackBonus}
                    onChange={(value) => handleGearEffectChange('attackBonus', value)}
                    className="input-fantasy w-full"
                    min={-10}
                    max={20}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-amber-300 font-fantasy text-sm font-semibold">AC</label>
                  <NumericInput 
                    value={newGearItem.effects.ac}
                    onChange={(value) => handleGearEffectChange('ac', value)}
                    className="input-fantasy w-full"
                    min={-10}
                    max={20}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-amber-300 font-fantasy text-sm font-semibold">Natural Armor</label>
                  <NumericInput 
                    value={newGearItem.effects.naturalArmor}
                    onChange={(value) => handleGearEffectChange('naturalArmor', value)}
                    className="input-fantasy w-full"
                    min={-10}
                    max={20}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-amber-300 font-fantasy text-sm font-semibold">Fortitude</label>
                  <NumericInput 
                    value={newGearItem.effects.fortitude}
                    onChange={(value) => handleGearEffectChange('fortitude', value)}
                    className="input-fantasy w-full"
                    min={-10}
                    max={20}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-amber-300 font-fantasy text-sm font-semibold">Reflex</label>
                  <NumericInput 
                    value={newGearItem.effects.reflex}
                    onChange={(value) => handleGearEffectChange('reflex', value)}
                    className="input-fantasy w-full"
                    min={-10}
                    max={20}
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-amber-300 font-fantasy text-sm font-semibold">Will</label>
                  <NumericInput 
                    value={newGearItem.effects.will}
                    onChange={(value) => handleGearEffectChange('will', value)}
                    className="input-fantasy w-full"
                    min={-10}
                    max={20}
                  />
                </div>
              </div>
            </div>
          
            <button 
              type="button" 
              onClick={handleAddGear} 
              className="w-full bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 px-6 py-3 rounded-lg border border-amber-600/50 font-fantasy font-semibold transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
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