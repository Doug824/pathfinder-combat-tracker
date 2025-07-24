import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { notesService } from '../../services/notesService';
import { campaignService } from '../../services/campaignService';
import NotesSidebar from './NotesSidebar';
import NotesListPanel from './NotesListPanel';
import NotesViewerPanel from './NotesViewerPanel';
import NoteEditor from './NoteEditor';
import OrnatePanel, { OrnateButton } from '../OrnatePanel';

const NotesManager = ({ campaign }) => {
  const { currentUser } = useFirebaseAuth();
  const [userCharacter, setUserCharacter] = useState(null);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = campaignService.getUserRole(campaign, currentUser.uid);

  // Get user's character information
  useEffect(() => {
    if (campaign && currentUser) {
      const characterInfo = campaignService.getMemberCharacter(campaign, currentUser.uid);
      setUserCharacter(characterInfo);
    }
  }, [campaign, currentUser]);

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

    // Filter by selected category and subcategory
    if (selectedCategory === 'type') {
      // Filter by note type
      if (selectedSubcategory) {
        filtered = filtered.filter(note => note.type === selectedSubcategory);
      }
    } else if (selectedCategory) {
      // Filter by category
      filtered = filtered.filter(note => note.category === selectedCategory);
      
      // Filter by subcategory if selected
      if (selectedSubcategory) {
        filtered = filtered.filter(note => note.subcategory === selectedSubcategory);
      }
    }

    setFilteredNotes(filtered);
  }, [notes, selectedCategory, selectedSubcategory]);

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

  const handleCategorySelect = (category, subcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSelectedNote(null); // Clear selected note when changing category
  };

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
  };

  const handleCloseViewer = () => {
    setSelectedNote(null);
  };

  const handleTagClick = (tag) => {
    setSearchQuery(tag);
  };

  const getAvailableTags = () => {
    const allTags = notes.flatMap(note => note.tags || []);
    return [...new Set(allTags)].sort();
  };

  if (loading) {
    return (
      <OrnatePanel variant="default" className="py-16">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-fantasy-bronze/30 border-t-fantasy-gold rounded-full animate-spin mb-4"></div>
          <p className="text-fantasy-gold text-lg font-fantasy uppercase tracking-wider">Loading notes...</p>
        </div>
      </OrnatePanel>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {error && (
        <OrnatePanel variant="dark" className="mb-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <OrnateButton
            onClick={() => setError(null)}
            variant="primary"
            icon="✓"
          >
            Dismiss
          </OrnateButton>
        </OrnatePanel>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-96">
        <div className="lg:col-span-1">
          <NotesSidebar
            notes={notes}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={handleCategorySelect}
            userRole={userRole}
          />
        </div>

        <div className="lg:col-span-1">
          <NotesListPanel
            notes={filteredNotes}
            selectedNote={selectedNote}
            onNoteSelect={handleNoteSelect}
            onNewNote={handleNewNote}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="lg:col-span-2">
          <NotesViewerPanel
            note={selectedNote}
            currentUser={currentUser}
            userRole={userRole}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onReveal={handleRevealNote}
            onTagClick={handleTagClick}
            onClose={handleCloseViewer}
          />
        </div>
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