import React from 'react';
import './Notes.css';

const NotesListPanel = ({ 
  notes, 
  selectedNote,
  onNoteSelect,
  onNewNote,
  searchQuery,
  onSearchChange
}) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
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

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  return (
    <div className="notes-list-panel">
      <div className="notes-list-header">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="new-note-btn" onClick={onNewNote}>
          + New Note
        </button>
      </div>

      <div className="notes-list-content">
        {filteredNotes.length === 0 ? (
          <div className="empty-notes">
            <div className="empty-icon">📝</div>
            <p>No notes found</p>
            <button className="create-first-note" onClick={onNewNote}>
              Create your first note
            </button>
          </div>
        ) : (
          <div className="notes-items">
            {filteredNotes.map(note => (
              <div 
                key={note.id}
                className={`note-list-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                onClick={() => onNoteSelect(note)}
              >
                <div className="note-item-header">
                  <h4 className="note-item-title">{note.title}</h4>
                  <div className="note-item-meta">
                    <span className="note-type-icon">{getTypeIcon(note.type)}</span>
                    <span className="note-date">{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
                
                <p className="note-item-content">
                  {truncateContent(note.content)}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="note-item-tags">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="note-item-tag">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="note-item-tag-more">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesListPanel;