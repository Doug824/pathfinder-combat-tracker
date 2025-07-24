/**
 * Example magic items demonstrating the enhanced item system
 * with description and special abilities fields
 */

export const exampleItems = [
  {
    id: 'otherworldly-kimono',
    name: 'Otherworldly Kimono',
    description: 'A flowing silk kimono that seems to shimmer with otherworldly energy, decorated with intricate patterns that shift and move in peripheral vision.',
    specialAbilities: `• Grants immunity to charm and compulsion effects
• Allows the wearer to become incorporeal for 1 round, 3 times per day
• Provides concealment (20% miss chance) against ranged attacks
• Once per day, can cast Dimension Door as a spell-like ability`,
    slot: 'body',
    bonusType: 'deflection',
    effects: {
      strength: 0,
      dexterity: 2,
      constitution: 0,
      intelligence: 0,
      wisdom: 1,
      charisma: 3,
      attackBonus: 0,
      ac: 2,
      fortitude: 0,
      reflex: 2,
      will: 3,
      naturalArmor: 0
    }
  },
  
  {
    id: 'ring-of-protection',
    name: 'Ring of Protection +2',
    description: 'A simple platinum ring set with a small diamond that glows faintly with protective magic.',
    specialAbilities: 'Provides a +2 deflection bonus to AC and a +2 resistance bonus on all saving throws.',
    slot: 'ring1',
    bonusType: 'deflection',
    effects: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
      attackBonus: 0,
      ac: 2,
      fortitude: 2,
      reflex: 2,
      will: 2,
      naturalArmor: 0
    }
  },

  {
    id: 'cloak-of-elvenkind',
    name: 'Cloak of Elvenkind',
    description: 'This cloak of neutral gray cloth is indistinguishable from an ordinary cloak of the same color.',
    specialAbilities: `• Grants a +5 competence bonus on Stealth checks
• The wearer is effectively invisible to darkvision
• Provides immunity to detection by Detect Magic and similar divination spells`,
    slot: 'shoulders',
    bonusType: 'competence',
    effects: {
      strength: 0,
      dexterity: 1,
      constitution: 0,
      intelligence: 0,
      wisdom: 1,
      charisma: 0,
      attackBonus: 0,
      ac: 0,
      fortitude: 0,
      reflex: 1,
      will: 0,
      naturalArmor: 0
    }
  },

  {
    id: 'amulet-of-natural-armor',
    name: 'Amulet of Natural Armor +3',
    description: 'This amulet is a brown piece of leather with a bone or tooth from a magical beast threaded onto it.',
    specialAbilities: 'Enhances the wearer\'s natural armor, providing protection as if their skin were naturally tougher.',
    slot: 'neck',
    bonusType: 'natural',
    effects: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
      attackBonus: 0,
      ac: 0,
      fortitude: 0,
      reflex: 0,
      will: 0,
      naturalArmor: 3
    }
  },

  {
    id: 'boots-of-speed',
    name: 'Boots of Speed',
    description: 'These boots appear to be ordinary footgear, but close examination reveals small wings at the heels.',
    specialAbilities: `• As a free action, the wearer can click the boot heels together to gain the effect of a Haste spell for 10 rounds
• This ability can be used once per day
• While hasted, gain +1 bonus on attack rolls, +1 dodge bonus to AC, and +30 feet to base speed
• Gain one extra attack when making a full attack action`,
    slot: 'feet',
    bonusType: 'enhancement',
    effects: {
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
      attackBonus: 0,
      ac: 0,
      fortitude: 0,
      reflex: 1,
      will: 0,
      naturalArmor: 0
    }
  },

  {
    id: 'gauntlets-of-ogre-power',
    name: 'Gauntlets of Ogre Power',
    description: 'These gauntlets are made of tough leather with iron studs running across the back of the hands and fingers.',
    specialAbilities: 'These gauntlets grant the wearer great strength, raising the wearer\'s Strength score as long as they are worn. They have no effect on a character that already has a Strength of 19 or higher.',
    slot: 'hands',
    bonusType: 'enhancement',
    effects: {
      strength: 4,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0,
      attackBonus: 0,
      ac: 0,
      fortitude: 0,
      reflex: 0,
      will: 0,
      naturalArmor: 0
    }
  }
];

export default exampleItems;