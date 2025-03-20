import React, { useState, useEffect } from 'react';

const CombatStatsCalculator = ({ baseStats, buffs }) => {
  const [finalStats, setFinalStats] = useState({...baseStats});
  const [derived, setDerived] = useState({
    ac: 10,
    fortitudeSave: 0,
    reflexSave: 0,
    willSave: 0,
    baseAttackBonus: 0
  });
  
  // Calculate modifiers
  const getModifier = (score) => Math.floor((score - 10) / 2);
  
  useEffect(() => {
    // Calculate stats with all buffs applied using Pathfinder stacking rules
    // Start with base stats
    const calculatedStats = {...baseStats};
    
    // Group buffs by stat and bonus type
    const groupedBuffs = {};
    Object.keys(calculatedStats).forEach(stat => {
      groupedBuffs[stat] = {};
      
      // Initialize each bonus type for this stat
      bonusTypes.forEach(type => {
        groupedBuffs[stat][type] = [];
      });
    });
    
    // Add BAB tracking
    groupedBuffs['bab'] = {};
    bonusTypes.forEach(type => {
      groupedBuffs['bab'][type] = [];
    });
    
    // Group all buffs by stat and bonus type
    buffs.forEach(buff => {
      Object.entries(buff.effects).forEach(([stat, value]) => {
        if (value !== 0 && groupedBuffs[stat]) {
          groupedBuffs[stat][buff.bonusType].push({
            value: value,
            name: buff.name
          });
        }
      });
    });
    
    // Apply stacking rules to each stat
    Object.keys(calculatedStats).forEach(stat => {
      // For each stat, process each bonus type
      Object.entries(groupedBuffs[stat]).forEach(([bonusType, bonuses]) => {
        if (bonuses.length > 0) {
          if (bonusType === 'dodge') {
            // Dodge bonuses stack
            const totalDodge = bonuses.reduce((sum, bonus) => sum + bonus.value, 0);
            calculatedStats[stat] += totalDodge;
          } else {
            // For all other types, only apply the highest bonus
            const highestBonus = bonuses.reduce((max, bonus) => 
              max.value > bonus.value ? max : bonus, { value: 0 });
            
            if (highestBonus.value !== 0) {
              calculatedStats[stat] += highestBonus.value;
            }
          }
        }
      });
    });
    
    setFinalStats(calculatedStats);
    
    // Calculate derived stats
    const baseAttackBonus = calculateBAB(buffs);
    
    setDerived({
      ac: 10 + getModifier(calculatedStats.dexterity),
      fortitudeSave: getModifier(calculatedStats.constitution),
      reflexSave: getModifier(calculatedStats.dexterity),
      willSave: getModifier(calculatedStats.wisdom),
      baseAttackBonus: baseAttackBonus
    });
  }, [baseStats, buffs]);
  
  // Calculate BAB from buffs
  const calculateBAB = (buffs) => {
    let bab = 0;
    
    // Group BAB buffs by bonus type
    const babBuffs = {};
    bonusTypes.forEach(type => {
      babBuffs[type] = [];
    });
    
    // Find buffs that specifically affect BAB
    buffs.forEach(buff => {
      if (buff.effects.bab && buff.effects.bab !== 0) {
        babBuffs[buff.bonusType].push({
          value: buff.effects.bab,
          name: buff.name
        });
      }
    });
    
    // Apply stacking rules for BAB
    Object.entries(babBuffs).forEach(([bonusType, bonuses]) => {
      if (bonuses.length > 0) {
        if (bonusType === 'dodge') {
          // Dodge bonuses stack
          const totalDodge = bonuses.reduce((sum, bonus) => sum + bonus.value, 0);
          bab += totalDodge;
        } else {
          // For all other types, only apply the highest bonus
          const highestBonus = bonuses.reduce((max, bonus) => 
            max.value > bonus.value ? max : bonus, { value: 0 });
          
          if (highestBonus.value !== 0) {
            bab += highestBonus.value;
          }
        }
      }
    });
    
    return bab;
  };
  
  // List of bonus types for reference
  const bonusTypes = [
    'enhancement', 'luck', 'sacred', 'profane', 'alchemical', 'armor',
    'competence', 'circumstance', 'deflection', 'dodge', 'inherent',
    'insight', 'morale', 'natural', 'shield', 'size', 'trait', 'untyped', 'bab'
  ];

  return (
    <div className="combat-stats">
      <h2>Combat Statistics</h2>
      
      <div className="final-attributes">
        <h3>Final Attributes (with buffs)</h3>
        {Object.entries(finalStats).map(([stat, value]) => (
          <div key={stat} className="stat-display">
            <span className="stat-name">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
            <span className="stat-value">{value}</span>
            <span className="modifier">(Mod: {getModifier(value) >= 0 ? '+' : ''}{getModifier(value)})</span>
          </div>
        ))}
      </div>
      
      <div className="derived-stats">
        <h3>Combat Values</h3>
        <div className="stat-display">
          <span className="stat-name">Armor Class:</span>
          <span className="stat-value">{derived.ac}</span>
        </div>
        <div className="stat-display">
          <span className="stat-name">Fortitude Save:</span>
          <span className="stat-value">{derived.fortitudeSave >= 0 ? '+' : ''}{derived.fortitudeSave}</span>
        </div>
        <div className="stat-display">
          <span className="stat-name">Reflex Save:</span>
          <span className="stat-value">{derived.reflexSave >= 0 ? '+' : ''}{derived.reflexSave}</span>
        </div>
        <div className="stat-display">
          <span className="stat-name">Will Save:</span>
          <span className="stat-value">{derived.willSave >= 0 ? '+' : ''}{derived.willSave}</span>
        </div>
        <div className="stat-display">
          <span className="stat-name">Base Attack Bonus:</span>
          <span className="stat-value">{derived.baseAttackBonus >= 0 ? '+' : ''}{derived.baseAttackBonus}</span>
        </div>
      </div>
    </div>
  );
};

export default CombatStatsCalculator;