import React, { useState, useEffect } from 'react';
import OrnatePanel, { OrnateTab, OrnateButton } from '../OrnatePanel';
import NumericInput from '../common/NumericInput';

const CharacterCreationWizard = ({ 
  onComplete, 
  onCancel, 
  existingCharacter = null 
}) => {
  // Wizard steps configuration
  const steps = [
    { id: 'welcome', title: 'Welcome', icon: '✨', description: 'Choose your path' },
    { id: 'basics', title: 'Basic Info', icon: '📋', description: 'Name, race, and class' },
    { id: 'abilities', title: 'Ability Scores', icon: '💪', description: 'Core attributes' },
    { id: 'class-features', title: 'Class Features', icon: '⚔️', description: 'BAB, saves, and HP' },
    { id: 'equipment', title: 'Equipment', icon: '🛡️', description: 'Starting gear' },
    { id: 'review', title: 'Review', icon: '👁️', description: 'Final confirmation' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [characterData, setCharacterData] = useState({
    // Basic Info
    name: '',
    race: '',
    characterClass: '',
    level: 1,
    alignment: '',
    size: 'medium',
    
    // Ability Scores  
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    
    // Class Features
    baseAttackBonus: 0,
    baseFortitude: 0,
    baseReflex: 0,
    baseWill: 0,
    hitPoints: {
      max: 8,
      current: 8,
      temporary: 0
    },
    
    // Equipment
    gear: [],
    
    // Import method
    importMethod: 'manual' // 'manual' or 'pdf'
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);

  // Calculate ability modifier
  const getModifier = (score) => Math.floor((score - 10) / 2);

  // Update character data
  const updateCharacterData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCharacterData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCharacterData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Navigation functions
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // PDF Upload handler
  const handlePDFUpload = async (file) => {
    setUploadedFile(file);
    setIsProcessingPDF(true);
    
    try {
      // TODO: Implement PDF OCR processing
      // For now, just set the import method and move to basics
      updateCharacterData('importMethod', 'pdf');
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Parse PDF and populate characterData
      // This would involve OCR and data extraction
      
      setIsProcessingPDF(false);
      nextStep(); // Move to basics step
    } catch (error) {
      console.error('PDF processing failed:', error);
      setIsProcessingPDF(false);
    }
  };

  // Validate current step
  const isStepValid = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return true;
      case 'basics':
        return characterData.name.trim() !== '' && 
               characterData.race.trim() !== '' && 
               characterData.characterClass.trim() !== '';
      case 'abilities':
        return Object.values(characterData.stats).every(stat => stat >= 3 && stat <= 99);
      case 'class-features':
        return characterData.baseAttackBonus >= 0 && 
               characterData.hitPoints.max > 0;
      case 'equipment':
        return true; // Equipment is optional
      case 'review':
        return true;
      default:
        return false;
    }
  };

  // Complete character creation
  const handleComplete = () => {
    if (onComplete) {
      onComplete(characterData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-fantasy text-ornate-gold drop-shadow-lg mb-4">
          FORGE YOUR LEGEND
        </h1>
        <p className="text-amber-200 text-xl font-fantasy">
          Create a new hero for your pathfinder adventures
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-center items-center gap-4 mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => goToStep(index)}
                className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 font-fantasy text-lg
                  ${index <= currentStep 
                    ? 'bg-amber-700/80 border-amber-500 text-amber-100' 
                    : 'bg-black/40 border-amber-800/50 text-amber-400'
                  }
                  ${index === currentStep ? 'ring-2 ring-amber-400 scale-110' : ''}
                  hover:bg-amber-600/70
                `}
              >
                {step.icon}
              </button>
              {index < steps.length - 1 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${index < currentStep ? 'bg-amber-500' : 'bg-amber-800/50'}
                `} />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-2xl font-fantasy text-amber-400 mb-1">
            {steps[currentStep].title}
          </h2>
          <p className="text-amber-200 text-sm">
            {steps[currentStep].description}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <OrnatePanel variant="default" className="mb-8">
        {renderStepContent()}
      </OrnatePanel>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <OrnateButton
              variant="secondary"
              onClick={prevStep}
              icon="◀"
            >
              Previous
            </OrnateButton>
          )}
          
          <OrnateButton
            variant="secondary"
            onClick={onCancel}
            icon="✖"
          >
            Cancel
          </OrnateButton>
        </div>

        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <OrnateButton
              variant="primary"
              onClick={nextStep}
              disabled={!isStepValid()}
              icon="▶"
            >
              Next
            </OrnateButton>
          ) : (
            <OrnateButton
              variant="primary"
              onClick={handleComplete}
              disabled={!isStepValid()}
              icon="✓"
            >
              Create Hero
            </OrnateButton>
          )}
        </div>
      </div>
    </div>
  );

  // Render step content based on current step
  function renderStepContent() {
    switch (steps[currentStep].id) {
      case 'welcome':
        return renderWelcomeStep();
      case 'basics':
        return renderBasicsStep();
      case 'abilities':
        return renderAbilitiesStep();
      case 'class-features':
        return renderClassFeaturesStep();
      case 'equipment':
        return renderEquipmentStep();
      case 'review':
        return renderReviewStep();
      default:
        return <div>Unknown step</div>;
    }
  }

  function renderWelcomeStep() {
    return (
      <div className="text-center space-y-8">
        <div className="mb-8">
          <h3 className="text-3xl font-fantasy text-amber-400 mb-4">
            Choose Your Path
          </h3>
          <p className="text-amber-200 text-lg max-w-2xl mx-auto">
            Begin your hero's journey by importing an existing character sheet or creating a new character from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* PDF Upload Option */}
          <div className="space-y-4">
            <div className="bg-black/40 rounded-lg border-2 border-amber-700/50 p-8 hover:border-amber-600/70 transition-all">
              <div className="text-6xl mb-4">📜</div>
              <h4 className="text-xl font-fantasy text-amber-400 mb-2">
                Import Character Sheet
              </h4>
              <p className="text-amber-200 text-sm mb-6">
                Upload a PDF character sheet and we'll automatically extract your character's information.
              </p>
              
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handlePDFUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="block w-full bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 px-6 py-3 rounded-lg border border-amber-600/50 font-fantasy font-bold transition-all duration-200 shadow-lg hover:shadow-amber-500/25 cursor-pointer text-center"
                >
                  {isProcessingPDF ? 'Processing...' : 'Choose PDF File'}
                </label>
                
                {uploadedFile && (
                  <div className="text-amber-200 text-sm">
                    Selected: {uploadedFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manual Creation Option */}
          <div className="space-y-4">
            <div className="bg-black/40 rounded-lg border-2 border-amber-700/50 p-8 hover:border-amber-600/70 transition-all">
              <div className="text-6xl mb-4">⚔️</div>
              <h4 className="text-xl font-fantasy text-amber-400 mb-2">
                Create From Scratch
              </h4>
              <p className="text-amber-200 text-sm mb-6">
                Build your character step by step with our guided creation wizard.
              </p>
              
              <OrnateButton
                variant="primary"
                onClick={() => {
                  updateCharacterData('importMethod', 'manual');
                  nextStep();
                }}
                className="w-full"
              >
                Start Creating
              </OrnateButton>
            </div>
          </div>
        </div>

        {isProcessingPDF && (
          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
              <span className="text-amber-200">Processing your character sheet...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderBasicsStep() {
    const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Orc', 'Half-Elf', 'Tiefling', 'Aasimar'];
    const classes = ['Fighter', 'Wizard', 'Cleric', 'Rogue', 'Ranger', 'Barbarian', 'Bard', 'Druid', 'Monk', 'Paladin', 'Sorcerer'];
    const alignments = [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ];

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-fantasy text-amber-400 mb-2">
            Basic Information
          </h3>
          <p className="text-amber-200">
            Tell us about your hero's identity and background
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Character Name */}
          <div className="md:col-span-2">
            <label className="block text-amber-300 font-fantasy font-semibold mb-3 text-lg">
              Character Name *
            </label>
            <input
              type="text"
              value={characterData.name}
              onChange={(e) => updateCharacterData('name', e.target.value)}
              className="input-fantasy w-full text-lg"
              placeholder="Enter your hero's name..."
            />
          </div>

          {/* Race Selection */}
          <div>
            <label className="block text-amber-300 font-fantasy font-semibold mb-3">
              Race *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {races.map(race => (
                <button
                  key={race}
                  onClick={() => updateCharacterData('race', race)}
                  className={`
                    p-3 rounded-lg border-2 transition-all font-fantasy text-sm
                    ${characterData.race === race 
                      ? 'bg-amber-900/60 border-amber-500 text-amber-300' 
                      : 'bg-black/40 border-amber-800/50 text-amber-200 hover:bg-amber-900/40'
                    }
                  `}
                >
                  {race}
                </button>
              ))}
            </div>
            
            {/* Custom race option */}
            <div className="mt-3">
              <input
                type="text"
                value={!races.includes(characterData.race) ? characterData.race : ''}
                onChange={(e) => updateCharacterData('race', e.target.value)}
                className="input-fantasy w-full text-sm"
                placeholder="Or enter custom race..."
              />
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-amber-300 font-fantasy font-semibold mb-3">
              Class *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {classes.map(cls => (
                <button
                  key={cls}
                  onClick={() => updateCharacterData('characterClass', cls)}
                  className={`
                    p-3 rounded-lg border-2 transition-all font-fantasy text-sm
                    ${characterData.characterClass === cls 
                      ? 'bg-amber-900/60 border-amber-500 text-amber-300' 
                      : 'bg-black/40 border-amber-800/50 text-amber-200 hover:bg-amber-900/40'
                    }
                  `}
                >
                  {cls}
                </button>
              ))}
            </div>
            
            {/* Custom class option */}
            <div className="mt-3">
              <input
                type="text"
                value={!classes.includes(characterData.characterClass) ? characterData.characterClass : ''}
                onChange={(e) => updateCharacterData('characterClass', e.target.value)}
                className="input-fantasy w-full text-sm"
                placeholder="Or enter custom class..."
              />
            </div>
          </div>

          {/* Level and Alignment */}
          <div>
            <label className="block text-amber-300 font-fantasy font-semibold mb-3">
              Level
            </label>
            <NumericInput
              value={characterData.level}
              onChange={(value) => updateCharacterData('level', value)}
              min={1}
              max={30}
              className="input-fantasy w-full"
            />
          </div>

          <div>
            <label className="block text-amber-300 font-fantasy font-semibold mb-3">
              Alignment
            </label>
            <select
              value={characterData.alignment}
              onChange={(e) => updateCharacterData('alignment', e.target.value)}
              className="input-fantasy w-full"
            >
              <option value="">Select Alignment</option>
              {alignments.map(alignment => (
                <option key={alignment} value={alignment}>
                  {alignment}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  function renderAbilitiesStep() {
    const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const totalPoints = Object.values(characterData.stats).reduce((sum, val) => sum + val, 0) - 60; // Point buy starts at 10s

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-fantasy text-amber-400 mb-2">
            Ability Scores
          </h3>
          <p className="text-amber-200">
            Distribute your character's core attributes
          </p>
          <div className="text-amber-300 text-sm mt-2">
            Point Buy Equivalent: {totalPoints} points used
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {abilityNames.map(ability => {
            const value = characterData.stats[ability];
            const modifier = getModifier(value);
            
            return (
              <div key={ability} className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
                <div className="text-center mb-4">
                  <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-2">
                    {ability.charAt(0).toUpperCase() + ability.slice(1)}
                  </h4>
                  
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <button
                      onClick={() => updateCharacterData(`stats.${ability}`, Math.max(3, value - 1))}
                      className="w-8 h-8 rounded-full bg-red-700/60 hover:bg-red-600/70 text-white font-bold"
                    >
                      -
                    </button>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-100 mb-1">
                        {value}
                      </div>
                      <div className="text-amber-300 text-sm">
                        Mod: {modifier >= 0 ? '+' : ''}{modifier}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => updateCharacterData(`stats.${ability}`, Math.min(99, value + 1))}
                      className="w-8 h-8 rounded-full bg-green-700/60 hover:bg-green-600/70 text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                  
                  <NumericInput
                    value={value}
                    onChange={(newValue) => updateCharacterData(`stats.${ability}`, newValue)}
                    min={3}
                    max={99}
                    className="input-fantasy w-full text-center"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Ability Score Methods */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6">
          <h4 className="text-amber-300 font-fantasy font-bold mb-3">
            Ability Score Generation Methods
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong className="text-amber-400">Point Buy (25 pts):</strong>
              <p className="text-amber-200">Start with 10s, spend points to increase</p>
            </div>
            <div>
              <strong className="text-amber-400">Standard Array:</strong>
              <p className="text-amber-200">15, 14, 13, 12, 10, 8</p>
            </div>
            <div>
              <strong className="text-amber-400">Rolling:</strong>
              <p className="text-amber-200">4d6 drop lowest, six times</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                // Standard Array
                const standardArray = [15, 14, 13, 12, 10, 8];
                const newStats = { ...characterData.stats };
                Object.keys(newStats).forEach((ability, index) => {
                  newStats[ability] = standardArray[index] || 10;
                });
                updateCharacterData('stats', newStats);
              }}
              className="bg-amber-700/60 hover:bg-amber-600/70 text-amber-100 px-4 py-2 rounded-lg font-fantasy text-sm"
            >
              Use Standard Array
            </button>
            
            <button
              onClick={() => {
                // Reset to 10s (Point Buy starting point)
                const resetStats = {};
                Object.keys(characterData.stats).forEach(ability => {
                  resetStats[ability] = 10;
                });
                updateCharacterData('stats', resetStats);
              }}
              className="bg-gray-700/60 hover:bg-gray-600/70 text-gray-100 px-4 py-2 rounded-lg font-fantasy text-sm"
            >
              Reset to 10s
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderClassFeaturesStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-fantasy text-amber-400 mb-2">
            Class Features
          </h3>
          <p className="text-amber-200">
            Configure your character's combat statistics and class abilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Base Attack Bonus */}
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-4">
              Base Attack Bonus
            </h4>
            <NumericInput
              value={characterData.baseAttackBonus}
              onChange={(value) => updateCharacterData('baseAttackBonus', value)}
              min={0}
              max={20}
              className="input-fantasy w-full"
            />
            <p className="text-amber-200 text-sm mt-2">
              Your class's base attack progression at level {characterData.level}
            </p>
          </div>

          {/* Hit Points */}
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-4">
              Hit Points
            </h4>
            <NumericInput
              value={characterData.hitPoints.max}
              onChange={(value) => {
                updateCharacterData('hitPoints.max', value);
                updateCharacterData('hitPoints.current', value);
              }}
              min={1}
              max={999}
              className="input-fantasy w-full"
            />
            <p className="text-amber-200 text-sm mt-2">
              Total HP including CON modifier ({getModifier(characterData.stats.constitution) >= 0 ? '+' : ''}{getModifier(characterData.stats.constitution)})
            </p>
          </div>

          {/* Base Saving Throws */}
          <div className="md:col-span-2 bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-4">
              Base Saving Throws
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-amber-300 font-fantasy font-semibold mb-2">
                  Fortitude
                </label>
                <NumericInput
                  value={characterData.baseFortitude}
                  onChange={(value) => updateCharacterData('baseFortitude', value)}
                  min={0}
                  max={20}
                  className="input-fantasy w-full"
                />
                <div className="text-amber-200 text-sm mt-1">
                  Total: {characterData.baseFortitude + getModifier(characterData.stats.constitution) >= 0 ? '+' : ''}
                  {characterData.baseFortitude + getModifier(characterData.stats.constitution)}
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-fantasy font-semibold mb-2">
                  Reflex
                </label>
                <NumericInput
                  value={characterData.baseReflex}
                  onChange={(value) => updateCharacterData('baseReflex', value)}
                  min={0}
                  max={20}
                  className="input-fantasy w-full"
                />
                <div className="text-amber-200 text-sm mt-1">
                  Total: {characterData.baseReflex + getModifier(characterData.stats.dexterity) >= 0 ? '+' : ''}
                  {characterData.baseReflex + getModifier(characterData.stats.dexterity)}
                </div>
              </div>

              <div>
                <label className="block text-amber-300 font-fantasy font-semibold mb-2">
                  Will
                </label>
                <NumericInput
                  value={characterData.baseWill}
                  onChange={(value) => updateCharacterData('baseWill', value)}
                  min={0}
                  max={20}
                  className="input-fantasy w-full"
                />
                <div className="text-amber-200 text-sm mt-1">
                  Total: {characterData.baseWill + getModifier(characterData.stats.wisdom) >= 0 ? '+' : ''}
                  {characterData.baseWill + getModifier(characterData.stats.wisdom)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Class-specific help text */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6">
          <h4 className="text-amber-300 font-fantasy font-bold mb-3">
            Class Guidance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-amber-400">High BAB Classes:</strong>
              <p className="text-amber-200">Fighter, Barbarian, Ranger, Paladin</p>
              <p className="text-amber-200">BAB equals level</p>
            </div>
            <div>
              <strong className="text-amber-400">Medium BAB Classes:</strong>
              <p className="text-amber-200">Cleric, Druid, Bard, Rogue</p>
              <p className="text-amber-200">BAB equals 3/4 level</p>
            </div>
            <div>
              <strong className="text-amber-400">Low BAB Classes:</strong>
              <p className="text-amber-200">Wizard, Sorcerer</p>
              <p className="text-amber-200">BAB equals 1/2 level</p>
            </div>
            <div>
              <strong className="text-amber-400">Saving Throws:</strong>
              <p className="text-amber-200">Each class has good/poor save progressions</p>
              <p className="text-amber-200">Good saves: 2 + 1/2 level</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderEquipmentStep() {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-fantasy text-amber-400 mb-2">
            Starting Equipment
          </h3>
          <p className="text-amber-200">
            Add your character's initial gear and equipment (optional)
          </p>
        </div>

        <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">🎒</div>
          <h4 className="text-amber-300 font-fantasy font-bold text-xl mb-2">
            Equipment Coming Soon
          </h4>
          <p className="text-amber-200 mb-4">
            For now, you can add equipment after character creation in the main setup page.
          </p>
          <p className="text-amber-200 text-sm">
            This step is optional - you can continue to complete your character creation.
          </p>
        </div>
      </div>
    );
  }

  function renderReviewStep() {
    const totalModifiers = Object.entries(characterData.stats)
      .reduce((sum, [_, value]) => sum + getModifier(value), 0);

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-fantasy text-amber-400 mb-2">
            Review Your Hero
          </h3>
          <p className="text-amber-200">
            Confirm your character details before creating
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-4 border-b border-amber-700/30 pb-2">
              Basic Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-amber-300">Name:</span>
                <span className="text-amber-100 font-bold">{characterData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-300">Race:</span>
                <span className="text-amber-100">{characterData.race}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-300">Class:</span>
                <span className="text-amber-100">{characterData.characterClass}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-300">Level:</span>
                <span className="text-amber-100">{characterData.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-300">Alignment:</span>
                <span className="text-amber-100">{characterData.alignment || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Ability Scores */}
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-4 border-b border-amber-700/30 pb-2">
              Ability Scores
            </h4>
            <div className="space-y-2">
              {Object.entries(characterData.stats).map(([ability, value]) => (
                <div key={ability} className="flex justify-between items-center">
                  <span className="text-amber-300 capitalize">{ability}:</span>
                  <div className="text-amber-100">
                    <span className="font-bold">{value}</span>
                    <span className="text-amber-300 text-sm ml-2">
                      ({getModifier(value) >= 0 ? '+' : ''}{getModifier(value)})
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-amber-700/30">
                <div className="flex justify-between text-sm">
                  <span className="text-amber-300">Total Modifiers:</span>
                  <span className="text-amber-100">{totalModifiers >= 0 ? '+' : ''}{totalModifiers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Statistics */}
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-4 border-b border-amber-700/30 pb-2">
              Combat Statistics
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-amber-300">Base Attack Bonus:</span>
                <span className="text-amber-100">{characterData.baseAttackBonus >= 0 ? '+' : ''}{characterData.baseAttackBonus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-300">Hit Points:</span>
                <span className="text-amber-100">{characterData.hitPoints.max}</span>
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-amber-300">Fortitude:</span>
                  <span className="text-amber-100">
                    {characterData.baseFortitude + getModifier(characterData.stats.constitution) >= 0 ? '+' : ''}
                    {characterData.baseFortitude + getModifier(characterData.stats.constitution)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300">Reflex:</span>
                  <span className="text-amber-100">
                    {characterData.baseReflex + getModifier(characterData.stats.dexterity) >= 0 ? '+' : ''}
                    {characterData.baseReflex + getModifier(characterData.stats.dexterity)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-300">Will:</span>
                  <span className="text-amber-100">
                    {characterData.baseWill + getModifier(characterData.stats.wisdom) >= 0 ? '+' : ''}
                    {characterData.baseWill + getModifier(characterData.stats.wisdom)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Import Method */}
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-6">
            <h4 className="text-amber-300 font-fantasy font-bold text-lg mb-4 border-b border-amber-700/30 pb-2">
              Creation Method
            </h4>
            <div className="flex items-center justify-center space-x-3">
              <div className="text-3xl">
                {characterData.importMethod === 'pdf' ? '📜' : '⚔️'}
              </div>
              <div>
                <div className="text-amber-100 font-bold">
                  {characterData.importMethod === 'pdf' ? 'Imported from PDF' : 'Created Manually'}
                </div>
                {uploadedFile && (
                  <div className="text-amber-300 text-sm">
                    Source: {uploadedFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Final confirmation */}
        <div className="bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-6 text-center">
          <h4 className="text-emerald-300 font-fantasy font-bold text-xl mb-2">
            Ready to Create Your Hero?
          </h4>
          <p className="text-emerald-200">
            Once created, you can further customize your character with equipment, buffs, and combat abilities.
          </p>
        </div>
      </div>
    );
  }
};

export default CharacterCreationWizard;