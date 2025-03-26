// List of all possible bonus types based on Pathfinder rules
export const bonusTypes = [
  'enhancement', 'luck', 'sacred', 'profane', 'alchemical', 'armor',
  'competence', 'circumstance', 'deflection', 'dodge', 'inherent',
  'insight', 'morale', 'natural', 'shield', 'size', 'trait', 'untyped', 'bab'
];

/**
 * Calculate final stats with all buffs and gear applied using Pathfinder stacking rules
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
    'bab', 'ac'
  ];
  
  // Initialize tracking for each stat
  allStats.forEach(stat => {
    bonusDetails[stat] = [];
    
    // Initialize stats that may not exist in baseStats
    if (calculatedStats[stat] === undefined) {
      if (stat === 'bab' || stat === 'ac') {
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
    Object.entries(buff.effects || {}).forEach(([stat, value]) => {
      if (value !== 0 && groupedBonuses[stat]) {
        groupedBonuses[stat][buff.bonusType].push({
          value: value,
          name: buff.name,
          source: 'buff'
        });
      }
    });
  });
  
  // Group all gear by stat and bonus type
  gear.forEach(item => {
    Object.entries(item.effects || {}).forEach(([stat, value]) => {
      if (value !== 0 && groupedBonuses[stat]) {
        groupedBonuses[stat][item.bonusType].push({
          value: value,
          name: item.name,
          source: 'gear',
          slot: item.slot
        });
      }
    });
  });
  
  // Apply stacking rules to each stat
  Object.keys(calculatedStats).forEach(stat => {
    // For each stat, process each bonus type
    Object.entries(groupedBonuses[stat] || {}).forEach(([bonusType, bonuses]) => {
      if (bonuses.length > 0) {
        if (bonusType === 'dodge') {
          // Dodge bonuses stack
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
 * @returns {Object} derived combat stats
 */
export const calculateDerivedStats = (finalStats) => {
  // Calculate modifiers
  const getModifier = (score) => Math.floor((score - 10) / 2);
  
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
  
  return {
    ac: ac,
    fortitudeSave: getModifier(finalStats.constitution || 10),
    reflexSave: getModifier(finalStats.dexterity || 10),
    willSave: getModifier(finalStats.wisdom || 10),
    baseAttackBonus: finalStats.bab || 0
  };
};

  export default calculateFinalStats;