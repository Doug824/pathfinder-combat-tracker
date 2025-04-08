import React, { useState, useEffect } from 'react';
import { calculateFinalStats } from '../../utils/bonusCalculator';
import { getSizeModifier, getSizeACModifier, getSizeDisplayName } from '../../utils/sizeUtils';
const CombatStatsCalculator = ({ baseStats, buffs, gear = [], character = {}, combatAbilities = [] }) => {
  const [finalStats, setFinalStats] = useState({...baseStats});
  const [bonusDetails, setBonusDetails] = useState({});
  const [derived, setDerived] = useState({
    ac: 10,
    fortitudeSave: 0,
    reflexSave: 0,
    willSave: 0,
    attackBonus: 0,
    cmb: 0,
    cmd: 10,
    damageBonus: 0,
    sizeModifier: 0,
    sizeACModifier: 0
  });
  
  // Calculate modifiers
  const getModifier = (score) => Math.floor((score - 10) / 2);
  
  useEffect(() => {
    // Get active abilities
    const activeAbilities = combatAbilities.filter(ability => ability.isActive);
    
    // Use the utility to calculate final stats
    const { finalStats: calculatedStats, bonusDetails: details } = calculateFinalStats(
      baseStats, 
      [...buffs, ...activeAbilities], // Include active abilities in calculation
      gear
    );
    setFinalStats(calculatedStats);
    setBonusDetails(details);
    
    // Get base values from character
    const baseAttackBonus = character.baseAttackBonus || 0;
    const baseFortitude = character.baseFortitude || 0;
    const baseReflex = character.baseReflex || 0;
    const baseWill = character.baseWill || 0;
    
    // Get ability modifiers
    const strMod = getModifier(calculatedStats.strength);
    const dexMod = getModifier(calculatedStats.dexterity);
    const conMod = getModifier(calculatedStats.constitution);
    const wisMod = getModifier(calculatedStats.wisdom);
    
    // Get bonuses from effects
    const attackBonus = details.attackBonus?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const fortitudeBonus = details.fortitude?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const reflexBonus = details.reflex?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const willBonus = details.will?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const acBonus = details.ac?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const cmbBonus = details.cmb?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const cmdBonus = details.cmd?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const damageBonus = details.damage?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    
    // Get ability modifier for damage
    // Use strength by default, but check if character has a specified damage ability
    const damageAbilityMod = character?.damageAbilityMod || 'strength';
    let abilityDamageBonus = 0;
    
    // Apply the appropriate ability modifier to damage
    switch (damageAbilityMod) {
      case 'strength':
        abilityDamageBonus = strMod;
        break;
      case 'dexterity':
        abilityDamageBonus = dexMod;
        break;
      case 'constitution':
        abilityDamageBonus = conMod;
        break;
      case 'intelligence':
        abilityDamageBonus = getModifier(calculatedStats.intelligence);
        break;
      case 'wisdom':
        abilityDamageBonus = wisMod;
        break;
      case 'charisma':
        abilityDamageBonus = getModifier(calculatedStats.charisma);
        break;
      default:
        abilityDamageBonus = strMod; // Default to strength
    }
    
    // Extract specific bonus types for CMD calculation
    const deflectionBonus = details.ac?.filter(b => b.type === 'deflection').reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const dodgeBonus = details.ac?.filter(b => b.type === 'dodge').reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    
    // Get size modifiers using the character's size
    const sizeModifier = getSizeModifier(character.size || 'medium');
    const sizeACModifier = getSizeACModifier(character.size || 'medium');
    
    // Calculate derived stats
    setDerived({
      ac: 10 + dexMod + acBonus + sizeACModifier,
      fortitudeSave: baseFortitude + conMod + fortitudeBonus,
      reflexSave: baseReflex + dexMod + reflexBonus,
      willSave: baseWill + wisMod + willBonus,
      attackBonus: baseAttackBonus + attackBonus,
      // CMB = BAB + STR modifier + size modifier + misc bonuses
      cmb: baseAttackBonus + strMod + sizeModifier + cmbBonus,
      // CMD = 10 + BAB + STR modifier + DEX modifier + size modifier + deflection bonus + dodge bonus + misc bonuses
      cmd: 10 + baseAttackBonus + strMod + dexMod + sizeModifier + deflectionBonus + dodgeBonus + cmdBonus,
      // Include ability modifier in damage bonus
      damageBonus: abilityDamageBonus + damageBonus,
      // Store size modifiers for display
      sizeModifier,
      sizeACModifier
    });
  }, [baseStats, buffs, gear, character, combatAbilities]);

  return (
    <div className="combat-stats">
      <h2>Combat Statistics</h2>
      
      <div className="final-attributes">
        <h3>Final Attributes (with buffs & gear)</h3>
        <div className="card-grid-layout">
          {Object.entries(finalStats).map(([stat, value]) => {
            // Skip certain stats that are now displayed in Combat Values
            if (['bab', 'attackBonus', 'ac', 'fortitude', 'reflex', 'will', 'cmb', 'cmd', 'damage'].includes(stat)) return null;
            
            const statBonuses = bonusDetails[stat] || [];
            const totalBonus = statBonuses.reduce((sum, bonus) => sum + bonus.value, 0);
            
            return (
              <div key={stat} className="stat-display card">
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
      </div>
      
      <div className="derived-stats">
        <h3>Combat Values</h3>
        <div className="card-grid-layout">
          {/* Display character size */}
          {character.size && (
            <div className="stat-display card">
              <div className="stat-header">
                <span className="stat-name">Size Category:</span>
                <span className="stat-value">{getSizeDisplayName(character.size)}</span>
              </div>
              <div className="save-details">
                <span>Size modifier for CMB/CMD: {derived.sizeModifier >= 0 ? '+' : ''}{derived.sizeModifier}</span>
                <span>Size modifier for AC: {derived.sizeACModifier >= 0 ? '+' : ''}{derived.sizeACModifier}</span>
              </div>
            </div>
          )}
          
          <div className="stat-display card">
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
          
          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">Damage Bonus:</span>
              <span className="stat-value">{derived.damageBonus >= 0 ? '+' : ''}{derived.damageBonus}</span>
            </div>
            <div className="save-details">
              <span>
                {character?.damageAbilityMod ? (
                  `${character.damageAbilityMod.charAt(0).toUpperCase() + character.damageAbilityMod.slice(1)} modifier: ${getModifier(finalStats[character.damageAbilityMod]) >= 0 ? '+' : ''}${getModifier(finalStats[character.damageAbilityMod])}`
                ) : (
                  `STR modifier: ${getModifier(finalStats.strength) >= 0 ? '+' : ''}${getModifier(finalStats.strength)}`
                )}
              </span>
              {bonusDetails.damage && bonusDetails.damage.length > 0 && (
                <div className="stat-bonuses">
                  <div className="bonus-sources">
                    {bonusDetails.damage.map((bonus, idx) => (
                      <div key={idx} className="bonus-source">
                        {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">Armor Class:</span>
              <span className="stat-value">{derived.ac}</span>
            </div>
            <div className="save-details">
              <span>Base: 10 + DEX modifier: {getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)}</span>
              {derived.sizeACModifier !== 0 && (
                <span> + Size modifier: {derived.sizeACModifier >= 0 ? '+' : ''}{derived.sizeACModifier}</span>
              )}
              {finalStats.naturalArmor > 0 && (
                <span> + Natural Armor: +{finalStats.naturalArmor}</span>
              )}
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

          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">Natural Armor:</span>
              <span className="stat-value">{finalStats.naturalArmor || 0}</span>
            </div>
            <div className="save-details">
              {bonusDetails.naturalArmor && bonusDetails.naturalArmor.length > 0 && (
                <div className="stat-bonuses">
                  <div className="bonus-sources">
                    {bonusDetails.naturalArmor.map((bonus, idx) => (
                      <div key={idx} className="bonus-source">
                        {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">CMB:</span>
              <span className="stat-value">{derived.cmb >= 0 ? '+' : ''}{derived.cmb}</span>
            </div>
            <div className="save-details">
              <span>BAB ({character.baseAttackBonus || 0}) + STR modifier ({getModifier(finalStats.strength) >= 0 ? '+' : ''}{getModifier(finalStats.strength)})</span>
              {derived.sizeModifier !== 0 && (
                <span> + Size modifier: {derived.sizeModifier >= 0 ? '+' : ''}{derived.sizeModifier}</span>
              )}
              {bonusDetails.cmb && bonusDetails.cmb.length > 0 && (
                <div className="stat-bonuses">
                  <div className="bonus-sources">
                    {bonusDetails.cmb.map((bonus, idx) => (
                      <div key={idx} className="bonus-source">
                        {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">CMD:</span>
              <span className="stat-value">{derived.cmd}</span>
            </div>
            <div className="save-details">
              <span>10 + BAB ({character.baseAttackBonus || 0}) + STR ({getModifier(finalStats.strength) >= 0 ? '+' : ''}{getModifier(finalStats.strength)}) + DEX ({getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)})</span>
              {derived.sizeModifier !== 0 && (
                <span> + Size modifier: {derived.sizeModifier >= 0 ? '+' : ''}{derived.sizeModifier}</span>
              )}
              {/* Other CMD details... */}
            </div>
          </div>
        </div>
        
        <h3>Saving Throws</h3>
        <div className="card-grid-layout">
          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">Fortitude Save:</span>
              <span className="stat-value">{derived.fortitudeSave >= 0 ? '+' : ''}{derived.fortitudeSave}</span>
            </div>
            <div className="save-details">
              <span>Base: {character.baseFortitude || 0} + CON modifier: {getModifier(finalStats.constitution) >= 0 ? '+' : ''}{getModifier(finalStats.constitution)}</span>
              {/* Fortitude bonuses... */}
            </div>
          </div>
          
          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">Reflex Save:</span>
              <span className="stat-value">{derived.reflexSave >= 0 ? '+' : ''}{derived.reflexSave}</span>
            </div>
            <div className="save-details">
              <span>Base: {character.baseReflex || 0} + DEX modifier: {getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)}</span>
              {/* Reflex bonuses... */}
            </div>
          </div>
          
          <div className="stat-display card">
            <div className="stat-header">
              <span className="stat-name">Will Save:</span>
              <span className="stat-value">{derived.willSave >= 0 ? '+' : ''}{derived.willSave}</span>
            </div>
            <div className="save-details">
              <span>Base: {character.baseWill || 0} + WIS modifier: {getModifier(finalStats.wisdom) >= 0 ? '+' : ''}{getModifier(finalStats.wisdom)}</span>
              {/* Will bonuses... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatStatsCalculator;