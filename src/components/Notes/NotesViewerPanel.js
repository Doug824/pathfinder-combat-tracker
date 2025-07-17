import React, { useState } from 'react';
import { notesService } from '../../services/notesService';
import './Notes.css';

const NotesViewerPanel = ({ 
  note, 
  currentUser, 
  userRole,
  onEdit,
  onDelete,
  onReveal,
  onTagClick,
  onClose
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!note) {
    return (
      <div className="notes-viewer-panel empty">
        <div className="empty-viewer">
          <div className="empty-icon">📝</div>
          <h3>Select a note to view</h3>
          <p>Choose a note from the list to view its contents</p>
        </div>
      </div>
    );
  }

  const canEdit = notesService.canEditNote(note, currentUser.uid, userRole);
  const canDelete = notesService.canDeleteNote(note, currentUser.uid, userRole);
  const canReveal = userRole === 'dm' && note.type === 'dm';

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true);
      try {
        await onDelete(note.id);
        onClose();
      } catch (err) {
        setIsDeleting(false);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const handleReveal = async () => {
    if (window.confirm('Reveal this note to all players? This action cannot be undone.')) {
      try {
        await onReveal(note.id);
      } catch (err) {
        alert('Failed to reveal note. Please try again.');
      }
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'personal': return '👤';
      case 'shared': return '👥';
      case 'dm': return '🎲';
      default: return '📝';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'personal': return 'var(--primary-color)';
      case 'shared': return 'var(--success-color, #28a745)';
      case 'dm': return 'var(--warning-color, #ffc107)';
      default: return 'var(--text-secondary)';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'world': '🌍',
      'npcs': '👤',
      'organizations': '🏛️',
      'story': '📜',
      'quests': '⚔️',
      'lore': '📚',
      'items': '💎',
      'sessions': '🎲',
      'mysteries': '🔍',
      'other': '📋'
    };
    return icons[category] || '📝';
  };

  const getCategoryName = (category) => {
    const names = {
      'world': 'World & Locations',
      'npcs': 'NPCs',
      'organizations': 'Organizations & Factions',
      'story': 'Story & Narrative',
      'quests': 'Quests & Missions',
      'lore': 'Knowledge & Lore',
      'items': 'Items & Treasure',
      'sessions': 'Session Records',
      'mysteries': 'Mysteries & Secrets',
      'other': 'Other'
    };
    return names[category] || 'General';
  };

  return (
    <div className="notes-viewer-panel">
      <div className="viewer-header">
        <div className="viewer-title">
          <h2>{note.title}</h2>
          <div className="viewer-meta">
            <span 
              className="note-type-badge"
              style={{ backgroundColor: getTypeColor(note.type) }}
            >
              {getTypeIcon(note.type)} {note.type}
            </span>
            <span className="note-author">by {note.authorName}</span>
            <span className="note-date">{formatDate(note.updatedAt)}</span>
          </div>
        </div>
        
        <div className="viewer-actions">
          {canEdit && (
            <button className="edit-btn" onClick={() => onEdit(note)}>
              Edit
            </button>
          )}
          {canReveal && (
            <button className="reveal-btn" onClick={handleReveal}>
              Reveal to Players
            </button>
          )}
          {canDelete && (
            <button 
              className="delete-btn"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      <div className="viewer-content">
        <div className="note-content">
          <div className="content-text">
            {note.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="note-metadata">
          {note.category && (
            <div className="note-category">
              <span className="category-label">
                {getCategoryIcon(note.category)} {getCategoryName(note.category)}
              </span>
            </div>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="note-tags">
              <span className="tags-label">Tags:</span>
              {note.tags.map(tag => (
                <span 
                  key={tag} 
                  className="note-tag clickable"
                  onClick={() => onTagClick && onTagClick(tag)}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {note.isRevealed && (
            <div className="note-revealed">
              <span className="revealed-badge">
                ✨ Revealed to players
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesViewerPanel;