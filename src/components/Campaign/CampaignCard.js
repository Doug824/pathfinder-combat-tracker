import React, { useState } from 'react';
import { campaignService } from '../../services/campaignService';
import OrnatePanel, { OrnateButton } from '../OrnatePanel';

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
    <OrnatePanel variant="default" className="transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/20">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-fantasy font-bold text-yellow-400 uppercase tracking-wider">{campaign.name}</h3>
        <div className="relative">
          <button 
            className="text-yellow-300 hover:text-yellow-100 text-2xl p-1 rounded transition-colors duration-300"
            onClick={() => setShowActions(!showActions)}
          >
            ⋮
          </button>
          {showActions && (
            <div className="absolute right-0 top-8 bg-gradient-to-b from-amber-900/95 to-amber-950/95 border-2 border-amber-700/50 rounded-lg shadow-lg z-10 min-w-40">
              <button 
                className="w-full text-left px-4 py-2 text-yellow-200 hover:bg-amber-700/30 rounded-t-lg transition-colors duration-300 font-fantasy uppercase tracking-wider text-sm"
                onClick={() => onSelect(campaign)}
              >
                View Details
              </button>
              {isDM && (
                <>
                  <button 
                    className="w-full text-left px-4 py-2 text-yellow-200 hover:bg-amber-700/30 transition-colors duration-300 font-fantasy uppercase tracking-wider text-sm"
                    onClick={() => {}}
                  >
                    Edit Campaign
                  </button>
                  <button 
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-b-lg transition-colors duration-300 font-fantasy uppercase tracking-wider text-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Campaign'}
                  </button>
                </>
              )}
              {!isDM && (
                <button 
                  onClick={handleLeaveClick}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-b-lg transition-colors duration-300 font-fantasy uppercase tracking-wider text-sm"
                >
                  Leave Campaign
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-amber-200 mb-4 line-clamp-2">
          {campaign.description || 'No description provided'}
        </p>

        <div className="flex justify-between items-center mb-4">
          <span className={`px-3 py-1 rounded-md text-xs font-fantasy uppercase tracking-wider font-bold text-yellow-100 border ${
            userRole === 'dm' 
              ? 'bg-gradient-to-b from-purple-600/50 to-purple-800/50 border-purple-500/50' 
              : 'bg-gradient-to-b from-blue-600/50 to-blue-800/50 border-blue-500/50'
          }`}>
            {userRole?.toUpperCase()}
          </span>
          
          <div className="text-right text-sm text-amber-200">
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span className="font-fantasy">{campaign.members.length} member{campaign.members.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span className="font-fantasy">{getLastActivityText()}</span>
            </div>
          </div>
        </div>

        {isDM && (
          <div className="bg-black/60 rounded-md border-2 border-amber-700/50 p-3 mb-4">
            <div className="text-amber-200 text-sm">
              <span className="font-fantasy uppercase tracking-wider">Invite Code:</span> 
              <code className="bg-black/60 px-2 py-1 rounded font-mono text-yellow-400 ml-2 border border-amber-700/30">
                {campaign.inviteCode}
              </code>
            </div>
          </div>
        )}
      </div>

      <OrnateButton
        variant="primary"
        onClick={() => onEnterCampaign(campaign)}
        className="w-full"
        icon="⚔️"
      >
        Enter Campaign
      </OrnateButton>
    </OrnatePanel>
  );
};

export default CampaignCard;