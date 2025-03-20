import React, { useState } from 'react';
import './App.css';
import BasicStats from './components/CharacterSheet/BasicStats';
import BuffTracker from './components/BuffTracker/BuffTracker';
import CombatStatsCalculator from './components/CombatStats/CombatStatsCalculator';

function App() {
  const [characterStats, setCharacterStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  
  const [activeBuffs, setActiveBuffs] = useState([]);
  
  const handleStatsChange = (newStats) => {
    setCharacterStats(newStats);
  };
  
  const handleBuffsChange = (newBuffs) => {
    setActiveBuffs(newBuffs);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Pathfinder Combat Tracker</h1>
      </header>
      
      <div className="main-content">
        <div className="column">
          <BasicStats 
            onStatsChange={handleStatsChange} 
          />
        </div>
        
        <div className="column">
          <BuffTracker 
            onBuffsChange={handleBuffsChange} 
          />
        </div>
        
        <div className="column">
          <CombatStatsCalculator 
            baseStats={characterStats} 
            buffs={activeBuffs} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;