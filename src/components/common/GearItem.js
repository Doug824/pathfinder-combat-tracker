import React, { useState } from 'react';
import SelectWrapper from './SelectWrapper';
import NumericInput from './NumericInput'; // Import the new component

const GearItem = ({ 
  item, 
  onRemove, 
  onUpdate, 
  equipmentSlots, 
  bonusTypes 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  
  // Handle changes to the item properties
  const handleChange = (field, value) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle changes to effect values
  const handleEffectChange = (stat, value) => {
    setEditedItem(prev => ({
      ...prev,
      effects: {
        ...prev.effects,
        [stat]: parseInt(value) || 0
      }
    }));
  };
  
  // Save changes
  const handleSave = () => {
    onUpdate(editedItem);
    setIsEditing(false);
  };
  
  // Cancel editing
  const handleCancel = () => {
    setEditedItem({ ...item });
    setIsEditing(false);
  };
  
  // Display mode (not editing)
  if (!isEditing) {
    return (
      <div className="gear-card">
        <div className="gear-card-header">
          <h4>{item.name}</h4>
          <div className="gear-card-actions">
            <button 
              type="button" 
              className="edit-gear-btn"
              onClick={() => setIsEditing(true)}
              title="Edit Item"
            >
              ✎
            </button>
            <button 
              type="button" 
              className="remove-gear-btn"
              onClick={() => onRemove(item.id)}
              title="Remove Item"
            >
              ×
            </button>
          </div>
        </div>
        <div className="gear-meta">
          <span>Slot: {equipmentSlots.find(slot => slot.value === item.slot)?.label || item.slot}</span>
          <span>Type: {item.bonusType.charAt(0).toUpperCase() + item.bonusType.slice(1)}</span>
        </div>
        <div className="gear-effects">
          {Object.entries(item.effects)
            .filter(([_, value]) => value !== 0)
            .map(([stat, value]) => (
              <span key={stat} className="gear-stat">
                {stat === 'naturalArmor' 
                  ? 'Natural Armor' 
                  : stat.charAt(0).toUpperCase() + stat.slice(1)}
                : {value > 0 ? '+' : ''}{value}
              </span>
            ))}
        </div>
        
        {/* Item Description */}
        {item.description && (
          <div className="gear-description">
            <div className="text-amber-300 text-sm font-fantasy font-semibold mb-1">Description:</div>
            <div className="text-amber-200 text-sm">{item.description}</div>
          </div>
        )}
        
        {/* Special Abilities */}
        {item.specialAbilities && (
          <div className="gear-special-abilities">
            <div className="text-amber-300 text-sm font-fantasy font-semibold mb-1">Special Abilities:</div>
            <div className="text-amber-200 text-sm whitespace-pre-wrap">{item.specialAbilities}</div>
          </div>
        )}
      </div>
    );
  }
  
  // Edit mode
  return (
    <div className="gear-card editing">
      <div className="gear-card-header">
        <h4>Edit {item.name}</h4>
        <div className="gear-card-actions">
          <button 
            type="button" 
            className="save-gear-btn"
            onClick={handleSave}
            title="Save Changes"
          >
            ✓
          </button>
          <button 
            type="button" 
            className="cancel-gear-btn"
            onClick={handleCancel}
            title="Cancel Editing"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="edit-gear-form">
        <div className="form-row">
          <div className="form-group">
            <label>Item Name</label>
            <input 
              type="text" 
              value={editedItem.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={editedItem.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-fantasy w-full resize-vertical"
              rows="2"
              placeholder="Brief description of the item..."
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Special Abilities</label>
            <textarea 
              value={editedItem.specialAbilities || ''}
              onChange={(e) => handleChange('specialAbilities', e.target.value)}
              className="input-fantasy w-full resize-vertical"
              rows="3"
              placeholder="Describe any special abilities, conditional bonuses, or complex effects that can't be represented with numeric bonuses..."
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Equipment Slot</label>
            <SelectWrapper>
              <select
                value={editedItem.slot}
                onChange={(e) => handleChange('slot', e.target.value)}
                className="form-control"
              >
                {equipmentSlots.map(slot => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
          
          <div className="form-group">
            <label>Bonus Type</label>
            <SelectWrapper>
              <select
                value={editedItem.bonusType}
                onChange={(e) => handleChange('bonusType', e.target.value)}
                className="form-control"
              >
                {bonusTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </SelectWrapper>
          </div>
        </div>
        
        <h4>Attribute Bonuses</h4>
        <div className="gear-stats-container">
          {/* First row: strength, dexterity, constitution */}
          <div className="form-row gear-stats-row">
            {['strength', 'dexterity', 'constitution'].map(stat => (
              <div key={stat} className="form-group gear-stat-input">
                <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                <NumericInput 
                  value={editedItem.effects[stat]}
                  onChange={(value) => handleEffectChange(stat, value)}
                  className="form-control"
                  min={-10}
                  max={10}
                />
              </div>
            ))}
          </div>
          
          {/* Second row: intelligence, wisdom, charisma */}
          <div className="form-row gear-stats-row">
            {['intelligence', 'wisdom', 'charisma'].map(stat => (
              <div key={stat} className="form-group gear-stat-input">
                <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
                <NumericInput 
                  value={editedItem.effects[stat]}
                  onChange={(value) => handleEffectChange(stat, value)}
                  className="form-control"
                  min={-10}
                  max={10}
                />
              </div>
            ))}
          </div>
          
          <h4>Combat Bonuses</h4>
          {/* Combat values: Attack bonus, AC */}
          <div className="form-row gear-stats-row combat-row">
            <div className="form-group gear-stat-input">
              <label>Attack Bonus</label>
              <NumericInput 
                value={editedItem.effects.attackBonus}
                onChange={(value) => handleEffectChange('attackBonus', value)}
                className="form-control"
                min={-10}
                max={10}
              />
            </div>
            <div className="form-group gear-stat-input">
              <label>AC</label>
              <NumericInput 
                value={editedItem.effects.ac}
                onChange={(value) => handleEffectChange('ac', value)}
                className="form-control"
                min={-10}
                max={10}
              />
            </div>
          </div>
          
          {/* Additional row for Natural Armor bonus */}
          <div className="form-row gear-stats-row">
            <div className="form-group gear-stat-input">
              <label>Natural Armor</label>
              <NumericInput 
                value={editedItem.effects.naturalArmor || 0}
                onChange={(value) => handleEffectChange('naturalArmor', value)}
                className="form-control"
                min={-10}
                max={10}
              />
            </div>
          </div>
          
          {/* Saving throws: fortitude, reflex, will */}
          <div className="form-row gear-stats-row">
            <div className="form-group gear-stat-input">
              <label>Fortitude</label>
              <NumericInput 
                value={editedItem.effects.fortitude}
                onChange={(value) => handleEffectChange('fortitude', value)}
                className="form-control"
                min={-10}
                max={10}
              />
            </div>
            <div className="form-group gear-stat-input">
              <label>Reflex</label>
              <NumericInput 
                value={editedItem.effects.reflex}
                onChange={(value) => handleEffectChange('reflex', value)}
                className="form-control"
                min={-10}
                max={10}
              />
            </div>
            <div className="form-group gear-stat-input">
              <label>Will</label>
              <NumericInput 
                value={editedItem.effects.will}
                onChange={(value) => handleEffectChange('will', value)}
                className="form-control"
                min={-10}
                max={10}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GearItem;