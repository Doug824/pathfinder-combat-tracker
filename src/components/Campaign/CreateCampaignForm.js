import React, { useState } from 'react';
import './Campaign.css';

const CreateCampaignForm = ({ onCreateCampaign, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Campaign name is required');
      return;
    }

    if (formData.name.length < 3) {
      setError('Campaign name must be at least 3 characters long');
      return;
    }

    if (formData.name.length > 50) {
      setError('Campaign name must be less than 50 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onCreateCampaign(formData);
      // Reset form
      setFormData({ name: '', description: '' });
    } catch (err) {
      setError(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-campaign-form">
      <div className="form-header">
        <h2>Create New Campaign</h2>
        <p>Set up a new Pathfinder campaign for your party</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="campaign-form">
        <div className="form-group">
          <label htmlFor="name">Campaign Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter campaign name (e.g., 'Curse of the Crimson Throne')"
            disabled={loading}
            required
            maxLength={50}
          />
          <span className="char-count">
            {formData.name.length}/50
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description of your campaign..."
            rows={4}
            disabled={loading}
            maxLength={500}
          />
          <span className="char-count">
            {formData.description.length}/500
          </span>
        </div>

        <div className="form-info">
          <h3>What happens when you create a campaign?</h3>
          <ul>
            <li>You become the Dungeon Master (DM) of this campaign</li>
            <li>A unique invite code is generated for players to join</li>
            <li>You can manage campaign settings and member permissions</li>
            <li>Players can create personal, shared, and DM-only notes</li>
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
          <button 
            type="submit" 
            className="save-button"
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaignForm;