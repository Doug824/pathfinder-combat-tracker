import React, { useState } from 'react';
import OrnatePanel, { OrnateTab, OrnateStatInput, OrnateButton } from '../components/OrnatePanel';

const FantasyCharacterSetup = ({ 
  character, 
  onUpdateCharacter,
  onStatsChange,
  stats 
}) => {
  const [activeTab, setActiveTab] = useState('race');
  const [characterStats, setCharacterStats] = useState(stats || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  });

  const calculateModifier = (stat) => {
    return Math.floor((stat - 10) / 2);
  };

  const handleStatChange = (statName, value) => {
    const newValue = Math.max(1, Math.min(99, value)); // Clamp between 1 and 99
    const newStats = { ...characterStats, [statName]: newValue };
    setCharacterStats(newStats);
    if (onStatsChange) {
      onStatsChange(newStats);
    }
  };

  const tabs = [
    { id: 'race', label: 'Race', icon: '🧝' },
    { id: 'class', label: 'Class', icon: '⚔️' },
    { id: 'abilities', label: 'Abilities', icon: '✨' },
  ];

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-fantasy text-ornate-gold drop-shadow-lg mb-2">
          HERO'S LEDGER
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center gap-2 mb-6">
        {tabs.map(tab => (
          <OrnateTab
            key={tab.id}
            label={tab.label}
            icon={tab.icon}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Main Content Panel */}
      <OrnatePanel variant="default" className="mb-6">
        {/* Character Name Display */}
        <div className="text-center mb-6 pb-4 border-b border-amber-800/50">
          <h2 className="text-3xl font-fantasy text-yellow-400">
            {character?.name || 'New Hero'}
          </h2>
          <p className="text-amber-200 mt-1">
            {character?.race || 'Human'}, {character?.characterClass || 'Monk'}
          </p>
        </div>

        {/* Tab Content */}
        {activeTab === 'abilities' && (
          <div className="space-y-1">
            <OrnateStatInput
              label="Strength"
              value={characterStats.strength}
              onChange={(value) => handleStatChange('strength', value)}
              modifier={calculateModifier(characterStats.strength)}
            />
            <OrnateStatInput
              label="Dexterity"
              value={characterStats.dexterity}
              onChange={(value) => handleStatChange('dexterity', value)}
              modifier={calculateModifier(characterStats.dexterity)}
            />
            <OrnateStatInput
              label="Constitution"
              value={characterStats.constitution}
              onChange={(value) => handleStatChange('constitution', value)}
              modifier={calculateModifier(characterStats.constitution)}
            />
            <OrnateStatInput
              label="Intelligence"
              value={characterStats.intelligence}
              onChange={(value) => handleStatChange('intelligence', value)}
              modifier={calculateModifier(characterStats.intelligence)}
            />
            <OrnateStatInput
              label="Wisdom"
              value={characterStats.wisdom}
              onChange={(value) => handleStatChange('wisdom', value)}
              modifier={calculateModifier(characterStats.wisdom)}
            />
            <OrnateStatInput
              label="Charisma"
              value={characterStats.charisma}
              onChange={(value) => handleStatChange('charisma', value)}
              modifier={calculateModifier(characterStats.charisma)}
            />
          </div>
        )}

        {activeTab === 'race' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Orc'].map(race => (
                <button
                  key={race}
                  onClick={() => onUpdateCharacter({ ...character, race })}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${character?.race === race 
                      ? 'bg-amber-900/60 border-yellow-500 text-yellow-300' 
                      : 'bg-black/40 border-amber-800/50 text-amber-200 hover:bg-amber-900/40'
                    }
                    font-fantasy text-lg
                  `}
                >
                  {race}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {['Fighter', 'Wizard', 'Cleric', 'Rogue', 'Ranger', 'Monk'].map(className => (
                <button
                  key={className}
                  onClick={() => onUpdateCharacter({ ...character, characterClass: className })}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${character?.characterClass === className 
                      ? 'bg-amber-900/60 border-yellow-500 text-yellow-300' 
                      : 'bg-black/40 border-amber-800/50 text-amber-200 hover:bg-amber-900/40'
                    }
                    font-fantasy text-lg
                  `}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>
        )}
      </OrnatePanel>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {/* Character Creation button */}
          <OrnateButton
            variant="secondary"
            icon="✨"
            onClick={() => {/* Handle character creation */}}
            className="text-sm"
          >
            Character Creation
          </OrnateButton>
        </div>
        
        <div className="flex gap-3">
          {/* Buffs button */}
          <OrnateButton
            variant="secondary"
            icon="🛡️"
            onClick={() => {/* Handle buffs */}}
            className="text-sm"
          >
            Buffs
          </OrnateButton>
          
          {/* Items button */}
          <OrnateButton
            variant="secondary"
            icon="🎒"
            onClick={() => {/* Handle items */}}
            className="text-sm"
          >
            Items
          </OrnateButton>
        </div>

        {/* Next button */}
        <OrnateButton
          variant="primary"
          onClick={handleNext}
          className="min-w-[120px]"
        >
          Next
        </OrnateButton>
      </div>
    </div>
  );
};

export default FantasyCharacterSetup;