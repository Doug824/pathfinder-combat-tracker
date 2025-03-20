import React, { useState, useEffect } from 'react';

const CombatStatsCalculator = ({ baseStats, buffs }) => {
    const [finalStats, setFinalStats] = useState({...baseStats});
    const [derived, setDerived] = useState({
        ac: 10,
        fortitudeSave: 0,
        reflexSave: 0,
        willSave: 0,
        baseAttackBonus: 0
    });

    // Calculate modifiers
    const getModifier = (score) => Math.floor((score - 10) / 2);

    useEffect(() => {
        // Calculate stats with all buffs applied
        const calculatedStats = {...baseStats};
    
        // Apply all buffs to the base stats
        buffs.forEach(buff => {
            Object.entries(buff.effects).forEach(([stat, value]) => {
                if (calculatedStats[stat] !== undefined) {
                    calculatedStats[stat] += value;
                }
            });
        });

        setFinalStats(calculatedStats);
        // Calculate derived stats
        setDerived({
            ac: 10 + getModifier(calculatedStats.dexterity),
            fortitudeSave: getModifier(calculatedStats.constitution),
            reflexSave: getModifier(calculatedStats.dexterity),
            willSave: getModifier(calculatedStats.wisdom),
            baseAttackBonus: 0 // This would come from character class/level
        });
    }, [baseStats, buffs]);

    return (
        <div className="combat-stats">
            <h2>Combat Statistics</h2>
            <div className="final-attributes">
                <h3>Final Attributes (with buffs)</h3>
                {Object.entries(finalStats).map(([stat, value]) => (
                    <div key={stat} className="stat-display">
                        <span className="stat-name">{stat.charAt(0).toUpperCase() + stat.slice(1)}:</span>
                        <span className="stat-value">{value}</span>
                        <span className="modifier">(Mod: {getModifier(value) >= 0 ? '+' : ''}{getModifier(value)})</span>
                    </div>
                ))}
            </div>
            <div className="derived-stats">
                <h3>Combat Values</h3>
                <div className="stat-display">
                    <span className="stat-name">Armor Class:</span>
                    <span className="stat-value">{derived.ac}</span>
                </div>
                <div className="stat-display">
                    <span className="stat-name">Fortitude Save:</span>
                    <span className="stat-value">{derived.fortitudeSave >= 0 ? '+' : ''}{derived.fortitudeSave}</span>
                </div>
                <div className="stat-display">
                    <span className="stat-name">Reflex Save:</span>
                    <span className="stat-value">{derived.reflexSave >= 0 ? '+' : ''}{derived.reflexSave}</span>
                </div>
                <div className="stat-display">
                    <span className="stat-name">Will Save:</span>
                    <span className="stat-value">{derived.willSave >= 0 ? '+' : ''}{derived.willSave}</span>
                </div>
                <div className="stat-display">
                    <span className="stat-name">Base Attack Bonus:</span>
                    <span className="stat-value">{derived.baseAttackBonus >= 0 ? '+' : ''}{derived.baseAttackBonus}</span>
                </div>
            </div>
        </div>
    );
};

export default CombatStatsCalculator;