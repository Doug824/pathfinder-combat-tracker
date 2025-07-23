import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { bestiaryService } from '../../services/bestiaryService';
import { campaignService } from '../../services/campaignService';
import PDFUploader from './PDFUploader';
import CreatureCard from './CreatureCard';
import CreatureEditor from './CreatureEditor';
import TemplateManager from './TemplateManager';

const CampaignBestiary = ({ campaign }) => {
  const { currentUser } = useFirebaseAuth();
  const [creatures, setCreatures] = useState([]);
  const [filteredCreatures, setFilteredCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCreature, setEditingCreature] = useState(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    cr: '',
    tags: ''
  });

  const userRole = campaignService.getUserRole(campaign, currentUser.uid);
  const isDM = userRole === 'dm';

  // Load creatures
  useEffect(() => {
    if (campaign) {
      loadCreatures();
    }
  }, [campaign]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [creatures, filters]);

  const loadCreatures = async () => {
    try {
      setLoading(true);
      setError(null);
      const campaignCreatures = await bestiaryService.getCampaignCreatures(campaign.id);
      setCreatures(campaignCreatures);
    } catch (err) {
      setError('Failed to load creatures');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...creatures];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(creature => 
        creature.name.toLowerCase().includes(searchLower) ||
        creature.type?.toLowerCase().includes(searchLower) ||
        creature.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(creature => creature.type === filters.type);
    }

    // Challenge rating filter
    if (filters.cr) {
      filtered = filtered.filter(creature => creature.challenge_rating === filters.cr);
    }

    // Tags filter
    if (filters.tags) {
      filtered = filtered.filter(creature => 
        creature.tags?.includes(filters.tags)
      );
    }

    setFilteredCreatures(filtered);
  };

  const handleUploadComplete = (results) => {
    if (results.creatures && results.creatures.length > 0) {
      setCreatures(prev => [...prev, ...results.creatures]);
    }
    setShowUploader(false);
  };

  const handleEditCreature = (creature) => {
    setEditingCreature(creature);
    setShowEditor(true);
  };

  const handleDeleteCreature = async (creatureId) => {
    if (window.confirm('Are you sure you want to delete this creature?')) {
      try {
        await bestiaryService.deleteCreature(campaign.id, creatureId);
        setCreatures(prev => prev.filter(c => c.id !== creatureId));
      } catch (err) {
        alert('Failed to delete creature');
      }
    }
  };

  const handleSaveCreature = async (creatureData) => {
    try {
      if (editingCreature) {
        // Update existing creature
        await bestiaryService.updateCreature(campaign.id, editingCreature.id, creatureData);
        setCreatures(prev => prev.map(c => 
          c.id === editingCreature.id ? { ...c, ...creatureData } : c
        ));
      } else {
        // Add new creature
        const newCreature = await bestiaryService.addCreature(campaign.id, creatureData, currentUser.uid);
        setCreatures(prev => [...prev, newCreature]);
      }
      setShowEditor(false);
      setEditingCreature(null);
    } catch (err) {
      throw err;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      cr: '',
      tags: ''
    });
  };

  const getUniqueTypes = () => {
    const types = creatures.map(c => c.type).filter(Boolean);
    return [...new Set(types)].sort();
  };

  const getUniqueCRs = () => {
    const crs = creatures.map(c => c.challenge_rating).filter(Boolean);
    return [...new Set(crs)].sort((a, b) => {
      const aNum = bestiaryService.parseChallengeRating(a);
      const bNum = bestiaryService.parseChallengeRating(b);
      return aNum - bNum;
    });
  };

  const getUniqueTags = () => {
    const tags = creatures.flatMap(c => c.tags || []);
    return [...new Set(tags)].sort();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-amber-700/30 border-t-amber-400 rounded-full animate-spin mb-4"></div>
        <p className="text-amber-300 text-lg font-fantasy">Loading bestiary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-red-300 mb-4">{error}</p>
        <button 
          onClick={loadCreatures}
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-fantasy font-semibold transition-all duration-300 transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-fantasy font-bold text-amber-400 glow-text mb-2">Campaign Bestiary</h2>
          <p className="text-amber-300 text-lg">{creatures.length} creatures in your collection</p>
        </div>
        
        {isDM && (
          <div className="flex flex-wrap gap-3">
            <button 
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowEditor(true)}
            >
              ➕ Add Creature
            </button>
            <button 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowUploader(true)}
            >
              📄 Upload PDF
            </button>
            <button 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowTemplateManager(true)}
            >
              🔧 Templates
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-black/30 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-amber-300 font-semibold mb-2">Search</label>
            <input
              type="text"
              placeholder="Search creatures..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-fantasy w-full"
            />
          </div>
          
          <div>
            <label className="block text-amber-300 font-semibold mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-fantasy w-full"
            >
              <option value="">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-amber-300 font-semibold mb-2">Challenge Rating</label>
            <select
              value={filters.cr}
              onChange={(e) => handleFilterChange('cr', e.target.value)}
              className="input-fantasy w-full"
            >
              <option value="">All CRs</option>
              {getUniqueCRs().map(cr => (
                <option key={cr} value={cr}>CR {cr}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-amber-300 font-semibold mb-2">Tags</label>
            <select
              value={filters.tags}
              onChange={(e) => handleFilterChange('tags', e.target.value)}
              className="input-fantasy w-full"
            >
              <option value="">All Tags</option>
              {getUniqueTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <div>
            <button 
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg font-fantasy font-semibold transition-all duration-300 w-full"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Creatures Grid */}
      <div className="min-h-96">
        {filteredCreatures.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6 text-amber-400">🐉</div>
            <h3 className="text-3xl font-fantasy font-bold text-amber-400 mb-4">No creatures found</h3>
            <p className="text-amber-300 text-lg">
              {creatures.length === 0 
                ? isDM 
                  ? "Upload a PDF or manually add creatures to build your bestiary"
                  : "The DM hasn't added any creatures yet"
                : "No creatures match your current filters"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCreatures.map(creature => (
              <CreatureCard
                key={creature.id}
                creature={creature}
                userRole={userRole}
                onEdit={handleEditCreature}
                onDelete={handleDeleteCreature}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploader && (
        <PDFUploader
          campaign={campaign}
          currentUser={currentUser}
          onUploadComplete={handleUploadComplete}
          onClose={() => setShowUploader(false)}
        />
      )}

      {showEditor && (
        <CreatureEditor
          creature={editingCreature}
          onSave={handleSaveCreature}
          onClose={() => {
            setShowEditor(false);
            setEditingCreature(null);
          }}
        />
      )}

      {showTemplateManager && (
        <TemplateManager
          campaign={campaign}
          onClose={() => setShowTemplateManager(false)}
          onCreatureCreated={loadCreatures}
        />
      )}
    </div>
  );
};

export default CampaignBestiary;