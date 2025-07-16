import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { bestiaryService } from '../../services/bestiaryService';
import { campaignService } from '../../services/campaignService';
import PDFUploader from './PDFUploader';
import CreatureCard from './CreatureCard';
import CreatureEditor from './CreatureEditor';
import './Campaign.css';

const CampaignBestiary = ({ campaign }) => {
  const { currentUser } = useFirebaseAuth();
  const [creatures, setCreatures] = useState([]);
  const [filteredCreatures, setFilteredCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCreature, setEditingCreature] = useState(null);
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
      console.error('Error loading creatures:', err);
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
        console.error('Error deleting creature:', err);
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
      console.error('Error saving creature:', err);
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
      <div className="bestiary-loading">
        <div className="spinner"></div>
        <p>Loading bestiary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bestiary-error">
        <p>{error}</p>
        <button onClick={loadCreatures}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="campaign-bestiary">
      <div className="bestiary-header">
        <div className="header-content">
          <h2>Campaign Bestiary</h2>
          <p>{creatures.length} creatures in your collection</p>
        </div>
        
        {isDM && (
          <div className="header-actions">
            <button 
              className="add-creature-button"
              onClick={() => setShowEditor(true)}
            >
              ➕ Add Creature
            </button>
            <button 
              className="upload-pdf-button"
              onClick={() => setShowUploader(true)}
            >
              📄 Upload PDF
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bestiary-filters">
        <div className="filters-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search creatures..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filters.cr}
              onChange={(e) => handleFilterChange('cr', e.target.value)}
            >
              <option value="">All CRs</option>
              {getUniqueCRs().map(cr => (
                <option key={cr} value={cr}>CR {cr}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <select
              value={filters.tags}
              onChange={(e) => handleFilterChange('tags', e.target.value)}
            >
              <option value="">All Tags</option>
              {getUniqueTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          
          <button className="clear-filters-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Creatures Grid */}
      <div className="creatures-content">
        {filteredCreatures.length === 0 ? (
          <div className="empty-bestiary">
            <div className="empty-icon">🐉</div>
            <h3>No creatures found</h3>
            <p>
              {creatures.length === 0 
                ? isDM 
                  ? "Upload a PDF or manually add creatures to build your bestiary"
                  : "The DM hasn't added any creatures yet"
                : "No creatures match your current filters"
              }
            </p>
          </div>
        ) : (
          <div className="creatures-grid">
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
    </div>
  );
};

export default CampaignBestiary;