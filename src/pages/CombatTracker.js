import React, { useState } from 'react';
import BuffTracker from '../components/BuffTracker/BuffTracker';
import CombatStatsCalculator from '../components/CombatStats/CombatStatsCalculator';
import CombatAbilities from '../components/CombatAbilities/CombatAbilities';

const CombatTracker = ({
  character,
  stats,
  buffs,
  gear,
  combatAbilities,
  onBuffsChange,
  onCombatAbilitiesChange
}) => {
  // State for tracking active tabs
  const [activeTab, setActiveTab] = useState('stats');
  
  const tabs = [
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
          {activeTab === 'stats' && (
            <CombatStatsCalculator 
              baseStats={stats} 
              buffs={buffs}
              gear={gear} 
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatTracker;