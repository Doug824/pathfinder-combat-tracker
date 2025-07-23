import React, { useState } from 'react';
import CharacterList from './CharacterList';
import CharacterForm from './CharacterForm';
import { FantasyStatBadge } from '../FantasyStatBlock';

const FantasyCharacterManager = ({ 
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
      <div className="parchment-card p-6 max-w-4xl mx-auto">
        <CharacterForm 
          character={editingCharacter} 
          onSaveCharacter={handleSaveCharacter} 
          onCancel={handleCancelForm} 
        />
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-fantasy-gold/20 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-fantasy font-bold text-fantasy-gold flex items-center gap-3">
            <span className="text-4xl">⚔️</span>
            Heroes Roster
          </h2>
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={handleNewCharacter}
          >
            <span className="text-xl">✨</span>
            Forge New Hero
          </button>
        </div>
        
        {/* Character Stats Summary */}
        {characters.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <FantasyStatBadge 
              label="Total Heroes" 
              value={characters.length} 
              variant="gold"
              icon="👥"
            />
            <FantasyStatBadge 
              label="Active Hero" 
              value={activeCharacterId ? "1" : "None"} 
              variant="health"
              icon="🗡️"
            />
            <FantasyStatBadge 
              label="Adventures" 
              value="∞" 
              variant="mana"
              icon="📜"
            />
          </div>
        )}
      </div>
      
      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {characters.map(character => (
          <div 
            key={character.id}
            className={`
              parchment-card p-4 cursor-pointer transition-all duration-300
              ${activeCharacterId === character.id 
                ? 'ring-2 ring-fantasy-gold shadow-fantasy-glow transform scale-105' 
                : 'hover:shadow-lg hover:transform hover:scale-102'
              }
            `}
            onClick={() => onSelectCharacter(character.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-fantasy font-bold text-ink">
                  {character.name}
                </h3>
                <p className="text-sm text-ink/70">
                  Level {character.level || 1} {character.characterClass || 'Adventurer'}
                </p>
              </div>
              <div className="flex gap-1">
                <button 
                  className="p-1 text-mystic-purple hover:text-mystic-purple/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCharacter(character.id);
                  }}
                  title="Edit Hero"
                >
                  ✏️
                </button>
                <button 
                  className="p-1 text-blood-red hover:text-blood-red/70 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete ${character.name}?`)) {
                      onDeleteCharacter(character.id);
                    }
                  }}
                  title="Delete Hero"
                >
                  ❌
                </button>
              </div>
            </div>
            
            <div className="space-y-1 text-sm">
              {character.race && (
                <div className="flex justify-between">
                  <span className="text-ink/60">Race:</span>
                  <span className="font-semibold">{character.race}</span>
                </div>
              )}
              {character.alignment && (
                <div className="flex justify-between">
                  <span className="text-ink/60">Alignment:</span>
                  <span className="font-semibold">{character.alignment}</span>
                </div>
              )}
              {character.deity && (
                <div className="flex justify-between">
                  <span className="text-ink/60">Deity:</span>
                  <span className="font-semibold">{character.deity}</span>
                </div>
              )}
            </div>
            
            {activeCharacterId === character.id && (
              <div className="mt-3 pt-3 border-t border-fantasy-bronze/30">
                <p className="text-xs text-center text-fantasy-gold font-fantasy animate-glow-pulse">
                  ★ Active Hero ★
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {characters.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏰</div>
          <h3 className="text-2xl font-fantasy text-fantasy-gold mb-2">
            No Heroes Yet
          </h3>
          <p className="text-gray-400 mb-6">
            Begin your adventure by creating your first hero!
          </p>
          <button 
            className="btn-primary mx-auto"
            onClick={handleNewCharacter}
          >
            Create Your First Hero
          </button>
        </div>
      )}
      
      {/* Active Character Quick Actions */}
      {activeCharacterId && (
        <div className="bg-gradient-to-r from-fantasy-gold/10 to-fantasy-bronze/10 rounded-lg border border-fantasy-gold/30 p-4">
          <h3 className="text-lg font-fantasy font-bold text-fantasy-gold mb-3">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <button 
              className="btn-secondary text-sm"
              onClick={() => handleEditCharacter(activeCharacterId)}
            >
              Edit Character Details
            </button>
            <button 
              className="btn-nature text-sm"
              onClick={() => window.location.hash = '#setup'}
            >
              Character Setup
            </button>
            <button 
              className="btn-danger text-sm"
              onClick={() => window.location.hash = '#combat'}
            >
              Enter Combat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FantasyCharacterManager;