import React, { useState } from 'react';

const BuffTracker = ({ onBuffsChange }) => {
    const [buffs, setBuffs] = useState([]);
    const [newBuff, setNewBuff] = useState({
        name: '',
        duration: 1,
        effects: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 }
    });

    const handleAddBuff = () => {
        if (newBuff.name.trim() === '') return;
    
        const updatedBuffs = [...buffs, { ...newBuff, id: Date.now() }];
        setBuffs(updatedBuffs);
        onBuffsChange(updatedBuffs);
    
        // Reset form
        setNewBuff({
            name: '',
            duration: 1,
            effects: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 }
        });
    };

    const handleRemoveBuff = (buffId) => {
        const updatedBuffs = buffs.filter(buff => buff.id !== buffId);
        setBuffs(updatedBuffs);
        onBuffsChange(updatedBuffs);
    };

    const handleBuffChange = (field, value) => {
        setNewBuff(prev => ({ ...prev, [field]: value }));
    };

    const handleEffectChange = (stat, value) => {
        setNewBuff(prev => ({
            ...prev,
            effects: {
                ...prev.effects,
                [stat]: parseInt(value) || 0
            }
        }));
    };

    return (
        <div className="buff-tracker">
            <h2>Active Buffs & Effects</h2>

            <div className="active-buffs">
                {buffs.length === 0 ? (
                    <p>No active buffs</p>
                ) : (
                    buffs.map(buff => (
                        <div key={buff.id} className="buff-card">
                            <h3>{buff.name}</h3>
                            <p>Duration: {buff.duration} rounds</p>
                            <div className="buff-effects">
                                {Object.entries(buff.effects)
                                .filter(([_, value]) => value !== 0)
                                .map(([stat, value]) => (
                                    <p key={stat}>
                                        {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value > 0 ? '+' : ''}{value}
                                    </p>
                                ))}
                            </div>
                            <button onClick={() => handleRemoveBuff(buff.id)}>Remove</button>
                        </div>
                    ))
                    )}
            </div>
            <div className="new-buff-form">
                <h3>Add New Buff</h3>
                <div>
                    <label>Name:</label>
                    <input 
                        type="text" 
                        value={newBuff.name}
                        onChange={(e) => handleBuffChange('name', e.target.value)}
                    />
                </div>
                <div>
                    <label>Duration (rounds):</label>
                    <input 
                        type="number" 
                        min="1"
                        value={newBuff.duration}
                        onChange={(e) => handleBuffChange('duration', parseInt(e.target.value))}
                    />
                </div>
                <div className="stat-effects">
                    <h4>Stat Bonuses/Penalties</h4>
                    {Object.keys(newBuff.effects).map(stat => (
                        <div key={stat}>
                            <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                            <input 
                                type="number" 
                                value={newBuff.effects[stat]}
                                onChange={(e) => handleEffectChange(stat, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
                <button onClick={handleAddBuff}>Add Buff</button>
            </div>
        </div>
    );
};

export default BuffTracker;