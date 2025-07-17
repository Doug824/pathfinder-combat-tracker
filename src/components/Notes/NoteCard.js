import React, { useState } from 'react';
import { notesService } from '../../services/notesService';
import './Notes.css';

const NoteCard = ({ 
  note, 
  currentUser, 
  userRole, 
  onEdit, 
  onDelete, 
  onReveal,
  onTagClick
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const canEdit = notesService.canEditNote(note, currentUser.uid, userRole);
  const canDelete = notesService.canDeleteNote(note, currentUser.uid, userRole);
  const canReveal = userRole === 'dm' && note.type === 'dm';

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setIsDeleting(true);
      try {
        await onDelete(note.id);
      } catch (err) {
        setIsDeleting(false);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const handleRevealClick = async () => {
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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


  return (
    <div className="note-card">
      <div className="note-card-header">
        <div className="note-title-row">
          <h4 className="note-title">{note.title}</h4>
          <div className="note-actions">
            <button
              className="actions-button"
              onClick={() => setShowActions(!showActions)}
            >
              ⋮
            </button>
            {showActions && (
              <div className="actions-dropdown">
                {canEdit && (
                  <button onClick={() => onEdit(note)}>
                    Edit Note
                  </button>
                )}
                {canReveal && (
                  <button onClick={handleRevealClick}>
                    Reveal to Players
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={handleDeleteClick}
                    className="delete-action"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Note'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="note-meta">
          <span 
            className="note-type"
            style={{ color: getTypeColor(note.type) }}
          >
            {getTypeIcon(note.type)} {note.type}
          </span>
          <span className="note-author">
            by {note.authorName}
          </span>
          <span className="note-date">
            {formatDate(note.updatedAt)}
          </span>
        </div>
      </div>

      <div className="note-content">
        <p>{note.content}</p>
      </div>

      {note.category && (
        <div className="note-category">
          <span className="category-label">
            {getCategoryIcon(note.category)} {getCategoryName(note.category)}
          </span>
        </div>
      )}

      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
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
  );
};

export default NoteCard;