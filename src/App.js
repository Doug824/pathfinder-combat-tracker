import React, { useEffect, useState } from 'react';
import './App.css';
import CharacterManager from './components/CharacterManager';
import CharacterSetup from './pages/CharacterSetup';
import CombatTracker from './pages/CombatTracker';
import Navigation from './components/Navigation';
import ThemeToggle from './components/ThemeToggle';
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
    updateBuffs,
    updateGear,
    updateCombatAbilities
  } = useCharacterStorage();
  
  // State for current page
  const [currentPage, setCurrentPage] = useState('manager');
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  
  // Default stats, buffs, and gear for when no character is active
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
  const [combatAbilities, setCombatAbilities] = useState([]);
  
  // Update local state when active character changes
  useEffect(() => {
    if (activeCharacter) {
      setCharacterStats(activeCharacter.stats || characterStats);
      setActiveBuffs(activeCharacter.buffs || []);
      setActiveGear(activeCharacter.gear || []);
      setCombatAbilities(activeCharacter.combatAbilities || []);
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
      setCombatAbilities([]);
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
  
  // Navigate to character setup when a new character is created
  useEffect(() => {
    if (activeCharacterId && currentPage === 'manager') {
      setCurrentPage('setup');
    }
  }, [activeCharacterId, currentPage]);

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
  
  const handleCombatAbilitiesChange = (newAbilities) => {
    setCombatAbilities(newAbilities);
    if (activeCharacter) {
      updateCombatAbilities(newAbilities);
    }
  };
  
  // Render current page based on state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'setup':
        return (
          <CharacterSetup 
            character={activeCharacter}
            onUpdateCharacter={updateCharacter}
            onStatsChange={handleStatsChange}
            onGearChange={handleGearChange}
            stats={characterStats}
            gear={activeGear}
          />
        );
      case 'combat':
        return (
          <CombatTracker
            character={activeCharacter}
            stats={characterStats}
            buffs={activeBuffs}
            gear={activeGear}
            combatAbilities={combatAbilities}
            onBuffsChange={handleBuffsChange}
            onCombatAbilitiesChange={handleCombatAbilitiesChange}
          />
        );
      case 'manager':
      default:
        return (
          <CharacterManager
            characters={characters}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={selectCharacter}
            onCreateCharacter={createCharacter}
            onUpdateCharacter={updateCharacter}
            onDeleteCharacter={deleteCharacter}
          />
        );
    }
  };
  
  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="App-header">
        <h1>Pathfinder Combat Tracker</h1>
        <div className="header-controls">
          <Navigation 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            activeCharacter={activeCharacter}
          />
          <ThemeToggle darkMode={darkMode} onToggle={handleThemeToggle} />
        </div>
      </header>
      
      <main className="app-content">
        {activeCharacter && currentPage !== 'manager' && (
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
        
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;