import React, { useEffect, useState } from 'react';
import './App.css';
import BasicStats from './components/CharacterSheet/BasicStats';
import BuffTracker from './components/BuffTracker/BuffTracker';
import CombatStatsCalculator from './components/CombatStats/CombatStatsCalculator';
import CharacterManager from './components/CharacterManager';
import useCharacterStorage from './hooks/useCharacterStorage';
import ThemeToggle from './components/ThemeToggle';

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
    updateBuffs,
    updateGear
  } = useCharacterStorage();
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  
  // Default stats and buffs for when no character is active
  const [characterStats, setCharacterStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });
  
  const [activeBuffs, setActiveBuffs] = useState([]);
  const [activeGear, setActiveGear] = useState([]);
  
  // Update local state when active character changes
  useEffect(() => {
    if (activeCharacter) {
      setCharacterStats(activeCharacter.stats || characterStats);
      setActiveBuffs(activeCharacter.buffs || []);
      setActiveGear(activeCharacter.gear || []);
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
      setActiveGear([]);
    }
  }, [activeCharacter]);
  
  // Toggle dark mode and store preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(savedTheme === 'true');
    } else {
      // Check for system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }
  }, []);
  
  // Apply theme class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };
  
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
  
  const handleGearChange = (newGear) => {
    setActiveGear(newGear);
    if (activeCharacter) {
      updateGear(newGear);
    }
  };
  
  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="App-header">
        <h1>Pathfinder Combat Tracker</h1>
        <ThemeToggle darkMode={darkMode} onToggle={handleThemeToggle} />
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
                gear={activeGear} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;