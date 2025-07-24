import React, { useState, useEffect } from 'react';
import './AnimatedDiceRoller.css';

const AnimatedDiceRoller = ({ damageModifier = 0 }) => {
  const [diceGroups, setDiceGroups] = useState([
    { id: Date.now(), count: 1, type: 6 }
  ]);
  const [diceResult, setDiceResult] = useState(null);
  const [showAverage, setShowAverage] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [modifier, setModifier] = useState(damageModifier);
  const [diceHistory, setDiceHistory] = useState([]);

  // Update the modifier whenever damageModifier changes
  useEffect(() => {
    setModifier(damageModifier);
  }, [damageModifier]);

  // Add a dice group
  const addDiceGroup = () => {
    setDiceGroups([
      ...diceGroups,
      { id: Date.now(), count: 1, type: 6 }
    ]);
  };

  // Remove a dice group
  const removeDiceGroup = (id) => {
    if (diceGroups.length > 1) {
      setDiceGroups(diceGroups.filter(group => group.id !== id));
    }
  };

  // Update a dice group
  const updateDiceGroup = (id, field, value) => {
    setDiceGroups(diceGroups.map(group => {
      if (group.id === id) {
        return {
          ...group,
          [field]: field === 'count' ? Math.max(1, parseInt(value) || 1) : parseInt(value)
        };
      }
      return group;
    }));
  };

  // Calculate average result
  const calculateAverageDice = () => {
    let total = 0;
    diceGroups.forEach(group => {
      // Average of a die is (min + max) / 2
      const averagePerDie = (1 + parseInt(group.type)) / 2;
      total += group.count * averagePerDie;
    });
    return total + parseInt(modifier || 0);
  };

  // Roll dice
  const rollDice = () => {
    setIsRolling(true);
    
    // Simulate dice rolling animation time
    setTimeout(() => {
      let total = 0;
      const groupRolls = [];
      
      diceGroups.forEach(group => {
        const rolls = [];
        for (let i = 0; i < group.count; i++) {
          const roll = Math.floor(Math.random() * group.type) + 1;
          total += roll;
          rolls.push(roll);
        }
        groupRolls.push({
          formula: `${group.count}d${group.type}`,
          rolls
        });
      });
      
      // Add damage modifier to the total
      const finalTotal = total + parseInt(modifier || 0);
      
      const result = { 
        total: finalTotal, 
        rawTotal: total,
        modifier: parseInt(modifier || 0),
        groupRolls,
        timestamp: new Date()
      };
      
      // Store in history
      setDiceHistory([result, ...diceHistory.slice(0, 9)]);
      
      setDiceResult(result);
      setShowAverage(false);
      setIsRolling(false);
    }, 800); // Animation time
  };

  // Format the dice formula
  const getDiceFormula = () => {
    let formula = diceGroups.map(group => `${group.count}d${group.type}`).join(' + ');
    if (parseInt(modifier || 0) !== 0) {
      formula += `${parseInt(modifier || 0) > 0 ? ' + ' : ' - '}${Math.abs(parseInt(modifier || 0))}`;
    }
    return formula;
  };

  return (
    <div className="space-y-4">
      <div className="bg-black/30 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
        <h3 className="text-lg font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Dice Configuration</h3>
        
        {/* Dice Groups */}
        <div className="space-y-3">
          {diceGroups.map((group) => (
            <div key={group.id} className="bg-black/20 rounded-lg border border-amber-700/20 p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label htmlFor={`dice-count-${group.id}`} className="block text-amber-300 font-fantasy font-semibold text-sm mb-1">Count</label>
                  <input
                    id={`dice-count-${group.id}`}
                    type="number"
                    min="1"
                    max="20"
                    value={group.count}
                    onChange={(e) => updateDiceGroup(group.id, 'count', e.target.value)}
                    className="input-fantasy w-16"
                  />
                </div>
                
                <div className="flex-1">
                  <label htmlFor={`dice-type-${group.id}`} className="block text-amber-300 font-fantasy font-semibold text-sm mb-1">Type</label>
                  <select
                    id={`dice-type-${group.id}`}
                    value={group.type}
                    onChange={(e) => updateDiceGroup(group.id, 'type', e.target.value)}
                    className="input-fantasy w-20"
                  >
                    <option value="4">d4</option>
                    <option value="6">d6</option>
                    <option value="8">d8</option>
                    <option value="10">d10</option>
                    <option value="12">d12</option>
                    <option value="20">d20</option>
                    <option value="100">d100</option>
                  </select>
                </div>
                
                <button
                  type="button"
                  onClick={() => removeDiceGroup(group.id)}
                  className="text-blood-red hover:text-red-600 w-8 h-8 rounded-full hover:bg-blood-red/50 transition-all duration-200 flex items-center justify-center mt-6"
                  aria-label="Remove dice"
                >
                  −
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add Dice Button */}
        <button
          type="button"
          onClick={addDiceGroup}
          className="w-full bg-amber-700/60 hover:bg-amber-600/70 text-amber-100 px-4 py-2 rounded-lg border border-amber-600/50 font-fantasy font-semibold transition-all duration-200 mt-3"
        >
          + Add Dice Group
        </button>
        
        {/* Modifier */}
        <div className="bg-black/20 rounded-lg border border-amber-700/20 p-3 mt-4">
          <label htmlFor="dice-modifier" className="block text-amber-300 font-fantasy font-semibold mb-2">Damage Modifier:</label>
          <div className="flex items-center gap-2">
            <input
              id="dice-modifier"
              type="number"
              value={modifier}
              onChange={(e) => setModifier(e.target.value)}
              className="input-fantasy w-20"
            />
            <span className="text-amber-200/70 text-sm font-fantasy">
              (From character stats)
            </span>
          </div>
        </div>
      </div>
      
      {/* Dice Display */}
      <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
        <div className="text-center mb-4">
          <div className="text-xl font-fantasy font-bold text-amber-300 bg-black/30 rounded-lg border border-amber-700/20 p-3">
            {getDiceFormula()}
          </div>
        </div>
          
        {showAverage && (
          <div className="text-center mb-4">
            <div className="bg-ocean-blue/30 border border-ocean-blue/50 rounded-lg p-3">
              <span className="text-parchment font-fantasy font-semibold text-sm">Average: </span>
              <span className="text-parchment-light font-fantasy font-bold text-lg">{calculateAverageDice().toFixed(1)}</span>
            </div>
          </div>
        )}
          
        {diceResult && !showAverage && (
          <div className={`bg-forest-green/30 border border-forest-green/50 rounded-lg p-4 transition-all duration-300 ${
            isRolling ? 'animate-pulse' : ''
          }`}>
            <div className="text-center mb-3">
              <span className="text-fantasy-gold font-fantasy font-semibold text-sm">Roll Result:</span>
              <div className="text-parchment-light font-fantasy font-bold text-3xl">{diceResult.total}</div>
            </div>
            <div className="space-y-2">
              {diceResult.groupRolls.map((group, groupIndex) => (
                <div key={groupIndex} className="bg-black/30 rounded border border-forest-green/30 p-2">
                  <span className="text-fantasy-gold font-fantasy font-semibold text-sm">{group.formula}:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {group.rolls.map((roll, i) => (
                      <span key={i} className={`inline-flex items-center justify-center w-8 h-8 rounded font-fantasy font-bold text-sm ${
                        roll === parseInt(group.formula.split('d')[1]) 
                          ? 'bg-forest-green/80 text-parchment-light border border-forest-green' 
                          : roll === 1 
                            ? 'bg-blood-red/80 text-parchment-light border border-blood-red'
                            : 'bg-fantasy-bronze/60 text-parchment-light border border-fantasy-bronze/50'
                      }`}>
                        {roll}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {diceResult.modifier !== 0 && (
                <div className="bg-black/30 rounded border border-amber-700/30 p-2">
                  <span className="text-amber-400 font-fantasy font-semibold text-sm">
                    Modifier: {diceResult.modifier > 0 ? '+' : ''}{diceResult.modifier}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Roll Actions */}
        <div className="flex gap-3 justify-center mt-4">
          <button 
            onClick={rollDice} 
            className={`bg-forest-green/80 hover:bg-forest-green/90 text-parchment-light px-6 py-3 rounded-lg border border-forest-green/50 font-fantasy font-bold transition-all duration-200 ${
              isRolling ? 'animate-pulse cursor-not-allowed opacity-75' : 'hover:scale-105'
            }`}
            disabled={isRolling}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </button>
          
          <button 
            onClick={() => {
              setDiceResult(null);
              setShowAverage(true);
            }}
            className="bg-ocean-blue/80 hover:bg-ocean-blue/90 text-parchment-light px-6 py-3 rounded-lg border border-ocean-blue/50 font-fantasy font-bold transition-all duration-200 hover:scale-105"
          >
            Show Average
          </button>
        </div>
      </div>
        
      {/* Dice History */}
      {diceHistory.length > 0 && (
        <div className="bg-black/30 backdrop-blur-md rounded-lg border border-amber-700/30 p-4">
          <h4 className="text-amber-400 font-fantasy font-bold mb-3 border-b border-amber-700/30 pb-2">Recent Rolls</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {diceHistory.map((result, index) => (
              <div key={index} className="bg-black/20 rounded border border-amber-700/20 p-2 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-amber-100 font-fantasy font-bold text-lg">{result.total}</span>
                  <span className="text-amber-300/70 font-fantasy text-sm">
                    {result.groupRolls.map(g => g.formula).join(' + ')}
                    {result.modifier !== 0 && `${result.modifier > 0 ? ' + ' : ' - '}${Math.abs(result.modifier)}`}
                  </span>
                </div>
                <span className="text-amber-400/60 font-fantasy text-xs">
                  {result.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedDiceRoller;