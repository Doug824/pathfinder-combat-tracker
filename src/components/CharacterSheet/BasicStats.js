import React, { useState, useEffect } from 'react';
import NumericInput from '../common/NumericInput';

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
    
  };
  
  // Only update parent once when component mounts - not on every stats change
  useEffect(() => {
    // Ensure all stats are integers for initial load
    const parsedStats = {
      strength: parseInt(stats.strength) || 10,
      dexterity: parseInt(stats.dexterity) || 10,
      constitution: parseInt(stats.constitution) || 10,
      intelligence: parseInt(stats.intelligence) || 10,
      wisdom: parseInt(stats.wisdom) || 10,
      charisma: parseInt(stats.charisma) || 10
    };
    
    // Only call onStatsChange once on mount with the parsed stats
    onStatsChange(parsedStats);
  }, []); // Empty dependency array - only run on mount
  
  // Define the order of stats for proper 2-row layout
  const statOrder = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statOrder.map((stat) => (
          <div key={stat} className="space-y-2">
            <label htmlFor={stat} className="block text-amber-300 font-fantasy font-semibold text-sm">
              {stat.charAt(0).toUpperCase() + stat.slice(1)}
            </label>
            <div className="flex items-center space-x-3">
              <NumericInput
                id={stat}
                value={stats[stat]}
                onChange={(value) => handleStatChange(stat, value)}
                min={3}
                max={30}
                className="input-fantasy flex-1"
              />
              <span className="text-amber-100 font-fantasy text-sm font-semibold min-w-[50px]">
                {calculateModifier(stats[stat]) >= 0 ? '+' : ''}{calculateModifier(stats[stat])}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BasicStats;