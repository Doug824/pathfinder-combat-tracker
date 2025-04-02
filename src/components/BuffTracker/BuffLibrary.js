import React, { useState } from 'react';

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
    <div className="buff-library">
      <div className="buff-library-header">
        <h2>Buff Library</h2>
        <div className="buff-library-controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search buffs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className="create-package-btn"
            onClick={() => setShowCreatePackage(!showCreatePackage)}
          >
            {showCreatePackage ? 'Cancel Package' : 'Create Package'}
          </button>
        </div>
      </div>
      
      {/* Package creation UI */}
      {showCreatePackage && (
        <div className="create-package-container">
          <h3>Create Buff Package</h3>
          <div className="package-form">
            <input
              type="text"
              placeholder="Package Name"
              value={newPackageName}
              onChange={(e) => setNewPackageName(e.target.value)}
              className="form-control"
            />
            
            <div className="package-buffs-list">
              <h4>Select Buffs for Package</h4>
              {savedBuffs.filter(buff => !buff.isPackage).map(buff => (
                <div key={buff.id} className="package-buff-select">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedBuffsForPackage.includes(buff.id)}
                      onChange={() => toggleBuffForPackage(buff.id)}
                    />
                    {buff.name}
                  </label>
                </div>
              ))}
            </div>
            
            <button 
              className="save-package-btn"
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
        <div className="buff-packages">
          <h3>Buff Packages</h3>
          <div className="buff-grid">
            {buffPackages.map(pkg => (
              <div key={pkg.id} className="buff-package-card">
                <div className="buff-package-header">
                  <h4>{pkg.name}</h4>
                  <button 
                    className="delete-buff-btn"
                    onClick={() => onDeleteSavedBuff(pkg.id)}
                  >
                    ×
                  </button>
                </div>
                <p className="buff-description">{pkg.description}</p>
                <div className="package-contents">
                  <h5>Contains:</h5>
                  <ul className="package-buffs">
                    {pkg.buffs.map(buff => (
                      <li key={buff.id}>{buff.name}</li>
                    ))}
                  </ul>
                </div>
                <button 
                  className="apply-package-btn"
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
      <div className="saved-buffs">
        <h3>Saved Buffs</h3>
        {filteredBuffs.length === 0 ? (
          <p className="no-buffs-message">No saved buffs match your search.</p>
        ) : (
          <div className="buff-grid">
            {filteredBuffs.filter(buff => !buff.isPackage).map(buff => {
              const isActive = isBuffActive(buff.id);
              
              return (
                <div 
                  key={buff.id} 
                  className={`saved-buff-card ${isActive ? 'active' : ''}`}
                >
                  <div className="buff-card-header">
                    <h4>{buff.name}</h4>
                    <button 
                      className="delete-buff-btn"
                      onClick={() => onDeleteSavedBuff(buff.id)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="buff-meta">
                    <span>Type: {buff.bonusType}</span>
                    <span>Duration: {buff.duration} {buff.durationType}</span>
                  </div>
                  
                  <p className="buff-description">{buff.description || 'No description'}</p>
                  
                  <div className="buff-effects">
                    {Object.entries(buff.effects)
                      .filter(([_, value]) => value !== 0)
                      .map(([stat, value]) => (
                        <span key={stat} className="buff-effect">
                          {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value > 0 ? '+' : ''}{value}
                        </span>
                      ))}
                  </div>
                  
                  {showCreatePackage ? (
                    <label className="package-selection">
                      <input
                        type="checkbox"
                        checked={selectedBuffsForPackage.includes(buff.id)}
                        onChange={() => toggleBuffForPackage(buff.id)}
                      />
                      Add to Package
                    </label>
                  ) : (
                    <div className="buff-actions">
                      {!isActive ? (
                        <button 
                          className="apply-buff-btn"
                          onClick={() => handleApplyBuff(buff)}
                        >
                          Apply Buff
                        </button>
                      ) : (
                        <button 
                          className="remove-buff-btn"
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