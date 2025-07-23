import React from 'react';

const CharacterList = ({ characters, activeCharacterId, onSelectCharacter, onDeleteCharacter }) => {
  return (
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
      {/* Content Header */}
      <div className="mb-6 border-b-2 border-amber-700/30 pb-4">
        <h3 className="text-xl font-fantasy font-bold text-yellow-300 flex items-center gap-3">
          <span className="text-2xl">📜</span>
          Your Heroes
        </h3>
        <p className="text-amber-200/70 text-sm mt-1">Select a hero to manage or view their details</p>
      </div>
      
      {characters.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-amber-700/30 rounded-lg">
          <div className="text-6xl mb-4">⚔️</div>
          <p className="text-amber-200/70 text-lg font-body">
            No heroes in your company yet!
          </p>
          <p className="text-amber-200/60 text-sm mt-2">
            Create your first hero to begin your adventure.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {characters.map(character => (
            <div
              key={character.id} 
              className={`
                relative group cursor-pointer transform transition-all duration-300 hover:scale-105
                ${character.id === activeCharacterId 
                  ? 'ring-4 ring-ornate-gold shadow-fantasy-glow' 
                  : 'hover:shadow-lg'
                }
              `}
            >
              {/* Character Card */}
              <div 
                className={`
                  relative p-4 rounded-lg border-2 backdrop-blur-sm transition-all duration-300
                  ${character.id === activeCharacterId
                    ? 'bg-gradient-to-br from-amber-900/70 to-amber-800/70 border-ornate-gold shadow-fantasy-glow' 
                    : 'bg-gradient-to-br from-black/60 to-amber-950/40 border-amber-700/50 hover:border-amber-600/70'
                  }
                `}
                onClick={() => onSelectCharacter(character.id)}
              >
                {/* Active indicator */}
                {character.id === activeCharacterId && (
                  <div className="absolute top-2 left-2">
                    <div className="w-3 h-3 bg-ornate-gold rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {/* Character Info */}
                <div className="space-y-2">
                  <h4 className="text-lg font-fantasy font-bold text-yellow-300 flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    {character.name}
                  </h4>
                  
                  <div className="flex gap-4 text-sm text-amber-200/80">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      Level {character.level || 1}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-amber-400">⚔️</span>
                      {character.characterClass || 'Adventurer'}
                    </span>
                  </div>
                  
                  {(character.race || character.alignment) && (
                    <div className="text-xs text-amber-200/70 pt-1 border-t border-amber-700/20">
                      {character.race && <span>{character.race}</span>}
                      {character.race && character.alignment && <span className="mx-2">•</span>}
                      {character.alignment && <span>{character.alignment}</span>}
                    </div>
                  )}
                </div>
                
                {/* Delete Button */}
                <button 
                  className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-bold transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Are you sure you want to delete ${character.name}?`)) {
                      onDeleteCharacter(character.id);
                    }
                  }}
                  title="Delete Hero"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterList;