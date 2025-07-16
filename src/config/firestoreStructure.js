// Firestore Database Structure Design
// This file documents the data structure for the Campaign Companion Module

const firestoreStructure = {
  // Users Collection
  users: {
    userId: {
      uid: 'string',
      email: 'string',
      displayName: 'string',
      photoURL: 'string',
      createdAt: 'timestamp',
      lastLogin: 'timestamp',
      campaigns: ['campaignId1', 'campaignId2'], // Array of campaign IDs
      role: 'player' // Default role, can be overridden per campaign
    }
  },

  // Campaigns Collection
  campaigns: {
    campaignId: {
      id: 'string',
      name: 'string',
      description: 'string',
      dmId: 'userId', // User ID of the DM
      inviteCode: 'string', // Unique code for joining
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      settings: {
        allowPlayerEdits: true, // Can players edit shared notes?
        requireApproval: false, // Do shared notes need DM approval?
        isActive: true
      },
      members: [
        {
          userId: 'string',
          role: 'dm|player',
          joinedAt: 'timestamp',
          characterId: 'string', // Reference to user's character
          characterName: 'string', // Character name for display
          characterClass: 'string', // Character class for display
          characterLevel: 'number', // Character level for display
          isActive: true
        }
      ],
      tags: ['NPC', 'Location', 'Clue', 'Quest', 'Item', 'Lore'] // Customizable
    }
  },

  // Notes Collection (Subcollection of campaigns)
  'campaigns/{campaignId}/notes': {
    noteId: {
      id: 'string',
      title: 'string',
      content: 'string', // Rich text/markdown
      type: 'personal|shared|dm', // Note visibility type
      authorId: 'userId',
      authorName: 'string',
      createdAt: 'timestamp',
      updatedAt: 'timestamp',
      sessionDate: 'timestamp', // When this note was relevant
      tags: ['tag1', 'tag2'],
      linkedNotes: ['noteId1', 'noteId2'], // Related notes
      attachments: [
        {
          url: 'string',
          name: 'string',
          type: 'image|pdf|other',
          uploadedAt: 'timestamp'
        }
      ],
      reactions: {
        '👍': ['userId1', 'userId2'],
        '❓': ['userId3']
      },
      isRevealed: false, // For DM notes that can be revealed
      revealedAt: 'timestamp', // When it was revealed
      editHistory: [
        {
          editedBy: 'userId',
          editedAt: 'timestamp',
          previousContent: 'string'
        }
      ]
    }
  },

  // Sessions Collection (Subcollection of campaigns)
  'campaigns/{campaignId}/sessions': {
    sessionId: {
      id: 'string',
      sessionNumber: 1,
      date: 'timestamp',
      title: 'string',
      summary: 'string', // AI-generated or manual
      dmNotes: 'string', // Private DM session notes
      attendees: ['userId1', 'userId2'],
      createdAt: 'timestamp',
      updatedAt: 'timestamp'
    }
  },

  // Handouts Collection (Subcollection of campaigns)
  'campaigns/{campaignId}/handouts': {
    handoutId: {
      id: 'string',
      title: 'string',
      description: 'string',
      fileUrl: 'string',
      fileType: 'image|pdf|text',
      uploadedBy: 'userId',
      uploadedAt: 'timestamp',
      isRevealed: false,
      revealedTo: ['userId1', 'userId2'], // Specific players
      revealedAt: 'timestamp'
    }
  }
};

// Firestore Security Rules Structure
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isUser(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function getCampaign(campaignId) {
      return get(/databases/$(database)/documents/campaigns/$(campaignId)).data;
    }
    
    function isDM(campaignId) {
      return isAuthenticated() && getCampaign(campaignId).dmId == request.auth.uid;
    }
    
    function isCampaignMember(campaignId) {
      return isAuthenticated() && 
        request.auth.uid in getCampaign(campaignId).members.map(m => m.userId);
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isUser(userId);
      allow create: if isUser(userId);
      allow update: if isUser(userId);
    }
    
    // Campaigns collection
    match /campaigns/{campaignId} {
      allow read: if isCampaignMember(campaignId);
      allow create: if isAuthenticated();
      allow update: if isDM(campaignId);
      allow delete: if isDM(campaignId);
      
      // Notes subcollection
      match /notes/{noteId} {
        allow read: if isCampaignMember(campaignId) && (
          resource.data.type == 'shared' ||
          (resource.data.type == 'personal' && resource.data.authorId == request.auth.uid) ||
          (resource.data.type == 'dm' && isDM(campaignId))
        );
        allow create: if isCampaignMember(campaignId);
        allow update: if isCampaignMember(campaignId) && (
          resource.data.authorId == request.auth.uid ||
          isDM(campaignId)
        );
        allow delete: if resource.data.authorId == request.auth.uid || isDM(campaignId);
      }
      
      // Sessions subcollection
      match /sessions/{sessionId} {
        allow read: if isCampaignMember(campaignId);
        allow write: if isDM(campaignId);
      }
      
      // Handouts subcollection
      match /handouts/{handoutId} {
        allow read: if isCampaignMember(campaignId) && (
          resource.data.isRevealed ||
          request.auth.uid in resource.data.revealedTo ||
          isDM(campaignId)
        );
        allow write: if isDM(campaignId);
      }
    }
  }
}
`;

export default firestoreStructure;