import React, { useState, useEffect } from 'react';
import { calculateFinalStats, calculateDerivedStats } from '../../utils/bonusCalculator';

const CombatStatsCalculator = ({ baseStats, buffs, gear = [] }) => {
  const [finalStats, setFinalStats] = useState({...baseStats});
  const [bonusDetails, setBonusDetails] = useState({});
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
    // Use the utility to calculate final stats
    const { finalStats: calculatedStats, bonusDetails: details } = calculateFinalStats(baseStats, buffs, gear);
    setFinalStats(calculatedStats);
    setBonusDetails(details);
    
    // Calculate derived stats
    const derivedStats = calculateDerivedStats(calculatedStats);
    setDerived(derivedStats);
  }, [baseStats, buffs, gear]);

  return (
    <div className="combat-stats">
      <h2>Combat Statistics</h2>
      
      <div className="final-attributes">
        <h3>Final Attributes (with buffs & gear)</h3>
        {Object.entries(finalStats).map(([stat, value]) => {
          // Skip bab as it's shown in derived stats
          if (stat === 'bab') return null;
          
          const statBonuses = bonusDetails[stat] || [];
          const totalBonus = statBonuses.reduce((sum, bonus) => sum + bonus.value, 0);
          
          return (
            <div key={stat} className="stat-display">
              <div className="stat-header">
                <span className="stat-name">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
                <span className="stat-value">{value}</span>
                <span className="modifier">(Mod: {getModifier(value) >= 0 ? '+' : ''}{getModifier(value)})</span>
              </div>
              
              {statBonuses.length > 0 && (
                <div className="stat-bonuses">
                  <span className="total-bonus">
                    From bonuses: {totalBonus > 0 ? '+' : ''}{totalBonus}
                  </span>
                  <div className="bonus-sources">
                    {statBonuses.map((bonus, idx) => (
                      <div key={idx} className="bonus-source">
                        {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="derived-stats">
        <h3>Combat Values</h3>
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Armor Class:</span>
            <span className="stat-value">{derived.ac}</span>
          </div>
          {bonusDetails.ac && bonusDetails.ac.length > 0 && (
            <div className="stat-bonuses">
              <div className="bonus-sources">
                {bonusDetails.ac.map((bonus, idx) => (
                  <div key={idx} className="bonus-source">
                    {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Fortitude Save:</span>
            <span className="stat-value">{derived.fortitudeSave >= 0 ? '+' : ''}{derived.fortitudeSave}</span>
          </div>
          <div className="save-details">
            <span>Constitution modifier</span>
          </div>
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Reflex Save:</span>
            <span className="stat-value">{derived.reflexSave >= 0 ? '+' : ''}{derived.reflexSave}</span>
          </div>
          <div className="save-details">
            <span>Dexterity modifier</span>
          </div>
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Will Save:</span>
            <span className="stat-value">{derived.willSave >= 0 ? '+' : ''}{derived.willSave}</span>
          </div>
          <div className="save-details">
            <span>Wisdom modifier</span>
          </div>
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Base Attack Bonus:</span>
            <span className="stat-value">{derived.baseAttackBonus >= 0 ? '+' : ''}{derived.baseAttackBonus}</span>
          </div>
          {bonusDetails.bab && bonusDetails.bab.length > 0 && (
            <div className="stat-bonuses">
              <div className="bonus-sources">
                {bonusDetails.bab.map((bonus, idx) => (
                  <div key={idx} className="bonus-source">
                    {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatStatsCalculator;