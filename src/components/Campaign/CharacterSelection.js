import React, { useState } from 'react';
import './Campaign.css';

const CharacterSelection = ({ 
  characters, 
  onSelectCharacter, 
  onCreateNew, 
  onCancel,
  campaignName 
}) => {
  const [selectedCharacterId, setSelectedCharacterId] = useState('');
  const [selectionMode, setSelectionMode] = useState('select'); // 'select' or 'create'

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectionMode === 'create') {
      onCreateNew();
    } else {
      const selectedCharacter = characters.find(char => char.id === selectedCharacterId);
      if (selectedCharacter) {
        onSelectCharacter(selectedCharacter);
      }
    }
  };

  const getCharacterDisplayName = (character) => {
    let displayName = character.name || 'Unnamed Character';
    if (character.level && character.characterClass) {
      displayName += ` (Level ${character.level} ${character.characterClass})`;
    }
    return displayName;
  };

  return (
    <div className="character-selection">
      <div className="selection-header">
        <h2>Select Character</h2>
        <p>Choose a character to join "{campaignName}"</p>
      </div>

      <form onSubmit={handleSubmit} className="character-selection-form">
        <div className="selection-options">
          <div className="selection-option">
            <label className="option-header">
              <input
                type="radio"
                name="selectionMode"
                value="select"
                checked={selectionMode === 'select'}
                onChange={(e) => setSelectionMode(e.target.value)}
              />
              <span>Use Existing Character</span>
            </label>
            
            {selectionMode === 'select' && (
              <div className="character-list">
                {characters.length === 0 ? (
                  <p className="no-characters">
                    You don't have any characters yet. Create a new one below.
                  </p>
                ) : (
                  <div className="character-options">
                    {characters.map(character => (
                      <label key={character.id} className="character-option">
                        <input
                          type="radio"
                          name="selectedCharacter"
                          value={character.id}
                          checked={selectedCharacterId === character.id}
                          onChange={(e) => setSelectedCharacterId(e.target.value)}
                        />
                        <div className="character-info">
                          <div className="character-name">
                            {getCharacterDisplayName(character)}
                          </div>
                          <div className="character-details">
                            {character.race && <span>{character.race}</span>}
                            {character.alignment && <span>{character.alignment}</span>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="selection-option">
            <label className="option-header">
              <input
                type="radio"
                name="selectionMode"
                value="create"
                checked={selectionMode === 'create'}
                onChange={(e) => setSelectionMode(e.target.value)}
              />
              <span>Create New Character</span>
            </label>
            
            {selectionMode === 'create' && (
              <div className="create-character-info">
                <p>Create a new character for this campaign. You'll be taken to the character creation form.</p>
              </div>
            )}
          </div>
        </div>

        <div className="selection-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="continue-button"
            disabled={selectionMode === 'select' && !selectedCharacterId}
          >
            {selectionMode === 'create' ? 'Create Character' : 'Join Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterSelection;