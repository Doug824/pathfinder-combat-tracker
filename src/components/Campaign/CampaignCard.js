import React, { useState } from 'react';
import { campaignService } from '../../services/campaignService';
import './Campaign.css';

const CampaignCard = ({ 
  campaign, 
  currentUser, 
  onSelect, 
  onLeave, 
  onDelete, 
  onUpdate,
  onEnterCampaign 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userRole = campaignService.getUserRole(campaign, currentUser.uid);
  const isDM = campaignService.isDM(campaign, currentUser.uid);

  const handleDeleteClick = async () => {
    if (window.confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await onDelete(campaign.id);
      } catch (err) {
        setIsDeleting(false);
        alert('Failed to delete campaign. Please try again.');
      }
    }
  };

  const handleLeaveClick = async () => {
    if (window.confirm(`Are you sure you want to leave "${campaign.name}"?`)) {
      try {
        await onLeave(campaign.id);
      } catch (err) {
        alert('Failed to leave campaign. Please try again.');
      }
    }
  };

  const getLastActivityText = () => {
    if (!campaign.updatedAt) return 'No activity';
    
    const now = new Date();
    const lastActivity = campaign.updatedAt.toDate ? campaign.updatedAt.toDate() : new Date(campaign.updatedAt);
    const diffTime = Math.abs(now - lastActivity);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <div className="campaign-card">
      <div className="campaign-card-header">
        <h3 className="campaign-name">{campaign.name}</h3>
        <div className="campaign-actions">
          <button 
            className="actions-button"
            onClick={() => setShowActions(!showActions)}
          >
            ⋮
          </button>
          {showActions && (
            <div className="actions-dropdown">
              <button onClick={() => onSelect(campaign)}>
                View Details
              </button>
              {isDM && (
                <>
                  <button onClick={() => console.log('Edit campaign')}>
                    Edit Campaign
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    className="delete-action"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Campaign'}
                  </button>
                </>
              )}
              {!isDM && (
                <button 
                  onClick={handleLeaveClick}
                  className="leave-action"
                >
                  Leave Campaign
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="campaign-card-content">
        <p className="campaign-description">
          {campaign.description || 'No description provided'}
        </p>

        <div className="campaign-meta">
          <div className="campaign-role">
            <span className={`role-badge ${userRole}`}>
              {userRole?.toUpperCase()}
            </span>
          </div>
          
          <div className="campaign-stats">
            <span className="member-count">
              👥 {campaign.members.length} member{campaign.members.length !== 1 ? 's' : ''}
            </span>
            <span className="last-activity">
              📅 {getLastActivityText()}
            </span>
          </div>
        </div>

        {isDM && (
          <div className="dm-info">
            <span className="invite-code">
              Invite Code: <code>{campaign.inviteCode}</code>
            </span>
          </div>
        )}
      </div>

      <div className="campaign-card-footer">
        <button 
          className="enter-button"
          onClick={() => onEnterCampaign(campaign)}
        >
          Enter Campaign
        </button>
      </div>
    </div>
  );
};

export default CampaignCard;