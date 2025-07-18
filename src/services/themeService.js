import { 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Theme service for managing user theme preferences
export const themeService = {
  // Get user theme preference
  async getUserTheme(userId) {
    try {
      const docRef = doc(db, 'userPreferences', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data().theme || 'dark';
      } else {
        return 'dark'; // Default theme
      }
    } catch (error) {
      console.error('Error getting user theme:', error);
      return 'dark'; // Default theme on error
    }
  },

  // Update user theme preference
  async updateUserTheme(userId, theme) {
    try {
      const docRef = doc(db, 'userPreferences', userId);
      
      // Try to update first, if document doesn't exist, create it
      try {
        await updateDoc(docRef, {
          theme: theme,
          updatedAt: serverTimestamp()
        });
      } catch (updateError) {
        // If document doesn't exist, create it
        await setDoc(docRef, {
          userId,
          theme: theme,
          activeCharacterId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating user theme:', error);
      throw error;
    }
  }
};