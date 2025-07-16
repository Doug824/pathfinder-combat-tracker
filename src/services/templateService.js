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

export const templateService = {
  // Get all templates for a campaign
  async getCampaignTemplates(campaignId) {
    try {
      const q = query(
        collection(db, 'campaigns', campaignId, 'templates'),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting campaign templates:', error);
      throw error;
    }
  },

  // Add a new template
  async addTemplate(campaignId, templateData, createdBy) {
    try {
      const template = {
        ...templateData,
        campaignId,
        createdBy,
        createdAt: serverTimestamp(),
        isActive: true
      };

      const docRef = await addDoc(collection(db, 'campaigns', campaignId, 'templates'), template);
      return { id: docRef.id, ...template };
    } catch (error) {
      console.error('Error adding template:', error);
      throw error;
    }
  },

  // Update template
  async updateTemplate(campaignId, templateId, updates) {
    try {
      const templateRef = doc(db, 'campaigns', campaignId, 'templates', templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return { id: templateId, ...updates };
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete template
  async deleteTemplate(campaignId, templateId) {
    try {
      const templateRef = doc(db, 'campaigns', campaignId, 'templates', templateId);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Get template by ID
  async getTemplate(campaignId, templateId) {
    try {
      const templateRef = doc(db, 'campaigns', campaignId, 'templates', templateId);
      const docSnap = await getDoc(templateRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Template not found');
      }
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  },

  // Apply template to creature
  applyTemplateToCreature(creature, template) {
    try {
      console.log(`Applying template "${template.name}" to creature "${creature.name}"`);
      
      // Clone the creature to avoid modifying the original
      const modifiedCreature = { ...creature };
      
      // Apply template modifications
      if (template.modifications) {
        const mods = template.modifications;
        
        // Update basic stats
        if (mods.challengeRatingModifier) {
          modifiedCreature.challenge_rating = this.modifyChallengeRating(
            creature.challenge_rating, 
            mods.challengeRatingModifier
          );
        }
        
        if (mods.hitPointsModifier) {
          modifiedCreature.hit_points = Math.max(1, 
            creature.hit_points + mods.hitPointsModifier
          );
        }
        
        if (mods.armorClassModifier) {
          modifiedCreature.armor_class = Math.max(1, 
            creature.armor_class + mods.armorClassModifier
          );
        }
        
        if (mods.speedModifier) {
          modifiedCreature.speed = this.modifySpeed(creature.speed, mods.speedModifier);
        }
        
        // Apply ability score modifications
        if (mods.abilityScoreModifiers) {
          modifiedCreature.stats = { ...creature.stats };
          for (const [ability, modifier] of Object.entries(mods.abilityScoreModifiers)) {
            if (modifiedCreature.stats[ability]) {
              modifiedCreature.stats[ability] = Math.max(1, 
                modifiedCreature.stats[ability] + modifier
              );
            }
          }
        }
        
        // Add template abilities
        if (mods.addedAbilities && mods.addedAbilities.length > 0) {
          modifiedCreature.abilities = [
            ...(creature.abilities || []),
            ...mods.addedAbilities
          ];
        }
        
        // Add template actions
        if (mods.addedActions && mods.addedActions.length > 0) {
          modifiedCreature.actions = [
            ...(creature.actions || []),
            ...mods.addedActions
          ];
        }
        
        // Update type if specified
        if (mods.typeChange) {
          modifiedCreature.type = mods.typeChange;
        }
        
        // Update size if specified
        if (mods.sizeChange) {
          modifiedCreature.size = mods.sizeChange;
        }
        
        // Add template tags
        if (mods.addedTags && mods.addedTags.length > 0) {
          modifiedCreature.tags = [
            ...(creature.tags || []),
            ...mods.addedTags
          ];
        }
      }
      
      // Mark creature as templated
      modifiedCreature.appliedTemplates = [
        ...(creature.appliedTemplates || []),
        {
          templateId: template.id,
          templateName: template.name,
          appliedAt: new Date()
        }
      ];
      
      // Update creature name to reflect template
      modifiedCreature.name = `${template.name} ${creature.name}`;
      
      // Update description to include template info
      const templateDesc = template.description || '';
      modifiedCreature.description = templateDesc + 
        (creature.description ? `\n\nOriginal: ${creature.description}` : '');
      
      console.log(`Template applied successfully. New CR: ${modifiedCreature.challenge_rating}`);
      return modifiedCreature;
    } catch (error) {
      console.error('Error applying template to creature:', error);
      throw error;
    }
  },

  // Helper method to modify challenge rating
  modifyChallengeRating(currentCR, modifier) {
    // Convert CR to number for calculation
    let crValue = this.parseChallengeRating(currentCR);
    crValue += modifier;
    
    // Convert back to CR format
    if (crValue <= 0) return '1/8';
    if (crValue < 1) {
      const fraction = Math.round(crValue * 8);
      return `${fraction}/8`;
    }
    return Math.max(1, Math.round(crValue)).toString();
  },

  // Helper method to parse challenge rating
  parseChallengeRating(crString) {
    if (!crString) return 1;
    
    if (crString.includes('/')) {
      const [num, den] = crString.split('/');
      return parseInt(num) / parseInt(den);
    }
    
    return parseInt(crString) || 1;
  },

  // Helper method to modify speed
  modifySpeed(currentSpeed, modifier) {
    if (!currentSpeed) return '30 ft.';
    
    // Extract number from speed string like "30 ft." or "25 ft., fly 60 ft."
    const speedMatch = currentSpeed.match(/(\d+)\s*ft/);
    if (speedMatch) {
      const baseSpeed = parseInt(speedMatch[1]);
      const newSpeed = Math.max(5, baseSpeed + modifier);
      return currentSpeed.replace(/\d+\s*ft/, `${newSpeed} ft`);
    }
    
    return currentSpeed;
  },

  // Real-time subscription to templates
  subscribeToTemplates(campaignId, callback) {
    const q = query(
      collection(db, 'campaigns', campaignId, 'templates'),
      where('isActive', '==', true),
      orderBy('name', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const templates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(templates);
    }, (error) => {
      console.error('Error in templates subscription:', error);
    });
  },

  // Get default templates (common creature templates)
  getDefaultTemplates() {
    return [
      {
        name: 'Shadow Creature',
        description: 'A creature touched by shadow magic, gaining darkvision and resistance to energy.',
        modifications: {
          challengeRatingModifier: 1,
          typeChange: 'undead',
          addedAbilities: [
            {
              name: 'Darkvision',
              description: 'The creature can see in darkness up to 60 feet.'
            },
            {
              name: 'Shadow Resistance',
              description: 'The creature has resistance to necrotic damage.'
            }
          ],
          addedTags: ['shadow', 'undead', 'darkvision']
        }
      },
      {
        name: 'Fiendish',
        description: 'A creature infused with fiendish energy from the lower planes.',
        modifications: {
          challengeRatingModifier: 1,
          hitPointsModifier: 10,
          abilityScoreModifiers: {
            str: 2,
            dex: 2,
            con: 2
          },
          addedAbilities: [
            {
              name: 'Fiendish Resistance',
              description: 'The creature has resistance to fire damage.'
            },
            {
              name: 'Darkvision',
              description: 'The creature can see in darkness up to 60 feet.'
            }
          ],
          addedTags: ['fiend', 'evil', 'fire resistance']
        }
      },
      {
        name: 'Celestial',
        description: 'A creature blessed with celestial power from the upper planes.',
        modifications: {
          challengeRatingModifier: 1,
          hitPointsModifier: 10,
          abilityScoreModifiers: {
            wis: 2,
            cha: 2
          },
          addedAbilities: [
            {
              name: 'Celestial Resistance',
              description: 'The creature has resistance to radiant damage.'
            },
            {
              name: 'Healing Touch',
              description: 'Once per day, the creature can heal 1d8+2 hit points to a touched ally.'
            }
          ],
          addedTags: ['celestial', 'good', 'radiant resistance']
        }
      },
      {
        name: 'Giant',
        description: 'A creature magically enlarged and strengthened.',
        modifications: {
          challengeRatingModifier: 2,
          hitPointsModifier: 20,
          armorClassModifier: -1,
          sizeChange: 'large',
          abilityScoreModifiers: {
            str: 4,
            con: 2,
            dex: -2
          },
          addedAbilities: [
            {
              name: 'Powerful Build',
              description: 'The creature counts as one size larger for carrying capacity and strength checks.'
            }
          ],
          addedTags: ['giant', 'large', 'strong']
        }
      },
      {
        name: 'Advanced',
        description: 'A more experienced and powerful version of the base creature.',
        modifications: {
          challengeRatingModifier: 2,
          hitPointsModifier: 15,
          armorClassModifier: 2,
          abilityScoreModifiers: {
            str: 2,
            dex: 2,
            con: 2,
            int: 2,
            wis: 2,
            cha: 2
          },
          addedTags: ['advanced', 'elite']
        }
      }
    ];
  }
};