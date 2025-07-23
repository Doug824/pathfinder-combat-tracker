import React, { useState } from 'react';
import { campaignService } from '../../services/campaignService';
import CampaignCard from './CampaignCard';
import OrnatePanel, { OrnateButton } from '../OrnatePanel';

const CampaignList = ({ 
  campaigns, 
  currentUser, 
  onLeaveCampaign, 
  onDeleteCampaign, 
  onUpdateCampaign,
  onEnterCampaign 
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseCampaign = () => {
    setSelectedCampaign(null);
  };

  const handleCopyInviteCode = (inviteCode) => {
    navigator.clipboard.writeText(inviteCode);
    // TODO: Show success toast
  };

  const handleGenerateNewInviteCode = async (campaignId) => {
    try {
      const newInviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await onUpdateCampaign(campaignId, { inviteCode: newInviteCode });
    } catch (err) {
      console.error('Error generating new invite code:', err);
    }
  };

  if (campaigns.length === 0) {
    return (
      <OrnatePanel variant="default" className="text-center py-16">
        <div className="text-8xl mb-6">🎲</div>
        <h3 className="text-3xl font-fantasy font-bold text-yellow-400 mb-4 uppercase tracking-wider">No Campaigns Yet</h3>
        <p className="text-amber-200 text-lg">Create your first campaign or join an existing one to get started!</p>
      </OrnatePanel>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {campaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            currentUser={currentUser}
            onSelect={handleSelectCampaign}
            onLeave={onLeaveCampaign}
            onDelete={onDeleteCampaign}
            onUpdate={onUpdateCampaign}
            onEnterCampaign={onEnterCampaign}
          />
        ))}
      </div>

      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleCloseCampaign}>
          <div className="max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <OrnatePanel variant="dark" title={selectedCampaign.name} className="relative">
              <button 
                className="absolute top-4 right-4 text-yellow-300 hover:text-yellow-100 text-3xl leading-none transition-colors duration-300"
                onClick={handleCloseCampaign}
              >
                ×
              </button>

              <div className="mb-6">
                <div className="text-amber-200 mb-2">
                  <span className="font-fantasy uppercase tracking-wider text-yellow-400">Description:</span> {selectedCampaign.description || 'No description'}
                </div>
                <div className="text-amber-200 mb-2">
                  <span className="font-fantasy uppercase tracking-wider text-yellow-400">Members:</span> {selectedCampaign.members.length}
                </div>
                <div className="text-amber-200">
                  <span className="font-fantasy uppercase tracking-wider text-yellow-400">Created:</span> {selectedCampaign.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </div>
              </div>

              {campaignService.isDM(selectedCampaign, currentUser.uid) && (
                <OrnatePanel variant="dark" className="mb-6">
                  <h3 className="text-xl font-fantasy font-bold text-yellow-400 mb-4 uppercase tracking-wider">DM Tools</h3>
                  <div className="mb-4">
                    <label className="block text-amber-200 font-fantasy uppercase tracking-wider mb-2">Invite Code:</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={selectedCampaign.inviteCode} 
                        readOnly 
                        className="flex-1 bg-black/60 border-2 border-amber-700/50 rounded px-3 py-2 text-yellow-300 font-mono text-center focus:border-yellow-500 focus:outline-none"
                      />
                      <OrnateButton
                        variant="primary"
                        onClick={() => handleCopyInviteCode(selectedCampaign.inviteCode)}
                        icon="📋"
                      >
                        Copy
                      </OrnateButton>
                      <OrnateButton
                        variant="secondary"
                        onClick={() => handleGenerateNewInviteCode(selectedCampaign.id)}
                        icon="🔄"
                      >
                        New Code
                      </OrnateButton>
                    </div>
                  </div>
                </OrnatePanel>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-fantasy font-bold text-yellow-400 mb-4 uppercase tracking-wider">Members</h3>
                <div className="space-y-3">
                  {selectedCampaign.members.map(member => (
                    <div key={member.userId} className="bg-black/60 rounded-md border-2 border-amber-700/50 p-4 flex justify-between items-center">
                      <div>
                        <div className="text-yellow-300 font-fantasy font-bold">
                          {member.characterName || 'No Character'}
                        </div>
                        {member.characterClass && member.characterLevel && (
                          <div className="text-amber-200 text-sm">
                            Level {member.characterLevel} {member.characterClass}
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-md text-xs font-fantasy uppercase tracking-wider font-bold text-yellow-100 border ${
                        member.role === 'dm' 
                          ? 'bg-gradient-to-b from-purple-600/50 to-purple-800/50 border-purple-500/50' 
                          : 'bg-gradient-to-b from-blue-600/50 to-blue-800/50 border-blue-500/50'
                      }`}>
                        {member.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <OrnateButton
                  variant="primary"
                  onClick={() => {
                    // Close modal and navigate to notes
                    handleCloseCampaign();
                    onEnterCampaign(selectedCampaign);
                  }}
                  className="w-full"
                  icon="⚔️"
                >
                  Enter Campaign
                </OrnateButton>
              </div>
            </OrnatePanel>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;