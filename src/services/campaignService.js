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
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generate unique invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Campaign CRUD operations
export const campaignService = {
  // Create a new campaign (DM only)
  async createCampaign(dmId, campaignData) {
    try {
      const campaign = {
        ...campaignData,
        dmId,
        inviteCode: generateInviteCode(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          allowPlayerEdits: true,
          requireApproval: false,
          isActive: true
        },
        members: [{
          userId: dmId,
          role: 'dm',
          joinedAt: serverTimestamp(),
          characterId: null, // DMs don't need characters
          characterName: null,
          characterClass: null,
          characterLevel: null,
          isActive: true
        }],
        tags: ['NPC', 'Location', 'Clue', 'Quest', 'Item', 'Lore']
      };

      const docRef = await addDoc(collection(db, 'campaigns'), campaign);
      
      // Update user's campaigns array
      await this.addUserToCampaign(dmId, docRef.id);
      
      return { id: docRef.id, ...campaign };
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Get campaigns for a user
  async getUserCampaigns(userId) {
    try {
      const q = query(
        collection(db, 'campaigns'),
        where('members', 'array-contains-any', [
          { userId, role: 'dm' },
          { userId, role: 'player' }
        ]),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user campaigns:', error);
      throw error;
    }
  },

  // Get campaign by ID
  async getCampaign(campaignId) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const campaignData = { id: docSnap.id, ...docSnap.data() };
        
        // Migration: Add character fields to existing members if they don't exist
        if (campaignData.members) {
          const updatedMembers = campaignData.members.map(member => ({
            ...member,
            characterId: member.characterId || null,
            characterName: member.characterName || null,
            characterClass: member.characterClass || null,
            characterLevel: member.characterLevel || null
          }));
          
          // Update campaign if migration was needed
          if (JSON.stringify(updatedMembers) !== JSON.stringify(campaignData.members)) {
            await updateDoc(docRef, {
              members: updatedMembers,
              updatedAt: serverTimestamp()
            });
            campaignData.members = updatedMembers;
          }
        }
        
        return campaignData;
      } else {
        throw new Error('Campaign not found');
      }
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  },

  // Update campaign (DM only)
  async updateCampaign(campaignId, updates) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return await this.getCampaign(campaignId);
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Delete campaign (DM only)
  async deleteCampaign(campaignId) {
    try {
      const docRef = doc(db, 'campaigns', campaignId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  },

  // Join campaign by invite code
  async joinCampaignByCode(userId, inviteCode, characterData = null) {
    try {
      const q = query(
        collection(db, 'campaigns'),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid invite code');
      }

      const campaignDoc = querySnapshot.docs[0];
      const campaign = campaignDoc.data();
      
      // Check if user is already a member
      const isAlreadyMember = campaign.members.some(member => member.userId === userId);
      if (isAlreadyMember) {
        throw new Error('You are already a member of this campaign');
      }

      // Add user to campaign
      const newMember = {
        userId,
        role: 'player',
        joinedAt: serverTimestamp(),
        characterId: characterData?.id || null,
        characterName: characterData?.name || null,
        characterClass: characterData?.characterClass || null,
        characterLevel: characterData?.level || null,
        isActive: true
      };

      await updateDoc(campaignDoc.ref, {
        members: arrayUnion(newMember),
        updatedAt: serverTimestamp()
      });

      // Add campaign to user's campaigns
      await this.addUserToCampaign(userId, campaignDoc.id);

      return { id: campaignDoc.id, ...campaign };
    } catch (error) {
      console.error('Error joining campaign:', error);
      throw error;
    }
  },

  // Leave campaign
  async leaveCampaign(userId, campaignId) {
    try {
      const campaign = await this.getCampaign(campaignId);
      
      // Don't allow DM to leave their own campaign
      if (campaign.dmId === userId) {
        throw new Error('DM cannot leave their own campaign. Delete the campaign instead.');
      }

      // Remove user from members array
      const memberToRemove = campaign.members.find(member => member.userId === userId);
      if (memberToRemove) {
        await updateDoc(doc(db, 'campaigns', campaignId), {
          members: arrayRemove(memberToRemove),
          updatedAt: serverTimestamp()
        });
      }

      // Remove campaign from user's campaigns
      await this.removeUserFromCampaign(userId, campaignId);

      return true;
    } catch (error) {
      console.error('Error leaving campaign:', error);
      throw error;
    }
  },

  // Update member's character assignment
  async updateMemberCharacter(campaignId, userId, characterData) {
    try {
      const campaign = await this.getCampaign(campaignId);
      
      // Find the member and update their character info
      const updatedMembers = campaign.members.map(member => {
        if (member.userId === userId) {
          return {
            ...member,
            characterId: characterData?.id || null,
            characterName: characterData?.name || null,
            characterClass: characterData?.characterClass || null,
            characterLevel: characterData?.level || null
          };
        }
        return member;
      });

      await updateDoc(doc(db, 'campaigns', campaignId), {
        members: updatedMembers,
        updatedAt: serverTimestamp()
      });

      return await this.getCampaign(campaignId);
    } catch (error) {
      console.error('Error updating member character:', error);
      throw error;
    }
  },

  // Helper: Add campaign to user's campaigns array
  async addUserToCampaign(userId, campaignId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        campaigns: arrayUnion(campaignId)
      });
    } catch (error) {
      console.error('Error adding campaign to user:', error);
      throw error;
    }
  },

  // Helper: Remove campaign from user's campaigns array
  async removeUserFromCampaign(userId, campaignId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        campaigns: arrayRemove(campaignId)
      });
    } catch (error) {
      console.error('Error removing campaign from user:', error);
      throw error;
    }
  },

  // Get campaign by invite code (for preview before joining)
  async getCampaignByInviteCode(inviteCode) {
    try {
      const q = query(
        collection(db, 'campaigns'),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Invalid invite code');
      }

      const campaignDoc = querySnapshot.docs[0];
      const campaign = campaignDoc.data();
      
      // Return only public info for preview
      return {
        id: campaignDoc.id,
        name: campaign.name,
        description: campaign.description,
        dmId: campaign.dmId,
        memberCount: campaign.members.length,
        createdAt: campaign.createdAt
      };
    } catch (error) {
      console.error('Error getting campaign by invite code:', error);
      throw error;
    }
  },

  // Check if user is DM of a campaign
  isDM(campaign, userId) {
    return campaign && campaign.dmId === userId;
  },

  // Check if user is member of a campaign
  isMember(campaign, userId) {
    return campaign && campaign.members.some(member => member.userId === userId);
  },

  // Get user's role in campaign
  getUserRole(campaign, userId) {
    if (!campaign) return null;
    
    const member = campaign.members.find(member => member.userId === userId);
    return member ? member.role : null;
  },

  // Get member's character information
  getMemberCharacter(campaign, userId) {
    if (!campaign) return null;
    
    const member = campaign.members.find(member => member.userId === userId);
    if (!member) return null;
    
    return {
      characterId: member.characterId,
      characterName: member.characterName,
      characterClass: member.characterClass,
      characterLevel: member.characterLevel
    };
  }
};