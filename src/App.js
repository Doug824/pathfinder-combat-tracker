import React, { useEffect, useState, useCallback } from 'react';
import CharacterManager from './components/CharacterManagement/CharacterManager';
import CharacterSetup from './pages/CharacterSetup';
import CombatTracker from './pages/CombatTracker';
import Navigation from './components/layout/Navigation';
import ThemeToggle from './components/common/ThemeToggle';
import LoginPage from './pages/LoginPage';

// Hook imports
import useCharacterStorage from './hooks/useCharacterStorage';
import useAuth from './hooks/useAuth';

// Asset imports
import logoIcon from './assets/HerosLedgerLogo.png';

// CSS imports
import './styles/index.css';
import './styles/fantasy-styles.css';
import './styles/mobile-fixes.css';


function App() {
  // Authentication
  const {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated
  } = useAuth();
  
  // State for tracking screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Character storage ( depends on the user)
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
    updateCombatAbilities,
    updateWeapons,
    updateCombatSettings,
    updateSavedBuffs,
    updateHitPoints
  } = useCharacterStorage(user);
  
  // State for current page
  const [currentPage, setCurrentPage] = useState('manager');
  
  // Flag to track manual navigation to manager
  const [manuallyNavigatedToManager, setManuallyNavigatedToManager] = useState(false);
  
  // Theme state - initialize to true for dark mode default
  const [darkMode, setDarkMode] = useState(true);
  
  // Default stats for when no character is active
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
  
  // Modified page change handler to track manual navigation
  const handlePageChange = useCallback((pageName) => {
    console.log("Changing page to:", pageName);
    
    // Track when user manually navigates to manager
    if (pageName === 'manager') {
      setManuallyNavigatedToManager(true);
    } else {
      setManuallyNavigatedToManager(false);
    }
    
    setCurrentPage(pageName);
  }, []);
  
  // Effect to add window resize listener to update the mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Fix iOS Safari scrolling issues
    document.documentElement.style.height = 'initial';
    document.documentElement.style.position = 'relative';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.WebkitOverflowScrolling = 'touch';
    
    document.body.style.height = 'initial';
    document.body.style.position = 'relative';
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'visible';
    document.body.style.WebkitOverflowScrolling = 'touch';
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.style = '';
      document.body.style = '';
    };  
  }, []);

  // Effect to handle auto-navigation to setup
  useEffect(() => {
    // Only auto-navigate if:
    // 1. We have an active character
    // 2. We're on the manager page
    // 3. We didn't get here by clicking the manager button
    if (activeCharacterId && currentPage === 'manager' && !manuallyNavigatedToManager) {
      console.log("Auto-navigating to setup from manager");
      const timer = setTimeout(() => {
        setCurrentPage('setup');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeCharacterId, currentPage, manuallyNavigatedToManager, setCurrentPage]);
  
  // Update local state when active character changes
  useEffect(() => {
    console.log("Active character changed:", activeCharacter);
    if (activeCharacter) {
      // Safely set statistics with defaults
      setCharacterStats({
        strength: parseInt(activeCharacter.stats?.strength) || 10,
        dexterity: parseInt(activeCharacter.stats?.dexterity) || 10,
        constitution: parseInt(activeCharacter.stats?.constitution) || 10,
        intelligence: parseInt(activeCharacter.stats?.intelligence) || 10,
        wisdom: parseInt(activeCharacter.stats?.wisdom) || 10,
        charisma: parseInt(activeCharacter.stats?.charisma) || 10
      });
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
      // Default to dark mode
      setDarkMode(true);
      // Save the preference
      localStorage.setItem('darkMode', 'true');
    }
  }, []);
  
  // Apply theme class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };
  
  // Improved stats change handler
  const handleStatsChange = (newStats) => {
    console.log("Stats changed:", newStats);
    
    // Ensure all stats are integers
    const parsedStats = {
      strength: parseInt(newStats.strength) || 10,
      dexterity: parseInt(newStats.dexterity) || 10,
      constitution: parseInt(newStats.constitution) || 10,
      intelligence: parseInt(newStats.intelligence) || 10,
      wisdom: parseInt(newStats.wisdom) || 10,
      charisma: parseInt(newStats.charisma) || 10
    };
    
    // Update local state
    setCharacterStats(parsedStats);
    
    // Immediately update the character if it exists
    if (activeCharacter) {
      console.log("Updating stats for active character:", activeCharacter.name);
      updateStats(parsedStats);
    } else {
      console.warn("No active character to update stats for");
    }
  };
  
  const handleBuffsChange = (newBuffs) => {
    console.log("Buffs changed");
    setActiveBuffs(newBuffs);
    if (activeCharacter) {
      updateBuffs(newBuffs);
    }
  };

  const handleHitPointsChange = (newHitPoints) => {
    console.log("Hit points changed:", newHitPoints);
    if (activeCharacter) {
      updateHitPoints(newHitPoints);
    } else {
      console.warn("No active character to update hit points for");
    }
  };
  
  const handleGearChange = (newGear) => {
    console.log("Gear changed");
    setActiveGear(newGear);
    if (activeCharacter) {
      updateGear(newGear);
    }
  };
  
  const handleCombatAbilitiesChange = (newAbilities) => {
    console.log("Combat abilities changed");
    setCombatAbilities(newAbilities);
    if (activeCharacter) {
      updateCombatAbilities(newAbilities);
    }
  };
  
  const handleUpdateWeapons = (primaryWeapon, offhandWeapon, primaryModMultiplier, offhandModMultiplier) => {
    console.log("Weapons updated with multipliers");
    if (activeCharacter) {
      updateWeapons(primaryWeapon, offhandWeapon, primaryModMultiplier, offhandModMultiplier);
    }
  };
  
  const handleUpdateCombatSettings = (settings) => {
    console.log("Combat settings updated", settings);
    if (activeCharacter) {
      updateCombatSettings(settings);
    }
  };
  
  // Handle user login
  const handleLogin = (username, password) => {
    return login(username, password);
  };
  
  // Handle user registration
  const handleRegister = (username, password) => {
    return register(username, password);
  };
  
  // Handle user logout
  const handleLogout = () => {
    logout();
    // Reset to manager page when logging out
    setCurrentPage('manager');
  };
  
  // Don't render anything while authentication state is loading
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
      </div>
    );
  }

  // Main app when authenticated
  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="App-header" style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'center' : 'center',
        padding: '15px 20px',
        gap: isMobile ? '15px' : '0'
      }}>
        <div className="app-title" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}>
          <img src={logoIcon} alt="Hero's Ledger Logo" className="app-logo" />
          <div>
            <h1 style={{ margin: 0 }}>Hero's Ledger</h1>
            <p className="app-tagline" style={{ margin: 0 }}>
              Because tracking stats shouldn't be a quest of its own
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'center',
          gap: '15px',
          width: isMobile ? '100%' : 'auto'
        }}>
          <Navigation 
            currentPage={currentPage} 
            setCurrentPage={handlePageChange} 
            activeCharacter={activeCharacter}
            isMobile={isMobile} // Pass this prop to Navigation
          />
          <div className="user-section" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'center' : 'flex-end'
          }}>
            <div className="user-info">
              <span className="username">{user.username}</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
            <ThemeToggle darkMode={darkMode} onToggle={handleThemeToggle} />
          </div>
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
        
        {/* Always render something based on currentPage */}
        {currentPage === 'manager' && (
          <CharacterManager
            characters={characters}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={selectCharacter}
            onCreateCharacter={createCharacter}
            onUpdateCharacter={updateCharacter}
            onDeleteCharacter={deleteCharacter}
          />
        )}
        
        {currentPage === 'setup' && activeCharacter && (
          <CharacterSetup 
            character={activeCharacter}
            onUpdateCharacter={updateCharacter}
            onStatsChange={handleStatsChange}
            onGearChange={handleGearChange}
            stats={characterStats}
            gear={activeGear}
          />
        )}
        
        {currentPage === 'combat' && activeCharacter && (
          <CombatTracker
            character={activeCharacter}
            stats={characterStats}
            buffs={activeBuffs}
            gear={activeGear}
            combatAbilities={combatAbilities}
            onBuffsChange={handleBuffsChange}
            onCombatAbilitiesChange={handleCombatAbilitiesChange}
            onUpdateWeapons={handleUpdateWeapons}
            onUpdateCombatSettings={handleUpdateCombatSettings}
            onUpdateSavedBuffs={updateSavedBuffs}
            onUpdateHitPoints={handleHitPointsChange}
          />
        )}
        
        {/* Fallback if somehow nothing matches */}
        {!(['manager', 'setup', 'combat'].includes(currentPage)) && (
          <div className="error-message">
            <h2>Navigation Error</h2>
            <p>Invalid page: {currentPage}</p>
            <button onClick={() => setCurrentPage('manager')}>
              Return to Character Manager
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;