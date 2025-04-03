import React, { useState, useEffect } from 'react';

const BasicStats = ({ onStatsChange, initialStats }) => {
  // Use initialStats if provided, otherwise use defaults
  const [stats, setStats] = useState(initialStats || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  
  // Update stats when initialStats changes (e.g., when selecting a different character)
  useEffect(() => {
    if (initialStats) {
      // Ensure all stats are integers
      const parsedStats = {
        strength: parseInt(initialStats.strength) || 10,
        dexterity: parseInt(initialStats.dexterity) || 10,
        constitution: parseInt(initialStats.constitution) || 10,
        intelligence: parseInt(initialStats.intelligence) || 10,
        wisdom: parseInt(initialStats.wisdom) || 10,
        charisma: parseInt(initialStats.charisma) || 10
      };
      setStats(parsedStats);
    }
  }, [initialStats]);
  
  // Calculate modifier from ability score
  const calculateModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };
  
  // Handle stat changes
  const handleStatChange = (stat, value) => {
    // Parse to integer or default to 10
    const parsedValue = parseInt(value) || 10;
    
    const newStats = {
      ...stats,
      [stat]: parsedValue
    };
    
    setStats(newStats);
    
    // Immediately pass the updated stats to the parent component
    onStatsChange(newStats);
    
    console.log(`Stat ${stat} changed to ${parsedValue}`);
  };
  
  // Initial update to parent when component mounts
  useEffect(() => {
    // Ensure all stats are integers
    const parsedStats = {
      strength: parseInt(stats.strength) || 10,
      dexterity: parseInt(stats.dexterity) || 10,
      constitution: parseInt(stats.constitution) || 10,
      intelligence: parseInt(stats.intelligence) || 10,
      wisdom: parseInt(stats.wisdom) || 10,
      charisma: parseInt(stats.charisma) || 10
    };
    
    // Only call if the stats have actually changed to avoid loops
    if (JSON.stringify(parsedStats) !== JSON.stringify(stats)) {
      setStats(parsedStats);
    }
    
    onStatsChange(parsedStats);
  }, [onStatsChange, stats]);
  
  return (
    <div className="basic-stats">
      <h2>Character Attributes</h2>
      
      {Object.entries(stats).map(([stat, value]) => (
        <div key={stat} className="stat-row">
          <label htmlFor={stat}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</label>
          <input
            id={stat}
            type="number"
            value={value}
            onChange={(e) => handleStatChange(stat, e.target.value)}
          />
          <span className="modifier">
            Modifier: {calculateModifier(value) >= 0 ? '+' : ''}{calculateModifier(value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BasicStats;