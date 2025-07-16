
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
    <div className="animated-dice-roller">
      <div className="dice-form">
        <h3 className="dice-form-title">Dice Roller</h3>
        
        {/* Dice Groups */}
        {diceGroups.map((group) => (
          <div key={group.id} className="dice-group">
            <div className="dice-group-content">
              <div className="dice-count">
                <label htmlFor={`dice-count-${group.id}`}>Dice</label>
                <input
                  id={`dice-count-${group.id}`}
                  type="number"
                  min="1"
                  max="20"
                  value={group.count}
                  onChange={(e) => updateDiceGroup(group.id, 'count', e.target.value)}
                  className="dice-input"
                />
              </div>
              
              <div className="dice-type">
                <label htmlFor={`dice-type-${group.id}`}>Type</label>
                <select
                  id={`dice-type-${group.id}`}
                  value={group.type}
                  onChange={(e) => updateDiceGroup(group.id, 'type', e.target.value)}
                  className="dice-select"
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
                className="remove-dice-btn"
                aria-label="Remove dice"
              >
                −
              </button>
            </div>
          </div>
        ))}
        
        {/* Add Dice Button */}
        <button
          type="button"
          onClick={addDiceGroup}
          className="add-dice-btn"
        >
          + Add Dice
        </button>
        
        {/* Modifier */}
        <div className="dice-modifier">
          <label htmlFor="dice-modifier">Damage Modifier:</label>
          <input
            id="dice-modifier"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(e.target.value)}
            className="modifier-input"
          />
          <span className="modifier-source">
            (From character damage bonus)
          </span>
        </div>
        
        {/* Dice Display */}
        <div className="dice-display">
          <div className="dice-formula">
            {getDiceFormula()}
          </div>
          
          {showAverage && (
            <div className="dice-result">
              <span className="result-label">Average:</span>
              <span className="result-value">{calculateAverageDice().toFixed(1)}</span>
            </div>
          )}
          
          {diceResult && !showAverage && (
            <div className={`dice-result ${isRolling ? 'dice-rolling' : ''}`}>
              <span className="result-label">Roll Result:</span>
              <span className="result-value">{diceResult.total}</span>
              <div className="individual-rolls">
                {diceResult.groupRolls.map((group, groupIndex) => (
                  <div key={groupIndex} className="dice-group-result">
                    <span className="dice-group-formula">{group.formula}:</span> 
                    <span className="dice-group-values">
                      {group.rolls.map((roll, i) => (
                        <span key={i} className={`individual-die ${roll === parseInt(group.type) ? 'max-roll' : (roll === 1 ? 'min-roll' : '')}`}>
                          {roll}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
                {diceResult.modifier !== 0 && (
                  <div className="damage-modifier-result">
                    <span>Modifier: {diceResult.modifier > 0 ? '+' : ''}{diceResult.modifier}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Roll Actions */}
        <div className="dice-actions">
          <button 
            onClick={rollDice} 
            className={`roll-button ${isRolling ? 'rolling' : ''}`}
            disabled={isRolling}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </button>
          
          <button 
            onClick={() => {
              setDiceResult(null);
              setShowAverage(true);
            }}
            className="average-button"
          >
            Show Average
          </button>
        </div>
        
        {/* Dice History */}
        {diceHistory.length > 0 && (
          <div className="dice-history">
            <h4>Recent Rolls</h4>
            <div className="history-list">
              {diceHistory.map((result, index) => (
                <div key={index} className="history-item">
                  <div className="history-result">
                    <span className="history-value">{result.total}</span>
                    <span className="history-formula">
                      {result.groupRolls.map(g => g.formula).join(' + ')}
                      {result.modifier !== 0 && `${result.modifier > 0 ? ' + ' : ' - '}${Math.abs(result.modifier)}`}
                    </span>
                  </div>
                  <span className="history-time">
                    {result.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedDiceRoller;