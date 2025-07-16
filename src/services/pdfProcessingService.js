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
      console.log('Starting stat block parsing...');
      
      // More flexible patterns for different formats
      const statBlockPatterns = [
        // Pattern 1: Name followed by CR - more restrictive
        /\b([A-Z][a-zA-Z\s]{3,25})\s+CR\s+(\d+(?:\/\d+)?)\b/gi,
        
        // Pattern 2: Name on its own line, followed by lines with stats
        /^([A-Z][a-zA-Z\s]{3,25})\s*\n.*?(?:AC|Armor Class)\s*(\d+)/gim,
        
        // Pattern 3: Look for creature names with AC and HP on same or nearby lines - more restrictive
        /\b([A-Z][a-zA-Z\s]{3,25}).*?(?:AC|Armor Class).*?(\d+).*?(?:HP|Hit Points).*?(\d+)/gi,
        
        // Pattern 4: Pathfinder format with size/type
        /\b([A-Z][a-zA-Z\s]{3,25})\s+(Small|Medium|Large|Huge|Gargantuan|Tiny)\s+(humanoid|beast|dragon|undead|fiend|celestial|fey|elemental|construct|plant|ooze|aberration|monstrosity|giant)/gi,
        
        // Pattern 5: Simple name extraction near stat keywords - more restrictive
        /\b([A-Z][a-zA-Z\s]{3,25})(?=.*(?:STR|DEX|CON|INT|WIS|CHA)\s*\d+)/gi
      ];
      
      // Try each pattern with limits to prevent timeouts
      for (let i = 0; i < statBlockPatterns.length; i++) {
        const pattern = statBlockPatterns[i];
        let match;
        let patternMatches = 0;
        let maxMatches = 50; // Limit matches per pattern
        
        while ((match = pattern.exec(text)) !== null && patternMatches < maxMatches) {
          patternMatches++;
          const creature = this.parseCreatureFromMatch(match, text, i + 1);
          if (creature) {
            statBlocks.push(creature);
          }
          
          // Prevent infinite loops
          if (pattern.lastIndex === match.index) {
            break;
          }
        }
        
        console.log(`Pattern ${i + 1} found ${patternMatches} matches`);
        if (patternMatches >= maxMatches) {
          console.log(`Pattern ${i + 1} hit match limit, stopping`);
        }
      }
      
      // If no patterns match, try to extract creatures by looking for common keywords
      if (statBlocks.length === 0) {
        console.log('No patterns matched, trying keyword extraction...');
        const keywordCreatures = this.extractByKeywords(text);
        statBlocks.push(...keywordCreatures);
      }
      
      const deduplicated = this.deduplicateCreatures(statBlocks);
      console.log(`Final creature count after deduplication: ${deduplicated.length}`);
      
      return deduplicated;
    } catch (error) {
      console.error('Error parsing stat blocks:', error);
      return [];
    }
  },

  // Parse creature from regex match
  parseCreatureFromMatch(match, fullText, patternNumber) {
    try {
      const name = match[1]?.trim();
      if (!name || name.length < 3 || name.length > 30) return null;
      
      // Filter out obvious false positives
      const falsePositives = [
        'award them a', 'grant them a', 'give them a', 'each melee', 'fort', 'ref', 'will',
        'burnt offerings', 'b u r n t o f f e r i n g s', 'rise of the runelords',
        'r u n e l o r d s', 'gamemastery', 'adventure path', 'part', 'credits',
        'table of contents', 'foreword', 'bestiary', 'appendix', 'index'
      ];
      
      if (falsePositives.some(fp => name.toLowerCase().includes(fp))) {
        return null;
      }
      
      // Filter out names that are clearly not creatures
      if (name.match(/^(the|a|an|and|or|but|if|when|where|how|why|what)\s/i)) {
        return null;
      }
      
      // Filter out names with numbers or special characters that aren't creature names
      if (name.match(/\d{2,}|\$|©|®|™|page|pp\.|chapter|section/i)) {
        return null;
      }
      
      console.log(`Pattern ${patternNumber} matched: "${name}"`);
      
      // Extract more details from the surrounding text
      const creatureSection = this.extractCreatureSection(name, fullText);
      
      // Validate that this section actually contains creature stats
      const hasStats = creatureSection.match(/\b(STR|DEX|CON|INT|WIS|CHA)\s*\d+/i) || 
                       creatureSection.match(/\b(AC|Armor Class)\s*\d+/i) ||
                       creatureSection.match(/\b(HP|Hit Points)\s*\d+/i);
      
      if (!hasStats && patternNumber === 1) {
        // For CR pattern, we need some stats to validate it's actually a creature
        return null;
      }
      
      // Get challenge rating from match if available
      let challenge_rating = '1';
      if (match[2] && patternNumber === 1) {
        challenge_rating = match[2];
      } else {
        challenge_rating = this.extractCR(creatureSection) || '1';
      }
      
      // Get size/type from match if available (pattern 4)
      let size = 'medium';
      let type = 'humanoid';
      if (patternNumber === 4 && match[2] && match[3]) {
        size = match[2].toLowerCase();
        type = match[3].toLowerCase();
      } else {
        size = this.extractSize(creatureSection) || 'medium';
        type = this.extractType(creatureSection) || 'humanoid';
      }
      
      const creature = {
        name,
        type,
        size,
        challenge_rating,
        armor_class: this.extractAC(creatureSection) || 10,
        hit_points: this.extractHP(creatureSection) || 10,
        speed: this.extractSpeed(creatureSection) || '30 ft.',
        stats: this.extractStats(creatureSection),
        abilities: this.extractAbilities(creatureSection),
        actions: this.extractActions(creatureSection),
        description: creatureSection.substring(0, 500), // First 500 chars as description
        tags: this.generateTags(creatureSection)
      };
      
      console.log(`Created creature: ${creature.name} (${creature.type}, CR ${creature.challenge_rating})`);
      return creature;
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
    const keywords = ['AC', 'Hit Points', 'Speed', 'STR', 'DEX', 'CON', 'Challenge', 'HP', 'Armor Class'];
    
    console.log('Trying keyword extraction...');
    
    // Split text into potential creature sections using multiple delimiters
    const sections = text.split(/\n\s*\n|\n\n|\f/);
    
    console.log(`Split text into ${sections.length} sections`);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (section.length < 50) continue; // Skip very short sections
      
      const keywordCount = keywords.filter(keyword => 
        section.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      
      console.log(`Section ${i}: ${keywordCount} keywords found`);
      
      // If section contains multiple stat block keywords, it's likely a creature
      if (keywordCount >= 2) { // Lower threshold
        const lines = section.split('\n').filter(line => line.trim());
        
        // Try to find a creature name - look for capitalized words
        let name = null;
        for (const line of lines.slice(0, 5)) { // Check first 5 lines
          const trimmed = line.trim();
          if (trimmed.match(/^[A-Z][a-zA-Z\s]{2,30}$/) && 
              !trimmed.includes(':') && 
              !trimmed.includes('AC') && 
              !trimmed.includes('HP')) {
            name = trimmed;
            break;
          }
        }
        
        if (!name) {
          // If no clear name found, try to extract from first line
          const firstLine = lines[0]?.trim();
          if (firstLine && firstLine.length > 2 && firstLine.length < 50) {
            name = firstLine.replace(/[^a-zA-Z\s]/g, '').trim();
          }
        }
        
        if (name && name.length > 2 && name.length < 50) {
          console.log(`Found potential creature: "${name}"`);
          
          const creature = {
            name,
            type: this.extractType(section) || 'humanoid',
            size: this.extractSize(section) || 'medium',
            challenge_rating: this.extractCR(section) || '1',
            armor_class: this.extractAC(section) || 10,
            hit_points: this.extractHP(section) || 10,
            speed: this.extractSpeed(section) || '30 ft.',
            stats: this.extractStats(section),
            abilities: this.extractAbilities(section),
            actions: this.extractActions(section),
            description: section.substring(0, 300),
            tags: this.generateTags(section)
          };
          
          creatures.push(creature);
        }
      }
    }
    
    console.log(`Keyword extraction found ${creatures.length} creatures`);
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
      
      // Debug logging
      console.log('Extracted text length:', text.length);
      console.log('First 2000 characters:', text.substring(0, 2000));
      
      const creatures = this.parseStatBlocks(text);
      
      console.log('Found creatures:', creatures.length);
      if (creatures.length > 0) {
        console.log('First creature:', creatures[0]);
      }
      
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