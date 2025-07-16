import React, { useState } from 'react';
import { campaignService } from '../../services/campaignService';
import CampaignCard from './CampaignCard';
import './Campaign.css';

const CampaignList = ({ 
  campaigns, 
  currentUser, 
  onLeaveCampaign, 
  onDeleteCampaign, 
  onUpdateCampaign 
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
      <div className="empty-state">
        <div className="empty-icon">🎲</div>
        <h3>No Campaigns Yet</h3>
        <p>Create your first campaign or join an existing one to get started!</p>
      </div>
    );
  }

  return (
    <div className="campaign-list">
      <div className="campaigns-grid">
        {campaigns.map(campaign => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            currentUser={currentUser}
            onSelect={handleSelectCampaign}
            onLeave={onLeaveCampaign}
            onDelete={onDeleteCampaign}
            onUpdate={onUpdateCampaign}
          />
        ))}
      </div>

      {selectedCampaign && (
        <div className="campaign-modal-overlay" onClick={handleCloseCampaign}>
          <div className="campaign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="campaign-modal-header">
              <h2>{selectedCampaign.name}</h2>
              <button 
                className="close-button"
                onClick={handleCloseCampaign}
              >
                ×
              </button>
            </div>

            <div className="campaign-modal-content">
              <div className="campaign-info">
                <p><strong>Description:</strong> {selectedCampaign.description || 'No description'}</p>
                <p><strong>Members:</strong> {selectedCampaign.members.length}</p>
                <p><strong>Created:</strong> {selectedCampaign.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
              </div>

              {campaignService.isDM(selectedCampaign, currentUser.uid) && (
                <div className="dm-tools">
                  <h3>DM Tools</h3>
                  <div className="invite-section">
                    <label>Invite Code:</label>
                    <div className="invite-code-group">
                      <input 
                        type="text" 
                        value={selectedCampaign.inviteCode} 
                        readOnly 
                        className="invite-code"
                      />
                      <button 
                        onClick={() => handleCopyInviteCode(selectedCampaign.inviteCode)}
                        className="copy-button"
                      >
                        Copy
                      </button>
                      <button 
                        onClick={() => handleGenerateNewInviteCode(selectedCampaign.id)}
                        className="regenerate-button"
                      >
                        New Code
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="members-section">
                <h3>Members</h3>
                <div className="members-list">
                  {selectedCampaign.members.map(member => (
                    <div key={member.userId} className="member-item">
                      <span className="member-name">
                        {member.characterName || 'Unknown'}
                      </span>
                      <span className={`member-role ${member.role}`}>
                        {member.role.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="campaign-actions">
                <button 
                  className="enter-campaign-button"
                  onClick={() => {
                    // TODO: Navigate to campaign notes
                    console.log('Enter campaign:', selectedCampaign.id);
                  }}
                >
                  Enter Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;