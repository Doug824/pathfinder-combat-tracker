import React, { useEffect, useState, useCallback } from 'react';
import CharacterManager from './components/CharacterManagement/CharacterManager';
import CampaignManager from './components/Campaign/CampaignManager';
import CharacterSetup from './pages/CharacterSetup';
import CombatTracker from './pages/CombatTracker';
import Navigation from './components/layout/Navigation';
import FantasySidebar from './components/FantasySidebar';
import ThemeToggle from './components/common/ThemeToggle';
import AuthPage from './components/Auth/AuthPage';
import ErrorBoundary from './components/ErrorBoundary';
import { FirebaseAuthProvider, useFirebaseAuth } from './contexts/FirebaseAuthContext';

// Hook imports
import useCharacterStorage from './hooks/useCharacterStorage';

// Asset imports
import logoIcon from './assets/HerosLedgerLogo.png';

// CSS imports
import './index.css';


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
      const timer = setTimeout(() => {
        setCurrentPage('setup');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeCharacterId, currentPage, manuallyNavigatedToManager, setCurrentPage]);
  
  // Update local state when active character changes
  useEffect(() => {
    if (activeCharacter) {
      // Safely set statistics with defaults - only update state, don't call updateStats
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
  
  // Apply theme class to document element for Tailwind dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode'); // Keep for CSS variables
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode'); // Keep for CSS variables
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
      updateStats(parsedStats);
    } else {
      console.warn("No active character to update stats for");
    }
  };
  
  const handleBuffsChange = (newBuffs) => {
    setActiveBuffs(newBuffs);
    if (activeCharacter) {
      updateBuffs(newBuffs);
    }
  };

  const handleHitPointsChange = (newHitPoints) => {
    if (activeCharacter) {
      updateHitPoints(newHitPoints);
    } else {
      console.warn("No active character to update hit points for");
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
  
  const handleUpdateWeapons = (primaryWeapon, offhandWeapon, primaryModMultiplier, offhandModMultiplier) => {
    if (activeCharacter) {
      updateWeapons(primaryWeapon, offhandWeapon, primaryModMultiplier, offhandModMultiplier);
    }
  };
  
  const handleUpdateCombatSettings = (settings) => {
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

  // Determine background class based on current page
  const getBackgroundClass = (page) => {
    switch (page) {
      case 'combat':
        return 'bg-page-combat';
      case 'campaigns':
        return 'bg-page-notes';
      case 'setup':
      case 'manager':
      default:
        return 'bg-page-main';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <AuthPage />
      </div>
    );
  }
  
  // Show error if character loading failed
  if (charactersError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="parchment-card p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-fantasy text-blood-red mb-4">Error Loading Characters</h2>
          <p className="mb-6">{charactersError}</p>
          <button onClick={refreshCharacters} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  // Main app when authenticated  
  return (
    <div className={`min-h-screen ${getBackgroundClass(currentPage)} flex ${isMobile ? 'flex-col' : 'flex-row'} relative`}>
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />
      
      {/* Fantasy Sidebar */}
      <FantasySidebar 
        currentPage={currentPage} 
        setCurrentPage={handlePageChange} 
        activeCharacter={activeCharacter}
        isMobile={isMobile}
        currentUser={currentUser}
        userRole={userRole}
        onLogout={handleLogout}
        logoIcon={logoIcon}
      />
      
      {/* Main content area */}
      <main className={`flex-1 relative z-10 p-4 ${isMobile ? 'pb-20' : 'ml-64'}`} style={{
        paddingTop: '20px'
      }}>

        {/* Active character info */}
        {activeCharacter && currentPage !== 'manager' && (
          <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 mb-6">
            <h2 className="text-3xl font-fantasy text-amber-400 mb-2">
              {activeCharacter.name}
              {activeCharacter.level && activeCharacter.characterClass && (
                <span className="text-xl text-amber-200/80 block font-body">
                  Level {activeCharacter.level} {activeCharacter.characterClass}
                </span>
              )}
            </h2>
            
            {activeCharacter.race && activeCharacter.alignment && (
              <div className="flex gap-4 text-amber-100 font-semibold">
                <span>{activeCharacter.race}</span>
                <span>•</span>
                <span>{activeCharacter.alignment}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Page content */}
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
        
        {/* Fallback error */}
        {!(['manager', 'campaigns', 'setup', 'combat'].includes(currentPage)) && (
          <div className="parchment-card p-8 text-center">
            <h2 className="text-2xl font-fantasy text-blood-red mb-4">Navigation Error</h2>
            <p className="mb-6">Invalid page: {currentPage}</p>
            <button onClick={() => setCurrentPage('manager')} className="btn-primary">
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