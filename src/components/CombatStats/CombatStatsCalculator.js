import React, { useState, useEffect } from 'react';
import { calculateFinalStats } from '../../utils/bonusCalculator';

// const finalStats = calculateFinalStats();
// const derivedStats = calculateDerivedStats();
const CombatStatsCalculator = ({ baseStats, buffs, gear = [], character = {} }) => {
  const [finalStats, setFinalStats] = useState({...baseStats});
  const [bonusDetails, setBonusDetails] = useState({});
  const [derived, setDerived] = useState({
    ac: 10,
    fortitudeSave: 0,
    reflexSave: 0,
    willSave: 0,
    attackBonus: 0
  });
  
  // Calculate modifiers
  const getModifier = (score) => Math.floor((score - 10) / 2);
  
  useEffect(() => {
    // Use the utility to calculate final stats
    const { finalStats: calculatedStats, bonusDetails: details } = calculateFinalStats(
      baseStats, 
      buffs, 
      gear
    );
    setFinalStats(calculatedStats);
    setBonusDetails(details);
    
    // Get base values from character
    const baseAttackBonus = character.baseAttackBonus || 0;
    const baseFortitude = character.baseFortitude || 0;
    const baseReflex = character.baseReflex || 0;
    const baseWill = character.baseWill || 0;
    
    // Get bonuses from effects
    const attackBonus = details.attackBonus?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const fortitudeBonus = details.fortitude?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const reflexBonus = details.reflex?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const willBonus = details.will?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    
    // Calculate derived stats
    setDerived({
      ac: 10 + getModifier(calculatedStats.dexterity) + (details.ac?.reduce((sum, bonus) => sum + bonus.value, 0) || 0),
      fortitudeSave: baseFortitude + getModifier(calculatedStats.constitution) + fortitudeBonus,
      reflexSave: baseReflex + getModifier(calculatedStats.dexterity) + reflexBonus,
      willSave: baseWill + getModifier(calculatedStats.wisdom) + willBonus,
      attackBonus: baseAttackBonus + attackBonus
    });
  }, [baseStats, buffs, gear, character]);

  return (
    <div className="combat-stats">
      <h2>Combat Statistics</h2>
      
      <div className="final-attributes">
        <h3>Final Attributes (with buffs & gear)</h3>
        {Object.entries(finalStats).map(([stat, value]) => {
          // Skip certain stats that are now displayed in Combat Values
          if (['bab', 'attackBonus', 'ac', 'fortitude', 'reflex', 'will'].includes(stat)) return null;
          
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
            <span className="stat-name">Attack Bonus:</span>
            <span className="stat-value">{derived.attackBonus >= 0 ? '+' : ''}{derived.attackBonus}</span>
          </div>
          <div className="save-details">
            <span>Base: {character.baseAttackBonus || 0}</span>
            {bonusDetails.attackBonus && bonusDetails.attackBonus.length > 0 && (
              <div className="stat-bonuses">
                <div className="bonus-sources">
                  {bonusDetails.attackBonus.map((bonus, idx) => (
                    <div key={idx} className="bonus-source">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Armor Class:</span>
            <span className="stat-value">{derived.ac}</span>
          </div>
          <div className="save-details">
            <span>Base: 10 + DEX modifier: {getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)}</span>
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
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Fortitude Save:</span>
            <span className="stat-value">{derived.fortitudeSave >= 0 ? '+' : ''}{derived.fortitudeSave}</span>
          </div>
          <div className="save-details">
            <span>Base: {character.baseFortitude || 0} + CON modifier: {getModifier(finalStats.constitution) >= 0 ? '+' : ''}{getModifier(finalStats.constitution)}</span>
            {bonusDetails.fortitude && bonusDetails.fortitude.length > 0 && (
              <div className="stat-bonuses">
                <div className="bonus-sources">
                  {bonusDetails.fortitude.map((bonus, idx) => (
                    <div key={idx} className="bonus-source">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Reflex Save:</span>
            <span className="stat-value">{derived.reflexSave >= 0 ? '+' : ''}{derived.reflexSave}</span>
          </div>
          <div className="save-details">
            <span>Base: {character.baseReflex || 0} + DEX modifier: {getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)}</span>
            {bonusDetails.reflex && bonusDetails.reflex.length > 0 && (
              <div className="stat-bonuses">
                <div className="bonus-sources">
                  {bonusDetails.reflex.map((bonus, idx) => (
                    <div key={idx} className="bonus-source">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="stat-display">
          <div className="stat-header">
            <span className="stat-name">Will Save:</span>
            <span className="stat-value">{derived.willSave >= 0 ? '+' : ''}{derived.willSave}</span>
          </div>
          <div className="save-details">
            <span>Base: {character.baseWill || 0} + WIS modifier: {getModifier(finalStats.wisdom) >= 0 ? '+' : ''}{getModifier(finalStats.wisdom)}</span>
            {bonusDetails.will && bonusDetails.will.length > 0 && (
              <div className="stat-bonuses">
                <div className="bonus-sources">
                  {bonusDetails.will.map((bonus, idx) => (
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
    </div>
  );
};

export default CombatStatsCalculator;