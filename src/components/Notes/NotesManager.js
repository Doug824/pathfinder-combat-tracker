import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { notesService } from '../../services/notesService';
import { campaignService } from '../../services/campaignService';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import NotesFilters from './NotesFilters';
import './Notes.css';

const NotesManager = ({ campaign }) => {
  const { currentUser } = useFirebaseAuth();
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    tag: '',
    search: ''
  });

  const userRole = campaignService.getUserRole(campaign, currentUser.uid);

  // Real-time notes subscription
  useEffect(() => {
    if (!campaign || !currentUser) return;

    const unsubscribe = notesService.subscribeToNotes(
      campaign.id,
      currentUser.uid,
      userRole,
      (updatedNotes) => {
        setNotes(updatedNotes);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [campaign, currentUser, userRole]);

  // Apply filters to notes
  useEffect(() => {
    let filtered = [...notes];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(note => note.type === filters.type);
    }

    // Filter by tag
    if (filters.tag) {
      filtered = filtered.filter(note => 
        note.tags && note.tags.includes(filters.tag)
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    setFilteredNotes(filtered);
  }, [notes, filters]);

  const handleCreateNote = async (noteData) => {
    try {
      const newNote = await notesService.createNote(campaign.id, {
        ...noteData,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email
      });
      setShowEditor(false);
      return newNote;
    } catch (err) {
      setError('Failed to create note. Please try again.');
      throw err;
    }
  };

  const handleUpdateNote = async (noteId, updates) => {
    try {
      await notesService.updateNote(campaign.id, noteId, updates, currentUser.uid);
      setEditingNote(null);
      setShowEditor(false);
    } catch (err) {
      setError('Failed to update note. Please try again.');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesService.deleteNote(campaign.id, noteId);
    } catch (err) {
      setError('Failed to delete note. Please try again.');
      throw err;
    }
  };

  const handleRevealNote = async (noteId) => {
    try {
      await notesService.revealNote(campaign.id, noteId, currentUser.uid);
    } catch (err) {
      setError('Failed to reveal note. Please try again.');
      throw err;
    }
  };

  const handleAddReaction = async (noteId, emoji) => {
    try {
      await notesService.addReaction(campaign.id, noteId, emoji, currentUser.uid);
    } catch (err) {
      setError('Failed to add reaction. Please try again.');
    }
  };

  const handleRemoveReaction = async (noteId, emoji) => {
    try {
      await notesService.removeReaction(campaign.id, noteId, emoji, currentUser.uid);
    } catch (err) {
      setError('Failed to remove reaction. Please try again.');
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setEditingNote(null);
    setShowEditor(false);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getAvailableTags = () => {
    const allTags = notes.flatMap(note => note.tags || []);
    return [...new Set(allTags)].sort();
  };

  if (loading) {
    return (
      <div className="notes-manager">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-manager">
      <div className="notes-header">
        <div className="notes-title">
          <h2>Campaign Notes</h2>
          <p>{campaign.name}</p>
        </div>
        <button 
          className="new-note-button"
          onClick={handleNewNote}
        >
          + New Note
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <NotesFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTags={getAvailableTags()}
        userRole={userRole}
      />

      <div className="notes-content">
        <NotesList
          notes={filteredNotes}
          currentUser={currentUser}
          userRole={userRole}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onRevealNote={handleRevealNote}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
        />
      </div>

      {showEditor && (
        <NoteEditor
          note={editingNote}
          campaign={campaign}
          currentUser={currentUser}
          userRole={userRole}
          onSave={editingNote ? handleUpdateNote : handleCreateNote}
          onClose={handleCloseEditor}
          availableTags={getAvailableTags()}
        />
      )}
    </div>
  );
};

export default NotesManager;