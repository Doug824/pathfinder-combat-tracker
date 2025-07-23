import React, { useState } from 'react';

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
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-fantasy font-bold text-amber-400 mb-2">Create New Campaign</h2>
        <p className="text-amber-300">Set up a new Pathfinder campaign for your party</p>
      </div>

      {error && (
        <div className="bg-red-900/60 border-2 border-red-700/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-md rounded-lg border-2 border-amber-700/50 p-6">
        <div className="mb-6">
          <label htmlFor="name" className="block text-amber-300 font-semibold mb-2">Campaign Name *</label>
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
            className="input-fantasy w-full"
          />
          <span className="block text-right text-amber-400 text-sm mt-1">
            {formData.name.length}/50
          </span>
        </div>

        <div className="mb-6">
          <label htmlFor="description" className="block text-amber-300 font-semibold mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Optional description of your campaign..."
            rows={4}
            disabled={loading}
            maxLength={500}
            className="input-fantasy w-full resize-none"
          />
          <span className="block text-right text-amber-400 text-sm mt-1">
            {formData.description.length}/500
          </span>
        </div>

        <div className="bg-black/40 rounded-lg border border-amber-700/30 p-4 mb-6">
          <h3 className="text-lg font-fantasy font-bold text-amber-400 mb-3">What happens when you create a campaign?</h3>
          <ul className="text-amber-100 space-y-2 list-disc list-inside">
            <li>You become the Dungeon Master (DM) of this campaign</li>
            <li>A unique invite code is generated for players to join</li>
            <li>You can manage campaign settings and member permissions</li>
            <li>Players can create personal, shared, and DM-only notes</li>
          </ul>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-fantasy font-semibold transition-all duration-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-3 rounded-lg font-fantasy font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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