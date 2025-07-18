import React, { useEffect, useState, useCallback } from 'react';
import CharacterManager from './components/CharacterManagement/CharacterManager';
import CampaignManager from './components/Campaign/CampaignManager';
import CharacterSetup from './pages/CharacterSetup';
import CombatTracker from './pages/CombatTracker';
import Navigation from './components/layout/Navigation';
import ThemeToggle from './components/common/ThemeToggle';
import AuthPage from './components/Auth/AuthPage';
import ErrorBoundary from './components/ErrorBoundary';
import { FirebaseAuthProvider, useFirebaseAuth } from './contexts/FirebaseAuthContext';

// Hook imports
import useCharacterStorage from './hooks/useCharacterStorage';

// Asset imports
import logoIcon from './assets/HerosLedgerLogo.png';

// CSS imports
import './styles/index.css';
import './styles/fantasy-styles.css';
import './styles/mobile-fixes.css';
import './styles/contextual-themes.css';


function AppContent() {
  // Firebase Authentication
  const {
    currentUser,
    userRole,
    logout,
    loading
  } = useFirebaseAuth();
  
  // State for tracking screen size
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Character storage (depends on the user)
  const {
    characters,
    activeCharacterId,
    activeCharacter,
    loading: charactersLoading,
    error: charactersError,
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
    updateHitPoints,
    refreshCharacters
  } = useCharacterStorage(currentUser);
  
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
    
    // Improved iOS Safari scrolling fixes - simplified approach
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // Remove fixed positioning that might interfere with scrolling
      document.documentElement.style.position = 'static';
      document.body.style.position = 'static';
      
      // Enable scrolling
      document.documentElement.style.overflow = 'auto';
      document.body.style.overflow = 'auto';
      
      // Ensure content takes full width and proper scrolling behavior
      document.documentElement.style.width = '100%';
      document.documentElement.style.WebkitOverflowScrolling = 'touch';
      document.body.style.width = '100%';
      document.body.style.WebkitOverflowScrolling = 'touch';
    }
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
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
  
  // Load theme preference from Firebase when user changes
  useEffect(() => {
    const loadTheme = async () => {
      if (currentUser?.uid) {
        try {
          const { themeService } = await import('./services/themeService');
          const theme = await themeService.getUserTheme(currentUser.uid);
          setDarkMode(theme === 'dark');
        } catch (error) {
          console.error('Error loading theme:', error);
          setDarkMode(true); // Default to dark mode
        }
      } else {
        setDarkMode(true); // Default to dark mode for non-authenticated users
      }
    };
    
    loadTheme();
  }, [currentUser]);
  
  // Apply theme class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleThemeToggle = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Save theme preference to Firebase
    if (currentUser?.uid) {
      try {
        const { themeService } = await import('./services/themeService');
        await themeService.updateUserTheme(currentUser.uid, newDarkMode ? 'dark' : 'light');
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    }
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
  
  // Handle user logout
  const handleLogout = async () => {
    await logout();
    // Reset to manager page when logging out
    setCurrentPage('manager');
  };

  // Determine contextual class based on current page
  const getContextualClass = (page) => {
    switch (page) {
      case 'combat':
        return 'context-combat';
      case 'campaigns':
        return 'context-campaigns';
      case 'setup':
        return 'context-manager';
      case 'manager':
      default:
        return 'context-manager';
    }
  };
  
  // Don't render anything while authentication state is loading
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Show loading while characters are being loaded for authenticated users
  if (currentUser && charactersLoading) {
    return <div className="loading">Loading characters...</div>;
  }
  
  // If not authenticated, show login page
  if (!currentUser) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <AuthPage />
      </div>
    );
  }
  
  // Show error if character loading failed
  if (charactersError) {
    return (
      <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="error-container">
          <h2>Error Loading Characters</h2>
          <p>{charactersError}</p>
          <button onClick={refreshCharacters}>Retry</button>
        </div>
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
        gap: isMobile ? '15px' : '0',
        width: '100%' // Ensure header takes full width
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
              <span className="username">
                {currentUser.displayName || currentUser.email}
                {userRole && <span className="user-role">({userRole})</span>}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
            <ThemeToggle darkMode={darkMode} onToggle={handleThemeToggle} />
          </div>
        </div>
      </header>
      
      <main className={`app-content ${getContextualClass(currentPage)}`} style={{
        paddingBottom: isMobile ? '120px' : '60px', // Extra padding on mobile
        position: 'relative',
        width: '100%',
        overflowX: 'hidden',
        overflowY: 'visible'
      }}>
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
        
        {currentPage === 'campaigns' && (
          <CampaignManager 
            characters={characters}
            onCreateCharacter={() => setCurrentPage('manager')}
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
        {!(['manager', 'campaigns', 'setup', 'combat'].includes(currentPage)) && (
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

// Main App component wrapped with Firebase Auth Provider
function App() {
  return (
    <ErrorBoundary>
      <FirebaseAuthProvider>
        <AppContent />
      </FirebaseAuthProvider>
    </ErrorBoundary>
  );
}

export default App;