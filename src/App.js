import React, { useEffect } from 'react';
import './App.css';
import BasicStats from './components/CharacterSheet/BasicStats';
import BuffTracker from './components/BuffTracker/BuffTracker';
import CombatStatsCalculator from './components/CombatStats/CombatStatsCalculator';
import CharacterManager from './components/CharacterManager';
import useCharacterStorage from './hooks/useCharacterStorage';

function App() {
  const {
    characters,
    activeCharacterId,
    activeCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    selectCharacter,
    updateStats,
    updateBuffs
  } = useCharacterStorage();
  
  // Default stats and buffs for when no character is active
  const [characterStats, setCharacterStats] = React.useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  
  const [activeBuffs, setActiveBuffs] = React.useState([]);
  
  // Update local state when active character changes
  useEffect(() => {
    if (activeCharacter) {
      setCharacterStats(activeCharacter.stats || characterStats);
      setActiveBuffs(activeCharacter.buffs || []);
    } else {
      // Reset to defaults if no character is active
      setCharacterStats({
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      });
      setActiveBuffs([]);
    }
  }, [activeCharacter]);
  
  const handleStatsChange = (newStats) => {
    setCharacterStats(newStats);
    if (activeCharacter) {
      updateStats(newStats);
    }
  };
  
  const handleBuffsChange = (newBuffs) => {
    setActiveBuffs(newBuffs);
    if (activeCharacter) {
      updateBuffs(newBuffs);
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Pathfinder Combat Tracker</h1>
      </header>
      
      <div className="character-section">
        <div className="sidebar">
          <CharacterManager
            characters={characters}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={selectCharacter}
            onCreateCharacter={createCharacter}
            onUpdateCharacter={updateCharacter}
            onDeleteCharacter={deleteCharacter}
          />
        </div>
        
        <div className="main-content">
          {activeCharacter && (
            <div className="active-character-info">
              <h2>
                {activeCharacter.name}
                {activeCharacter.level && activeCharacter.characterClass && (
                  <span className="character-subtitle">
                    Level {activeCharacter.level} {activeCharacter.characterClass}
                  </span>
                )}
              </h2>
              
              {activeCharacter.race && activeCharacter.alignment && (
                <div className="character-meta">
                  <span>{activeCharacter.race}</span>
                  <span>{activeCharacter.alignment}</span>
                </div>
              )}
            </div>
          )}
          
          <div className="character-stats-container">
            <div className="column">
              <BasicStats 
                onStatsChange={handleStatsChange}
                initialStats={characterStats} 
              />
            </div>
            
            <div className="column">
              <BuffTracker 
                onBuffsChange={handleBuffsChange}
                initialBuffs={activeBuffs}
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
      </div>
    </div>
  );
}

export default App;