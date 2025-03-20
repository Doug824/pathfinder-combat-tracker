import React, { useState } from 'react';

const BuffTracker = ({ onBuffsChange }) => {
    const [buffs, setBuffs] = useState([]);
    const [newBuff, setNewBuff] = useState({
        name: '',
        duration: 1,
        durationType: 'rounds', // New property to track duration type
        effects: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 }
    });

    // Duration type options for the dropdown
    const durationTypes = [
        { value: 'rounds', label: 'Rounds' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'permanent', label: 'Permanent' }
    ];

    const handleAddBuff = () => {
        if (newBuff.name.trim() === '') return;
    
        // Create a copy of the buff with a unique ID
        const buffToAdd = { 
            ...newBuff, 
            id: Date.now(),
            // Set duration to null if permanent
        duration: newBuff.durationType === 'permanent' ? null : newBuff.duration 
        };
    
        const updatedBuffs = [...buffs, buffToAdd];
        setBuffs(updatedBuffs);
        onBuffsChange(updatedBuffs);
    
        // Reset form
        setNewBuff({
            name: '',
            duration: 1,
            durationType: 'rounds',
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

    // Format the duration for display
    const formatDuration = (buff) => {
        if (buff.durationType === 'permanent' || buff.duration === null) {
            return 'Permanent';
        }
        return `${buff.duration} ${buff.durationType}`;
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
                            <p>Duration: {formatDuration(buff)}</p>
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
            <div className="duration-container">
                <label>Duration:</label>
                {newBuff.durationType !== 'permanent' && (
                    <input 
                        type="number" 
                        min="1"
                        value={newBuff.duration}
                        onChange={(e) => handleBuffChange('duration', parseInt(e.target.value))}
                        className="duration-input"
                    />
                )}

                <select
                    value={newBuff.durationType}
                    onChange={(e) => handleBuffChange('durationType', e.target.value)}
                    className="duration-type-select"
                >
                    {durationTypes.map(type => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="stat-effects">
                <h4>Stat Bonuses/Penalties</h4>
                {Object.keys(newBuff.effects).map(stat => (
                    <div key={stat} className="stat-effect-row">
                        <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}:</label>
                        <input 
                            type="number" 
                        value={newBuff.effects[stat]}
                        onChange={(e) => handleEffectChange(stat, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            <button onClick={handleAddBuff} className="add-buff-button">Add Buff</button>
            </div>
        </div>
    );
};

export default BuffTracker;