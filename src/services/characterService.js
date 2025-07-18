import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Character CRUD operations
export const characterService = {
  // Create a new character
  async createCharacter(userId, characterData) {
    try {
      const character = {
        ...characterData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'characters'), character);
      return { id: docRef.id, ...characterData };
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  },

  // Get all characters for a user
  async getUserCharacters(userId) {
    try {
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        collection(db, 'characters'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const characters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort on client side by updatedAt
      return characters.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting user characters:', error);
      throw error;
    }
  },

  // Get character by ID
  async getCharacter(characterId) {
    try {
      const docRef = doc(db, 'characters', characterId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Character not found');
      }
    } catch (error) {
      console.error('Error getting character:', error);
      throw error;
    }
  },

  // Update character
  async updateCharacter(characterId, updates) {
    try {
      const docRef = doc(db, 'characters', characterId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return await this.getCharacter(characterId);
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  },

  // Delete character
  async deleteCharacter(characterId) {
    try {
      const docRef = doc(db, 'characters', characterId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  },

  // Get or create user preferences document
  async getUserPreferences(userId) {
    try {
      const docRef = doc(db, 'userPreferences', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        // Create default preferences
        const defaultPrefs = {
          userId,
          activeCharacterId: null,
          theme: 'dark',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Use setDoc instead of updateDoc for new documents
        await setDoc(docRef, defaultPrefs);
        return defaultPrefs;
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      // Return default preferences on error
      return {
        userId,
        activeCharacterId: null,
        theme: 'dark'
      };
    }
  },

  // Update user preferences
  async updateUserPreferences(userId, updates) {
    try {
      const docRef = doc(db, 'userPreferences', userId);
      
      // Try to update first, if document doesn't exist, create it
      try {
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (updateError) {
        // If document doesn't exist, create it
        await setDoc(docRef, {
          userId,
          activeCharacterId: null,
          theme: 'dark',
          ...updates,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return await this.getUserPreferences(userId);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
};