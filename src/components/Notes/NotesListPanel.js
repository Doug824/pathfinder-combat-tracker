import React from 'react';
import OrnatePanel, { OrnateButton } from '../OrnatePanel';
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
    <OrnatePanel variant="default" className="h-full">
      <div className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-black/60 border-2 border-amber-700/50 rounded px-4 py-2 text-yellow-300 placeholder-amber-400 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <OrnateButton
          onClick={onNewNote}
          variant="primary"
          className="w-full"
          icon="✨"
        >
          New Note
        </OrnateButton>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-amber-200 mb-4">No notes found</p>
            <OrnateButton
              onClick={onNewNote}
              variant="secondary"
              icon="✨"
            >
              Create your first note
            </OrnateButton>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <div 
                key={note.id}
                className={`p-3 rounded-md cursor-pointer transition-all duration-300 ${
                  selectedNote?.id === note.id
                    ? 'bg-amber-900/40 border-2 border-yellow-500/50'
                    : 'bg-black/20 border-2 border-amber-700/30 hover:bg-amber-900/20'
                }`}
                onClick={() => onNoteSelect(note)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-fantasy text-yellow-300 text-sm uppercase tracking-wider truncate">{note.title}</h4>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-lg">{getTypeIcon(note.type)}</span>
                    <span className="text-xs text-amber-300 font-fantasy">{formatDate(note.updatedAt)}</span>
                  </div>
                </div>
                
                <p className="text-amber-200 text-xs leading-relaxed mb-2">
                  {truncateContent(note.content)}
                </p>
                
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-amber-800/30 border border-amber-700/50 rounded text-xs text-amber-200 font-fantasy">
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="px-2 py-1 bg-amber-800/30 border border-amber-700/50 rounded text-xs text-amber-300 font-fantasy">
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
    </OrnatePanel>
  );
};

export default NotesListPanel;