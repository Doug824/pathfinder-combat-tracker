import React, { useState } from 'react';
import './BuffLibrary.css';

const BuffLibrary = ({ savedBuffs, activeBuffs, onApplyBuff, onRemoveBuff, onDeleteSavedBuff, onCreateBuffPackage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreatePackage, setShowCreatePackage] = useState(false);
  const [newPackageName, setNewPackageName] = useState('');
  const [selectedBuffsForPackage, setSelectedBuffsForPackage] = useState([]);
  
  // Extract unique categories from savedBuffs
  const categories = ['all', ...new Set(savedBuffs.map(buff => buff.category))];
  
  // Filter buffs based on search and category
  const filteredBuffs = savedBuffs.filter(buff => {
    const matchesSearch = buff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          buff.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || buff.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Get all buff packages
  const buffPackages = savedBuffs.filter(buff => buff.isPackage);
  
  // Check if a buff is currently active
  const isBuffActive = (buffId) => {
    return activeBuffs.some(activeBuff => activeBuff.originId === buffId);
  };
  
  // Handle applying a buff from the library
  const handleApplyBuff = (buff) => {
    if (buff.isPackage) {
      // If it's a package, apply all buffs in the package
      buff.buffs.forEach(packageBuff => {
        onApplyBuff({...packageBuff, originId: packageBuff.id});
      });
    } else {
      // Apply a single buff
      onApplyBuff({...buff, originId: buff.id});
    }
  };
  
  // Handle removing an active buff
  const handleRemoveBuff = (buffId) => {
    onRemoveBuff(buffId);
  };
  
  // Toggle buff selection for package creation
  const toggleBuffForPackage = (buffId) => {
    if (selectedBuffsForPackage.includes(buffId)) {
      setSelectedBuffsForPackage(selectedBuffsForPackage.filter(id => id !== buffId));
    } else {
      setSelectedBuffsForPackage([...selectedBuffsForPackage, buffId]);
    }
  };
  
  // Create a new buff package
  const handleCreatePackage = () => {
    if (newPackageName.trim() === '' || selectedBuffsForPackage.length === 0) return;
    
    const buffsInPackage = savedBuffs.filter(buff => 
      selectedBuffsForPackage.includes(buff.id) && !buff.isPackage
    );
    
    const newPackage = {
      id: `package-${Date.now()}`,
      name: newPackageName,
      description: `Package of ${buffsInPackage.length} buffs`,
      category: 'Package',
      isPackage: true,
      buffs: buffsInPackage
    };
    
    onCreateBuffPackage(newPackage);
    
    // Reset package creation state
    setNewPackageName('');
    setSelectedBuffsForPackage([]);
    setShowCreatePackage(false);
  };
  
  return (
    <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Buff Library</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search buffs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-fantasy w-full"
            />
          </div>
          
          <div className="min-w-[150px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-fantasy w-full"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className={`px-4 py-2 rounded-lg border font-fantasy font-semibold transition-all duration-200 ${
              showCreatePackage
                ? 'bg-red-700/80 hover:bg-red-600/90 text-red-100 border-red-600/50'
                : 'bg-amber-700/80 hover:bg-amber-600/90 text-amber-100 border-amber-600/50'
            }`}
            onClick={() => setShowCreatePackage(!showCreatePackage)}
          >
            {showCreatePackage ? 'Cancel Package' : 'Create Package'}
          </button>
        </div>
      </div>
      
      {/* Package creation UI */}
      {showCreatePackage && (
        <div className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4 mb-6">
          <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Create Buff Package</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-amber-300 font-fantasy font-semibold">Package Name</label>
              <input
                type="text"
                placeholder="Package Name"
                value={newPackageName}
                onChange={(e) => setNewPackageName(e.target.value)}
                className="input-fantasy w-full"
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-fantasy font-bold text-amber-400">Select Buffs for Package</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {savedBuffs.filter(buff => !buff.isPackage).map(buff => (
                  <label key={buff.id} className="flex items-center gap-2 bg-black/30 rounded border border-amber-700/20 p-2 cursor-pointer hover:bg-black/50 transition-all duration-200">
                    <input
                      type="checkbox"
                      checked={selectedBuffsForPackage.includes(buff.id)}
                      onChange={() => toggleBuffForPackage(buff.id)}
                      className="w-4 h-4 text-amber-600 bg-black/60 border-amber-700 rounded focus:ring-amber-500"
                    />
                    <span className="text-amber-200 font-fantasy">{buff.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <button 
              className="bg-emerald-700/80 hover:bg-emerald-600/90 text-emerald-100 px-6 py-2 rounded-lg border border-emerald-600/50 font-fantasy font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCreatePackage}
              disabled={newPackageName.trim() === '' || selectedBuffsForPackage.length === 0}
            >
              Save Package
            </button>
          </div>
        </div>
      )}
      
      {/* Buff Packages Section */}
      {buffPackages.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Buff Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buffPackages.map(pkg => (
              <div key={pkg.id} className="bg-black/40 backdrop-blur-md rounded-lg border border-amber-700/30 p-4 hover:bg-black/60 transition-all duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-fantasy font-bold text-amber-300">{pkg.name}</h4>
                  <button 
                    className="text-red-400 hover:text-red-300 w-6 h-6 rounded-full hover:bg-red-900/50 transition-all duration-200 flex items-center justify-center"
                    onClick={() => onDeleteSavedBuff(pkg.id)}
                  >
                    ×
                  </button>
                </div>
                <p className="text-amber-200/80 text-sm mb-3">{pkg.description}</p>
                <div className="mb-4">
                  <h5 className="text-amber-400 font-fantasy font-semibold mb-2">Contains:</h5>
                  <div className="space-y-1">
                    {pkg.buffs.map(buff => (
                      <div key={buff.id} className="bg-black/30 rounded px-2 py-1 text-amber-200 text-sm">
                        {buff.name}
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  className="w-full bg-emerald-700/80 hover:bg-emerald-600/90 text-emerald-100 px-4 py-2 rounded-lg border border-emerald-600/50 font-fantasy font-semibold transition-all duration-200"
                  onClick={() => handleApplyBuff(pkg)}
                >
                  Apply All Buffs
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Individual Buffs Section */}
      <div>
        <h3 className="text-xl font-fantasy font-bold text-amber-400 mb-4 border-b border-amber-700/30 pb-2">Saved Buffs</h3>
        {filteredBuffs.length === 0 ? (
          <p className="text-amber-200/70 text-center py-8">No saved buffs match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuffs.filter(buff => !buff.isPackage).map(buff => {
              const isActive = isBuffActive(buff.id);
              
              return (
                <div 
                  key={buff.id} 
                  className={`bg-black/40 backdrop-blur-md rounded-lg border p-4 hover:bg-black/60 transition-all duration-200 ${
                    isActive 
                      ? 'border-emerald-600/50 bg-emerald-900/20' 
                      : 'border-amber-700/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className={`text-lg font-fantasy font-bold ${
                      isActive ? 'text-emerald-300' : 'text-amber-300'
                    }`}>{buff.name}</h4>
                    <button 
                      className="text-red-400 hover:text-red-300 w-6 h-6 rounded-full hover:bg-red-900/50 transition-all duration-200 flex items-center justify-center"
                      onClick={() => onDeleteSavedBuff(buff.id)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bg-amber-700/30 border border-amber-600/50 rounded px-2 py-1 text-amber-200 text-xs font-fantasy">
                      Type: {buff.bonusType}
                    </span>
                    <span className="bg-blue-700/30 border border-blue-600/50 rounded px-2 py-1 text-blue-200 text-xs font-fantasy">
                      Duration: {buff.duration} {buff.durationType}
                    </span>
                  </div>
                  
                  <p className="text-amber-200/80 text-sm mb-3">{buff.description || 'No description'}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(buff.effects)
                      .filter(([_, value]) => value !== 0)
                      .map(([stat, value]) => (
                        <span key={stat} className={`px-2 py-1 rounded text-xs font-fantasy font-semibold ${
                          value > 0 
                            ? 'bg-emerald-700/40 border border-emerald-600/50 text-emerald-200' 
                            : 'bg-red-700/40 border border-red-600/50 text-red-200'
                        }`}>
                          {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value > 0 ? '+' : ''}{value}
                        </span>
                      ))}
                  </div>
                  
                  {showCreatePackage ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBuffsForPackage.includes(buff.id)}
                        onChange={() => toggleBuffForPackage(buff.id)}
                        className="w-4 h-4 text-amber-600 bg-black/60 border-amber-700 rounded focus:ring-amber-500"
                      />
                      <span className="text-amber-200 font-fantasy">Add to Package</span>
                    </label>
                  ) : (
                    <div>
                      {!isActive ? (
                        <button 
                          className="w-full bg-emerald-700/80 hover:bg-emerald-600/90 text-emerald-100 px-4 py-2 rounded-lg border border-emerald-600/50 font-fantasy font-semibold transition-all duration-200"
                          onClick={() => handleApplyBuff(buff)}
                        >
                          Apply Buff
                        </button>
                      ) : (
                        <button 
                          className="w-full bg-red-700/80 hover:bg-red-600/90 text-red-100 px-4 py-2 rounded-lg border border-red-600/50 font-fantasy font-semibold transition-all duration-200"
                          onClick={() => handleRemoveBuff(buff.id)}
                        >
                          Remove Buff
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuffLibrary;