import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { campaignService } from '../../services/campaignService';
import CreateCampaignForm from './CreateCampaignForm';
import JoinCampaignForm from './JoinCampaignForm';
import CampaignList from './CampaignList';
import NotesManager from '../Notes/NotesManager';
import CampaignBestiary from './CampaignBestiary';
import './Campaign.css';

const CampaignManager = ({ characters, onCreateCharacter }) => {
  const { currentUser, userRole } = useFirebaseAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Load user's campaigns
  useEffect(() => {
    if (currentUser) {
      loadCampaigns();
    }
  }, [currentUser]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const userCampaigns = await campaignService.getUserCampaigns(currentUser.uid);
      setCampaigns(userCampaigns);
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (campaignData) => {
    try {
      const newCampaign = await campaignService.createCampaign(currentUser.uid, campaignData);
      setCampaigns(prev => [newCampaign, ...prev]);
      setActiveTab('list');
      return newCampaign;
    } catch (err) {
      console.error('Error creating campaign:', err);
      throw err;
    }
  };

  const handleJoinCampaign = async (inviteCode, character) => {
    try {
      const campaign = await campaignService.joinCampaignByCode(currentUser.uid, inviteCode, character);
      setCampaigns(prev => [campaign, ...prev]);
      setActiveTab('list');
      return campaign;
    } catch (err) {
      console.error('Error joining campaign:', err);
      throw err;
    }
  };

  const handleLeaveCampaign = async (campaignId) => {
    try {
      await campaignService.leaveCampaign(currentUser.uid, campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } catch (err) {
      console.error('Error leaving campaign:', err);
      throw err;
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      await campaignService.deleteCampaign(campaignId);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    } catch (err) {
      console.error('Error deleting campaign:', err);
      throw err;
    }
  };

  const handleUpdateCampaign = async (campaignId, updates) => {
    try {
      const updatedCampaign = await campaignService.updateCampaign(campaignId, updates);
      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? updatedCampaign : c
      ));
      return updatedCampaign;
    } catch (err) {
      console.error('Error updating campaign:', err);
      throw err;
    }
  };

  const handleEnterCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setActiveTab('notes');
  };

  const handleBackToCampaigns = () => {
    setSelectedCampaign(null);
    setActiveTab('list');
  };

  if (loading) {
    return (
      <div className="campaign-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaign-manager">
      <div className="campaign-header">
        <h1>Campaign Management</h1>
        <p>Create, join, and manage your Pathfinder campaigns</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadCampaigns}>Try Again</button>
        </div>
      )}

      {activeTab !== 'notes' && activeTab !== 'bestiary' && (
        <div className="campaign-tabs">
          <button 
            className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            My Campaigns ({campaigns.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Campaign
          </button>
          <button 
            className={`tab-button ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            Join Campaign
          </button>
        </div>
      )}

      {(activeTab === 'notes' || activeTab === 'bestiary') && selectedCampaign && (
        <div className="campaign-navigation">
          <div className="campaign-breadcrumb">
            <button 
              className="back-button"
              onClick={handleBackToCampaigns}
            >
              ← Back to Campaigns
            </button>
            <h3>{selectedCampaign.name}</h3>
          </div>
          
          <div className="campaign-tabs">
            <button 
              className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              📝 Notes
            </button>
            <button 
              className={`tab-button ${activeTab === 'bestiary' ? 'active' : ''}`}
              onClick={() => setActiveTab('bestiary')}
            >
              🐉 Bestiary
            </button>
          </div>
        </div>
      )}

      <div className="campaign-content">
        {activeTab === 'list' && (
          <CampaignList 
            campaigns={campaigns}
            currentUser={currentUser}
            onLeaveCampaign={handleLeaveCampaign}
            onDeleteCampaign={handleDeleteCampaign}
            onUpdateCampaign={handleUpdateCampaign}
            onEnterCampaign={handleEnterCampaign}
          />
        )}

        {activeTab === 'create' && (
          <CreateCampaignForm 
            onCreateCampaign={handleCreateCampaign}
            onCancel={() => setActiveTab('list')}
          />
        )}

        {activeTab === 'join' && (
          <JoinCampaignForm 
            onJoinCampaign={handleJoinCampaign}
            onCancel={() => setActiveTab('list')}
            characters={characters}
            onCreateCharacter={onCreateCharacter}
          />
        )}

        {activeTab === 'notes' && selectedCampaign && (
          <NotesManager campaign={selectedCampaign} />
        )}

        {activeTab === 'bestiary' && selectedCampaign && (
          <CampaignBestiary campaign={selectedCampaign} />
        )}
      </div>
    </div>
  );
};

export default CampaignManager;