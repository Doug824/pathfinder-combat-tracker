import React, { useState } from 'react';
import { campaignService } from '../../services/campaignService';
import CharacterSelection from './CharacterSelection';
import './Campaign.css';

const JoinCampaignForm = ({ onJoinCampaign, onCancel, characters, onCreateCharacter }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setInviteCode(value);
    setError('');
    setPreviewCampaign(null);
  };

  const handlePreview = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    if (inviteCode.length !== 6) {
      setError('Invite code must be 6 characters long');
      return;
    }

    try {
      setPreviewing(true);
      setError('');
      const campaign = await campaignService.getCampaignByInviteCode(inviteCode);
      setPreviewCampaign(campaign);
    } catch (err) {
      setError(err.message || 'Invalid invite code');
      setPreviewCampaign(null);
    } finally {
      setPreviewing(false);
    }
  };

  const handleJoinClick = () => {
    setShowCharacterSelection(true);
  };

  const handleCharacterSelect = async (character) => {
    try {
      setLoading(true);
      setError('');
      await onJoinCampaign(inviteCode, character);
      // Reset form
      setInviteCode('');
      setPreviewCampaign(null);
      setShowCharacterSelection(false);
    } catch (err) {
      setError(err.message || 'Failed to join campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewCharacter = () => {
    // Store campaign info and redirect to character creation
    sessionStorage.setItem('pendingCampaignJoin', JSON.stringify({
      inviteCode,
      campaign: previewCampaign
    }));
    onCreateCharacter();
  };

  const handleCancelCharacterSelection = () => {
    setShowCharacterSelection(false);
  };

  return (
    <div className="join-campaign-form">
      <div className="form-header">
        <h2>Join Campaign</h2>
        <p>Enter the invite code provided by your Dungeon Master</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="invite-code-section">
        <div className="form-group">
          <label htmlFor="inviteCode">Invite Code</label>
          <div className="invite-code-input-group">
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={handleChange}
              placeholder="ABC123"
              disabled={loading || previewing}
              maxLength={6}
              className="invite-code-input"
            />
            <button 
              type="button"
              onClick={handlePreview}
              disabled={loading || previewing || inviteCode.length !== 6}
              className="preview-button"
            >
              {previewing ? 'Checking...' : 'Preview'}
            </button>
          </div>
          <p className="input-hint">
            Invite codes are 6 characters long (letters and numbers)
          </p>
        </div>
      </div>

      {previewCampaign && (
        <div className="campaign-preview">
          <h3>Campaign Preview</h3>
          <div className="preview-content">
            <div className="preview-info">
              <h4>{previewCampaign.name}</h4>
              <p className="preview-description">
                {previewCampaign.description || 'No description provided'}
              </p>
              <div className="preview-meta">
                <span>👥 {previewCampaign.memberCount} member{previewCampaign.memberCount !== 1 ? 's' : ''}</span>
                <span>📅 Created {previewCampaign.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
              </div>
            </div>
            
            <div className="preview-actions">
              <button 
                onClick={handleJoinClick}
                disabled={loading}
                className="join-button"
              >
                {loading ? 'Joining...' : 'Join Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCharacterSelection && previewCampaign && (
        <CharacterSelection
          characters={characters}
          campaignName={previewCampaign.name}
          onSelectCharacter={handleCharacterSelect}
          onCreateNew={handleCreateNewCharacter}
          onCancel={handleCancelCharacterSelection}
        />
      )}

      {!showCharacterSelection && (
        <>
          <div className="form-info">
            <h3>How to get an invite code:</h3>
            <ul>
              <li>Ask your Dungeon Master to share the campaign invite code</li>
              <li>The DM can find the code in their campaign management page</li>
              <li>Codes are unique to each campaign and can be regenerated</li>
              <li>You'll join as a Player and can create notes immediately</li>
            </ul>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JoinCampaignForm;