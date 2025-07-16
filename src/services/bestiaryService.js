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

export const bestiaryService = {
  // Get all creatures for a campaign
  async getCampaignCreatures(campaignId) {
    try {
      const q = query(
        collection(db, 'campaigns', campaignId, 'bestiary'),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting campaign creatures:', error);
      throw error;
    }
  },

  // Add a single creature to campaign bestiary
  async addCreature(campaignId, creatureData, uploadedBy) {
    try {
      const creature = {
        ...creatureData,
        campaignId,
        uploadedBy,
        uploadedAt: serverTimestamp(),
        isPublic: false, // DM can choose to make public later
        tags: creatureData.tags || []
      };

      const docRef = await addDoc(collection(db, 'campaigns', campaignId, 'bestiary'), creature);
      return { id: docRef.id, ...creature };
    } catch (error) {
      console.error('Error adding creature:', error);
      throw error;
    }
  },

  // Add multiple creatures from PDF processing
  async addCreatures(campaignId, creaturesData, uploadedBy, sourceFile) {
    try {
      const results = [];
      
      for (const creatureData of creaturesData) {
        const creature = {
          ...creatureData,
          campaignId,
          uploadedBy,
          uploadedAt: serverTimestamp(),
          sourceFile: sourceFile || null,
          isPublic: false,
          tags: creatureData.tags || []
        };

        const docRef = await addDoc(collection(db, 'campaigns', campaignId, 'bestiary'), creature);
        results.push({ id: docRef.id, ...creature });
      }
      
      return results;
    } catch (error) {
      console.error('Error adding creatures:', error);
      throw error;
    }
  },

  // Update creature
  async updateCreature(campaignId, creatureId, updates) {
    try {
      const creatureRef = doc(db, 'campaigns', campaignId, 'bestiary', creatureId);
      await updateDoc(creatureRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { id: creatureId, ...updates };
    } catch (error) {
      console.error('Error updating creature:', error);
      throw error;
    }
  },

  // Delete creature
  async deleteCreature(campaignId, creatureId) {
    try {
      const creatureRef = doc(db, 'campaigns', campaignId, 'bestiary', creatureId);
      await deleteDoc(creatureRef);
    } catch (error) {
      console.error('Error deleting creature:', error);
      throw error;
    }
  },

  // Get creature by ID
  async getCreature(campaignId, creatureId) {
    try {
      const creatureRef = doc(db, 'campaigns', campaignId, 'bestiary', creatureId);
      const docSnap = await getDoc(creatureRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Creature not found');
      }
    } catch (error) {
      console.error('Error getting creature:', error);
      throw error;
    }
  },

  // Search creatures by name or type
  async searchCreatures(campaignId, searchTerm) {
    try {
      const creatures = await this.getCampaignCreatures(campaignId);
      
      if (!searchTerm) return creatures;
      
      const searchLower = searchTerm.toLowerCase();
      return creatures.filter(creature => 
        creature.name.toLowerCase().includes(searchLower) ||
        creature.type?.toLowerCase().includes(searchLower) ||
        creature.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching creatures:', error);
      throw error;
    }
  },

  // Real-time subscription to creatures
  subscribeToCreatures(campaignId, callback) {
    const q = query(
      collection(db, 'campaigns', campaignId, 'bestiary'),
      orderBy('name', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const creatures = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(creatures);
    }, (error) => {
      console.error('Error in creatures subscription:', error);
    });
  },

  // Filter creatures by type
  async getCreaturesByType(campaignId, type) {
    try {
      const q = query(
        collection(db, 'campaigns', campaignId, 'bestiary'),
        where('type', '==', type),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting creatures by type:', error);
      throw error;
    }
  },

  // Get creatures by challenge rating range
  async getCreaturesByCR(campaignId, minCR, maxCR) {
    try {
      const creatures = await this.getCampaignCreatures(campaignId);
      
      return creatures.filter(creature => {
        const cr = this.parseChallengeRating(creature.challenge_rating);
        return cr >= minCR && cr <= maxCR;
      });
    } catch (error) {
      console.error('Error getting creatures by CR:', error);
      throw error;
    }
  },

  // Helper function to parse challenge rating
  parseChallengeRating(crString) {
    if (!crString) return 0;
    
    if (crString.includes('/')) {
      const [num, den] = crString.split('/');
      return parseInt(num) / parseInt(den);
    }
    
    return parseInt(crString) || 0;
  },

  // Validate creature data structure
  validateCreatureData(creatureData) {
    const required = ['name', 'type', 'size'];
    const missing = required.filter(field => !creatureData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    return true;
  }
};