import * as pdfjsLib from 'pdfjs-dist';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Set up the worker for PDF.js - use local worker to avoid CORS issues
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

export const pdfProcessingService = {
  // Extract text from PDF file
  async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await getDocument(arrayBuffer).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items into readable text
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        
        fullText += pageText + '\n\n';
      }
      
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  },

  // Parse stat blocks from text using pattern matching
  parseStatBlocks(text) {
    const statBlocks = [];
    
    try {
      // Pattern to match D&D/Pathfinder stat blocks
      const statBlockPatterns = [
        // Basic creature pattern: Name, size type, AC, HP, etc.
        /([A-Z][a-z\s]+)\n([A-Z][a-z\s]+)\s+([a-z\s]+)\nArmor Class\s+(\d+).*?\nHit Points\s+(\d+)/gim,
        
        // Alternative pattern for different formats
        /^([A-Z][A-Z\s]+)\s*\n.*?AC\s*(\d+).*?HP\s*(\d+)/gim,
        
        // Pathfinder specific pattern
        /^([A-Z][a-z\s]+)\s+CR\s+(\d+(?:\/\d+)?)/gim
      ];
      
      // Try each pattern
      for (const pattern of statBlockPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          const creature = this.parseCreatureFromMatch(match, text);
          if (creature) {
            statBlocks.push(creature);
          }
        }
      }
      
      // If no patterns match, try to extract creatures by looking for common keywords
      if (statBlocks.length === 0) {
        const keywordCreatures = this.extractByKeywords(text);
        statBlocks.push(...keywordCreatures);
      }
      
      return this.deduplicateCreatures(statBlocks);
    } catch (error) {
      console.error('Error parsing stat blocks:', error);
      return [];
    }
  },

  // Parse creature from regex match
  parseCreatureFromMatch(match, fullText) {
    try {
      const name = match[1]?.trim();
      if (!name) return null;
      
      // Extract more details from the surrounding text
      const creatureSection = this.extractCreatureSection(name, fullText);
      
      return {
        name,
        type: this.extractType(creatureSection) || 'humanoid',
        size: this.extractSize(creatureSection) || 'medium',
        challenge_rating: this.extractCR(creatureSection) || '1',
        armor_class: this.extractAC(creatureSection) || 10,
        hit_points: this.extractHP(creatureSection) || 10,
        speed: this.extractSpeed(creatureSection) || '30 ft.',
        stats: this.extractStats(creatureSection),
        abilities: this.extractAbilities(creatureSection),
        actions: this.extractActions(creatureSection),
        description: creatureSection.substring(0, 500), // First 500 chars as description
        tags: this.generateTags(creatureSection)
      };
    } catch (error) {
      console.error('Error parsing creature from match:', error);
      return null;
    }
  },

  // Extract creature section from full text
  extractCreatureSection(name, text) {
    const nameIndex = text.indexOf(name);
    if (nameIndex === -1) return '';
    
    // Get text starting from creature name
    const startText = text.substring(nameIndex);
    
    // Find the end of this creature (next creature name or end of text)
    const nextCreatureMatch = startText.substring(100).match(/^[A-Z][a-z\s]+\n.*?AC\s*\d+/m);
    const endIndex = nextCreatureMatch ? nextCreatureMatch.index + 100 : Math.min(startText.length, 2000);
    
    return startText.substring(0, endIndex);
  },

  // Extract by common keywords when patterns fail
  extractByKeywords(text) {
    const creatures = [];
    const keywords = ['AC', 'Hit Points', 'Speed', 'STR', 'DEX', 'CON', 'Challenge'];
    
    // Split text into potential creature sections
    const sections = text.split(/\n\s*\n/);
    
    for (const section of sections) {
      const keywordCount = keywords.filter(keyword => section.includes(keyword)).length;
      
      // If section contains multiple stat block keywords, it's likely a creature
      if (keywordCount >= 3) {
        const lines = section.split('\n');
        const name = lines[0]?.trim();
        
        if (name && name.length > 2 && name.length < 50) {
          creatures.push({
            name,
            type: this.extractType(section) || 'humanoid',
            size: this.extractSize(section) || 'medium',
            challenge_rating: this.extractCR(section) || '1',
            armor_class: this.extractAC(section) || 10,
            hit_points: this.extractHP(section) || 10,
            speed: this.extractSpeed(section) || '30 ft.',
            stats: this.extractStats(section),
            description: section.substring(0, 300),
            tags: this.generateTags(section)
          });
        }
      }
    }
    
    return creatures;
  },

  // Helper functions for extracting specific data
  extractType(text) {
    const typeMatch = text.match(/\b(aberration|beast|celestial|construct|dragon|elemental|fey|fiend|giant|humanoid|monstrosity|ooze|plant|undead)\b/i);
    return typeMatch ? typeMatch[1].toLowerCase() : null;
  },

  extractSize(text) {
    const sizeMatch = text.match(/\b(tiny|small|medium|large|huge|gargantuan)\b/i);
    return sizeMatch ? sizeMatch[1].toLowerCase() : null;
  },

  extractCR(text) {
    const crMatch = text.match(/(?:Challenge|CR)\s*(\d+(?:\/\d+)?)/i);
    return crMatch ? crMatch[1] : null;
  },

  extractAC(text) {
    const acMatch = text.match(/(?:Armor Class|AC)\s*(\d+)/i);
    return acMatch ? parseInt(acMatch[1]) : null;
  },

  extractHP(text) {
    const hpMatch = text.match(/(?:Hit Points|HP)\s*(\d+)/i);
    return hpMatch ? parseInt(hpMatch[1]) : null;
  },

  extractSpeed(text) {
    const speedMatch = text.match(/Speed\s*([^\n]+)/i);
    return speedMatch ? speedMatch[1].trim() : null;
  },

  extractStats(text) {
    const stats = {};
    const statNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
    
    for (const stat of statNames) {
      const match = text.match(new RegExp(`${stat}\\s*(\\d+)`, 'i'));
      stats[stat.toLowerCase()] = match ? parseInt(match[1]) : 10;
    }
    
    return stats;
  },

  extractAbilities(text) {
    const abilities = [];
    
    // Look for ability descriptions
    const abilityMatches = text.match(/([A-Z][a-z\s]+)\.\s*([^.]+\.)/g);
    
    if (abilityMatches) {
      for (const match of abilityMatches) {
        const [, name, description] = match.match(/([A-Z][a-z\s]+)\.\s*(.+)/);
        if (name && description) {
          abilities.push({
            name: name.trim(),
            description: description.trim()
          });
        }
      }
    }
    
    return abilities;
  },

  extractActions(text) {
    const actions = [];
    
    // Look for action descriptions
    const actionSection = text.match(/Actions?\s*\n(.*?)(?:\n[A-Z]|\n\s*$)/s);
    if (actionSection) {
      const actionText = actionSection[1];
      const actionMatches = actionText.match(/([A-Z][a-z\s]+)\.\s*([^.]+\.)/g);
      
      if (actionMatches) {
        for (const match of actionMatches) {
          const [, name, description] = match.match(/([A-Z][a-z\s]+)\.\s*(.+)/);
          if (name && description) {
            actions.push({
              name: name.trim(),
              description: description.trim()
            });
          }
        }
      }
    }
    
    return actions;
  },

  generateTags(text) {
    const tags = [];
    
    // Add type-based tags
    if (text.match(/\bdragon\b/i)) tags.push('dragon');
    if (text.match(/\bundead\b/i)) tags.push('undead');
    if (text.match(/\bfiend\b/i)) tags.push('fiend');
    if (text.match(/\bfey\b/i)) tags.push('fey');
    
    // Add ability-based tags
    if (text.match(/\bfly\b/i)) tags.push('flying');
    if (text.match(/\bswim\b/i)) tags.push('swimming');
    if (text.match(/\bspellcaster\b/i)) tags.push('spellcaster');
    
    // Add size tags
    if (text.match(/\blarge\b/i)) tags.push('large');
    if (text.match(/\bhuge\b/i)) tags.push('huge');
    if (text.match(/\bgargantuan\b/i)) tags.push('gargantuan');
    
    return tags;
  },

  // Remove duplicate creatures
  deduplicateCreatures(creatures) {
    const seen = new Set();
    return creatures.filter(creature => {
      const key = creature.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  },

  // Process PDF file and extract creatures
  async processFile(file) {
    try {
      const text = await this.extractTextFromPDF(file);
      const creatures = this.parseStatBlocks(text);
      
      return {
        success: true,
        creatures,
        text: text.substring(0, 1000), // First 1000 chars for preview
        fileName: file.name
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      return {
        success: false,
        error: error.message,
        creatures: [],
        fileName: file.name
      };
    }
  }
};