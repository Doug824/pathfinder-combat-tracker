import React, { useState } from 'react';
import { campaignService } from '../../services/campaignService';
import CharacterSelection from './CharacterSelection';
import OrnatePanel, { OrnateButton } from '../OrnatePanel';

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
    // TODO: Implement automatic campaign joining after character creation
    onCreateCharacter();
  };

  const handleCancelCharacterSelection = () => {
    setShowCharacterSelection(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-fantasy font-bold text-amber-400 mb-2">Join Campaign</h2>
        <p className="text-amber-300">Enter the invite code provided by your Dungeon Master</p>
      </div>

      {error && (
        <div className="bg-red-900/60 border-2 border-red-700/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 mb-6">
        <div className="mb-6">
          <label htmlFor="inviteCode" className="block text-amber-300 font-semibold mb-2">Invite Code</label>
          <div className="flex gap-3">
            <input
              type="text"
              id="inviteCode"
              value={inviteCode}
              onChange={handleChange}
              placeholder="ABC123"
              disabled={loading || previewing}
              maxLength={6}
              className="input-fantasy flex-1 text-center font-mono text-lg uppercase tracking-wider"
            />
            <button 
              type="button"
              onClick={handlePreview}
              disabled={loading || previewing || inviteCode.length !== 6}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-2 rounded-lg font-fantasy font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {previewing ? 'Checking...' : 'Preview'}
            </button>
          </div>
          <p className="text-amber-400 text-sm mt-2">
            Invite codes are 6 characters long (letters and numbers)
          </p>
        </div>
      </div>

      {previewCampaign && (
        <div className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6 mb-6">
          <h3 className="text-2xl font-fantasy font-bold text-amber-400 mb-4">Campaign Preview</h3>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-fantasy font-bold text-amber-400 mb-2">{previewCampaign.name}</h4>
              <p className="text-amber-100 mb-3">
                {previewCampaign.description || 'No description provided'}
              </p>
              <div className="flex gap-4 text-amber-300 text-sm">
                <span className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{previewCampaign.memberCount} member{previewCampaign.memberCount !== 1 ? 's' : ''}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>📅</span>
                  <span>Created {previewCampaign.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</span>
                </span>
              </div>
            </div>
            
            <div className="md:ml-6">
              <button 
                onClick={handleJoinClick}
                disabled={loading}
                className="w-full md:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-8 py-3 rounded-lg font-fantasy font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
          <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4 mb-6">
            <h3 className="text-lg font-fantasy font-bold text-amber-400 mb-3">How to get an invite code:</h3>
            <ul className="text-amber-100 space-y-2 list-disc list-inside">
              <li>Ask your Dungeon Master to share the campaign invite code</li>
              <li>The DM can find the code in their campaign management page</li>
              <li>Codes are unique to each campaign and can be regenerated</li>
              <li>You'll join as a Player and can create notes immediately</li>
            </ul>
          </div>

          <div className="text-center">
            <button 
              type="button" 
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-fantasy font-semibold transition-all duration-300"
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