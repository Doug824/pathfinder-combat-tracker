# Hero's Ledger - Development Roadmap

This roadmap is based on comprehensive user feedback and testing. The goal is to transform Hero's Ledger from a combat tracker into a complete character sheet replacement for Pathfinder RPG.

## Progress Status
**Last updated:** January 2025  
**Current focus:** Medium priority features after completing major high-priority items  
**Recently completed:** Character creation wizard, enhanced item system, AC calculation visibility

## Critical Issues (High Priority) ✅ COMPLETED

### 🐛 Bug Fixes ✅ COMPLETED
- [x] **Fast typing input validation** - ✅ Fixed ability scores jumping to 30 when typing quickly (added debouncing + regex validation)
- [x] **Combat abilities not applying** - ✅ Fixed modifiers from combat abilities not working (toggle function now passes isActive state)

### 🚀 Major Features ✅ COMPLETED 
- [x] **AC calculation transparency** - ✅ COMPLETED: Shows Touch/Flat-footed AC, expandable breakdown, manual override capability
- [x] **Character creation workflow redesign** - ✅ COMPLETED: Full wizard with PDF upload option, step-by-step guidance, fantasy styling
- [ ] **Character sheet PDF upload & OCR** - Infrastructure ready, needs OCR implementation (detailed roadmap in PDFUploadProcessor.js)

## Major Missing Features (Medium Priority)

### 📋 Character Management ✅ PARTIALLY COMPLETED
- [x] **Enhanced item system** - ✅ COMPLETED: Added description and special abilities fields for complex items like Otherworldly Kimono
- [ ] **Class features & feats system** - Complete character building framework
- [ ] **Manual HP configuration** - Support for HP rolls, favored class bonuses, and custom calculations
- [ ] **CMB/CMD bonus fields** - Combat maneuver support

### ⚡ Combat & Rest Management
- [ ] **Long Rest functionality** - One-click healing and buff duration management
- [ ] **Cancel button in buff dialog** - Basic UX improvement
- [ ] **Early BAB/saves input** - Allow entry during initial character setup

## Long-term Enhancements (Low Priority)

### 🗃️ Content Integration
- [ ] **d20pfsrd database integration** - Preloaded spells, items, classes, and abilities
- [ ] **Auto-calculation systems** - BAB, saves, and other derived stats with override options

### 🎯 Advanced Features
- [ ] **Debuff tracking system** - Currently only handles buffs
- [ ] **Enhanced condition tracking** - Better handling of ability score damage and negative levels

## User Feedback Summary

**Key Pain Points:**
- Character creation workflow is unclear and frustrating
- Missing core RPG features makes it incomplete as a character sheet replacement
- Input validation issues create poor user experience
- Lack of content database means too much manual entry

**Vision:**
Transform Hero's Ledger into a comprehensive, all-in-one Pathfinder character management tool that can fully replace traditional character sheets while maintaining the excellent combat tracking capabilities.

## Implementation Notes

### Phase 1: Critical Fixes
Focus on bug fixes and core usability improvements to make the current features work reliably.

### Phase 2: Complete Character System
Build out the missing character creation and management features to make this a viable character sheet replacement.

### Phase 3: Content & Automation
Integrate external databases and add smart automation to reduce manual data entry.

---

## Development Notes for Future Sessions

### Recently Completed Work (January 2025)

#### Session 1: Critical Bug Fixes
1. **Input Validation Fix** - Added debouncing (150ms) and regex validation to NumericInput component to prevent fast typing bugs
2. **Combat Abilities Fix** - Updated toggle function in combatAbilityItem.js to pass both abilityId and isActive state 
3. **AC Calculation Visibility** - Complete implementation in CombatStatsCalculator.js:
   - Added Touch AC and Flat-footed AC calculations and display
   - Manual AC override input with clear visual indication when active
   - Expandable breakdown section showing all AC bonuses by type
   - Proper Pathfinder rules: Touch AC excludes armor/shield/natural armor

#### Session 2: Major Feature Development
4. **Character Creation Wizard** - Complete overhaul of character creation experience:
   - Welcome screen with PDF upload option or manual creation choice
   - Step-by-step wizard: Welcome → Basics → Abilities → Class Features → Equipment → Review
   - Beautiful fantasy styling with progress indicator and clickable navigation
   - Point-buy ability score system with helper buttons (Standard Array, Reset to 10s)
   - Class guidance with BAB/saves recommendations and examples
   - Comprehensive validation at each step with smart defaults
   - Integration with existing FantasyCharacterManager

5. **Enhanced Item System** - Added support for complex magical items:
   - Description field for item flavor text and general information
   - Special Abilities field for complex effects beyond numeric bonuses
   - Examples provided (immunity effects, spell-like abilities, conditional bonuses)
   - Proper fantasy-styled display with conditional rendering
   - Complete integration with GearItem component and CharacterSetup forms
   - Created comprehensive example items (Otherworldly Kimono, Ring of Protection, etc.)

### Key Files Modified

#### Character Creation System
- `/src/components/CharacterCreation/CharacterCreationWizard.js` - New comprehensive wizard component
- `/src/components/CharacterCreation/PDFUploadProcessor.js` - PDF processing infrastructure with implementation roadmap
- `/src/components/CharacterManagement/FantasyCharacterManager.js` - Integration with new wizard

#### Enhanced Item System  
- `/src/components/common/GearItem.js` - Added description and special abilities display/editing
- `/src/pages/CharacterSetup.js` - Enhanced gear creation form with new fields
- `/src/data/exampleItems.js` - Comprehensive example items demonstrating new features

#### Previous Bug Fixes
- `/src/components/common/NumericInput.js` - Debouncing and validation
- `/src/components/CombatAbilities/combatAbilityItem.js` - Toggle function fix  
- `/src/components/CombatStats/CombatStatsCalculator.js` - AC calculation overhaul
- `/src/components/CharacterSheet/BasicStats.js` - Increased ability score max to 99

### Current Status & Next Steps

**Major Achievements:**
- ✅ All critical high-priority issues resolved
- ✅ Complete character creation workflow redesigned
- ✅ Enhanced item system for complex magical items
- ✅ AC calculation transparency with overrides

**Ready for Implementation:**
- PDF Upload/OCR (infrastructure ready, detailed implementation notes in PDFUploadProcessor.js)
- Class features and feats system
- Long Rest functionality  
- Cancel button for buff dialog (quick win)

**Next Session Priority:** Medium-priority features or PDF OCR implementation

---

*Last updated: January 2025*  
*Based on user testing feedback and development priorities*