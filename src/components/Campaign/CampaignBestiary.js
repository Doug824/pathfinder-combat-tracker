import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { bestiaryService } from '../../services/bestiaryService';
import { campaignService } from '../../services/campaignService';
import PDFUploader from './PDFUploader';
import CreatureCard from './CreatureCard';
import CreatureEditor from './CreatureEditor';
import TemplateManager from './TemplateManager';
import OrnatePanel, { OrnateButton } from '../OrnatePanel';

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
      <OrnatePanel variant="default" className="py-16">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-fantasy-bronze/30 border-t-fantasy-gold rounded-full animate-spin mb-4"></div>
          <p className="text-fantasy-gold text-lg font-fantasy uppercase tracking-wider">Loading bestiary...</p>
        </div>
      </OrnatePanel>
    );
  }

  if (error) {
    return (
      <OrnatePanel variant="dark" className="py-16">
        <div className="flex flex-col items-center justify-center">
          <p className="text-red-400 mb-4">{error}</p>
          <OrnateButton
            onClick={loadCreatures}
            variant="primary"
            icon="🔄"
          >
            Try Again
          </OrnateButton>
        </div>
      </OrnatePanel>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-fantasy font-bold text-fantasy-gold uppercase tracking-wider mb-2 drop-shadow-lg">Campaign Bestiary</h2>
          <p className="text-parchment-dark text-lg">{creatures.length} creatures in your collection</p>
        </div>
        
        {isDM && (
          <div className="flex flex-wrap gap-3">
            <OrnateButton
              variant="primary"
              onClick={() => setShowEditor(true)}
              icon="➕"
            >
              Add Creature
            </OrnateButton>
            <OrnateButton
              variant="secondary"
              onClick={() => setShowUploader(true)}
              icon="📄"
            >
              Upload PDF
            </OrnateButton>
            <OrnateButton
              variant="secondary"
              onClick={() => setShowTemplateManager(true)}
              icon="🔧"
            >
              Templates
            </OrnateButton>
          </div>
        )}
      </div>

      {/* Filters */}
      <OrnatePanel variant="default" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-parchment-dark font-fantasy uppercase tracking-wider text-sm mb-2">Search</label>
            <input
              type="text"
              placeholder="Search creatures..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full bg-black/60 border-2 border-fantasy-bronze/50 rounded px-4 py-2 text-fantasy-gold focus:border-fantasy-gold focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-parchment-dark font-fantasy uppercase tracking-wider text-sm mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full bg-black/60 border-2 border-fantasy-bronze/50 rounded px-4 py-2 text-fantasy-gold focus:border-fantasy-gold focus:outline-none"
            >
              <option value="">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-parchment-dark font-fantasy uppercase tracking-wider text-sm mb-2">Challenge Rating</label>
            <select
              value={filters.cr}
              onChange={(e) => handleFilterChange('cr', e.target.value)}
              className="w-full bg-black/60 border-2 border-fantasy-bronze/50 rounded px-4 py-2 text-fantasy-gold focus:border-fantasy-gold focus:outline-none"
            >
              <option value="">All CRs</option>
              {getUniqueCRs().map(cr => (
                <option key={cr} value={cr}>CR {cr}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-parchment-dark font-fantasy uppercase tracking-wider text-sm mb-2">Tags</label>
            <select
              value={filters.tags}
              onChange={(e) => handleFilterChange('tags', e.target.value)}
              className="w-full bg-black/60 border-2 border-fantasy-bronze/50 rounded px-4 py-2 text-fantasy-gold focus:border-fantasy-gold focus:outline-none"
            >
              <option value="">All Tags</option>
              {getUniqueTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <div>
            <OrnateButton
              variant="secondary"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </OrnateButton>
          </div>
        </div>
      </OrnatePanel>

      {/* Creatures Grid */}
      <div className="min-h-96">
        {filteredCreatures.length === 0 ? (
          <OrnatePanel variant="default" className="text-center py-16">
            <div className="text-8xl mb-6">🐉</div>
            <h3 className="text-3xl font-fantasy font-bold text-fantasy-gold mb-4 uppercase tracking-wider">No creatures found</h3>
            <p className="text-parchment-dark text-lg">
              {creatures.length === 0 
                ? isDM 
                  ? "Upload a PDF or manually add creatures to build your bestiary"
                  : "The DM hasn't added any creatures yet"
                : "No creatures match your current filters"
              }
            </p>
          </OrnatePanel>
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