import React from 'react';

const CharacterList = ({ characters, activeCharacterId, onSelectCharacter, onDeleteCharacter }) => {
  return (
    <div className="character-list">
      <h3>Your Characters</h3>
      {characters.length === 0 ? (
        <p>No saved characters. Create your first character to get started!</p>
      ) : (
        <ul className="character-cards">
          {characters.map(character => (
            <li 
              key={character.id} 
              className={`character-card ${character.id === activeCharacterId ? 'active' : ''}`}
            >
              <div 
                className="character-card-content"
                onClick={() => onSelectCharacter(character.id)}
              >
                <h4>{character.name}</h4>
                <div className="character-meta">
                  <span>Level: {character.level || 1}</span>
                  <span>Class: {character.characterClass || 'None'}</span>
                </div>
              </div>
              <button 
                className="delete-character-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCharacter(character.id);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CharacterList;