import React, { useState } from 'react';
import CharacterList from './CharacterList';
import CharacterForm from './CharacterForm';

const CharacterManager = ({ 
  characters, 
  activeCharacterId, 
  onSelectCharacter, 
  onCreateCharacter, 
  onUpdateCharacter, 
  onDeleteCharacter 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  
  const handleNewCharacter = () => {
    setEditingCharacter(null);
    setShowForm(true);
  };
  
  const handleEditCharacter = (characterId) => {
    const character = characters.find(char => char.id === characterId);
    if (character) {
      setEditingCharacter(character);
      setShowForm(true);
    }
  };
  
  const handleSaveCharacter = (characterData) => {
    if (characterData.id) {
      onUpdateCharacter(characterData);
    } else {
      onCreateCharacter(characterData);
    }
    setShowForm(false);
  };
  
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCharacter(null);
  };
  
  if (showForm) {
    return (
      <CharacterForm 
        character={editingCharacter} 
        onSaveCharacter={handleSaveCharacter} 
        onCancel={handleCancelForm} 
      />
    );
  }
  
  return (
    <div className="character-manager">
      {/* Fantasy Tab Header */}
      <div className="relative mb-6">
        <div className="bg-gradient-to-r from-black/80 via-amber-900/60 to-black/80 rounded-t-xl p-4 border-2 border-amber-700/50 border-b-0 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-fantasy font-bold text-ornate-gold uppercase tracking-wider flex items-center gap-3">
              <span className="text-3xl">⚔️</span>
              Manage Heroes
            </h2>
            <button 
              className="px-6 py-3 bg-gradient-to-r from-amber-700/80 to-amber-900/80 hover:from-amber-600/80 hover:to-amber-800/80 text-yellow-300 font-fantasy font-semibold rounded-lg border-2 border-amber-600/50 shadow-lg transform hover:scale-105 transition-all backdrop-blur-sm"
              onClick={handleNewCharacter}
            >
              Create New Hero
            </button>
          </div>
        </div>
        {/* Tab bottom border */}
        <div className="h-1 bg-gradient-to-r from-amber-700/50 via-amber-600/70 to-amber-700/50"></div>
      </div>
      
      <CharacterList 
        characters={characters} 
        activeCharacterId={activeCharacterId}
        onSelectCharacter={onSelectCharacter}
        onEditCharacter={handleEditCharacter}
        onDeleteCharacter={onDeleteCharacter}
      />
      
      {activeCharacterId && (
        <div className="mt-6 flex justify-center">
          <button 
            className="px-8 py-3 bg-gradient-to-r from-amber-800/70 to-amber-900/70 hover:from-amber-700/70 hover:to-amber-800/70 text-amber-200 font-fantasy font-semibold rounded-lg border-2 border-amber-700/50 shadow-lg transform hover:scale-105 transition-all backdrop-blur-sm flex items-center gap-3"
            onClick={() => handleEditCharacter(activeCharacterId)}
          >
            <span className="text-xl">🛡️</span>
            Edit Hero Details
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterManager;