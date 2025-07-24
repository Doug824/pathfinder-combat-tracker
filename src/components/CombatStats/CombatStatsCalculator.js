
import React, { useState, useEffect } from 'react';
import { calculateFinalStats } from '../../utils/bonusCalculator';
import { getSizeModifier, getSizeACModifier, getSizeDisplayName } from '../../utils/sizeUtils';
import NumericInput from '../common/NumericInput';

const CombatStatsCalculator = ({ baseStats, buffs, gear = [], character = {}, combatAbilities = [] }) => {
  const [finalStats, setFinalStats] = useState({...baseStats});
  const [bonusDetails, setBonusDetails] = useState({});
  const [acOverride, setAcOverride] = useState(null);
  const [showACBreakdown, setShowACBreakdown] = useState(false);
  const [derived, setDerived] = useState({
    ac: 10,
    touchAC: 10,
    flatFootedAC: 10,
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
  
  // Apply penalties from negative levels
  const applyNegativeLevelPenalties = (statValue, type = 'general') => {
    const negLevels = character?.hitPoints?.negLevels || 0;
    
    if (negLevels <= 0) return statValue;
    
    switch (type) {
      case 'hp':
        // Each negative level reduces HP by 5
        return Math.max(1, statValue - (negLevels * 5));
      case 'attack':
      case 'save':
      case 'maneuver':
        // Each negative level applies a -1 penalty to attacks, saves, and combat maneuvers
        return statValue - negLevels;
      case 'skillCheck':
        // Negative levels also apply a -1 to skill checks
        return statValue - negLevels;
      default:
        return statValue;
    }
  };
  
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
    
    // Store the raw sum before penalties
    const rawAttackBonus = baseAttackBonus + attackBonus;
    // Apply negative level penalties to attack bonus
    const totalAttackBonus = applyNegativeLevelPenalties(rawAttackBonus, 'attack');
    
    // Apply negative level penalties to saves
    const fortSave = applyNegativeLevelPenalties(
      baseFortitude + conMod + fortitudeBonus,
      'save'
    );
    
    const refSave = applyNegativeLevelPenalties(
      baseReflex + dexMod + reflexBonus,
      'save'
    );
    
    const willSave = applyNegativeLevelPenalties(
      baseWill + wisMod + willBonus,
      'save'
    );
    
    // Apply negative level penalties to CMB
    const totalCMB = applyNegativeLevelPenalties(
      baseAttackBonus + strMod + sizeModifier + cmbBonus,
      'maneuver'
    );
    
    // Apply negative level penalties to CMD
    const totalCMD = applyNegativeLevelPenalties(
      10 + baseAttackBonus + strMod + dexMod + sizeModifier + deflectionBonus + dodgeBonus + cmdBonus,
      'maneuver'
    );
    
    // Calculate AC values
    const baseAC = 10 + dexMod + acBonus + sizeACModifier;
    const actualAC = acOverride !== null ? acOverride : baseAC;
    
    // Calculate Touch AC (no armor or natural armor)
    const armorBonus = bonusDetails.ac?.filter(b => b.type === 'armor').reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const shieldBonus = bonusDetails.ac?.filter(b => b.type === 'shield').reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const naturalArmorBonus = finalStats.naturalArmor || 0;
    const touchAC = 10 + dexMod + sizeACModifier + (acBonus - armorBonus - shieldBonus - naturalArmorBonus);
    
    // Calculate Flat-footed AC (no dex bonus)
    const flatFootedAC = 10 + acBonus + sizeACModifier;

    // Calculate derived stats
    setDerived({
      ac: actualAC,
      touchAC: touchAC,
      flatFootedAC: flatFootedAC,
      fortitudeSave: fortSave,
      reflexSave: refSave,
      willSave: willSave,
      attackBonus: totalAttackBonus,
      cmb: totalCMB,
      cmd: totalCMD,
      // Include ability modifier in damage bonus
      damageBonus: abilityDamageBonus + damageBonus,
      // Store size modifiers for display
      sizeModifier,
      sizeACModifier
    });
  }, [baseStats, buffs, gear, character, combatAbilities, acOverride]);

  return (
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
      <h2 className="text-amber-400 font-fantasy font-bold text-2xl mb-6">Combat Statistics</h2>
      
      {character?.hitPoints?.negLevels > 0 && (
        <div className="bg-red-900/40 border border-red-700/50 rounded-lg p-4 mb-6">
          <h4 className="text-red-400 font-fantasy font-bold mb-2">Negative Levels: {character.hitPoints.negLevels}</h4>
          <p className="text-red-300 text-sm mb-1">All attack rolls, saving throws, combat maneuvers, and skill checks have a 
          -{character.hitPoints.negLevels} penalty.</p>
          <p className="text-red-300 text-sm">Maximum hit points are reduced by {character.hitPoints.negLevels * 5}.</p>
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-amber-400 font-fantasy font-bold text-xl mb-4">Final Attributes (with buffs & gear)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(finalStats).map(([stat, value]) => {
            // Skip certain stats that are now displayed in Combat Values
            if (['bab', 'attackBonus', 'ac', 'fortitude', 'reflex', 'will', 'cmb', 'cmd', 'damage'].includes(stat)) return null;
            
            const statBonuses = bonusDetails[stat] || [];
            const totalBonus = statBonuses.reduce((sum, bonus) => sum + bonus.value, 0);
            
            return (
              <div key={stat} className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-300 font-medium">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
                    <span className="text-amber-100 text-xl font-bold">{value}</span>
                  </div>
                  <div className="text-amber-200 text-sm">(Mod: {getModifier(value) >= 0 ? '+' : ''}{getModifier(value)})</div>
                </div>
                
                {statBonuses.length > 0 && (
                  <div className="text-xs">
                    <div className="text-amber-300 mb-1">
                      From bonuses: {totalBonus > 0 ? '+' : ''}{totalBonus}
                    </div>
                    <div className="space-y-1">
                      {statBonuses.map((bonus, idx) => (
                        <div key={idx} className="text-amber-200 bg-black/20 rounded px-2 py-1">
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
      
      <div className="mb-8">
        <h3 className="text-amber-400 font-fantasy font-bold text-xl mb-4">Combat Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Display character size */}
          {character.size && (
            <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-amber-300 font-medium">Size Category:</span>
                  <span className="text-amber-100 text-xl font-bold">{getSizeDisplayName(character.size)}</span>
                </div>
              </div>
              <div className="text-amber-200 text-sm space-y-1">
                <div>Size modifier for CMB/CMD: {derived.sizeModifier >= 0 ? '+' : ''}{derived.sizeModifier}</div>
                <div>Size modifier for AC: {derived.sizeACModifier >= 0 ? '+' : ''}{derived.sizeACModifier}</div>
              </div>
            </div>
          )}
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">Attack Bonus:</span>
                <span className="text-amber-100 text-xl font-bold">{derived.attackBonus >= 0 ? '+' : ''}{derived.attackBonus}</span>
              </div>
              {character?.hitPoints?.negLevels > 0 && (
                <div className="text-red-400 text-xs">
                  (includes -{character.hitPoints.negLevels} negative level penalty)
                </div>
              )}
            </div>
            <div className="text-amber-200 text-sm">
              <div className="mb-2">Base: {character.baseAttackBonus || 0}</div>
              {bonusDetails.attackBonus && bonusDetails.attackBonus.length > 0 && (
                <div className="space-y-1">
                  {bonusDetails.attackBonus.map((bonus, idx) => (
                    <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">Damage Bonus:</span>
                <span className="text-amber-100 text-xl font-bold">{derived.damageBonus >= 0 ? '+' : ''}{derived.damageBonus}</span>
              </div>
            </div>
            <div className="text-amber-200 text-sm">
              <div className="mb-2">
                {character?.damageAbilityMod ? (
                  `${character.damageAbilityMod.charAt(0).toUpperCase() + character.damageAbilityMod.slice(1)} modifier: ${getModifier(finalStats[character.damageAbilityMod]) >= 0 ? '+' : ''}${getModifier(finalStats[character.damageAbilityMod])}`
                ) : (
                  `STR modifier: ${getModifier(finalStats.strength) >= 0 ? '+' : ''}${getModifier(finalStats.strength)}`
                )}
              </div>
              {bonusDetails.damage && bonusDetails.damage.length > 0 && (
                <div className="space-y-1">
                  {bonusDetails.damage.map((bonus, idx) => (
                    <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">Armor Class:</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-100 text-xl font-bold">{derived.ac}</span>
                  {acOverride !== null && (
                    <span className="text-red-400 text-sm">(Override)</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 text-amber-200 text-sm mb-2">
                <span>Touch: {derived.touchAC}</span>
                <span>•</span>
                <span>Flat-footed: {derived.flatFootedAC}</span>
              </div>
            </div>
            
            {/* AC Override Input */}
            <div className="mb-3">
              <label className="block text-amber-300 text-sm font-medium mb-1">Manual Override:</label>
              <div className="flex gap-2 items-center">
                <NumericInput
                  value={acOverride || ''}
                  onChange={(value) => setAcOverride(value === '' ? null : parseInt(value))}
                  className="flex-1 text-sm"
                  placeholder="Auto"
                  min={1}
                  max={99}
                />
                {acOverride !== null && (
                  <button
                    onClick={() => setAcOverride(null)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1 bg-red-900/20 rounded border border-red-700/30"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Expandable AC Breakdown */}
            <button
              onClick={() => setShowACBreakdown(!showACBreakdown)}
              className="w-full text-amber-300 hover:text-amber-200 text-sm mb-2 flex items-center justify-center gap-1"
            >
              {showACBreakdown ? '▼' : '▶'} AC Breakdown
            </button>
            
            {showACBreakdown && (
              <div className="text-amber-200 text-sm bg-black/20 rounded p-3">
                <div className="mb-2">Base: 10 + DEX modifier: {getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)}</div>
                {derived.sizeACModifier !== 0 && (
                  <div className="mb-1"> + Size modifier: {derived.sizeACModifier >= 0 ? '+' : ''}{derived.sizeACModifier}</div>
                )}
                {finalStats.naturalArmor > 0 && (
                  <div className="mb-1"> + Natural Armor: +{finalStats.naturalArmor}</div>
                )}
                {bonusDetails.ac && bonusDetails.ac.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {bonusDetails.ac.map((bonus, idx) => (
                      <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                        {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-amber-700/30">
                  <div className="text-xs text-amber-300">
                    <div>Touch AC = Base (10) + DEX + Size + Deflection + Dodge bonuses</div>
                    <div>Flat-footed AC = Total AC - DEX modifier</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">Natural Armor:</span>
                <span className="text-amber-100 text-xl font-bold">{finalStats.naturalArmor || 0}</span>
              </div>
            </div>
            <div className="text-amber-200 text-sm">
              {bonusDetails.naturalArmor && bonusDetails.naturalArmor.length > 0 && (
                <div className="space-y-1">
                  {bonusDetails.naturalArmor.map((bonus, idx) => (
                    <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">CMB:</span>
                <span className="text-amber-100 text-xl font-bold">{derived.cmb >= 0 ? '+' : ''}{derived.cmb}</span>
              </div>
              {character?.hitPoints?.negLevels > 0 && (
                <div className="text-red-400 text-xs">
                  (includes -{character.hitPoints.negLevels} negative level penalty)
                </div>
              )}
            </div>
            <div className="text-amber-200 text-sm">
              <div className="mb-2">BAB ({character.baseAttackBonus || 0}) + STR modifier ({getModifier(finalStats.strength) >= 0 ? '+' : ''}{getModifier(finalStats.strength)})</div>
              {derived.sizeModifier !== 0 && (
                <div className="mb-1"> + Size modifier: {derived.sizeModifier >= 0 ? '+' : ''}{derived.sizeModifier}</div>
              )}
              {bonusDetails.cmb && bonusDetails.cmb.length > 0 && (
                <div className="space-y-1 mt-2">
                  {bonusDetails.cmb.map((bonus, idx) => (
                    <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">CMD:</span>
                <span className="text-amber-100 text-xl font-bold">{derived.cmd}</span>
              </div>
              {character?.hitPoints?.negLevels > 0 && (
                <div className="text-red-400 text-xs">
                  (includes -{character.hitPoints.negLevels} negative level penalty)
                </div>
              )}
            </div>
            <div className="text-amber-200 text-sm">
              <div className="mb-2">10 + BAB ({character.baseAttackBonus || 0}) + STR ({getModifier(finalStats.strength) >= 0 ? '+' : ''}{getModifier(finalStats.strength)}) + DEX ({getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)})</div>
              {derived.sizeModifier !== 0 && (
                <div className="mb-1"> + Size modifier: {derived.sizeModifier >= 0 ? '+' : ''}{derived.sizeModifier}</div>
              )}
            </div>
          </div>
        </div>
        
        <h3 className="text-amber-400 font-fantasy font-bold text-xl mb-4">Saving Throws</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">Fortitude Save:</span>
                <span className="text-amber-100 text-xl font-bold">{derived.fortitudeSave >= 0 ? '+' : ''}{derived.fortitudeSave}</span>
              </div>
              {character?.hitPoints?.negLevels > 0 && (
                <div className="text-red-400 text-xs">
                  (includes -{character.hitPoints.negLevels} negative level penalty)
                </div>
              )}
            </div>
            <div className="text-amber-200 text-sm">
              <div className="mb-2">Base: {character.baseFortitude || 0} + CON modifier: {getModifier(finalStats.constitution) >= 0 ? '+' : ''}{getModifier(finalStats.constitution)}</div>
              {bonusDetails.fortitude && bonusDetails.fortitude.length > 0 && (
                <div className="space-y-1">
                  {bonusDetails.fortitude.map((bonus, idx) => (
                    <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">Reflex Save:</span>
                <span className="text-amber-100 text-xl font-bold">{derived.reflexSave >= 0 ? '+' : ''}{derived.reflexSave}</span>
              </div>
              {character?.hitPoints?.negLevels > 0 && (
                <div className="text-red-400 text-xs">
                  (includes -{character.hitPoints.negLevels} negative level penalty)
                </div>
              )}
            </div>
            <div className="text-amber-200 text-sm">
              <div className="mb-2">Base: {character.baseReflex || 0} + DEX modifier: {getModifier(finalStats.dexterity) >= 0 ? '+' : ''}{getModifier(finalStats.dexterity)}</div>
              {bonusDetails.reflex && bonusDetails.reflex.length > 0 && (
                <div className="space-y-1 mt-2">
                  {bonusDetails.reflex.map((bonus, idx) => (
                    <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-amber-300 font-medium">Will Save:</span>
                <span className="text-amber-100 text-xl font-bold">{derived.willSave >= 0 ? '+' : ''}{derived.willSave}</span>
              </div>
              {character?.hitPoints?.negLevels > 0 && (
                <div className="text-red-400 text-xs">
                  (includes -{character.hitPoints.negLevels} negative level penalty)
                </div>
              )}
            </div>
            <div className="text-amber-200 text-sm">
              <div className="mb-2">Base: {character.baseWill || 0} + WIS modifier: {getModifier(finalStats.wisdom) >= 0 ? '+' : ''}{getModifier(finalStats.wisdom)}</div>
              {bonusDetails.will && bonusDetails.will.length > 0 && (
                <div className="space-y-1 mt-2">
                  {bonusDetails.will.map((bonus, idx) => (
                    <div key={idx} className="text-xs bg-black/20 rounded px-2 py-1">
                      {bonus.name} ({bonus.source}): {bonus.value > 0 ? '+' : ''}{bonus.value} {bonus.type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CombatStatsCalculator;