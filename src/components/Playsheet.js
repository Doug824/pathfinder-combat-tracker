import React, { useState, useEffect } from 'react';
import { calculateFinalStats } from '../utils/bonusCalculator';
import './Playsheet.css'; // Import the new CSS file

const Playsheet = ({
  character,
  stats,
  buffs,
  gear,
  combatAbilities,
  onCombatAbilitiesChange,
  onUpdateWeapons,
  onUpdateCombatSettings
}) => {
  // State for attack calculations
  const [attacksCount, setAttacksCount] = useState(1);
  const [hasHaste, setHasHaste] = useState(false);
  const [attackModifiers, setAttackModifiers] = useState([0]);
  const [damageModifier, setDamageModifier] = useState(0);
  
  // State for two-weapon fighting
  const [twoWeaponFighting, setTwoWeaponFighting] = useState(character?.twoWeaponFighting || false);
  const [offhandAttacksCount, setOffhandAttacksCount] = useState(character?.offhandAttacksCount || 1);
  const [offhandAttackModifiers, setOffhandAttackModifiers] = useState([0]);
  const [offhandDamageModifier, setOffhandDamageModifier] = useState(0);
  
  // State for ability modifier selection
  const [attackAbilityMod, setAttackAbilityMod] = useState(character?.attackAbilityMod || 'strength');
  const [damageAbilityMod, setDamageAbilityMod] = useState(character?.damageAbilityMod || 'strength');
  const [offhandAttackAbilityMod, setOffhandAttackAbilityMod] = useState(character?.offhandAttackAbilityMod || 'strength');
  const [offhandDamageAbilityMod, setOffhandDamageAbilityMod] = useState(character?.offhandDamageAbilityMod || 'strength');
  
  // State for weapons
  const [primaryWeapon, setPrimaryWeapon] = useState(character?.primaryWeapon || {
    name: 'Primary Weapon',
    attackBonus: 0,
    damageBonus: 0
  });
  const [offhandWeapon, setOffhandWeapon] = useState(character?.offhandWeapon || {
    name: 'Off-Hand Weapon',
    attackBonus: 0,
    damageBonus: 0
  });

  // State for combat dice
  const [diceCount, setDiceCount] = useState(1);
  const [diceType, setDiceType] = useState(6);
  const [diceResult, setDiceResult] = useState(null);
  const [showAverage, setShowAverage] = useState(true);
  const [diceGroups, setDiceGroups] = useState([
    { id: Date.now(), count: 1, type: 6 }
  ]);
  
  // State for combat stats
  const [combatStats, setCombatStats] = useState({
    baseAttackBonus: character?.baseAttackBonus || 0,
    attackBonus: 0,
    normalAC: 10,
    touchAC: 10,
    flatFootedAC: 10,
    cmb: 0,
    cmd: 10,
    fort: 0,
    ref: 0,
    will: 0
  });
  
  // Calculate all stats with currently active abilities
  useEffect(() => {
    // Get active abilities with correct effects
    const activeAbilities = combatAbilities.filter(ability => ability.isActive);
    
    // Create a mapping of ability effects to make debugging easier
    const abilityEffects = activeAbilities.map(ability => ({
      name: ability.name,
      effects: ability.effects,
      inputValue: ability.inputValue,
      variableInput: ability.variableInput
    }));
    
    console.log("Active abilities with effects:", abilityEffects);
    
    // Process any variable input abilities to make sure their effects are up-to-date
    const processedAbilities = activeAbilities.map(ability => {
      if (ability.variableInput && ability.isActive) {
        const inputValue = ability.inputValue || 1;
        
        if (ability.name === 'Improved Power Attack') {
          return {
            ...ability,
            effects: {
              ...ability.effects,
              attackBonus: -inputValue,    // NEGATIVE
              damage: inputValue * 2       // POSITIVE
            }
          };
        } else if (ability.name === 'Greater Power Attack') {
          return {
            ...ability,
            effects: {
              ...ability.effects,
              attackBonus: inputValue,     // POSITIVE
              damage: -inputValue          // NEGATIVE
            }
          };
        } else if (ability.name === 'Fighting Defensively') {
          return {
            ...ability,
            effects: {
              ...ability.effects,
              attackBonus: -inputValue,
              ac: ability.secondaryInputValue || 2
            }
          };
        } else if (ability.name === 'Combat Expertise') {
          return {
            ...ability,
            effects: {
              ...ability.effects,
              attackBonus: -inputValue,
              ac: inputValue
            }
          };
        } else if (ability.name === 'Deadly Aim') {
          return {
            ...ability,
            effects: {
              ...ability.effects,
              attackBonus: -inputValue,
              damage: inputValue * 2
            }
          };
        }
      }
      return ability;
    });
    
    // Calculate stats with the processed abilities
    const { finalStats, bonusDetails } = calculateFinalStats(stats, [...buffs, ...processedAbilities], gear);
    
    // Get ability modifiers
    const strMod = Math.floor((finalStats.strength - 10) / 2);
    const dexMod = Math.floor((finalStats.dexterity - 10) / 2);
    const conMod = Math.floor((finalStats.constitution - 10) / 2);
    const intMod = Math.floor((finalStats.intelligence - 10) / 2);
    const wisMod = Math.floor((finalStats.wisdom - 10) / 2);
    const chaMod = Math.floor((finalStats.charisma - 10) / 2);
    
    // Map of ability scores to their modifiers
    const abilityModValues = {
      strength: strMod,
      dexterity: dexMod,
      constitution: conMod,
      intelligence: intMod,
      wisdom: wisMod,
      charisma: chaMod
    };
    
    // Get selected ability modifiers for attack and damage
    const selectedAttackMod = abilityModValues[attackAbilityMod] || strMod;
    const selectedDamageMod = abilityModValues[damageAbilityMod] || strMod;
    const selectedOffhandAttackMod = abilityModValues[offhandAttackAbilityMod] || strMod;
    const selectedOffhandDamageMod = abilityModValues[offhandDamageAbilityMod] || strMod;
    
    // Get base attack bonus and attack bonuses
    const baseBAB = character?.baseAttackBonus || 0;
    const attackBonuses = bonusDetails.attackBonus?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const damageBonuses = bonusDetails.damage?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;

    // Direct check for Power Attack abilities to ensure penalties are applied
    let directAttackPenalty = 0;
    let directDamagePenalty = 0;

    // Look for active power attack abilities
    for (const ability of processedAbilities) {
      if (ability.isActive) {
        if (ability.name === 'Improved Power Attack') {
          const value = ability.inputValue || 1;
          directAttackPenalty -= value; // Ensure the penalty is negative
        }
        else if (ability.name === 'Greater Power Attack') {
          const value = ability.inputValue || 1;
          directDamagePenalty -= value; // Ensure the penalty is negative
        }
      }
    }

    // Apply two-weapon fighting penalty if active
    const twfPenalty = twoWeaponFighting ? -2 : 0;
    
    // Calculate primary weapon attack bonus - include direct penalty
    const totalAttackBonus = baseBAB + selectedAttackMod + attackBonuses + primaryWeapon.attackBonus + twfPenalty + directAttackPenalty;
    
    // Calculate primary weapon damage modifier - include direct penalty
    const primaryDamageMod = selectedDamageMod + damageBonuses + primaryWeapon.damageBonus + directDamagePenalty;

    // Calculate offhand weapon attack bonus
    const totalOffhandAttackBonus = baseBAB + selectedOffhandAttackMod + attackBonuses + offhandWeapon.attackBonus + twfPenalty + directAttackPenalty;
    
    // Calculate offhand weapon damage modifier (typically half ability bonus)
    const offhandAbilityDamageMod = twoWeaponFighting ? Math.floor(selectedOffhandDamageMod / 2) : selectedOffhandDamageMod;
    const totalOffhandDamageMod = offhandAbilityDamageMod + damageBonuses + offhandWeapon.damageBonus + directDamagePenalty;
    
    // Calculate AC values - ensure AC penalty is applied
    const baseAC = 10;
    const acBonuses = bonusDetails.ac?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const normalAC = baseAC + dexMod + acBonuses;
  
    // Touch AC calculation
    const touchAC = baseAC + dexMod + (bonusDetails.ac?.filter(b => 
      ['dodge', 'deflection', 'luck', 'sacred', 'profane', 'insight', 'morale'].includes(b.type)
    ).reduce((sum, bonus) => sum + bonus.value, 0) || 0);
  
    // Flat-footed AC calculation
    const flatFootedAC = baseAC + (bonusDetails.ac?.filter(b => b.type !== 'dodge').reduce((sum, bonus) => sum + bonus.value, 0) || 0);
    
    // Calculate CMB and CMD
    const cmb = baseBAB + strMod + (bonusDetails.cmb?.reduce((sum, bonus) => sum + bonus.value, 0) || 0);

    // Calculate dodge bonuses to CMD
    let dodgeBonusToCmd = 0;

    // Check for active abilities that provide dodge bonuses
    for (const ability of processedAbilities) {
      if (ability.isActive) {
        // Combat Expertise provides dodge bonus to AC equal to the penalty to attack
        if (ability.name === 'Combat Expertise' && ability.effects.ac > 0) {
          dodgeBonusToCmd += ability.effects.ac;
        }
        // Fighting Defensively provides dodge bonus to AC
        else if (ability.name === 'Fighting Defensively' && ability.effects.ac > 0) {
          dodgeBonusToCmd += ability.effects.ac;
        }
      }
    }

// Add dodge bonuses from other sources (items, buffs, etc.)
const otherDodgeBonuses = bonusDetails.ac?.filter(b => b.type === 'dodge').reduce((sum, bonus) => sum + bonus.value, 0) || 0;
dodgeBonusToCmd += otherDodgeBonuses;

// Calculate CMD with dodge bonuses
const cmd = 10 + baseBAB + strMod + dexMod + dodgeBonusToCmd + (bonusDetails.cmd?.reduce((sum, bonus) => sum + bonus.value, 0) || 0);
    
    // Calculate saving throws
    const baseFort = character?.baseFortitude || 0;
    const baseRef = character?.baseReflex || 0;
    const baseWill = character?.baseWill || 0;
    const fortBonuses = bonusDetails.fortitude?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const refBonuses = bonusDetails.reflex?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const willBonuses = bonusDetails.will?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    
    const fort = baseFort + conMod + fortBonuses;
    const ref = baseRef + dexMod + refBonuses;
    const will = baseWill + wisMod + willBonuses;
    
    setCombatStats({
      baseAttackBonus: baseBAB,
      attackBonus: totalAttackBonus,
      normalAC,
      touchAC,
      flatFootedAC,
      cmb,
      cmd,
      fort,
      ref,
      will
    });
    
    // Set damage modifiers
    setDamageModifier(primaryDamageMod);
    setOffhandDamageModifier(totalOffhandDamageMod);
    
    // Update attacks array based on BAB and haste
    updateAttackModifiers(baseBAB, totalAttackBonus, hasHaste);
    
    // Calculate offhand attacks if two-weapon fighting is enabled
    if (twoWeaponFighting) {
      updateOffhandAttackModifiers(baseBAB, totalOffhandAttackBonus);
    }
    
  }, [stats, buffs, gear, combatAbilities, character, hasHaste, twoWeaponFighting,
    attackAbilityMod, damageAbilityMod, offhandAttackAbilityMod, offhandDamageAbilityMod,
    primaryWeapon, offhandWeapon]);
  
  // Function to update attack modifiers when BAB or haste changes
  const updateAttackModifiers = (baseBAB, totalAttackBonus, hasHaste) => {
    const attacks = [];
    
    // Add first attack at full BAB
    attacks.push(totalAttackBonus);
    
    // Add iterative attacks (-5 per attack, minimum of +1)
    let remainingBAB = baseBAB;
    while (remainingBAB >= 6) { // At 6+ BAB, gain an additional attack
      remainingBAB -= 5;
      const attackMod = totalAttackBonus - (baseBAB - remainingBAB);
      attacks.push(Math.max(attackMod, totalAttackBonus - baseBAB + 1));
    }
    
    // Add haste attack if applicable
    if (hasHaste) {
      attacks.push(totalAttackBonus); // Haste gives one extra attack at full BAB
    }
    
    setAttacksCount(attacks.length);
    setAttackModifiers(attacks);
  };
  
  // Function to update offhand attack modifiers
  const updateOffhandAttackModifiers = (baseBAB, totalAttackBonus) => {
    const attacks = [];
    
    // Add first offhand attack
    attacks.push(totalAttackBonus);
    
    // Add additional offhand attacks if BAB is high enough
    let remainingBAB = baseBAB;
    for (let i = 1; i < offhandAttacksCount; i++) {
      remainingBAB -= 5;
      if (remainingBAB >= 1) {
        const attackMod = totalAttackBonus - (baseBAB - remainingBAB);
        attacks.push(Math.max(attackMod, totalAttackBonus - baseBAB + 1));
      }
    }
    
    setOffhandAttackModifiers(attacks);
  };
  
  // Handle weapon changes
  const handleWeaponChange = (isOffhand, field, value) => {
    if (isOffhand) {
      const updatedOffhand = {
        ...offhandWeapon,
        [field]: field === 'name' ? value : (parseInt(value) || 0)
      };
      setOffhandWeapon(updatedOffhand);
      
      // Save weapon data if character exists
      if (character && typeof onUpdateWeapons === 'function') {
        onUpdateWeapons(primaryWeapon, updatedOffhand);
      }
    } else {
      const updatedPrimary = {
        ...primaryWeapon,
        [field]: field === 'name' ? value : (parseInt(value) || 0)
      };
      setPrimaryWeapon(updatedPrimary);
      
      // Save weapon data if character exists
      if (character && typeof onUpdateWeapons === 'function') {
        onUpdateWeapons(updatedPrimary, offhandWeapon);
      }
    }
  };
  
  // Handle offhand attacks count change
  const handleOffhandAttacksCountChange = (value) => {
    const count = parseInt(value) || 1;
    const newCount = Math.max(1, Math.min(count, 3)); // Limit to 1-3 attacks
    setOffhandAttacksCount(newCount);
    
    // Save combat settings if character exists
    if (character && typeof onUpdateCombatSettings === 'function') {
      onUpdateCombatSettings({
        offhandAttacksCount: newCount
      });
    }
  };
  
  // Handle ability modifier changes
  const handleAbilityModChange = (type, value) => {
    switch(type) {
      case 'attack':
        setAttackAbilityMod(value);
        break;
      case 'damage':
        setDamageAbilityMod(value);
        break;
      case 'offhandAttack':
        setOffhandAttackAbilityMod(value);
        break;
      case 'offhandDamage':
        setOffhandDamageAbilityMod(value);
        break;
      default:
        return;
    }
    
    // Save combat settings if character exists
    if (character && typeof onUpdateCombatSettings === 'function') {
      const settings = {};
      settings[`${type}AbilityMod`] = value;
      onUpdateCombatSettings(settings);
    }
  };
  
  // Handle two-weapon fighting toggle
  const handleTwoWeaponFightingToggle = () => {
    const newValue = !twoWeaponFighting;
    setTwoWeaponFighting(newValue);
    
    // Save combat settings if character exists
    if (character && typeof onUpdateCombatSettings === 'function') {
      onUpdateCombatSettings({
        twoWeaponFighting: newValue
      });
    }
  };
  
  // Toggle a combat ability
  const toggleAbility = (abilityId) => {
    const updatedAbilities = combatAbilities.map(ability => {
      if (ability.id === abilityId) {
        // Create a new object with isActive toggled
        const isActive = !ability.isActive;
        
        // Initialize updated effects
        let updatedEffects = { ...ability.effects };
        
        // If turning on the ability and it has variable input, make sure effects are right
        if (isActive && ability.variableInput) {
          const inputValue = ability.inputValue || 1;
          
          if (ability.name === 'Improved Power Attack') {
            updatedEffects = {
              ...updatedEffects,
              attackBonus: -inputValue,  // NEGATIVE
              damage: inputValue * 2     // POSITIVE
            };
          } else if (ability.name === 'Greater Power Attack') {
            updatedEffects = {
              ...updatedEffects,
              attackBonus: inputValue,   // POSITIVE
              damage: -inputValue        // NEGATIVE
            };
          } else if (ability.name === 'Combat Expertise') {
            updatedEffects = {
              ...updatedEffects,
              attackBonus: -inputValue,  // NEGATIVE
              ac: inputValue             // POSITIVE
            };
          } else if (ability.name === 'Fighting Defensively') {
            updatedEffects = {
              ...updatedEffects,
              attackBonus: -inputValue,  // NEGATIVE
              ac: ability.secondaryInputValue || 2  // POSITIVE
            };
          } else if (ability.name === 'Deadly Aim') {
            updatedEffects = {
              ...updatedEffects,
              attackBonus: -inputValue,  // NEGATIVE
              damage: inputValue * 2     // POSITIVE
            };
          }
        }
        
        return { 
          ...ability, 
          isActive,
          effects: updatedEffects
        };
      }
      return ability;
    });
    
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Handle ability input change
  const handleAbilityInputChange = (abilityId, value) => {
    const numValue = parseInt(value) || 0;
    
    const updatedAbilities = combatAbilities.map(ability => {
      if (ability.id === abilityId) {
        let updatedEffects = { ...ability.effects };
        
        if (ability.name === 'Improved Power Attack') {
          updatedEffects = {
            ...updatedEffects,
            attackBonus: -numValue,  // NEGATIVE to reduce attack
            damage: numValue * 2     // POSITIVE to increase damage
          };
        } 
        else if (ability.name === 'Greater Power Attack') {
          updatedEffects = {
            ...updatedEffects,
            attackBonus: numValue,   // POSITIVE to increase attack
            damage: -numValue        // NEGATIVE to reduce damage
          };
        }
        else if (ability.name === 'Combat Expertise') {
          updatedEffects = {
            ...updatedEffects,
            attackBonus: -numValue,
            ac: numValue
          };
        }
        else if (ability.name === 'Fighting Defensively') {
          const acBonus = ability.secondaryInputValue || 2;
          updatedEffects = {
            ...updatedEffects,
            attackBonus: -numValue,
            ac: acBonus
          };
        }
        else if (ability.name === 'Deadly Aim') {
          updatedEffects = {
            ...updatedEffects,
            attackBonus: -numValue,
            damage: numValue * 2
          };
        }
        
        return { 
          ...ability, 
          inputValue: numValue,
          effects: updatedEffects
        };
      }
      return ability;
    });
    
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Handle secondary input change (like AC bonus for Fighting Defensively)
  const handleSecondaryInputChange = (abilityId, value) => {
    const numValue = parseInt(value) || 0;
    
    const updatedAbilities = combatAbilities.map(ability => {
      if (ability.id === abilityId) {
        let updatedEffects = { ...ability.effects };
        
        // Special handling for Fighting Defensively
        if (ability.name === 'Fighting Defensively') {
          updatedEffects = {
            ...updatedEffects,
            attackBonus: -(ability.inputValue || 4),
            ac: numValue  // Use the secondary input value for AC bonus
          };
        }
        
        return {
          ...ability,
          secondaryInputValue: numValue,
          effects: updatedEffects
        };
      }
      return ability;
    });
    
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Format modifier for display (+X or -X)
  const formatModifier = (value) => {
    return value >= 0 ? `+${value}` : value;
  };
  
  // Add a dice group
const addDiceGroup = () => {
  setDiceGroups([
    ...diceGroups,
    { id: Date.now(), count: 1, type: 6 }
  ]);
};

// Remove a dice group
const removeDiceGroup = (id) => {
  if (diceGroups.length > 1) {
    setDiceGroups(diceGroups.filter(group => group.id !== id));
  }
};

// Update a dice group
const updateDiceGroup = (id, field, value) => {
  setDiceGroups(diceGroups.map(group => {
    if (group.id === id) {
      return {
        ...group,
        [field]: field === 'count' ? Math.max(1, parseInt(value) || 1) : parseInt(value)
      };
    }
    return group;
  }));
};
  // Calculate average result for dice
  // Calculate average result for multiple dice groups
const calculateAverageDice = () => {
  let total = 0;
  diceGroups.forEach(group => {
    // Average of a die is (min + max) / 2
    const averagePerDie = (1 + parseInt(group.type)) / 2;
    total += group.count * averagePerDie;
  });
  return total + damageModifier;
};

// Roll multiple dice groups and get random result
const rollDice = () => {
  let total = 0;
  const groupRolls = [];
  
  diceGroups.forEach(group => {
    const rolls = [];
    for (let i = 0; i < group.count; i++) {
      const roll = Math.floor(Math.random() * group.type) + 1;
      total += roll;
      rolls.push(roll);
    }
    groupRolls.push({
      formula: `${group.count}d${group.type}`,
      rolls
    });
  });
  
  // Add damage modifier to the total
  total += damageModifier;
  
  // Return both the total and rolls by dice group
  return { total, groupRolls };
};

  // Handle button click to roll dice
  // Handle button click to roll dice
  const handleRollDice = () => {
    const result = rollDice();
    setDiceResult(result);
    setShowAverage(false);
  };

  // Handle button click to show average
  const handleShowAverage = () => {
    setDiceResult(null);
    setShowAverage(true);
  };

  return (
    <div className="playsheet">
      {/* Left Column: Combat Stats */}
      <div className="playsheet-left-column">
        <div className="playsheet-section attacks">
          <h3>Attacks</h3>
          <div className="playsheet-controls">
            <label className="haste-toggle">
              <input
                type="checkbox"
                checked={hasHaste}
                onChange={() => setHasHaste(!hasHaste)}
              />
              Haste (Extra Attack)
            </label>
            
            <label className="twf-toggle">
              <input
                type="checkbox"
                checked={twoWeaponFighting}
                onChange={handleTwoWeaponFightingToggle}
              />
              Two-Weapon Fighting (-2 penalty)
            </label>
          </div>
          
          {/* Primary Attacks Display */}
          <div className="attack-list">
            {attackModifiers.map((mod, index) => (
              <div key={index} className="attack-row">
                <span className="attack-name">
                  {index === 0 ? 'Primary Attack' : 
                   (hasHaste && index === attackModifiers.length - 1) ? 'Haste Attack' : 
                   `Iterative Attack ${index}`}
                </span>
                <span className="attack-value">{formatModifier(mod)}</span>
              </div>
            ))}
          </div>
          
          <div className="damage-mod">
            <span className="damage-label">Damage Modifier:</span>
            <span className="damage-value">{formatModifier(damageModifier)}</span>
          </div>
          
          {/* Off-hand Attacks Display (only if two-weapon fighting is enabled) */}
          {twoWeaponFighting && (
            <>
              <div className="offhand-attacks">
                <h4>{offhandWeapon.name} Attacks</h4>
                <div className="attack-list">
                  {offhandAttackModifiers.map((mod, index) => (
                    <div key={index} className="attack-row">
                      <span className="attack-name">Off-hand Attack {index + 1}</span>
                      <span className="attack-value">{formatModifier(mod)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="damage-mod">
                  <span className="damage-label">Off-hand Damage:</span>
                  <span className="damage-value">{formatModifier(offhandDamageModifier)}</span>
                </div>
              </div>
            </>
          )}
          
          <div className="attack-summary">
            Total Attacks: {attacksCount + (twoWeaponFighting ? offhandAttackModifiers.length : 0)}
            {hasHaste && <span> (includes Haste)</span>}
          </div>
        </div>
        
        <div className="playsheet-section defenses">
          <h3>Armor Class</h3>
          <div className="defense-row">
            <span className="defense-name">Normal AC:</span>
            <span className="defense-value">{combatStats.normalAC}</span>
          </div>
          <div className="defense-row">
            <span className="defense-name">Touch AC:</span>
            <span className="defense-value">{combatStats.touchAC}</span>
          </div>
          <div className="defense-row">
            <span className="defense-name">Flat-Footed AC:</span>
            <span className="defense-value">{combatStats.flatFootedAC}</span>
          </div>
          <div className="defense-row">
            <span className="defense-name">Combat Maneuver Bonus:</span>
            <span className="defense-value">{formatModifier(combatStats.cmb)}</span>
          </div>
          <div className="defense-row">
            <span className="defense-name">Combat Maneuver Defense:</span>
            <span className="defense-value">{combatStats.cmd}</span>
          </div>
        </div>
        
        <div className="playsheet-section saves">
          <h3>Saving Throws</h3>
          <div className="save-row">
            <span className="save-name">Fortitude:</span>
            <span className="save-value">{formatModifier(combatStats.fort)}</span>
          </div>
          <div className="save-row">
            <span className="save-name">Reflex:</span>
            <span className="save-value">{formatModifier(combatStats.ref)}</span>
          </div>
          <div className="save-row">
            <span className="save-name">Will:</span>
            <span className="save-value">{formatModifier(combatStats.will)}</span>
          </div>
        </div>
      </div>
      
      {/* Right Column: Weapon Configuration and Dice Roller */}
      <div className="playsheet-right-column">
        <div className="playsheet-section weapon-settings">
          <h3>Weapon Configuration</h3>
          
          {/* Primary Weapon Settings */}
          <div className="primary-weapon">
            <h4>Primary Weapon</h4>
            <div className="weapon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Weapon Name</label>
                  <input
                    type="text"
                    value={primaryWeapon.name}
                    onChange={(e) => handleWeaponChange(false, 'name', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Attack Bonus</label>
                  <input
                    type="number"
                    value={primaryWeapon.attackBonus}
                    onChange={(e) => handleWeaponChange(false, 'attackBonus', e.target.value)}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>Damage Bonus</label>
                  <input
                    type="number"
                    value={primaryWeapon.damageBonus}
                    onChange={(e) => handleWeaponChange(false, 'damageBonus', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Attack Ability</label>
                  <select
                    value={attackAbilityMod}
                    onChange={(e) => handleAbilityModChange('attack', e.target.value)}
                    className="form-control"
                  >
                    <option value="strength">Strength</option>
                    <option value="dexterity">Dexterity</option>
                    <option value="constitution">Constitution</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="charisma">Charisma</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Damage Ability</label>
                  <select
                    value={damageAbilityMod}
                    onChange={(e) => handleAbilityModChange('damage', e.target.value)}
                    className="form-control"
                  >
                    <option value="strength">Strength</option>
                    <option value="dexterity">Dexterity</option>
                    <option value="constitution">Constitution</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="charisma">Charisma</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Off-hand Weapon Settings (only visible when two-weapon fighting is enabled) */}
          {twoWeaponFighting && (
            <div className="offhand-weapon">
              <h4>Off-Hand Weapon</h4>
              <div className="weapon-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Weapon Name</label>
                    <input
                      type="text"
                      value={offhandWeapon.name}
                      onChange={(e) => handleWeaponChange(true, 'name', e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Attack Bonus</label>
                    <input
                      type="number"
                      value={offhandWeapon.attackBonus}
                      onChange={(e) => handleWeaponChange(true, 'attackBonus', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Damage Bonus</label>
                    <input
                      type="number"
                      value={offhandWeapon.damageBonus}
                      onChange={(e) => handleWeaponChange(true, 'damageBonus', e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Attack Ability</label>
                    <select
                      value={offhandAttackAbilityMod}
                      onChange={(e) => handleAbilityModChange('offhandAttack', e.target.value)}
                      className="form-control"
                    >
                      <option value="strength">Strength</option>
                      <option value="dexterity">Dexterity</option>
                      <option value="constitution">Constitution</option>
                      <option value="intelligence">Intelligence</option>
                      <option value="wisdom">Wisdom</option>
                      <option value="charisma">Charisma</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Damage Ability</label>
                    <select
                      value={offhandDamageAbilityMod}
                      onChange={(e) => handleAbilityModChange('offhandDamage', e.target.value)}
                      className="form-control"
                    >
                      <option value="strength">Strength</option>
                      <option value="dexterity">Dexterity</option>
                      <option value="constitution">Constitution</option>
                      <option value="intelligence">Intelligence</option>
                      <option value="wisdom">Wisdom</option>
                      <option value="charisma">Charisma</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Number of Off-hand Attacks</label>
                    <input
                      type="number"
                      min="1"
                      max="3"
                      value={offhandAttacksCount}
                      onChange={(e) => handleOffhandAttacksCountChange(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Dice Roller Section */}
        <div className="playsheet-section dice-roller">
          <h3>Dice Roller</h3>
          
          <div className="dice-form">
            {diceGroups.map((group, index) => (
              <div key={group.id} className="dice-group">
                <div className="form-row">
                  <div className="form-group">
                    <label>Number of Dice</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={group.count}
                      onChange={(e) => updateDiceGroup(group.id, 'count', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Dice Type</label>
                    <select
                      value={group.type}
                      onChange={(e) => updateDiceGroup(group.id, 'type', e.target.value)}
                      className="form-control"
                    >
                      <option value="4">d4</option>
                      <option value="6">d6</option>
                      <option value="8">d8</option>
                      <option value="10">d10</option>
                      <option value="12">d12</option>
                      <option value="20">d20</option>
                      <option value="100">d100</option>
                    </select>
                  </div>
                  
                  <div className="dice-group-actions">
                    {diceGroups.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeDiceGroup(group.id)}
                        className="remove-dice-btn"
                        aria-label="Remove dice group"
                      >
                        −
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              type="button"
              onClick={addDiceGroup}
              className="add-dice-btn"
            >
              + Add Dice
            </button>
            
            <div className="dice-display">
              <div className="dice-formula">
                {diceGroups.map((group, index) => (
                  <span key={group.id}>
                    {index > 0 && ' + '}
                    {group.count}d{group.type}
                  </span>
                ))} 
                {damageModifier !== 0 && (
                  <span>{damageModifier > 0 ? ' + ' : ' - '}{Math.abs(damageModifier)}</span>
                )}
              </div>
              
              {showAverage && (
                <div className="dice-result">
                  <span className="result-label">Average:</span>
                  <span className="result-value">{calculateAverageDice().toFixed(1)}</span>
                </div>
              )}
              
              {diceResult && !showAverage && (
                <div className="dice-result">
                  <span className="result-label">Roll Result:</span>
                  <span className="result-value">{diceResult.total}</span>
                  <div className="individual-rolls">
                    {diceResult.groupRolls.map((group, groupIndex) => (
                      <div key={groupIndex} className="dice-group-result">
                        <span className="dice-group-formula">{group.formula}:</span> 
                        <span className="dice-group-values">{group.rolls.join(', ')}</span>
                      </div>
                    ))}
                    {damageModifier !== 0 && (
                      <div className="damage-modifier-result">
                        <span>Damage Modifier: {damageModifier > 0 ? '+' : ''}{damageModifier}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="dice-actions">
              <button 
                onClick={handleRollDice} 
                className="roll-button"
              >
                Roll Dice
              </button>
              
              <button 
                onClick={handleShowAverage} 
                className="average-button"
              >
                Show Average
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Combat Abilities - Full Width */}
      <div className="playsheet-section abilities">
        <h3>Combat Abilities</h3>
        {combatAbilities.length === 0 ? (
          <p>No combat abilities defined. Add abilities in the Combat Abilities tab.</p>
        ) : (
          <div className="ability-toggles">
            {combatAbilities.map(ability => (
              <div key={ability.id} className="ability-toggle-row">
                <label className="ability-toggle">
                  <input
                    type="checkbox"
                    checked={ability.isActive}
                    onChange={() => toggleAbility(ability.id)}
                  />
                  <span className="ability-name">{ability.name}</span>
                </label>
                
                {ability.isActive && ability.variableInput && (
                  <div className="ability-variable-input">
                    <label>{ability.inputLabel || 'Value:'}
                      <input
                        type="number"
                        min={ability.inputMin || 0}
                        max={ability.inputMax || combatStats.baseAttackBonus}
                        step={ability.inputStep || 1}
                        value={ability.inputValue || 0}
                        onChange={(e) => handleAbilityInputChange(ability.id, e.target.value)}
                      />
                    </label>
                    
                    {/* Secondary input for abilities like Fighting Defensively */}
                    {ability.hasSecondaryInput && (
                      <div style={{ marginTop: '5px' }}>
                        <label htmlFor={`ability-secondary-input-${ability.id}`}>
                          {ability.secondaryInputLabel || 'Secondary Value:'}
                          <input
                            id={`ability-secondary-input-${ability.id}`}
                            type="number"
                            min={1}
                            max={10}
                            step={1}
                            value={ability.secondaryInputValue || 2}
                            onChange={(e) => handleSecondaryInputChange(ability.id, e.target.value)}
                            disabled={!ability.isActive}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
                
                {ability.isActive && (
                  <div className="ability-active-effects">
                    {Object.entries(ability.effects || {})
                      .filter(([_, value]) => value !== 0)
                      .map(([stat, value]) => (
                        <span key={stat} className="ability-effect">
                          {stat.charAt(0).toUpperCase() + stat.slice(1)}: {formatModifier(value)}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playsheet;