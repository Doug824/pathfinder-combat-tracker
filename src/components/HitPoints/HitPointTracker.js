import React, { useState, useEffect } from 'react';
import NumericInput from '../common/NumericInput';

const HitPointTracker = ({ 
  character, 
  finalStats,
  onHitPointChange,
  className = ''
}) => {
  // Add a state for true max HP (without negative level penalties)
  const [hitPoints, setHitPoints] = useState({
    trueMaxHP: character?.hitPoints?.trueMaxHP || character?.hitPoints?.maxHP || 0,
    maxHP: character?.hitPoints?.maxHP || 0,
    currentHP: character?.hitPoints?.currentHP || 0,
    tempHP: character?.hitPoints?.tempHP || 0,
    nonLethalDamage: character?.hitPoints?.nonLethalDamage || 0,
    negLevels: character?.hitPoints?.negLevels || 0,
    // Store for non-Con HP calculation
    baseHP: character?.hitPoints?.baseHP || 0,
    lastConModifier: character?.hitPoints?.lastConModifier || 0,
  });

  // Calculate the constitution bonus to hit points based on level
  const calculateConBonus = () => {
    const level = character?.level || 1;
    const conModifier = Math.floor((finalStats.constitution - 10) / 2);
    return level * conModifier;
  };
  
  // Apply penalties from negative levels to maxHP
  const applyNegativeLevelPenalties = (baseValue, negLevels) => {
    // Each negative level reduces max HP by 5
    const negLevelPenalty = negLevels * 5;
    return Math.max(1, baseValue - negLevelPenalty);
  };

  // Effect to update max HP when Constitution changes or negative levels change
  useEffect(() => {
    if (!character) return;
    
    const conModifier = Math.floor((finalStats.constitution - 10) / 2);
    const hasConChanged = conModifier !== hitPoints.lastConModifier;
    const hasNegLevelsChanged = hitPoints.negLevels !== character.hitPoints?.negLevels;
    
    if (hasConChanged || hasNegLevelsChanged) {
      const level = character.level || 1;
      
      // Calculate HP change from Constitution
      let hpChange = 0;
      if (hasConChanged) {
        const conDifference = conModifier - hitPoints.lastConModifier;
        hpChange = level * conDifference;
      }
      
      // First, update the true max HP without negative level penalties
      let newTrueMaxHP = hitPoints.trueMaxHP;
      
      // If Con changed, adjust true max HP
      if (hasConChanged) {
        newTrueMaxHP = hitPoints.trueMaxHP + hpChange;
      }
      
      // Now apply negative level penalties to get displayed max HP
      const newMaxHP = applyNegativeLevelPenalties(newTrueMaxHP, hitPoints.negLevels);
      
      // Adjust current HP
      let newCurrentHP = hitPoints.currentHP;
      
      // If max HP goes up due to Constitution change, current HP should too (if not injured)
      if (hpChange > 0 && hitPoints.currentHP === hitPoints.maxHP) {
        newCurrentHP = newMaxHP;
      }
      
      // If max HP goes down, current HP should never exceed max
      if (newCurrentHP > newMaxHP) {
        newCurrentHP = newMaxHP;
      }
      
      // Apply negative level changes to current HP
      if (hasNegLevelsChanged) {
        // Get the difference in negative levels
        const prevNegLevels = character.hitPoints?.negLevels || 0;
        const newNegLevels = hitPoints.negLevels;
        const negLevelsDiff = newNegLevels - prevNegLevels;
        
        // Each negative level change affects current HP by 5 points
        const hpPenalty = negLevelsDiff * 5;
        newCurrentHP = Math.max(1, newCurrentHP - hpPenalty);
      }
      
      const updatedHitPoints = {
        ...hitPoints,
        trueMaxHP: newTrueMaxHP,  // Store the true max HP (without negative level penalties)
        maxHP: newMaxHP,          // Store the effective max HP with penalties
        currentHP: newCurrentHP,  // Store the updated current HP
        lastConModifier: conModifier
      };
      
      setHitPoints(updatedHitPoints);
      onHitPointChange(updatedHitPoints);
      
    }
  }, [finalStats.constitution, hitPoints.negLevels, character]);

  // Calculate health percentage for visual feedback
  const calculateHealthPercentage = () => {
    if (hitPoints.maxHP <= 0) return 100;
    return Math.max(0, Math.min(100, (hitPoints.currentHP / hitPoints.maxHP) * 100));
  };

  // Get appropriate health status and color
  const getHealthStatus = () => {
    const percentage = calculateHealthPercentage();
    if (percentage > 75) return { status: 'healthy', color: 'var(--success-color)' };
    if (percentage > 50) return { status: 'injured', color: '#FFA500' }; // Orange
    if (percentage > 25) return { status: 'bloodied', color: '#FF6347' }; // Tomato
    if (percentage > 0) return { status: 'critical', color: 'var(--error-color)' };
    return { status: 'unconscious', color: '#800000' }; // Dark red
  };

  // Handle changes to hit point values
  const handleHPChange = (field, value) => {
    let valueParsed = parseInt(value) || 0;
    
    // Ensure non-negative values for most fields
    if (field !== 'currentHP' && valueParsed < 0) {
      valueParsed = 0;
    }
    
    // Update the hitPoints state
    const updatedHitPoints = { ...hitPoints, [field]: valueParsed };
    
    // Special handling for various fields
    if (field === 'trueMaxHP') {
      // When changing the true max HP, we need to recalculate the effective max HP
      // by applying negative level penalties
      updatedHitPoints.maxHP = applyNegativeLevelPenalties(valueParsed, hitPoints.negLevels);
      
      // Also update current HP if appropriate
      if (hitPoints.currentHP === hitPoints.maxHP) {
        // Character is at full health, so keep them at full health
        updatedHitPoints.currentHP = updatedHitPoints.maxHP;
      } else if (updatedHitPoints.maxHP < hitPoints.currentHP) {
        // If new max HP is less than current HP, adjust current HP down
        updatedHitPoints.currentHP = updatedHitPoints.maxHP;
      }
      
      // Update the base HP calculation
      const conBonus = calculateConBonus();
      updatedHitPoints.baseHP = valueParsed - conBonus;
    } 
    else if (field === 'maxHP') {
      // When directly editing the displayed max HP, we need to update the true max HP
      // by adding back the negative level penalties
      updatedHitPoints.trueMaxHP = valueParsed + (hitPoints.negLevels * 5);
      
      // Also update current HP if appropriate
      if (hitPoints.currentHP === hitPoints.maxHP) {
        // Character is at full health, so keep them at full health
        updatedHitPoints.currentHP = valueParsed;
      } else if (valueParsed < hitPoints.currentHP) {
        // If new max HP is less than current HP, adjust current HP down
        updatedHitPoints.currentHP = valueParsed;
      }
      
      // Update the base HP calculation
      const conBonus = calculateConBonus();
      updatedHitPoints.baseHP = updatedHitPoints.trueMaxHP - conBonus;
    }
    else if (field === 'baseHP') {
      // When changing base HP, recalculate both true max HP and effective max HP
      const conBonus = calculateConBonus();
      const newTrueMaxHP = valueParsed + conBonus;
      
      updatedHitPoints.trueMaxHP = newTrueMaxHP;
      updatedHitPoints.maxHP = applyNegativeLevelPenalties(newTrueMaxHP, hitPoints.negLevels);
      
      // Adjust current HP if needed
      if (hitPoints.currentHP === hitPoints.maxHP) {
        // Keep at full health
        updatedHitPoints.currentHP = updatedHitPoints.maxHP;
      } else if (updatedHitPoints.maxHP < hitPoints.currentHP) {
        // Cap current HP at max
        updatedHitPoints.currentHP = updatedHitPoints.maxHP;
      }
    }
    else if (field === 'negLevels') {
      // When changing negative levels, recalculate the effective max HP
      // but don't change the true max HP value
      updatedHitPoints.maxHP = applyNegativeLevelPenalties(hitPoints.trueMaxHP, valueParsed);
      
      // Calculate the HP adjustment
      const negLevelDiff = valueParsed - hitPoints.negLevels;
      const hpPenalty = negLevelDiff * 5;
      
      // Apply the adjustment to current HP
      updatedHitPoints.currentHP = Math.max(1, hitPoints.currentHP - hpPenalty);
      
      // Make sure current HP doesn't exceed max HP
      if (updatedHitPoints.currentHP > updatedHitPoints.maxHP) {
        updatedHitPoints.currentHP = updatedHitPoints.maxHP;
      }
    }
    
    setHitPoints(updatedHitPoints);
    onHitPointChange(updatedHitPoints);
  };

  // Handle taking damage
  const handleTakeDamage = (amount) => {
    amount = parseInt(amount) || 0;
    if (amount <= 0) return;
    
    let newCurrentHP = hitPoints.currentHP;
    let newTempHP = hitPoints.tempHP;
    
    // First reduce temp HP
    if (newTempHP > 0) {
      if (amount <= newTempHP) {
        newTempHP -= amount;
        amount = 0;
      } else {
        amount -= newTempHP;
        newTempHP = 0;
      }
    }
    
    // Then reduce current HP if there's damage left
    if (amount > 0) {
      newCurrentHP = Math.max(-1000, newCurrentHP - amount);
    }
    
    const updatedHitPoints = {
      ...hitPoints,
      currentHP: newCurrentHP,
      tempHP: newTempHP
    };
    
    setHitPoints(updatedHitPoints);
    onHitPointChange(updatedHitPoints);
  };

  // Handle healing
  const handleHeal = (amount) => {
    amount = parseInt(amount) || 0;
    if (amount <= 0) return;
    
    const newCurrentHP = Math.min(hitPoints.maxHP, hitPoints.currentHP + amount);
    
    const updatedHitPoints = {
      ...hitPoints,
      currentHP: newCurrentHP
    };
    
    setHitPoints(updatedHitPoints);
    onHitPointChange(updatedHitPoints);
  };

  // Handle adding temporary hit points
  const handleAddTempHP = (amount) => {
    amount = parseInt(amount) || 0;
    if (amount <= 0) return;
    
    // Temp HP doesn't stack, take the higher value
    const newTempHP = Math.max(hitPoints.tempHP, amount);
    
    const updatedHitPoints = {
      ...hitPoints,
      tempHP: newTempHP
    };
    
    setHitPoints(updatedHitPoints);
    onHitPointChange(updatedHitPoints);
  };

  // Handle adding non-lethal damage
  const handleNonLethalDamage = (amount) => {
    amount = parseInt(amount) || 0;
    if (amount <= 0) return;
    
    const newNonLethalDamage = hitPoints.nonLethalDamage + amount;
    
    const updatedHitPoints = {
      ...hitPoints,
      nonLethalDamage: newNonLethalDamage
    };
    
    setHitPoints(updatedHitPoints);
    onHitPointChange(updatedHitPoints);
  };

  // Get visual indicator classes based on health status
  const healthStatus = getHealthStatus();
  
  // Check if character is unconscious or disabled
  const isUnconscious = hitPoints.currentHP <= 0;
  const isDisabled = hitPoints.currentHP === 0;
  const isNonLethalUnconscious = !isUnconscious && hitPoints.nonLethalDamage >= hitPoints.currentHP;

  return (
    <div className={`bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 ${className}`}>
      <h3 className="text-amber-400 font-fantasy font-bold text-xl mb-4">Hit Points</h3>
      
      <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div 
            className="w-20 h-20 rounded-full border-4 border-amber-600 flex items-center justify-center relative overflow-hidden"
            title={`${calculateHealthPercentage().toFixed(0)}% health remaining`}
          >
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-600 to-red-400 transition-all duration-300"
              style={{ height: `${calculateHealthPercentage()}%` }}
            ></div>
            <div className="relative z-10 text-white font-bold text-sm">
              {Math.round(calculateHealthPercentage())}%
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-baseline gap-2 text-2xl font-bold mb-2">
              <span className="text-amber-100" style={{ color: healthStatus.color }}>
                {hitPoints.currentHP}
              </span>
              <span className="text-amber-300">/</span>
              <span className="text-amber-100">{hitPoints.maxHP}</span>
              {hitPoints.tempHP > 0 && (
                <span className="text-blue-400 text-lg">(+{hitPoints.tempHP})</span>
              )}
            </div>
          
            {/* Show true max HP if negative levels are present */}
            {hitPoints.negLevels > 0 && (
              <div className="text-amber-300 text-sm">
                True Max HP: {hitPoints.trueMaxHP}
              </div>
            )}
            
            {hitPoints.nonLethalDamage > 0 && (
              <div className="text-yellow-400 text-sm">
                Non-lethal: {hitPoints.nonLethalDamage}
              </div>
            )}
            
            {hitPoints.negLevels > 0 && (
              <div className="bg-red-900/40 border border-red-700/30 rounded p-2 mt-2">
                <div className="text-red-400 font-bold text-sm mb-1">
                  Negative Levels: {hitPoints.negLevels}
                </div>
                <div className="text-red-300 text-xs space-y-0.5">
                  <div>-{hitPoints.negLevels} to attack rolls</div>
                  <div>-{hitPoints.negLevels} to saving throws</div>
                  <div>-{hitPoints.negLevels} to combat maneuvers</div>
                  <div>-{hitPoints.negLevels*5} to hit points</div>
                </div>
              </div>
            )}
            
            {isUnconscious && (
              <div className="bg-red-900/60 border border-red-600 rounded px-3 py-1 mt-2">
                <span className="text-red-200 font-bold text-sm">
                  {hitPoints.currentHP < 0 ? "DYING" : "DISABLED"}
                </span>
              </div>
            )}
            
            {isNonLethalUnconscious && (
              <div className="bg-yellow-900/60 border border-yellow-600 rounded px-3 py-1 mt-2">
                <span className="text-yellow-200 font-bold text-sm">
                  UNCONSCIOUS (Non-lethal)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4 mb-6">
        <h4 className="text-amber-400 font-fantasy font-bold mb-4">Hit Point Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Add True Max HP field that's always visible */}
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">True Max HP</label>
            <NumericInput
              value={hitPoints.trueMaxHP}
              onChange={(value) => handleHPChange('trueMaxHP', value)}
              min={1}
            />
          </div>
          
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">Effective Max HP</label>
            <NumericInput
              value={hitPoints.maxHP}
              onChange={(value) => handleHPChange('maxHP', value)}
              min={1}
            />
          </div>
          
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">Current HP</label>
            <NumericInput
              value={hitPoints.currentHP}
              onChange={(value) => handleHPChange('currentHP', value)}
              min={-1000}
              max={hitPoints.maxHP}
            />
          </div>
          
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">Temp HP</label>
            <NumericInput
              value={hitPoints.tempHP}
              onChange={(value) => handleHPChange('tempHP', value)}
              min={0}
            />
          </div>
          
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">Non-Lethal</label>
            <NumericInput
              value={hitPoints.nonLethalDamage}
              onChange={(value) => handleHPChange('nonLethalDamage', value)}
              min={0}
            />
          </div>
          
          <div>
            <label className="block text-amber-300 text-sm font-medium mb-2">Neg. Levels</label>
            <NumericInput
              value={hitPoints.negLevels}
              onChange={(value) => handleHPChange('negLevels', value)}
              min={0}
              max={20}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
        <h4 className="text-amber-400 font-fantasy font-bold mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="input-fantasy flex-1"
              placeholder="Amount"
              id="damage-amount"
            />
            <button 
              className="bg-red-700/80 hover:bg-red-600/90 text-red-100 px-4 py-2 rounded transition-colors"
              onClick={() => handleTakeDamage(document.getElementById('damage-amount').value)}
            >
              Take Damage
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="input-fantasy flex-1"
              placeholder="Amount"
              id="heal-amount"
            />
            <button 
              className="bg-green-700/80 hover:bg-green-600/90 text-green-100 px-4 py-2 rounded transition-colors"
              onClick={() => handleHeal(document.getElementById('heal-amount').value)}
            >
              Heal
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="input-fantasy flex-1"
              placeholder="Amount"
              id="temp-hp-amount"
            />
            <button 
              className="bg-blue-700/80 hover:bg-blue-600/90 text-blue-100 px-4 py-2 rounded transition-colors"
              onClick={() => handleAddTempHP(document.getElementById('temp-hp-amount').value)}
            >
              Add Temp HP
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              className="input-fantasy flex-1"
              placeholder="Amount"
              id="nonlethal-amount"
            />
            <button 
              className="bg-yellow-700/80 hover:bg-yellow-600/90 text-yellow-100 px-4 py-2 rounded transition-colors"
              onClick={() => handleNonLethalDamage(document.getElementById('nonlethal-amount').value)}
            >
              Non-Lethal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HitPointTracker;