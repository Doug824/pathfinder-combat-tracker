import React, { useState } from 'react';
import BuffTracker from '../components/BuffTracker/BuffTracker';
import CombatStatsCalculator from '../components/CombatStats/CombatStatsCalculator';
import CombatAbilities from '../components/CombatAbilities/CombatAbilities';
import Playsheet from '../components/Playsheet';

const CombatTracker = ({
  character,
  stats,
  buffs,
  gear,
  combatAbilities,
  onBuffsChange,
  onCombatAbilitiesChange,
  onUpdateWeapons,
  onUpdateCombatSettings
}) => {
  // State for tracking active tabs
  const [activeTab, setActiveTab] = useState('playsheet');
  
  const tabs = [
    { id: 'playsheet', label: 'Playsheet' },
    { id: 'stats', label: 'Combat Stats' },
    { id: 'buffs', label: 'Active Buffs' },
    { id: 'abilities', label: 'Combat Abilities' }
  ];
  
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
            />
          )}
          
          {activeTab === 'stats' && (
            <CombatStatsCalculator 
              baseStats={stats} 
              buffs={buffs}
              gear={gear} 
              character={character}
            />
          )}
          
          {activeTab === 'buffs' && (
            <BuffTracker 
              onBuffsChange={onBuffsChange}
              initialBuffs={buffs}
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