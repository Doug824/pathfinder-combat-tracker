import { useState, useEffect } from 'react';

const useCharacterStorage = (user) => {
  const [characters, setCharacters] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [activeCharacter, setActiveCharacter] = useState(null);
  
  // Storage keys based on user
  const getCharactersKey = () => {
    if (user) {
      // Handle both Firebase user (uid) and legacy user (username)
      const userId = user.uid || user.username || 'guest';
      return `pathfinderCharacters_${userId}`;
    }
    return 'pathfinderCharacters_guest';
  };
  
  const getActiveCharacterKey = () => {
    if (user) {
      // Handle both Firebase user (uid) and legacy user (username)  
      const userId = user.uid || user.username || 'guest';
      return `activeCharacterId_${userId}`;
    }
    return 'activeCharacterId_guest';
  };
  
  // Load characters from localStorage on initial mount or when user changes
  useEffect(() => {
    try {
      const storedCharacters = localStorage.getItem(getCharactersKey());
      const activeId = localStorage.getItem(getActiveCharacterKey());
      
      if (storedCharacters) {
        const parsedCharacters = JSON.parse(storedCharacters);
        setCharacters(parsedCharacters);
        
        // If there's an active character ID in storage, use it
        if (activeId && parsedCharacters.some(char => char.id === activeId)) {
          setActiveCharacterId(activeId);
          setActiveCharacter(parsedCharacters.find(char => char.id === activeId));
        } else if (parsedCharacters.length > 0) {
          // Otherwise, use the first character if available
          setActiveCharacterId(parsedCharacters[0].id);
          setActiveCharacter(parsedCharacters[0]);
        } else {
          // No characters available
          setActiveCharacterId(null);
          setActiveCharacter(null);
        }
      } else {
        // No stored characters for this user
        setCharacters([]);
        setActiveCharacterId(null);
        setActiveCharacter(null);
      }
    } catch (error) {
      console.error("Error loading characters from localStorage:", error);
    }
  }, [user]);
  
  // Save characters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(getCharactersKey(), JSON.stringify(characters));
      console.log("Saved characters to localStorage:", characters);
    } catch (error) {
      console.error("Error saving characters to localStorage:", error);
    }
  }, [characters, user]);
  
  // Save active character ID to localStorage whenever it changes
  useEffect(() => {
    try {
      if (activeCharacterId) {
        localStorage.setItem(getActiveCharacterKey(), activeCharacterId);
        
        // Update the active character object
        const foundCharacter = characters.find(char => char.id === activeCharacterId);
        setActiveCharacter(foundCharacter || null);
        console.log("Active character set to:", foundCharacter);
      } else {
        localStorage.removeItem(getActiveCharacterKey());
        setActiveCharacter(null);
      }
    } catch (error) {
      console.error("Error updating active character:", error);
    }
  }, [getActiveCharacterKey,activeCharacterId, characters, user]);
  
  // Create a new character
  const createCharacter = (characterData) => {
    try {
      // Log the incoming data to debug
      console.log("Creating character with provided data:", characterData);
      
      // Explicitly extract stats to make sure we're using the right object
      const providedStats = characterData.stats || {};
      console.log("Provided stats:", providedStats);
      
      // Create stats object with defaults for any missing properties
      const statsWithDefaults = {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        ...providedStats
      };
      
      // Convert all stats to numbers
      Object.keys(statsWithDefaults).forEach(key => {
        statsWithDefaults[key] = parseInt(statsWithDefaults[key]) || 10;
      });
      
      console.log("Final stats after processing:", statsWithDefaults);
      
      // Calculate initial hit points based on constitution
      const conModifier = Math.floor((statsWithDefaults.constitution - 10) / 2);
      // Conservative default of 8 + con modifier for level 1 HP
      const baseHP = 8;
      const initialMaxHP = baseHP + conModifier;
      
      // Create the character object with all necessary defaults
      const newCharacter = {
        id: Date.now().toString(),
        name: characterData.name || 'New Character',
        level: parseInt(characterData.level) || 1,
        characterClass: characterData.characterClass || '',
        race: characterData.race || '',
        size: characterData.size || 'medium',
        alignment: characterData.alignment || '',
        // Use our carefully processed stats object
        stats: statsWithDefaults,
        // Add hit points data with trueMaxHP field
        hitPoints: {
          baseHP: baseHP,
          maxHP: initialMaxHP,
          trueMaxHP: initialMaxHP,
          currentHP: initialMaxHP,
          tempHP: 0,
          nonLethalDamage: 0,
          negLevels: 0,
          lastConModifier: conModifier
        },
        buffs: [],
        gear: [],
        combatAbilities: [],
        baseAttackBonus: 0,
        baseFortitude: 0,
        baseReflex: 0,
        baseWill: 0,
        // Default weapon configurations
        primaryWeapon: {
          name: 'Primary Weapon',
          attackBonus: 0,
          damageBonus: 0
        },
        primaryWeaponModMultiplier: 1.0, // Default to 1.0× for primary
        offhandWeapon: {
          name: 'Off-Hand Weapon',
          attackBonus: 0,
          damageBonus: 0
        },
        offhandWeaponModMultiplier: 0.5, // Default to 0.5× for offhand
        // Default combat settings
        twoWeaponFighting: false,
        offhandAttacksCount: 1,
        attackAbilityMod: 'strength',
        damageAbilityMod: 'strength',
        offhandAttackAbilityMod: 'strength',
        offhandDamageAbilityMod: 'strength',
        // Add saved buffs array
        savedBuffs: [
          // Some default buffs for new characters
          {
            id: `saved-bless-${Date.now()}`,
            name: 'Bless',
            description: '+1 morale bonus on attack rolls and saves vs. fear',
            category: 'Spell',
            duration: 1,
            durationType: 'minutes',
            bonusType: 'morale',
            effects: { 
              attackBonus: 1,
              fortitude: 1,
              reflex: 1,
              will: 1
            }
          },
          {
            id: `saved-shield-of-faith-${Date.now()}`,
            name: 'Shield of Faith',
            description: '+2 deflection bonus to AC',
            category: 'Spell',
            duration: 1,
            durationType: 'minutes',
            bonusType: 'deflection',
            effects: { 
              ac: 2
            }
          }
        ],
        // Store owner information
        owner: user ? user.username : 'guest',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      console.log("Final character being created:", newCharacter);
      
      // Add to character list and set as active
      const updatedCharacters = [...characters, newCharacter];
      setCharacters(updatedCharacters);
      setActiveCharacterId(newCharacter.id);
      
      return newCharacter;
    } catch (error) {
      console.error("Error creating character:", error);
      return null;
    }
  };
  
  // Update an existing character
  const updateCharacter = (characterData) => {
    try {
      if (!characterData.id) return null;
      
      // Ensure stats are properly handled
      let updatedStats = characterData.stats || {};
      
      // If stats are present, ensure they are all numbers
      if (updatedStats) {
        Object.keys(updatedStats).forEach(key => {
          updatedStats[key] = parseInt(updatedStats[key]) || 10;
        });
      }
      
      const updatedCharacter = {
        ...characterData,
        stats: updatedStats,
        lastModified: new Date().toISOString()
      };
      
      const updatedCharacters = characters.map(char => 
        char.id === updatedCharacter.id ? updatedCharacter : char
      );
      
      setCharacters(updatedCharacters);
      console.log("Updated character:", updatedCharacter);
      
      // If this is the active character, update the active character object
      if (activeCharacterId === updatedCharacter.id) {
        setActiveCharacter(updatedCharacter);
      }
      
      return updatedCharacter;
    } catch (error) {
      console.error("Error updating character:", error);
      return null;
    }
  };
  
  // Delete a character
  const deleteCharacter = (characterId) => {
    try {
      const updatedCharacters = characters.filter(char => char.id !== characterId);
      setCharacters(updatedCharacters);
      
      // If the deleted character was active, select a new active character
      if (activeCharacterId === characterId) {
        if (updatedCharacters.length > 0) {
          setActiveCharacterId(updatedCharacters[0].id);
        } else {
          setActiveCharacterId(null);
        }
      }
      
      console.log("Deleted character:", characterId);
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };
  
  // Select a character as active
  const selectCharacter = (characterId) => {
    try {
      if (characters.some(char => char.id === characterId)) {
        setActiveCharacterId(characterId);
        console.log("Selected character:", characterId);
      }
    } catch (error) {
      console.error("Error selecting character:", error);
    }
  };
  
  // Update stats for active character
  const updateStats = (newStats) => {
    try {
      if (activeCharacter) {
        // Ensure stats are numbers
        const processedStats = { ...newStats };
        Object.keys(processedStats).forEach(key => {
          processedStats[key] = parseInt(processedStats[key]) || 10;
        });
        
        const updatedCharacter = {
          ...activeCharacter,
          stats: processedStats,
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated character stats:", processedStats);
      }
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  };
  
  // Update buffs for active character
  const updateBuffs = (newBuffs) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          buffs: newBuffs,
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated character buffs");
      }
    } catch (error) {
      console.error("Error updating buffs:", error);
    }
  };
  
  // Update gear for active character
  const updateGear = (newGear) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          gear: newGear,
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated character gear");
      }
    } catch (error) {
      console.error("Error updating gear:", error);
    }
  };
  
  // Update combat abilities for active character
  const updateCombatAbilities = (newAbilities) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          combatAbilities: newAbilities,
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated combat abilities");
      }
    } catch (error) {
      console.error("Error updating combat abilities:", error);
    }
  };
  
  // Function to update weapons
  const updateWeapons = (primaryWeapon, offhandWeapon, primaryModMultiplier, offhandModMultiplier) => {
    try {
      if (activeCharacter) {
        // Create clean versions of the weapon data
        const cleanPrimary = {
          name: primaryWeapon.name || 'Primary Weapon',
          attackBonus: parseInt(primaryWeapon.attackBonus) || 0,
          damageBonus: parseInt(primaryWeapon.damageBonus) || 0
        };
        
        const cleanOffhand = {
          name: offhandWeapon.name || 'Off-Hand Weapon',
          attackBonus: parseInt(offhandWeapon.attackBonus) || 0,
          damageBonus: parseInt(offhandWeapon.damageBonus) || 0
        };
        
        // Parse multiplier values with proper defaults
        const primaryMult = parseFloat(primaryModMultiplier) || 1.0;
        const offhandMult = parseFloat(offhandModMultiplier) || 0.5;
        
        const updatedCharacter = {
          ...activeCharacter,
          primaryWeapon: cleanPrimary,
          offhandWeapon: cleanOffhand,
          primaryWeaponModMultiplier: primaryMult,
          offhandWeaponModMultiplier: offhandMult,
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated weapon configuration", { 
          primary: cleanPrimary, 
          offhand: cleanOffhand,
          primaryMult: primaryMult,
          offhandMult: offhandMult
        });
      }
    } catch (error) {
      console.error("Error updating weapons:", error);
    }
  };
  
  // Function to update combat settings
  const updateCombatSettings = (settings) => {
    try {
      if (activeCharacter) {
        // Normalize settings
        const normalizedSettings = {};
        
        // Process specific settings if present
        if ('twoWeaponFighting' in settings) {
          normalizedSettings.twoWeaponFighting = Boolean(settings.twoWeaponFighting);
        }
        
        if ('offhandAttacksCount' in settings) {
          normalizedSettings.offhandAttacksCount = Math.max(1, Math.min(parseInt(settings.offhandAttacksCount) || 1, 3));
        }
        
        // Handle ability modifier selections
        const abilityModOptions = ['attackAbilityMod', 'damageAbilityMod', 'offhandAttackAbilityMod', 'offhandDamageAbilityMod'];
        
        for (const modOption of abilityModOptions) {
          if (modOption in settings && typeof settings[modOption] === 'string') {
            normalizedSettings[modOption] = settings[modOption];
          }
        }
        
        // Apply the settings
        const updatedCharacter = {
          ...activeCharacter,
          ...normalizedSettings,
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated combat settings:", normalizedSettings);
      }
    } catch (error) {
      console.error("Error updating combat settings:", error);
    }
  };
  
  // Function to update saved buffs
  const updateSavedBuffs = (newSavedBuffs) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          savedBuffs: newSavedBuffs || [],
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated saved buffs:", newSavedBuffs?.length);
      } else {
        console.warn("No active character to update saved buffs for");
      }
    } catch (error) {
      console.error("Error updating saved buffs:", error);
    }
  };
  
  // Function to update hit points
  const updateHitPoints = (newHitPoints) => {
    try {
      if (activeCharacter) {
        // Make sure trueMaxHP is preserved if it doesn't exist in the new hit points
        const updatedHitPoints = {
          ...newHitPoints,
          // If trueMaxHP doesn't exist in newHitPoints but exists in character, keep the old value
          trueMaxHP: newHitPoints.trueMaxHP || 
                    (activeCharacter.hitPoints?.trueMaxHP || activeCharacter.hitPoints?.maxHP)
        };
        
        const updatedCharacter = {
          ...activeCharacter,
          hitPoints: updatedHitPoints,
          lastModified: new Date().toISOString()
        };
        
        updateCharacter(updatedCharacter);
        console.log("Updated character hit points:", updatedHitPoints);
      } else {
        console.warn("No active character to update hit points for");
      }
    } catch (error) {
      console.error("Error updating hit points:", error);
    }
  };
  
  return {
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
  };
};

export default useCharacterStorage;