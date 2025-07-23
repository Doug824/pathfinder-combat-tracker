import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { campaignService } from '../../services/campaignService';
import CreateCampaignForm from './CreateCampaignForm';
import JoinCampaignForm from './JoinCampaignForm';
import CampaignList from './CampaignList';
import NotesManager from '../Notes/NotesManager';
import CampaignBestiary from './CampaignBestiary';
import OrnatePanel, { OrnateTab, OrnateButton } from '../OrnatePanel';

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
      <div className="max-w-7xl mx-auto p-8">
        <OrnatePanel variant="default" className="py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-700/30 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
            <p className="text-yellow-300 text-lg font-fantasy uppercase tracking-wider">Loading campaigns...</p>
          </div>
        </OrnatePanel>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-fantasy font-bold text-yellow-400 uppercase tracking-wider mb-2 drop-shadow-lg">Campaign Management</h1>
        <p className="text-amber-200 text-lg">Create, join, and manage your Pathfinder campaigns</p>
      </div>

      {error && (
        <OrnatePanel variant="dark" className="mb-6">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <OrnateButton
              onClick={loadCampaigns}
              variant="primary"
              icon="🔄"
            >
              Try Again
            </OrnateButton>
          </div>
        </OrnatePanel>
      )}

      {activeTab !== 'notes' && activeTab !== 'bestiary' && (
        <div className="flex justify-center gap-2 mb-8">
          <OrnateTab
            label={`My Campaigns (${campaigns.length})`}
            active={activeTab === 'list'}
            onClick={() => setActiveTab('list')}
            icon="📜"
          />
          <OrnateTab
            label="Create Campaign"
            active={activeTab === 'create'}
            onClick={() => setActiveTab('create')}
            icon="✨"
          />
          <OrnateTab
            label="Join Campaign"
            active={activeTab === 'join'}
            onClick={() => setActiveTab('join')}
            icon="🤝"
          />
        </div>
      )}

      {(activeTab === 'notes' || activeTab === 'bestiary') && selectedCampaign && (
        <div className="mb-8">
          <OrnatePanel variant="default" className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <OrnateButton
                variant="secondary"
                onClick={handleBackToCampaigns}
                icon="←"
              >
                Back to Campaigns
              </OrnateButton>
              <h3 className="text-2xl font-fantasy font-bold text-yellow-400 uppercase tracking-wider">{selectedCampaign.name}</h3>
            </div>
            
            <div className="flex justify-center gap-2">
              <OrnateTab
                label="Notes"
                active={activeTab === 'notes'}
                onClick={() => setActiveTab('notes')}
                icon="📝"
              />
              <OrnateTab
                label="Bestiary"
                active={activeTab === 'bestiary'}
                onClick={() => setActiveTab('bestiary')}
                icon="🐉"
              />
            </div>
          </OrnatePanel>
        </div>
      )}

      <div>
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