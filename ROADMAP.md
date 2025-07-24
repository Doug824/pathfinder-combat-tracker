# Hero's Ledger - Development Roadmap

This roadmap is based on comprehensive user feedback and testing. The goal is to transform Hero's Ledger from a combat tracker into a complete character sheet replacement for Pathfinder RPG.

## Progress Status
**Last updated:** January 2025  
**Current focus:** High-priority features after critical bug fixes  
**Recently completed:** AC calculation visibility, input validation fixes, combat ability bug fixes

## Critical Issues (High Priority)

### 🐛 Bug Fixes ✅ COMPLETED
- [x] **Fast typing input validation** - ✅ Fixed ability scores jumping to 30 when typing quickly (added debouncing + regex validation)
- [x] **Combat abilities not applying** - ✅ Fixed modifiers from combat abilities not working (toggle function now passes isActive state)

### 🚀 Major Features  
- [x] **AC calculation transparency** - ✅ COMPLETED: Shows Touch/Flat-footed AC, expandable breakdown, manual override capability
- [ ] **Character sheet PDF upload & OCR** - Allow users to upload character sheets and automatically parse data
- [ ] **Character creation workflow redesign** - Improve UX similar to Beyond20, clearer step-by-step process

## Major Missing Features (Medium Priority)

### 📋 Character Management
- [ ] **Enhanced item system** - Add plaintext fields for complex item abilities (e.g., Otherworldly Kimono)
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
1. **Input Validation Fix** - Added debouncing (150ms) and regex validation to NumericInput component to prevent fast typing bugs
2. **Combat Abilities Fix** - Updated toggle function in combatAbilityItem.js to pass both abilityId and isActive state 
3. **AC Calculation Visibility** - Complete implementation in CombatStatsCalculator.js:
   - Added Touch AC and Flat-footed AC calculations and display
   - Manual AC override input with clear visual indication when active
   - Expandable breakdown section showing all AC bonuses by type
   - Proper Pathfinder rules: Touch AC excludes armor/shield/natural armor

### Key Files Modified
- `/src/components/common/NumericInput.js` - Debouncing and validation
- `/src/components/CombatAbilities/combatAbilityItem.js` - Toggle function fix  
- `/src/components/CombatStats/CombatStatsCalculator.js` - AC calculation overhaul
- `/src/components/CharacterSheet/BasicStats.js` - Increased ability score max to 99

### Next Priority Tasks
Choose between:
1. **PDF Upload/OCR** - Most requested feature, high technical complexity
2. **Character Creation Redesign** - Major UX improvement, better user onboarding

Both are high-priority and would significantly improve the user experience.

---

*Last updated: January 2025*  
*Based on user testing feedback and development priorities*