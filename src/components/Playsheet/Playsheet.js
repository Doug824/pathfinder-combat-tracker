import React, { useState, useEffect } from 'react';
import { calculateFinalStats } from '../../utils/bonusCalculator';
import { getSizeACModifier, getSizeModifier } from '../../utils/sizeUtils';
import AnimatedDiceRoller from '../dice/AnimatedDiceRoller';
import './Playsheet.css';
import HitPointTracker from '../HitPoints/HitPointTracker';

const Playsheet = ({
  character,
  stats,
  buffs,
  gear,
  combatAbilities,
  onCombatAbilitiesChange,
  onUpdateWeapons,
  onUpdateCombatSettings,
  onUpdateHitPoints
}) => {
  // State for tracking screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
  
  // State for weapon multipliers
  const [primaryModMultiplier, setPrimaryModMultiplier] = useState(
    character?.primaryWeaponModMultiplier || 1.0
  );
  const [offhandModMultiplier, setOffhandModMultiplier] = useState(
    character?.offhandWeaponModMultiplier || 0.5
  );

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

  // State for tracking which weapon damage modifier to use in the dice roller
  const [currentDamageModifier, setCurrentDamageModifier] = useState(damageModifier);
  
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
  
  // State to store calculated final stats for HP tracking
  const [finalStats, setFinalStats] = useState({...stats});

  // Function to apply negative level penalties
  const applyNegativeLevelPenalties = (statValue, type = 'general') => {
    const negLevels = character?.hitPoints?.negLevels || 0;
    
    if (negLevels <= 0) return statValue;
    
    // The penalties are applied directly in the main calculation
    // This function exists for readability but no longer applies the penalties
    // to avoid double application
    return statValue;
  };

  // Recalculate final stats whenever inputs change
  useEffect(() => {
    // Get active abilities
    const activeAbilities = combatAbilities.filter(ability => ability.isActive);
    
    // Calculate final stats with all active effects
    const { finalStats: calculatedStats } = calculateFinalStats(stats, [...buffs, ...activeAbilities], gear);
    
    // Update final stats
    setFinalStats(calculatedStats);
  }, [stats, buffs, gear, combatAbilities]);

  // Window resize listener to update the mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Ensure scrolling works on all browsers but especially iOS Safari
    document.documentElement.style.height = 'initial';
    document.documentElement.style.position = 'relative';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.WebkitOverflowScrolling = 'touch';
    
    // Fix body element
    document.body.style.height = 'initial';
    document.body.style.position = 'relative';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'visible';
    document.body.style.WebkitOverflowScrolling = 'touch';
    
    return () => {
      // Reset styles when component unmounts
      document.documentElement.style = '';
      document.body.style = '';
    };
  }, []);
  
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

    // Apply two-weapon fighting penalty if active
    const twfPenalty = twoWeaponFighting ? -2 : 0;
    
    // Get size modifier for attack rolls
    const sizeAttackModifier = getSizeModifier(character?.size || 'medium');
    
    // Apply negative level penalties - only once here
    const negLevels = character?.hitPoints?.negLevels || 0;
    const negativeLevelPenalty = negLevels > 0 ? -negLevels : 0;

    // Calculate the attack bonus with negative level penalty applied once
    const rawAttackBonus = baseBAB + selectedAttackMod + attackBonuses + primaryWeapon.attackBonus + twfPenalty + sizeAttackModifier;
    const finalAttackBonus = rawAttackBonus + negativeLevelPenalty; // Apply penalty once


    // Calculate primary weapon damage modifier with multiplier
    const rawDamageMod = selectedDamageMod * primaryModMultiplier;
    const primaryDamageMod = Math.floor(rawDamageMod) + damageBonuses + primaryWeapon.damageBonus;

    // Calculate raw offhand attack bonus (before negative level penalties)
    const rawOffhandAttackBonus = baseBAB + selectedOffhandAttackMod + attackBonuses + offhandWeapon.attackBonus + twfPenalty + sizeAttackModifier;

    // Calculate offhand weapon damage modifier with multiplier
    const offhandAbilityDamageMod = twoWeaponFighting ? Math.floor(selectedOffhandDamageMod / 2) : selectedOffhandDamageMod;
    const totalOffhandDamageMod = offhandAbilityDamageMod + damageBonuses + offhandWeapon.damageBonus;
    
    // Calculate AC values
    const baseAC = 10;
    const acBonuses = bonusDetails.ac?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    
    // Normal AC
    const sizeACModifier = getSizeACModifier(character?.size || 'medium');
    const normalAC = baseAC + dexMod + acBonuses + sizeACModifier;

    // Touch AC
    const touchAC = baseAC + dexMod + sizeACModifier + (bonusDetails.ac?.filter(b => 
      ['dodge', 'deflection', 'luck', 'sacred', 'profane', 'insight', 'morale', 'untyped'].includes(b.type)
    ).reduce((sum, bonus) => sum + bonus.value, 0) || 0);

    // Flat-footed AC
    const flatFootedAC = baseAC + sizeACModifier + (bonusDetails.ac?.filter(b => 
      b.type !== 'dodge'
    ).reduce((sum, bonus) => sum + bonus.value, 0) || 0);
    
    // Calculate CMB and CMD
    const cmb = baseBAB + strMod + (bonusDetails.cmb?.reduce((sum, bonus) => sum + bonus.value, 0) || 0);

    // Calculate dodge bonuses to CMD - track sources to avoid double-counting
    let dodgeBonusToCmd = 0;
    const dodgeSources = new Set(); // Track sources of dodge bonuses to avoid duplication

    // Check for active abilities that provide dodge bonuses
    for (const ability of processedAbilities) {
      if (ability.isActive) {
        // Only count if we haven't already counted a bonus from this source
        const sourceName = ability.name;
        if (!dodgeSources.has(sourceName)) {
          // Combat Expertise provides dodge bonus to AC equal to the penalty to attack
          if (ability.name === 'Combat Expertise' && ability.effects.ac > 0) {
            dodgeBonusToCmd += ability.effects.ac;
            dodgeSources.add(sourceName);
            console.log(`Adding dodge bonus from ${sourceName}: +${ability.effects.ac} to CMD`);
          }
          // Fighting Defensively provides dodge bonus to AC
          else if (ability.name === 'Fighting Defensively' && ability.effects.ac > 0) {
            dodgeBonusToCmd += ability.effects.ac;
            dodgeSources.add(sourceName);
            console.log(`Adding dodge bonus from ${sourceName}: +${ability.effects.ac} to CMD`);
          }
        }
      }
    }

    // Add dodge bonuses from other sources (items, buffs, etc.)
    // First collect all non-ability dodge bonuses to avoid double-counting
    const dodgeBonusesFromOtherSources = [];
    bonusDetails.ac?.forEach(bonus => {
      if (bonus.type === 'dodge') {
        const sourceName = bonus.name;
        if (!dodgeSources.has(sourceName)) {
          dodgeBonusesFromOtherSources.push({
            source: sourceName,
            value: bonus.value
          });
          dodgeSources.add(sourceName);
        }
      }
    });

    // Now add the unique dodge bonuses 
    const otherDodgeBonuses = dodgeBonusesFromOtherSources.reduce((sum, bonus) => {
      console.log(`Adding dodge bonus from ${bonus.source}: +${bonus.value} to CMD`);
      return sum + bonus.value;
    }, 0);
    dodgeBonusToCmd += otherDodgeBonuses;

    // Calculate CMD with dodge bonuses
    const cmd = 10 + baseBAB + strMod + dexMod + dodgeBonusToCmd + (bonusDetails.cmd?.reduce((sum, bonus) => sum + bonus.value, 0) || 0);

    console.log(`Total dodge bonus to CMD: +${dodgeBonusToCmd}`);
    
    // Calculate saving throws
    const baseFort = character?.baseFortitude || 0;
    const baseRef = character?.baseReflex || 0;
    const baseWill = character?.baseWill || 0;
    const fortBonuses = bonusDetails.fortitude?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const refBonuses = bonusDetails.reflex?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    const willBonuses = bonusDetails.will?.reduce((sum, bonus) => sum + bonus.value, 0) || 0;
    
    // Apply negative level penalties to saves
    const fort = baseFort + conMod + fortBonuses + negativeLevelPenalty;
    const ref = baseRef + dexMod + refBonuses + negativeLevelPenalty;
    const will = baseWill + wisMod + willBonuses + negativeLevelPenalty;
    
    setCombatStats({
      baseAttackBonus: baseBAB,
      attackBonus: finalAttackBonus,
      normalAC,
      touchAC,
      flatFootedAC,
      cmb: cmb + negativeLevelPenalty, // Apply negative level penalty to CMB
      cmd,
      fort,
      ref,
      will
    });
    
    // Set damage modifiers
    setDamageModifier(primaryDamageMod);
    setOffhandDamageModifier(totalOffhandDamageMod);
    
    // Update the current damage modifier for the dice roller
    setCurrentDamageModifier(primaryDamageMod);
    
    // Generate attack modifiers
    const attackModifiersArray = [];
    
    // First attack at full bonus with negative level penalty already applied
    attackModifiersArray.push(finalAttackBonus);
    
    // Calculate iterative attacks based on BAB
    let remainingBAB = baseBAB;
    
    // First iterative at BAB +6
    if (remainingBAB >= 6) {
      remainingBAB -= 5;
      const rawIterativeBonus = rawAttackBonus - 5;
      const finalIterative = rawIterativeBonus + negativeLevelPenalty; // Apply negative level penalty once
      attackModifiersArray.push(finalIterative);
    }
    
    // Second iterative at BAB +11
    if (remainingBAB >= 5) {
      remainingBAB -= 5;
      const rawIterativeBonus = rawAttackBonus - 10;
      const finalIterative = rawIterativeBonus + negativeLevelPenalty; // Apply negative level penalty once
      attackModifiersArray.push(finalIterative);
    }
    
    // Third iterative at BAB +16
    if (remainingBAB >= 5) {
      remainingBAB -= 5;
      const rawIterativeBonus = rawAttackBonus - 15;
      const finalIterative = rawIterativeBonus + negativeLevelPenalty; // Apply negative level penalty once
      attackModifiersArray.push(finalIterative);
    }
    
    // Add haste attack if applicable - insert after primary attack
    if (hasHaste) {
      // The haste attack should have the same bonus as the first attack (including negative level penalty)
      attackModifiersArray.splice(1, 0, finalAttackBonus);
    }
    
    // Set the attack modifiers state with the final calculated values
    setAttacksCount(attackModifiersArray.length);
    setAttackModifiers(attackModifiersArray);
    
    // Similarly for offhand attacks if using two-weapon fighting
    if (twoWeaponFighting) {
      // Generate array of raw offhand attack modifiers
      const offhandAttackModifiersArray = [];
      
      const rawOffhandAttackBonus = baseBAB + selectedOffhandAttackMod + attackBonuses + offhandWeapon.attackBonus + twfPenalty + sizeAttackModifier;
      // Apply the negative level penalty to the offhand attack
      const finalOffhandAttackBonus = rawOffhandAttackBonus + negativeLevelPenalty;
      
      offhandAttackModifiersArray.push(finalOffhandAttackBonus);
      
      // Add additional offhand attacks if BAB is high enough
      let offhandRemainingBAB = baseBAB;
      for (let i = 1; i < offhandAttacksCount; i++) {
        offhandRemainingBAB -= 5;
        if (offhandRemainingBAB >= 1) {
          const rawOffhandIterativeBonus = rawOffhandAttackBonus - (baseBAB - offhandRemainingBAB);
          // Apply negative level penalty to each iterative attack
          const finalOffhandIterative = rawOffhandIterativeBonus + negativeLevelPenalty;
          offhandAttackModifiersArray.push(Math.max(finalOffhandIterative, finalOffhandAttackBonus - baseBAB + 1));
        }
      }
      
      setOffhandAttackModifiers(offhandAttackModifiersArray);
    }
    
  }, [stats, buffs, gear, combatAbilities, character, hasHaste, twoWeaponFighting,
    attackAbilityMod, damageAbilityMod, offhandAttackAbilityMod, offhandDamageAbilityMod,
    primaryWeapon, offhandWeapon, offhandAttacksCount]);

  // Handle weapon changes
  const handleWeaponChange = (isOffhand, field, value) => {
    if (isOffhand) {
      if (field === 'modMultiplier') {
        // Handle multiplier specifically since it might be a decimal
        const multiplier = parseFloat(value) || 0.5;
        setOffhandModMultiplier(multiplier);
        
        // Save weapon data if character exists
        if (character && typeof onUpdateWeapons === 'function') {
          onUpdateWeapons(primaryWeapon, offhandWeapon, primaryModMultiplier, multiplier);
        }
      } else {
        const updatedOffhand = {
          ...offhandWeapon,
          [field]: field === 'name' ? value : (parseInt(value) || 0)
        };
        setOffhandWeapon(updatedOffhand);
        
        // Save weapon data if character exists
        if (character && typeof onUpdateWeapons === 'function') {
          onUpdateWeapons(primaryWeapon, updatedOffhand, primaryModMultiplier, offhandModMultiplier);
        }
      }
    } else {
      if (field === 'modMultiplier') {
        // Handle multiplier specifically since it might be a decimal
        const multiplier = parseFloat(value) || 1.0;
        setPrimaryModMultiplier(multiplier);
        
        // Save weapon data if character exists
        if (character && typeof onUpdateWeapons === 'function') {
          onUpdateWeapons(primaryWeapon, offhandWeapon, multiplier, offhandModMultiplier);
        }
      } else {
        const updatedPrimary = {
          ...primaryWeapon,
          [field]: field === 'name' ? value : (parseInt(value) || 0)
        };
        setPrimaryWeapon(updatedPrimary);
        
        // Save weapon data if character exists
        if (character && typeof onUpdateWeapons === 'function') {
          onUpdateWeapons(updatedPrimary, offhandWeapon, primaryModMultiplier, offhandModMultiplier);
        }
      }
    }
  };
  
  // Handle offhand attacks count change
  const handleOffhandAttacksCountChange = (value) => {
    const count = parseInt(value) || 1;
    const newCount = Math.max(1, Math.min(count, 4)); // Limit to 1-4 attacks
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
      
      // Return unchanged for all other abilities
      return ability;
    });
    
    // Apply the changes
    onCombatAbilitiesChange(updatedAbilities);
  };
  
  // Format modifier for display (+X or -X)
  const formatModifier = (value) => {
    return value >= 0 ? `+${value}` : value;
  };
  
  // Handler for selecting which weapon's damage modifier to use in the dice roller
  const handleSelectWeaponDamage = (isOffhand) => {
    setCurrentDamageModifier(isOffhand ? offhandDamageModifier : damageModifier);
  };

  const AttackRow = ({ attackName, attackValue }) => {
    // Determine if this is a haste attack
    const isHasteAttack = attackName === 'Haste Attack';
    const hasNegativeLevels = character?.hitPoints?.negLevels > 0;
    
    return (
      <div className={`attack-row ${isHasteAttack ? 'haste-attack' : ''}`}>
        <span className="attack-name">{attackName}</span>
        <div className="attack-value-container">
          <span className="attack-value">{attackValue}</span>
          {hasNegativeLevels && (
            <span className="negative-level-indicator">*</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      {/* Left Column: Combat Stats */}
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
          <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Attacks</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <label className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 px-4 py-2 cursor-pointer hover:bg-black/60 transition-all duration-200">
              <input
                type="checkbox"
                checked={hasHaste}
                onChange={() => setHasHaste(!hasHaste)}
                className="w-4 h-4 text-amber-600 bg-black/60 border-amber-700 rounded focus:ring-amber-500"
              />
              <span className="text-amber-200 font-fantasy">Haste (Extra Attack)</span>
            </label>
            
            <label className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 px-4 py-2 cursor-pointer hover:bg-black/60 transition-all duration-200">
              <input
                type="checkbox"
                checked={twoWeaponFighting}
                onChange={handleTwoWeaponFightingToggle}
                className="w-4 h-4 text-amber-600 bg-black/60 border-amber-700 rounded focus:ring-amber-500"
              />
              <span className="text-amber-200 font-fantasy">Two-Weapon Fighting</span>
            </label>
          </div>
          
          {/* Primary Attacks Display */}
          <div className="space-y-2 mb-4">
          {attackModifiers.map((mod, index) => {
            // Determine attack name based on position and haste
            let attackName;
            if (index === 0) {
              attackName = 'First Attack';
            } else if (hasHaste && index === 1) {
              attackName = 'Haste Attack';
            } else {
              // Calculate the attack number, accounting for haste
              const attackNumber = hasHaste ? index : index + 1;
              
              // Use ordinal names instead of "Iterative Attack X"
              if (attackNumber === 2) {
                attackName = 'Second Attack';
              } else if (attackNumber === 3) {
                attackName = 'Third Attack';
              } else if (attackNumber === 4) {
                attackName = 'Fourth Attack';
              } else {
                attackName = 'Fifth Attack';
              }
            }
            
            return (
              <div key={index} className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center hover:bg-black/60 transition-all duration-200">
                <span className="text-amber-200 font-fantasy font-semibold">{attackName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-100 font-bold text-lg">{formatModifier(mod)}</span>
                  {character?.hitPoints?.negLevels > 0 && (
                    <span className="text-red-400 text-sm" title={`Includes -${character.hitPoints.negLevels} from negative levels`}>*</span>
                  )}
                </div>
              </div>
            );
          })}
          </div>
          
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center">
            <span className="text-amber-300 font-fantasy font-semibold">Damage Modifier:</span>
            <span className="text-amber-100 font-bold text-lg">{formatModifier(damageModifier)}</span>
          </div>
          
          {/* Off-hand Attacks Display (only if two-weapon fighting is enabled) */}
          {twoWeaponFighting && (
            <>
              <div className="mt-6">
                <h4 className="text-lg font-fantasy font-bold text-amber-400 mb-3 border-b border-amber-700/30 pb-1">{offhandWeapon.name} Attacks</h4>
                <div className="space-y-2 mb-4">
                  {offhandAttackModifiers.map((mod, index) => (
                    <div key={index} className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center hover:bg-black/60 transition-all duration-200">
                      <span className="text-amber-200 font-fantasy font-semibold">Off-hand Attack {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-100 font-bold text-lg">{formatModifier(mod)}</span>
                        {character?.hitPoints?.negLevels > 0 && (
                          <span className="text-red-400 text-sm" title={`Includes -${character.hitPoints.negLevels} from negative levels`}>*</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center">
                  <span className="text-amber-300 font-fantasy font-semibold">Off-hand Damage:</span>
                  <span className="text-amber-100 font-bold text-lg">{formatModifier(offhandDamageModifier)}</span>
                </div>
              </div>
            </>
          )}
          
          <div className="bg-amber-700/20 backdrop-blur-md rounded-lg border border-amber-600/50 p-3 text-center">
            <span className="text-amber-100 font-fantasy font-semibold">
              Total Attacks: {attacksCount + (twoWeaponFighting ? offhandAttackModifiers.length : 0)}
              {hasHaste && <span className="text-amber-300"> (includes Haste)</span>}
            </span>
          </div>
        </div>
        
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
          <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Armor Class</h3>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center mb-2 hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Normal AC:</span>
            <span className="text-amber-100 font-bold text-lg">{combatStats.normalAC}</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center mb-2 hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Touch AC:</span>
            <span className="text-amber-100 font-bold text-lg">{combatStats.touchAC}</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center mb-2 hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Flat-Footed AC:</span>
            <span className="text-amber-100 font-bold text-lg">{combatStats.flatFootedAC}</span>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center mb-2 hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Combat Maneuver Bonus:</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-100 font-bold text-lg">{formatModifier(combatStats.cmb)}</span>
              {character?.hitPoints?.negLevels > 0 && (
                <span className="text-red-400 text-sm" title={`Includes -${character.hitPoints.negLevels} from negative levels`}>*</span>
              )}
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Combat Maneuver Defense:</span>
            <span className="text-amber-100 font-bold text-lg">{combatStats.cmd}</span>
          </div>
        </div>
        
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
          <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Saving Throws</h3>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center mb-2 hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Fortitude:</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-100 font-bold text-lg">{formatModifier(combatStats.fort)}</span>
              {character?.hitPoints?.negLevels > 0 && (
                <span className="text-red-400 text-sm" title={`Includes -${character.hitPoints.negLevels} from negative levels`}>*</span>
              )}
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center mb-2 hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Reflex:</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-100 font-bold text-lg">{formatModifier(combatStats.ref)}</span>
              {character?.hitPoints?.negLevels > 0 && (
                <span className="text-red-400 text-sm" title={`Includes -${character.hitPoints.negLevels} from negative levels`}>*</span>
              )}
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-3 flex justify-between items-center hover:bg-black/60 transition-all duration-200">
            <span className="text-amber-200 font-fantasy font-semibold">Will:</span>
            <div className="flex items-center gap-2">
              <span className="text-amber-100 font-bold text-lg">{formatModifier(combatStats.will)}</span>
              {character?.hitPoints?.negLevels > 0 && (
                <span className="text-red-400 text-sm" title={`Includes -${character.hitPoints.negLevels} from negative levels`}>*</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Column: Weapon Configuration and Dice Roller */}
      <div className="space-y-6">
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
          <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Weapon Configuration</h3>
          {/* Primary Weapon Settings */}
          <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4 mb-4">
            <h4 className="text-lg font-fantasy font-bold text-amber-400 mb-3 border-b border-amber-700/30 pb-1">Primary Weapon</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="primaryWeaponName" className="block text-amber-300 font-fantasy font-semibold">Weapon Name</label>
                <input
                  id="primaryWeaponName"
                  type="text"
                  value={primaryWeapon.name}
                  onChange={(e) => handleWeaponChange(false, 'name', e.target.value)}
                  className="input-fantasy w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="primaryAttackBonus" className="block text-amber-300 font-fantasy font-semibold">Attack Bonus</label>
                  <input
                    id="primaryAttackBonus"
                    type="number"
                    value={primaryWeapon.attackBonus}
                    onChange={(e) => handleWeaponChange(false, 'attackBonus', e.target.value)}
                    className="input-fantasy w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="primaryDamageBonus" className="block text-amber-300 font-fantasy font-semibold">Damage Bonus</label>
                  <input
                    id="primaryDamageBonus"
                    type="number"
                    value={primaryWeapon.damageBonus}
                    onChange={(e) => handleWeaponChange(false, 'damageBonus', e.target.value)}
                    className="input-fantasy w-full"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="attackAbilityMod" className="block text-amber-300 font-fantasy font-semibold">Attack Ability</label>
                  <select
                    id="attackAbilityMod"
                    value={attackAbilityMod}
                    onChange={(e) => handleAbilityModChange('attack', e.target.value)}
                    className="input-fantasy w-full"
                  >
                    <option value="strength">Strength</option>
                    <option value="dexterity">Dexterity</option>
                    <option value="constitution">Constitution</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="wisdom">Wisdom</option>
                    <option value="charisma">Charisma</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="damageAbilityMod" className="block text-amber-300 font-fantasy font-semibold">Damage Ability</label>
                  <select
                    id="damageAbilityMod"
                    value={damageAbilityMod}
                    onChange={(e) => handleAbilityModChange('damage', e.target.value)}
                    className="input-fantasy w-full"
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
            <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
              <h4 className="text-lg font-fantasy font-bold text-amber-400 mb-3 border-b border-amber-700/30 pb-1">Off-Hand Weapon</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="offhandWeaponName" className="block text-amber-300 font-fantasy font-semibold">Weapon Name</label>
                  <input
                    id="offhandWeaponName"
                    type="text"
                    value={offhandWeapon.name}
                    onChange={(e) => handleWeaponChange(true, 'name', e.target.value)}
                    className="input-fantasy w-full"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="offhandAttackBonus">Attack Bonus</label>
                    <input
                      id="offhandAttackBonus"
                      type="number"
                      value={offhandWeapon.attackBonus}
                      onChange={(e) => handleWeaponChange(true, 'attackBonus', e.target.value)}
                      className="input-fantasy"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="offhandDamageBonus">Damage Bonus</label>
                    <input
                      id="offhandDamageBonus"
                      type="number"
                      value={offhandWeapon.damageBonus}
                      onChange={(e) => handleWeaponChange(true, 'damageBonus', e.target.value)}
                      className="input-fantasy"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="offhandAttackAbilityMod">Attack Ability</label>
                    <select
                      id="offhandAttackAbilityMod"
                      value={offhandAttackAbilityMod}
                      onChange={(e) => handleAbilityModChange('offhandAttack', e.target.value)}
                      className="input-fantasy"
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
                    <label htmlFor="offhandDamageAbilityMod">Damage Ability</label>
                    <select
                      id="offhandDamageAbilityMod"
                      value={offhandDamageAbilityMod}
                      onChange={(e) => handleAbilityModChange('offhandDamage', e.target.value)}
                      className="input-fantasy"
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
                    <label htmlFor="offhandAttacksCount">Number of Off-hand Attacks</label>
                    <input
                      id="offhandAttacksCount"
                      type="number"
                      min="1"
                      max="3"
                      value={offhandAttacksCount}
                      onChange={(e) => handleOffhandAttacksCountChange(e.target.value)}
                      className="input-fantasy"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Hit Points Section */}
        <HitPointTracker
          character={character}
          finalStats={finalStats}
          onHitPointChange={onUpdateHitPoints || (() => console.warn("No hit point update function provided"))}
          className="playsheet-hp-tracker mini-hp-tracker"
        />

        {character?.hitPoints?.negLevels > 0 && (
          <div className="bg-red-900/60 backdrop-blur-md rounded-lg border-2 border-red-700/50 p-4 mb-6">
            <div className="text-red-200 font-fantasy font-bold text-center">
              <span className="text-lg">{character.hitPoints.negLevels} Negative Level{character.hitPoints.negLevels > 1 ? 's' : ''}</span>
              <div className="text-red-300 text-sm mt-2">
                (-{character.hitPoints.negLevels} to attacks, saves, and maneuvers)
              </div>
            </div>
          </div>
        )}

        {/* Dice Roller Section */}
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
          <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Dice Roller</h3>
          
          {/* Weapon selector for dice roller */}
          {twoWeaponFighting && (
            <div className="mb-4">
              <p className="text-amber-300 font-fantasy font-semibold mb-2">Select Weapon for Damage:</p>
              <div className="flex gap-2">
                <button 
                  className={`px-4 py-2 rounded-lg border font-fantasy font-semibold transition-all duration-200 ${
                    currentDamageModifier === damageModifier 
                      ? 'bg-amber-700/80 border-amber-600 text-amber-100 shadow-lg' 
                      : 'bg-black/40 border-amber-700/30 text-amber-200 hover:bg-black/60'
                  }`}
                  onClick={() => handleSelectWeaponDamage(false)}
                >
                  {primaryWeapon.name} Damage
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg border font-fantasy font-semibold transition-all duration-200 ${
                    currentDamageModifier === offhandDamageModifier 
                      ? 'bg-amber-700/80 border-amber-600 text-amber-100 shadow-lg' 
                      : 'bg-black/40 border-amber-700/30 text-amber-200 hover:bg-black/60'
                  }`}
                  onClick={() => handleSelectWeaponDamage(true)}
                >
                  {offhandWeapon.name} Damage
                </button>
              </div>
            </div>
          )}
          
          {/* Animated Dice Roller Component */}
          <AnimatedDiceRoller damageModifier={currentDamageModifier} />
        </div>
      </div>
      
      {/* Combat Abilities - Full Width */}
      <div className="lg:col-span-2 bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
        <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-6 border-b border-amber-700/30 pb-2">Combat Abilities</h3>
        {combatAbilities.length === 0 ? (
          <p className="text-amber-200/70 text-center py-8">No combat abilities defined. Add abilities in the Combat Abilities tab.</p>
        ) : (
          <div className="space-y-4">
            {combatAbilities.map(ability => (
              <div key={ability.id} className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4 hover:bg-black/60 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ability.isActive}
                      onChange={() => toggleAbility(ability.id)}
                      className="w-5 h-5 text-amber-600 bg-black/60 border-amber-700 rounded focus:ring-amber-500"
                    />
                    <span className="text-amber-100 font-fantasy font-bold text-lg">{ability.name}</span>
                  </label>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-fantasy font-semibold transition-all duration-200 ${
                    ability.isActive 
                      ? 'bg-emerald-700/60 text-emerald-200 border border-emerald-600/50' 
                      : 'bg-gray-700/60 text-gray-300 border border-gray-600/50'
                  }`}>
                    {ability.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                {ability.isActive && ability.variableInput && (
                  <div className="bg-black/30 rounded-lg border border-amber-700/20 p-3 mb-3">
                    <label htmlFor={`ability-input-${ability.id}`} className="block text-amber-300 font-fantasy font-semibold mb-2">
                      {ability.inputLabel || 'Value:'}
                    </label>
                    <input
                      id={`ability-input-${ability.id}`}
                      type="number"
                      min={ability.inputMin || 0}
                      max={ability.inputMax || combatStats.baseAttackBonus}
                      step={ability.inputStep || 1}
                      value={ability.inputValue || 0}
                      onChange={(e) => handleAbilityInputChange(ability.id, e.target.value)}
                      className="input-fantasy w-16"
                    />
                    
                    {/* Secondary input for abilities like Fighting Defensively */}
                    {ability.hasSecondaryInput && (
                      <div className="mt-3">
                        <label htmlFor={`ability-secondary-input-${ability.id}`} className="block text-amber-300 font-fantasy font-semibold mb-2">
                          {ability.secondaryInputLabel || 'Secondary Value:'}
                        </label>
                        <input
                          id={`ability-secondary-input-${ability.id}`}
                          type="number"
                          min={1}
                          max={10}
                          step={1}
                          value={ability.secondaryInputValue || 2}
                          onChange={(e) => handleSecondaryInputChange(ability.id, e.target.value)}
                          disabled={!ability.isActive}
                          className="input-fantasy w-16"
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {ability.isActive && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(ability.effects || {})
                      .filter(([_, value]) => value !== 0)
                      .map(([stat, value]) => (
                        <span key={stat} className="bg-emerald-700/40 border border-emerald-600/50 rounded-lg px-3 py-1 text-emerald-200 text-sm font-fantasy font-semibold">
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