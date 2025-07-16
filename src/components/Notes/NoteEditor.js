import React, { useState, useEffect } from 'react';
import './Notes.css';

const NoteEditor = ({ 
  note, 
  campaign, 
  currentUser, 
  userRole, 
  onSave, 
  onClose, 
  availableTags 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'personal',
    category: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');

  const isEditing = !!note;

  const categoryOptions = [
    { value: '', label: 'No Category' },
    { value: 'npcs', label: 'NPCs', icon: '👤' },
    { value: 'locations', label: 'Locations', icon: '🏰' },
    { value: 'items', label: 'Items', icon: '⚔️' },
    { value: 'quests', label: 'Quests', icon: '📜' },
    { value: 'lore', label: 'Lore', icon: '📚' },
    { value: 'organizations', label: 'Organizations', icon: '🏛️' },
    { value: 'events', label: 'Events', icon: '⚡' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        type: note.type || 'personal',
        category: note.category || '',
        tags: note.tags || []
      });
    }
  }, [note]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddExistingTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    if (formData.title.length > 100) {
      setError('Title must be less than 100 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (isEditing) {
        await onSave(note.id, formData);
      } else {
        await onSave(formData);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save note');
    } finally {
      setLoading(false);
    }
  };

  const getTypeOptions = () => {
    const options = [
      { value: 'personal', label: 'Personal Note', description: 'Only visible to you' },
      { value: 'shared', label: 'Shared Note', description: 'Visible to all party members' }
    ];

    if (userRole === 'dm') {
      options.push({ 
        value: 'dm', 
        label: 'DM Note', 
        description: 'Only visible to the DM' 
      });
    }

    return options;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'personal': return '👤';
      case 'shared': return '👥';
      case 'dm': return '🎲';
      default: return '📝';
    }
  };

  return (
    <div className="note-editor-overlay">
      <div className="note-editor">
        <div className="note-editor-header">
          <h2>{isEditing ? 'Edit Note' : 'Create New Note'}</h2>
          <button 
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="note-editor-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter note title..."
              disabled={loading}
              required
              maxLength={100}
            />
            <span className="char-count">{formData.title.length}/100</span>
          </div>

          <div className="form-group">
            <label htmlFor="type">Note Type *</label>
            <div className="type-selector">
              {getTypeOptions().map(option => (
                <label key={option.value} className="type-option">
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={formData.type === option.value}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="type-option-content">
                    <span className="type-icon">{getTypeIcon(option.value)}</span>
                    <div className="type-text">
                      <div className="type-label">{option.label}</div>
                      <div className="type-description">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon ? `${option.icon} ${option.label}` : option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter note content..."
              rows={8}
              disabled={loading}
              required
              maxLength={5000}
            />
            <span className="char-count">{formData.content.length}/5000</span>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-input-section">
              <div className="new-tag-input">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={loading || !newTag.trim()}
                >
                  Add
                </button>
              </div>

              {availableTags.length > 0 && (
                <div className="available-tags">
                  <span className="available-tags-label">Available tags:</span>
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddExistingTag(tag)}
                      className={`tag-button ${formData.tags.includes(tag) ? 'active' : ''}`}
                      disabled={loading || formData.tags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

              {formData.tags.length > 0 && (
                <div className="selected-tags">
                  <span className="selected-tags-label">Selected tags:</span>
                  {formData.tags.map(tag => (
                    <span key={tag} className="selected-tag">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="save-button"
              disabled={loading || !formData.title.trim() || !formData.content.trim()}
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Note' : 'Create Note')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditor;