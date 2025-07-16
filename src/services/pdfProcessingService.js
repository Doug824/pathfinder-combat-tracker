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
      console.log('Text length:', text.length);
      
      // Look for stat blocks throughout the text but with better filtering
      const statBlockPatterns = [
        // Pattern 1: Name + CR (most reliable indicator)
        /\b([A-Z][a-zA-Z\s]{3,25})\s+CR\s+(\d+(?:\/\d+)?)\b/gi,
        
        // Pattern 2: Size + Type + Name pattern (like "Medium humanoid Tsuto")
        /\b(Small|Medium|Large|Huge|Gargantuan|Tiny)\s+(humanoid|beast|dragon|undead|fiend|celestial|fey|elemental|construct|plant|ooze|aberration|monstrosity|giant)\s+([A-Z][a-zA-Z\s]{3,25})/gi,
        
        // Pattern 3: Name followed by parenthetical info like "Goblin (fighter 2)"
        /\b([A-Z][a-zA-Z\s]{3,25})\s+\([^)]*(?:fighter|cleric|wizard|rogue|ranger|barbarian|bard|druid|paladin|sorcerer|monk)[^)]*\)/gi
      ];
      
      // Try each pattern
      for (let i = 0; i < statBlockPatterns.length; i++) {
        const pattern = statBlockPatterns[i];
        let match;
        let patternMatches = 0;
        let maxMatches = 30;
        
        while ((match = pattern.exec(text)) !== null && patternMatches < maxMatches) {
          patternMatches++;
          
          let creatureName, challengeRating = '1', size = 'medium', type = 'humanoid';
          
          if (i === 0) {
            // Pattern 1: Name + CR
            creatureName = match[1];
            challengeRating = match[2];
          } else if (i === 1) {
            // Pattern 2: Size + Type + Name
            size = match[1].toLowerCase();
            type = match[2].toLowerCase();
            creatureName = match[3];
          } else if (i === 2) {
            // Pattern 3: Name + class info
            creatureName = match[1];
          }
          
          const creature = this.parseCreatureFromName(creatureName, text, challengeRating, size, type);
          if (creature) {
            statBlocks.push(creature);
          }
          
          // Prevent infinite loops
          if (pattern.lastIndex === match.index) {
            break;
          }
        }
        
        console.log(`Pattern ${i + 1} found ${patternMatches} matches`);
      }
      
      const deduplicated = this.deduplicateCreatures(statBlocks);
      console.log(`Final creature count after deduplication: ${deduplicated.length}`);
      
      return deduplicated;
    } catch (error) {
      console.error('Error parsing stat blocks:', error);
      return [];
    }
  },

  // Parse creature from name with better validation
  parseCreatureFromName(name, fullText, challengeRating = '1', size = 'medium', type = 'humanoid') {
    try {
      if (!name || name.length < 3 || name.length > 25) return null;
      
      name = name.trim();
      
      // Enhanced false positive filters
      const falsePositives = [
        // Common false positives from your PDF
        'each time a', 'when a', 'if a', 'as a', 'like a', 'such a', 'once a',
        'award them a', 'grant them a', 'give them a', 'allow them a',
        'each melee', 'each ranged', 'each attack', 'each round',
        'burnt offerings', 'rise of the runelords', 'gamemastery',
        'adventure path', 'table of contents', 'foreword', 'credits',
        'fort', 'ref', 'will', 'str', 'dex', 'con', 'int', 'wis', 'cha',
        // Adventure-specific text
        'sandpoint', 'thassilon', 'pathfinder', 'paizo'
      ];
      
      if (falsePositives.some(fp => name.toLowerCase().includes(fp))) {
        return null;
      }
      
      // Filter out obvious non-creature names
      if (name.match(/^(the|a|an|and|or|but|if|when|where|how|why|what|this|that|these|those)\s/i)) {
        return null;
      }
      
      // Filter out names that are clearly not creatures
      if (name.match(/\d{2,}|\$|©|®|™|page|pp\.|chapter|section|table|figure/i)) {
        return null;
      }
      
      console.log(`Parsing creature: "${name}"`);
      
      // Get the section around this creature name
      const creatureSection = this.extractCreatureSection(name, fullText);
      
      // Validate this looks like a creature by checking for stat-like content
      const hasCreatureIndicators = creatureSection.match(/\b(AC|Armor Class|HP|Hit Points|STR|DEX|CON|INT|WIS|CHA|Fort|Ref|Will|Melee|Ranged|Speed)\s*:?\s*\d+/i);
      
      if (!hasCreatureIndicators) {
        console.log(`Rejected "${name}" - no creature indicators found`);
        return null;
      }
      
      // Extract stats from the creature section
      const extractedCR = this.extractCR(creatureSection);
      const finalCR = extractedCR || challengeRating;
      
      const creature = {
        name,
        type: this.extractType(creatureSection) || type,
        size: this.extractSize(creatureSection) || size,
        challenge_rating: finalCR,
        armor_class: this.extractAC(creatureSection) || 10,
        hit_points: this.extractHP(creatureSection) || 10,
        speed: this.extractSpeed(creatureSection) || '30 ft.',
        stats: this.extractStats(creatureSection),
        abilities: this.extractAbilities(creatureSection),
        actions: this.extractActions(creatureSection),
        description: this.extractDescription(creatureSection),
        tags: this.generateTags(creatureSection)
      };
      
      console.log(`Created creature: ${creature.name} (${creature.type}, CR ${creature.challenge_rating})`);
      return creature;
    } catch (error) {
      console.error('Error parsing creature from name:', error);
      return null;
    }
  },

  // Find the bestiary or appendix section of the PDF
  findBestiarySection(text) {
    console.log('Looking for bestiary section...');
    
    // Common bestiary section headers
    const bestiaryHeaders = [
      /bestiary/i,
      /appendix.*creatures/i,
      /appendix.*monsters/i,
      /creatures.*appendix/i,
      /monsters.*appendix/i,
      /stat.*blocks/i,
      /npc.*appendix/i,
      /creature.*statistics/i
    ];
    
    for (const header of bestiaryHeaders) {
      const match = text.match(header);
      if (match) {
        const startIndex = match.index;
        console.log(`Found bestiary section starting at index ${startIndex}`);
        
        // Try to find the end of the bestiary section
        const afterBestiary = text.substring(startIndex);
        
        // Look for common section endings
        const endPatterns = [
          /\n\s*open\s+game\s+license/i,
          /\n\s*legal\s+information/i,
          /\n\s*index/i,
          /\n\s*back\s+cover/i,
          /\n\s*ogl/i
        ];
        
        let endIndex = afterBestiary.length;
        for (const endPattern of endPatterns) {
          const endMatch = afterBestiary.match(endPattern);
          if (endMatch && endMatch.index < endIndex) {
            endIndex = endMatch.index;
          }
        }
        
        const bestiaryText = afterBestiary.substring(0, endIndex);
        console.log(`Bestiary section length: ${bestiaryText.length}`);
        return bestiaryText;
      }
    }
    
    console.log('No bestiary section found, will use full text');
    return null;
  },

  // Parse structured creature from detailed match
  parseStructuredCreature(match, fullText, patternNumber) {
    try {
      const name = match[1]?.trim();
      if (!name || name.length < 3 || name.length > 25) return null;
      
      // Apply false positive filters
      const falsePositives = [
        'each time a', 'when a', 'if a', 'as a', 'like a', 'such a',
        'award them a', 'grant them a', 'give them a', 'each melee',
        'burnt offerings', 'rise of the runelords', 'gamemastery',
        'adventure path', 'table of contents', 'foreword', 'credits'
      ];
      
      if (falsePositives.some(fp => name.toLowerCase().includes(fp))) {
        return null;
      }
      
      console.log(`Structured pattern ${patternNumber} matched: "${name}"`);
      
      // Extract creature section for detailed parsing
      const creatureSection = this.extractCreatureSection(name, fullText);
      
      let challenge_rating = '1';
      let size = 'medium';
      let type = 'humanoid';
      let armor_class = 10;
      let hit_points = 10;
      
      // Extract data from match based on pattern
      if (patternNumber === 1) {
        // Pattern 1: Name, CR, AC, HP
        challenge_rating = match[2] || '1';
        armor_class = parseInt(match[3]) || 10;
        hit_points = parseInt(match[4]) || 10;
      } else if (patternNumber === 2) {
        // Pattern 2: Name, size, type, AC, HP
        size = match[2]?.toLowerCase() || 'medium';
        type = match[3]?.toLowerCase() || 'humanoid';
        armor_class = parseInt(match[4]) || 10;
        hit_points = parseInt(match[5]) || 10;
        challenge_rating = this.extractCR(creatureSection) || '1';
      }
      
      const creature = {
        name,
        type,
        size,
        challenge_rating,
        armor_class,
        hit_points,
        speed: this.extractSpeed(creatureSection) || '30 ft.',
        stats: this.extractStats(creatureSection),
        abilities: this.extractAbilities(creatureSection),
        actions: this.extractActions(creatureSection),
        description: this.extractDescription(creatureSection),
        tags: this.generateTags(creatureSection)
      };
      
      console.log(`Created structured creature: ${creature.name} (${creature.type}, CR ${creature.challenge_rating})`);
      return creature;
    } catch (error) {
      console.error('Error parsing structured creature:', error);
      return null;
    }
  },

  // Extract creatures from a specific section using fallback patterns
  extractCreaturesFromSection(text) {
    const creatures = [];
    
    // Only use the most reliable pattern for fallback
    const pattern = /\b([A-Z][a-zA-Z\s]{3,25})\s+CR\s+(\d+(?:\/\d+)?)\b/gi;
    let match;
    let maxMatches = 15; // Even more restrictive
    let matchCount = 0;
    
    while ((match = pattern.exec(text)) !== null && matchCount < maxMatches) {
      matchCount++;
      const creature = this.parseCreatureFromMatch(match, text, 1);
      if (creature) {
        creatures.push(creature);
      }
    }
    
    console.log(`Fallback extraction found ${creatures.length} creatures`);
    return creatures;
  },

  // Extract a cleaner description from creature section
  extractDescription(section) {
    if (!section || section.length < 50) return '';
    
    // Try to find the actual description part, not just random text
    const lines = section.split('\n').filter(line => line.trim());
    
    // Look for description after basic stats
    let descriptionStart = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('special abilities') || 
          line.includes('tactics') || 
          line.includes('ecology') ||
          line.includes('description')) {
        descriptionStart = i;
        break;
      }
    }
    
    if (descriptionStart > -1) {
      const descLines = lines.slice(descriptionStart, descriptionStart + 3);
      return descLines.join(' ').substring(0, 300);
    }
    
    // Fallback to first few lines that look like description
    const descriptionLines = lines.filter(line => 
      line.length > 20 && 
      !line.match(/^(STR|DEX|CON|INT|WIS|CHA|AC|HP|Fort|Ref|Will|Speed|Melee|Ranged|CR)\s/i)
    ).slice(0, 2);
    
    return descriptionLines.join(' ').substring(0, 300);
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