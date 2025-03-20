import React, { useState, useEffect } from 'react';

const BasicStats = ({ onStatsChange }) => {
  // Initial character stats
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  
  // Calculate modifier from ability score
  const calculateModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };
  
  // Handle stat changes
  const handleStatChange = (stat, value) => {
    const newStats = {
      ...stats,
      [stat]: parseInt(value) || 0
    };
    
    setStats(newStats);
    // Pass the updated stats to the parent component
    onStatsChange(newStats);
  };
  
  // Initial update to parent
  useEffect(() => {
    onStatsChange(stats);
  }, []);
  
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