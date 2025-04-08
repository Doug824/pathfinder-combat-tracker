import React, { useState, useEffect } from 'react';
import BuffTracker from '../components/BuffTracker/BuffTracker';
import CombatStatsCalculator from '../components/CombatStats/CombatStatsCalculator';
import CombatAbilities from '../components/CombatAbilities/CombatAbilities';
import Playsheet from '../components/Playsheet/Playsheet';
import BuffLibrary from '../components/BuffTracker/BuffLibrary';
import HitPointTracker from '../components/HitPoints/HitPointTracker';
import { calculateFinalStats } from '../utils/bonusCalculator';

const CombatTracker = ({
  character,
  stats,
  buffs,
  gear,
  combatAbilities,
  onBuffsChange,
  onCombatAbilitiesChange,
  onUpdateWeapons,
  onUpdateCombatSettings,
  onUpdateSavedBuffs,
  onUpdateHitPoints
}) => {
  // State for tracking active tabs
  const [activeTab, setActiveTab] = useState('playsheet');
  
  // State to store calculated final stats (including all buffs, abilities, etc.)
  const [finalStats, setFinalStats] = useState(stats);
  
  // Add a new tab for hit points
  const tabs = [
    { id: 'playsheet', label: 'Playsheet' },
    { id: 'stats', label: 'Combat Stats' },
    { id: 'hitpoints', label: 'Hit Points' },
    { id: 'buffs', label: 'Active Buffs' },
    { id: 'buffLibrary', label: 'Buff Library' },
    { id: 'abilities', label: 'Combat Abilities' }
  ];
  
  // Calculate final stats when components or stats change
  useEffect(() => {
    // Get active abilities
    const activeAbilities = combatAbilities.filter(ability => ability.isActive);
    
    // Calculate final stats with all active effects
    const { finalStats: calculatedStats } = calculateFinalStats(stats, [...buffs, ...activeAbilities], gear);
    
    // Update final stats
    setFinalStats(calculatedStats);
  }, [stats, buffs, gear, combatAbilities]);
  
  // Handler to save a buff to the library
  const handleSaveBuff = (buff) => {
    if (character && onUpdateSavedBuffs) {
      // Get current saved buffs or empty array if not defined
      const currentSavedBuffs = character.savedBuffs || [];
      
      // Check if this buff already exists by name and bonus type to avoid duplicates
      const exists = currentSavedBuffs.some(savedBuff => 
        savedBuff.name === buff.name && savedBuff.bonusType === buff.bonusType
      );
      
      if (!exists) {
        // Add the new buff to the saved buffs array
        const updatedSavedBuffs = [...currentSavedBuffs, buff];
        onUpdateSavedBuffs(updatedSavedBuffs);
        console.log(`Saved buff "${buff.name}" to library`);
      } else {
        console.log(`Buff "${buff.name}" already exists in library`);
      }
    } else {
      console.warn("Cannot save buff: Missing character or onUpdateSavedBuffs prop");
    }
  };

  // Apply a buff from the library
  const handleApplyBuffFromLibrary = (buff) => {
    // Create a copy of the buff to add to active buffs
    const buffToApply = { 
      ...buff,
      id: Date.now(), // Generate a new ID for this instance
      originId: buff.id // Store the original ID to track its source
    };
    
    const updatedBuffs = [...buffs, buffToApply];
    onBuffsChange(updatedBuffs);
  };
  
  // Remove an active buff by ID
  const handleRemoveBuffById = (originId) => {
    const updatedBuffs = buffs.filter(buff => buff.originId !== originId);
    onBuffsChange(updatedBuffs);
  };
  
  // Delete a buff from the saved library
  const handleDeleteSavedBuff = (buffId) => {
    if (character && character.savedBuffs && onUpdateSavedBuffs) {
      const updatedSavedBuffs = character.savedBuffs.filter(buff => buff.id !== buffId);
      onUpdateSavedBuffs(updatedSavedBuffs);
      console.log(`Deleted buff ${buffId} from library`);
    }
  };
  
  // Create a buff package from multiple buffs
  const handleCreateBuffPackage = (newPackage) => {
    if (character && character.savedBuffs && onUpdateSavedBuffs) {
      const updatedSavedBuffs = [...character.savedBuffs, newPackage];
      onUpdateSavedBuffs(updatedSavedBuffs);
      console.log(`Created buff package: ${newPackage.name}`);
    }
  };
  
  // Handler for hit point changes
  const handleHitPointsChange = (newHitPoints) => {
    if (onUpdateHitPoints) {
      onUpdateHitPoints(newHitPoints);
    }
  };

  return (
    <div className="combat-tracker">
      <div className="tabs-container">
        <div className="tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
        {activeTab === 'playsheet' && (
          <Playsheet
            character={character}
            stats={stats}
            buffs={buffs}
            gear={gear}
            combatAbilities={combatAbilities}
            onCombatAbilitiesChange={onCombatAbilitiesChange}
            onUpdateWeapons={onUpdateWeapons}
            onUpdateCombatSettings={onUpdateCombatSettings}
            onUpdateHitPoints={handleHitPointsChange}
          />
        )}
          
          {activeTab === 'stats' && (
            <CombatStatsCalculator 
              baseStats={stats} 
              buffs={buffs}
              gear={gear} 
              character={character}
              combatAbilities={combatAbilities}
            />
          )}
          
          {activeTab === 'hitpoints' && (
            <HitPointTracker
              character={character}
              finalStats={finalStats}
              onHitPointChange={handleHitPointsChange}
            />
          )}
          
          {activeTab === 'buffs' && (
            <BuffTracker 
              onBuffsChange={onBuffsChange}
              initialBuffs={buffs}
              onSaveBuff={handleSaveBuff}
            />
          )}
          
          {activeTab === 'buffLibrary' && (
            <BuffLibrary 
              savedBuffs={character.savedBuffs || []}
              activeBuffs={buffs}
              onApplyBuff={handleApplyBuffFromLibrary}
              onRemoveBuff={handleRemoveBuffById}
              onDeleteSavedBuff={handleDeleteSavedBuff}
              onCreateBuffPackage={handleCreateBuffPackage}
            />
          )}
          
          {activeTab === 'abilities' && (
            <CombatAbilities
              combatAbilities={combatAbilities}
              onCombatAbilitiesChange={onCombatAbilitiesChange}
              baseStats={stats}
              buffs={buffs}
              gear={gear}
              character={character}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatTracker;