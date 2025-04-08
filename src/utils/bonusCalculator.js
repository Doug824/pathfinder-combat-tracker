// List of all possible bonus types
export const bonusTypes = [
  'enhancement', 'luck', 'sacred', 'profane', 'alchemical', 'armor',
  'competence', 'circumstance', 'deflection', 'dodge', 'inherent',
  'insight', 'morale', 'natural', 'resistance', 'shield', 'size', 'trait', 'untyped'
];

/**
 * Calculate final stats with all buffs and gear applied
 * 
 * @param {Object} baseStats - Base character stats
 * @param {Array} buffs - Array of active buffs
 * @param {Array} gear - Array of equipped gear
 * @returns {Object} { finalStats, bonusDetails }
 */
export const calculateFinalStats = (baseStats, buffs = [], gear = []) => {
  // Start with base stats
  const calculatedStats = { ...baseStats };
  const bonusDetails = {};
  
  // Define all possible stats
  const allStats = [
    'strength', 'dexterity', 'constitution', 
    'intelligence', 'wisdom', 'charisma',
    'attackBonus', 'ac', 'fortitude', 'reflex', 'will',
    'cmb', 'cmd', 'damage', 'naturalArmor'  // Add naturalArmor to the list
  ];
  
  // Initialize tracking for each stat
  allStats.forEach(stat => {
    bonusDetails[stat] = [];
    
    // Initialize stats that may not exist in baseStats
    if (calculatedStats[stat] === undefined) {
      if (stat === 'attackBonus' || stat === 'ac' || 
          stat === 'fortitude' || stat === 'reflex' || stat === 'will' ||
          stat === 'cmb' || stat === 'cmd' || stat === 'damage' ||
          stat === 'naturalArmor') {  // Initialize naturalArmor
        calculatedStats[stat] = 0; 
      } else {
        calculatedStats[stat] = 10; // Default for ability scores
      }
    }
  });
  
  // Group buffs and gear by stat and bonus type
  const groupedBonuses = {};
  allStats.forEach(stat => {
    groupedBonuses[stat] = {};
    
    // Initialize each bonus type for this stat
    bonusTypes.forEach(type => {
      groupedBonuses[stat][type] = [];
    });
  });
  
  // Group all buffs by stat and bonus type
  buffs.forEach(buff => {
    // Make sure buff has a bonusType, default to 'untyped' if not
    const bonusType = buff.bonusType || 'untyped';
    
    Object.entries(buff.effects || {}).forEach(([stat, value]) => {
      if (value !== 0 && groupedBonuses[stat]) {
        groupedBonuses[stat][bonusType].push({
          value: value,
          name: buff.name || 'Unknown',
          source: 'buff'
        });
      }
    });
  });
  
  // Group all gear by stat and bonus type
  gear.forEach(item => {
    // Make sure item has a bonusType, default to 'untyped' if not
    const bonusType = item.bonusType || 'untyped';
    
    Object.entries(item.effects || {}).forEach(([stat, value]) => {
      if (value !== 0 && groupedBonuses[stat]) {
        groupedBonuses[stat][bonusType].push({
          value: value,
          name: item.name || 'Unknown',
          source: 'gear',
          slot: item.slot
        });
      }
    });
  });
  
  // Apply stacking rules to each stat
  Object.keys(groupedBonuses).forEach(stat => {
    // For each stat, process each bonus type
    Object.entries(groupedBonuses[stat] || {}).forEach(([bonusType, bonuses]) => {
      if (bonuses.length > 0) {
        if (bonusType === 'dodge' || bonusType === 'untyped') {
          // Dodge and untyped bonuses stack
          bonuses.forEach(bonus => {
            calculatedStats[stat] += bonus.value;
            bonusDetails[stat].push({
              type: bonusType,
              value: bonus.value,
              name: bonus.name,
              source: bonus.source
            });
          });
        } else {
          // For all other types, only apply the highest bonus
          const highestBonus = bonuses.reduce((max, bonus) => 
            max.value > bonus.value ? max : bonus, { value: 0 });
          
          if (highestBonus.value !== 0) {
            calculatedStats[stat] += highestBonus.value;
            bonusDetails[stat].push({
              type: bonusType,
              value: highestBonus.value,
              name: highestBonus.name,
              source: highestBonus.source
            });
          }
        }
      }
    });
  });
  
  return { finalStats: calculatedStats, bonusDetails };
};

/**
 * Calculate derived combat stats based on final attribute values
 * 
 * @param {Object} finalStats - Character stats with all bonuses applied
 * @param {Object} character - Character object with base values
 * @returns {Object} derived combat stats
 */
export const calculateDerivedStats = (finalStats, character = {}) => {
  // Calculate modifiers
  const getModifier = (score) => Math.floor((score - 10) / 2);
  
  // Get base values from character
  const baseAttackBonus = character.baseAttackBonus || 0;
  const baseFortitude = character.baseFortitude || 0;
  const baseReflex = character.baseReflex || 0;
  const baseWill = character.baseWill || 0;
  
  // Start with base AC of 10
  let ac = 10;
  
  // Add dexterity modifier to AC
  if (finalStats.dexterity) {
    ac += getModifier(finalStats.dexterity);
  }
  
  // Add any direct AC bonuses
  if (finalStats.ac) {
    ac += finalStats.ac;
  }
  
  // Add natural armor bonus
  if (finalStats.naturalArmor) {
    ac += finalStats.naturalArmor;
  }
  
  // Calculate touch AC - does not include natural armor bonus
  let touchAC = 10 + getModifier(finalStats.dexterity || 10);
  
  // Calculate flat-footed AC - includes natural armor but not dex
  let flatFootedAC = 10;
  
  // Add any direct AC bonuses
  if (finalStats.ac) {
    touchAC += finalStats.ac;
    flatFootedAC += finalStats.ac;
  }
  
  // Only add natural armor to flat-footed AC, not touch AC
  if (finalStats.naturalArmor) {
    flatFootedAC += finalStats.naturalArmor;
  }
  
  return {
    ac: ac,
    touchAC: touchAC,
    flatFootedAC: flatFootedAC,
    fortitudeSave: baseFortitude + getModifier(finalStats.constitution || 10) + (finalStats.fortitude || 0),
    reflexSave: baseReflex + getModifier(finalStats.dexterity || 10) + (finalStats.reflex || 0),
    willSave: baseWill + getModifier(finalStats.wisdom || 10) + (finalStats.will || 0),
    attackBonus: baseAttackBonus + (finalStats.attackBonus || 0)
  };
};

const bonusCalculators = {
  calculateFinalStats,
  calculateDerivedStats
};

export default bonusCalculators;