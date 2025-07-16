import React from 'react';
import NoteCard from './NoteCard';
import './Notes.css';

const NotesList = ({ 
  notes, 
  currentUser, 
  userRole, 
  onEditNote, 
  onDeleteNote, 
  onRevealNote,
  onAddReaction,
  onRemoveReaction,
  onTagClick
}) => {
  const groupedNotes = {
    personal: notes.filter(note => note.type === 'personal'),
    shared: notes.filter(note => note.type === 'shared'),
    dm: notes.filter(note => note.type === 'dm')
  };

  if (notes.length === 0) {
    return (
      <div className="notes-empty-state">
        <div className="empty-icon">📝</div>
        <h3>No Notes Yet</h3>
        <p>Create your first note to start tracking campaign information!</p>
      </div>
    );
  }

  const renderNoteGroup = (title, notes, type) => {
    if (notes.length === 0) return null;

    const getGroupIcon = (type) => {
      switch (type) {
        case 'personal': return '👤';
        case 'shared': return '👥';
        case 'dm': return '🎲';
        default: return '📝';
      }
    };

    const getGroupDescription = (type) => {
      switch (type) {
        case 'personal': return 'Only visible to you';
        case 'shared': return 'Visible to all party members';
        case 'dm': return 'Only visible to the DM';
        default: return '';
      }
    };

    return (
      <div className="notes-group" key={type}>
        <div className="notes-group-header">
          <h3>
            <span className="group-icon">{getGroupIcon(type)}</span>
            {title}
            <span className="notes-count">({notes.length})</span>
          </h3>
          <p className="group-description">{getGroupDescription(type)}</p>
        </div>
        <div className="notes-grid">
          {notes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              currentUser={currentUser}
              userRole={userRole}
              onEdit={onEditNote}
              onDelete={onDeleteNote}
              onReveal={onRevealNote}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="notes-list">
      {userRole === 'dm' && renderNoteGroup('DM Notes', groupedNotes.dm, 'dm')}
      {renderNoteGroup('Shared Notes', groupedNotes.shared, 'shared')}
      {renderNoteGroup('Personal Notes', groupedNotes.personal, 'personal')}
    </div>
  );
};

export default NotesList;