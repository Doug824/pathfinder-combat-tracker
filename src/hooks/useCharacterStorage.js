import { useState, useEffect } from 'react';
import { characterService } from '../services/characterService';

const useCharacterStorage = (user) => {
  const [characters, setCharacters] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [activeCharacter, setActiveCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load characters from Firebase when user changes
  useEffect(() => {
    if (user?.uid) {
      loadCharacters();
    } else {
      // No user, clear everything
      setCharacters([]);
      setActiveCharacterId(null);
      setActiveCharacter(null);
      setLoading(false);
    }
  }, [user]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load characters and preferences in parallel
      const [charactersData, preferencesData] = await Promise.all([
        characterService.getUserCharacters(user.uid),
        characterService.getUserPreferences(user.uid)
      ]);
      
      setCharacters(charactersData);
      
      // Set active character from preferences
      if (preferencesData.activeCharacterId && charactersData.some(char => char.id === preferencesData.activeCharacterId)) {
        setActiveCharacterId(preferencesData.activeCharacterId);
        setActiveCharacter(charactersData.find(char => char.id === preferencesData.activeCharacterId));
      } else if (charactersData.length > 0) {
        // Use first character if no valid active character in preferences
        setActiveCharacterId(charactersData[0].id);
        setActiveCharacter(charactersData[0]);
        // Update preferences with new active character
        await characterService.updateUserPreferences(user.uid, {
          activeCharacterId: charactersData[0].id
        });
      } else {
        setActiveCharacterId(null);
        setActiveCharacter(null);
      }
      
      console.log("Loaded characters from Firebase:", charactersData);
    } catch (err) {
      console.error("Error loading characters from Firebase:", err);
      setError('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  // Create a new character
  const createCharacter = async (characterData) => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      setError(null);
      
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
      const newCharacterData = {
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
        ]
      };
      
      console.log("Final character being created:", newCharacterData);
      
      // Save to Firebase
      const newCharacter = await characterService.createCharacter(user.uid, newCharacterData);
      
      // Update local state
      const updatedCharacters = [...characters, newCharacter];
      setCharacters(updatedCharacters);
      setActiveCharacterId(newCharacter.id);
      setActiveCharacter(newCharacter);
      
      // Update active character in preferences
      await characterService.updateUserPreferences(user.uid, {
        activeCharacterId: newCharacter.id
      });
      
      return newCharacter;
    } catch (error) {
      console.error("Error creating character:", error);
      setError('Failed to create character');
      return null;
    }
  };
  
  // Update an existing character
  const updateCharacter = async (characterData) => {
    try {
      if (!characterData.id) return null;
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      setError(null);
      
      // Ensure stats are properly handled
      let updatedStats = characterData.stats || {};
      
      // If stats are present, ensure they are all numbers
      if (updatedStats) {
        Object.keys(updatedStats).forEach(key => {
          updatedStats[key] = parseInt(updatedStats[key]) || 10;
        });
      }
      
      const updatedCharacterData = {
        ...characterData,
        stats: updatedStats
      };
      
      // Save to Firebase
      const updatedCharacter = await characterService.updateCharacter(characterData.id, updatedCharacterData);
      
      // Update local state
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
      setError('Failed to update character');
      return null;
    }
  };
  
  // Delete a character
  const deleteCharacter = async (characterId) => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      setError(null);
      
      // Delete from Firebase
      await characterService.deleteCharacter(characterId);
      
      // Update local state
      const updatedCharacters = characters.filter(char => char.id !== characterId);
      setCharacters(updatedCharacters);
      
      // If the deleted character was active, select a new active character
      if (activeCharacterId === characterId) {
        if (updatedCharacters.length > 0) {
          setActiveCharacterId(updatedCharacters[0].id);
          setActiveCharacter(updatedCharacters[0]);
          // Update preferences
          await characterService.updateUserPreferences(user.uid, {
            activeCharacterId: updatedCharacters[0].id
          });
        } else {
          setActiveCharacterId(null);
          setActiveCharacter(null);
          // Update preferences
          await characterService.updateUserPreferences(user.uid, {
            activeCharacterId: null
          });
        }
      }
      
      console.log("Deleted character:", characterId);
    } catch (error) {
      console.error("Error deleting character:", error);
      setError('Failed to delete character');
    }
  };
  
  // Select a character as active
  const selectCharacter = async (characterId) => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      setError(null);
      
      if (characters.some(char => char.id === characterId)) {
        setActiveCharacterId(characterId);
        const character = characters.find(char => char.id === characterId);
        setActiveCharacter(character);
        
        // Update preferences
        await characterService.updateUserPreferences(user.uid, {
          activeCharacterId: characterId
        });
        
        console.log("Selected character:", characterId);
      }
    } catch (error) {
      console.error("Error selecting character:", error);
      setError('Failed to select character');
    }
  };
  
  // Update stats for active character
  const updateStats = async (newStats) => {
    try {
      if (activeCharacter) {
        // Ensure stats are numbers
        const processedStats = { ...newStats };
        Object.keys(processedStats).forEach(key => {
          processedStats[key] = parseInt(processedStats[key]) || 10;
        });
        
        const updatedCharacter = {
          ...activeCharacter,
          stats: processedStats
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated character stats:", processedStats);
      }
    } catch (error) {
      console.error("Error updating stats:", error);
      setError('Failed to update stats');
    }
  };
  
  // Update buffs for active character
  const updateBuffs = async (newBuffs) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          buffs: newBuffs
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated character buffs");
      }
    } catch (error) {
      console.error("Error updating buffs:", error);
      setError('Failed to update buffs');
    }
  };
  
  // Update gear for active character
  const updateGear = async (newGear) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          gear: newGear
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated character gear");
      }
    } catch (error) {
      console.error("Error updating gear:", error);
      setError('Failed to update gear');
    }
  };
  
  // Update combat abilities for active character
  const updateCombatAbilities = async (newAbilities) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          combatAbilities: newAbilities
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated combat abilities");
      }
    } catch (error) {
      console.error("Error updating combat abilities:", error);
      setError('Failed to update combat abilities');
    }
  };
  
  // Function to update weapons
  const updateWeapons = async (primaryWeapon, offhandWeapon, primaryModMultiplier, offhandModMultiplier) => {
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
          offhandWeaponModMultiplier: offhandMult
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated weapon configuration", { 
          primary: cleanPrimary, 
          offhand: cleanOffhand,
          primaryMult: primaryMult,
          offhandMult: offhandMult
        });
      }
    } catch (error) {
      console.error("Error updating weapons:", error);
      setError('Failed to update weapons');
    }
  };
  
  // Function to update combat settings
  const updateCombatSettings = async (settings) => {
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
          ...normalizedSettings
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated combat settings:", normalizedSettings);
      }
    } catch (error) {
      console.error("Error updating combat settings:", error);
      setError('Failed to update combat settings');
    }
  };
  
  // Function to update saved buffs
  const updateSavedBuffs = async (newSavedBuffs) => {
    try {
      if (activeCharacter) {
        const updatedCharacter = {
          ...activeCharacter,
          savedBuffs: newSavedBuffs || []
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated saved buffs:", newSavedBuffs?.length);
      } else {
        console.warn("No active character to update saved buffs for");
      }
    } catch (error) {
      console.error("Error updating saved buffs:", error);
      setError('Failed to update saved buffs');
    }
  };
  
  // Function to update hit points
  const updateHitPoints = async (newHitPoints) => {
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
          hitPoints: updatedHitPoints
        };
        
        await updateCharacter(updatedCharacter);
        console.log("Updated character hit points:", updatedHitPoints);
      } else {
        console.warn("No active character to update hit points for");
      }
    } catch (error) {
      console.error("Error updating hit points:", error);
      setError('Failed to update hit points');
    }
  };
  
  return {
    characters,
    activeCharacterId,
    activeCharacter,
    loading,
    error,
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
    refreshCharacters: loadCharacters
  };
};

export default useCharacterStorage;