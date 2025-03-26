import { useState, useEffect } from 'react';

const useCharacterStorage = () => {
  const [characters, setCharacters] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [activeCharacter, setActiveCharacter] = useState(null);
  
  // Load characters from localStorage on initial mount
  useEffect(() => {
    const storedCharacters = localStorage.getItem('pathfinderCharacters');
    const activeId = localStorage.getItem('activeCharacterId');
    
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
      }
    }
  }, []);
  
  // Save characters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pathfinderCharacters', JSON.stringify(characters));
  }, [characters]);
  
  // Save active character ID to localStorage whenever it changes
  useEffect(() => {
    if (activeCharacterId) {
      localStorage.setItem('activeCharacterId', activeCharacterId);
      
      // Update the active character object
      setActiveCharacter(characters.find(char => char.id === activeCharacterId) || null);
    } else {
      localStorage.removeItem('activeCharacterId');
      setActiveCharacter(null);
    }
  }, [activeCharacterId, characters]);
  
  // Create a new character
  const createCharacter = (characterData) => {
    const newCharacter = {
      ...characterData,
      id: Date.now().toString(),
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      stats: characterData.stats || {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      buffs: characterData.buffs || [],
      gear: characterData.gear || [],
      combatAbilities: characterData.combatAbilities || []
    };
    
    setCharacters(prev => [...prev, newCharacter]);
    setActiveCharacterId(newCharacter.id);
    
    return newCharacter;
  };
  
  // Update an existing character
  const updateCharacter = (characterData) => {
    if (!characterData.id) return null;
    
    const updatedCharacter = {
      ...characterData,
      lastModified: new Date().toISOString()
    };
    
    setCharacters(prev => 
      prev.map(char => char.id === updatedCharacter.id ? updatedCharacter : char)
    );
    
    // If this is the active character, update the active character object
    if (activeCharacterId === updatedCharacter.id) {
      setActiveCharacter(updatedCharacter);
    }
    
    return updatedCharacter;
  };
  
  // Delete a character
  const deleteCharacter = (characterId) => {
    setCharacters(prev => prev.filter(char => char.id !== characterId));
    
    // If the deleted character was active, select a new active character
    if (activeCharacterId === characterId) {
      const remainingCharacters = characters.filter(char => char.id !== characterId);
      if (remainingCharacters.length > 0) {
        setActiveCharacterId(remainingCharacters[0].id);
      } else {
        setActiveCharacterId(null);
      }
    }
  };
  
  // Select a character as active
  const selectCharacter = (characterId) => {
    if (characters.some(char => char.id === characterId)) {
      setActiveCharacterId(characterId);
    }
  };
  
  // Update stats for active character
  const updateStats = (newStats) => {
    if (activeCharacter) {
      const updatedCharacter = {
        ...activeCharacter,
        stats: newStats,
        lastModified: new Date().toISOString()
      };
      
      updateCharacter(updatedCharacter);
    }
  };
  
  // Update buffs for active character
  const updateBuffs = (newBuffs) => {
    if (activeCharacter) {
      const updatedCharacter = {
        ...activeCharacter,
        buffs: newBuffs,
        lastModified: new Date().toISOString()
      };
      
      updateCharacter(updatedCharacter);
    }
  };
  
  // Update gear for active character
  const updateGear = (newGear) => {
    if (activeCharacter) {
      const updatedCharacter = {
        ...activeCharacter,
        gear: newGear,
        lastModified: new Date().toISOString()
      };
      
      updateCharacter(updatedCharacter);
    }
  };
  
  // Update combat abilities for active character
  const updateCombatAbilities = (newAbilities) => {
    if (activeCharacter) {
      const updatedCharacter = {
        ...activeCharacter,
        combatAbilities: newAbilities,
        lastModified: new Date().toISOString()
      };
      
      updateCharacter(updatedCharacter);
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
    updateCombatAbilities
  };
};

export default useCharacterStorage;