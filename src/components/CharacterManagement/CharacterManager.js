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
      <div className="character-manager-header">
        <h2>Character Manager</h2>
        <button className="new-character-btn" onClick={handleNewCharacter}>
          + New Character
        </button>
      </div>
      
      <CharacterList 
        characters={characters} 
        activeCharacterId={activeCharacterId}
        onSelectCharacter={onSelectCharacter}
        onEditCharacter={handleEditCharacter}
        onDeleteCharacter={onDeleteCharacter}
      />
      
      {activeCharacterId && (
        <div className="active-character-controls">
          <button 
            className="edit-character-btn"
            onClick={() => handleEditCharacter(activeCharacterId)}
          >
            Edit Character Details
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterManager;