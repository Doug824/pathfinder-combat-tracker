import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const notesService = {
  // Create a new note
  async createNote(campaignId, noteData) {
    try {
      const note = {
        ...noteData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reactions: {},
        linkedNotes: [],
        attachments: [],
        editHistory: []
      };

      const notesRef = collection(db, 'campaigns', campaignId, 'notes');
      const docRef = await addDoc(notesRef, note);
      
      return { id: docRef.id, ...note };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Get all notes for a campaign
  async getCampaignNotes(campaignId, userId, userRole) {
    try {
      const notesRef = collection(db, 'campaigns', campaignId, 'notes');
      let q;

      if (userRole === 'dm') {
        // DM can see all notes
        q = query(notesRef, orderBy('updatedAt', 'desc'));
      } else {
        // Players can only see personal notes (their own) and shared notes
        q = query(
          notesRef,
          where('type', 'in', ['shared', 'personal']),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const allNotes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter personal notes to only show user's own notes
      const filteredNotes = allNotes.filter(note => {
        if (note.type === 'personal') {
          return note.authorId === userId;
        }
        return true;
      });

      return filteredNotes;
    } catch (error) {
      console.error('Error getting campaign notes:', error);
      throw error;
    }
  },

  // Get a specific note by ID
  async getNote(campaignId, noteId) {
    try {
      const noteRef = doc(db, 'campaigns', campaignId, 'notes', noteId);
      const noteSnap = await getDoc(noteRef);
      
      if (noteSnap.exists()) {
        return { id: noteSnap.id, ...noteSnap.data() };
      } else {
        throw new Error('Note not found');
      }
    } catch (error) {
      console.error('Error getting note:', error);
      throw error;
    }
  },

  // Update a note
  async updateNote(campaignId, noteId, updates, userId) {
    try {
      const noteRef = doc(db, 'campaigns', campaignId, 'notes', noteId);
      
      // Get current note to save edit history
      const currentNote = await this.getNote(campaignId, noteId);
      
      const editHistory = currentNote.editHistory || [];
      editHistory.push({
        editedBy: userId,
        editedAt: serverTimestamp(),
        previousContent: currentNote.content
      });

      const updatedNote = {
        ...updates,
        updatedAt: serverTimestamp(),
        editHistory
      };

      await updateDoc(noteRef, updatedNote);
      
      return await this.getNote(campaignId, noteId);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  // Delete a note
  async deleteNote(campaignId, noteId) {
    try {
      const noteRef = doc(db, 'campaigns', campaignId, 'notes', noteId);
      await deleteDoc(noteRef);
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Add reaction to a note
  async addReaction(campaignId, noteId, emoji, userId) {
    try {
      const noteRef = doc(db, 'campaigns', campaignId, 'notes', noteId);
      const note = await this.getNote(campaignId, noteId);
      
      const reactions = note.reactions || {};
      if (!reactions[emoji]) {
        reactions[emoji] = [];
      }
      
      // Add user to reaction if not already present
      if (!reactions[emoji].includes(userId)) {
        reactions[emoji].push(userId);
      }

      await updateDoc(noteRef, {
        reactions,
        updatedAt: serverTimestamp()
      });

      return reactions;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  },

  // Remove reaction from a note
  async removeReaction(campaignId, noteId, emoji, userId) {
    try {
      const noteRef = doc(db, 'campaigns', campaignId, 'notes', noteId);
      const note = await this.getNote(campaignId, noteId);
      
      const reactions = note.reactions || {};
      if (reactions[emoji]) {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        
        // Remove emoji key if no users left
        if (reactions[emoji].length === 0) {
          delete reactions[emoji];
        }
      }

      await updateDoc(noteRef, {
        reactions,
        updatedAt: serverTimestamp()
      });

      return reactions;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },

  // Reveal a DM note to players (changes type from 'dm' to 'shared')
  async revealNote(campaignId, noteId, userId) {
    try {
      const noteRef = doc(db, 'campaigns', campaignId, 'notes', noteId);
      
      await updateDoc(noteRef, {
        type: 'shared',
        isRevealed: true,
        revealedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return await this.getNote(campaignId, noteId);
    } catch (error) {
      console.error('Error revealing note:', error);
      throw error;
    }
  },

  // Get notes filtered by type
  async getNotesByType(campaignId, type, userId, userRole) {
    try {
      const allNotes = await this.getCampaignNotes(campaignId, userId, userRole);
      return allNotes.filter(note => note.type === type);
    } catch (error) {
      console.error('Error getting notes by type:', error);
      throw error;
    }
  },

  // Get notes filtered by tag
  async getNotesByTag(campaignId, tag, userId, userRole) {
    try {
      const allNotes = await this.getCampaignNotes(campaignId, userId, userRole);
      return allNotes.filter(note => 
        note.tags && note.tags.includes(tag)
      );
    } catch (error) {
      console.error('Error getting notes by tag:', error);
      throw error;
    }
  },

  // Search notes by content
  async searchNotes(campaignId, searchTerm, userId, userRole) {
    try {
      const allNotes = await this.getCampaignNotes(campaignId, userId, userRole);
      const searchLower = searchTerm.toLowerCase();
      
      return allNotes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  },

  // Real-time listener for campaign notes
  subscribeToNotes(campaignId, userId, userRole, callback) {
    try {
      const notesRef = collection(db, 'campaigns', campaignId, 'notes');
      let q;

      if (userRole === 'dm') {
        q = query(notesRef, orderBy('updatedAt', 'desc'));
      } else {
        q = query(
          notesRef,
          where('type', 'in', ['shared', 'personal']),
          orderBy('updatedAt', 'desc')
        );
      }

      return onSnapshot(q, (snapshot) => {
        const allNotes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter personal notes to only show user's own notes
        const filteredNotes = allNotes.filter(note => {
          if (note.type === 'personal') {
            return note.authorId === userId;
          }
          return true;
        });

        callback(filteredNotes);
      });
    } catch (error) {
      console.error('Error subscribing to notes:', error);
      throw error;
    }
  },

  // Check if user can edit a note
  canEditNote(note, userId, userRole) {
    // DM can edit any note
    if (userRole === 'dm') return true;
    
    // Author can edit their own notes
    if (note.authorId === userId) return true;
    
    // Players can edit shared notes (if campaign allows)
    if (note.type === 'shared') return true;
    
    return false;
  },

  // Check if user can delete a note
  canDeleteNote(note, userId, userRole) {
    // DM can delete any note
    if (userRole === 'dm') return true;
    
    // Author can delete their own notes
    if (note.authorId === userId) return true;
    
    return false;
  }
};