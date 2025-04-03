# Hero's Ledger: Pathfinder Combat Tracker

![Hero's Ledger Logo](./src/assets/HerosLedgerLogo.png)

> Because tracking stats shouldn't be a quest of its own.

## Overview

Hero's Ledger is a web application designed to simplify combat tracking for Pathfinder Role-Playing Game players. It allows players to manage characters, track buffs and combat abilities, calculate combat statistics accurately, and roll dice—all in a visually appealing interface that works across devices.

## Features

### Character Management
- Create, edit, and delete character profiles
- Store multiple characters with their base stats
- Track character level, class, race, alignment, and size
- Support for all Pathfinder size categories (Fine to Colossal)

### Character Setup
- Configure base attributes (STR, DEX, CON, INT, WIS, CHA)
- Add custom gear with various bonus types
- Track equipment by slot (following Pathfinder's equipment slot rules)
- Calculate modifiers automatically

### Combat Tracker
- **PlaySheet**: Simplified combat view showing all relevant information
  - Attack rolls with modifiers (including iterative attacks)
  - AC and saving throw calculations
  - Weapon configuration with primary/offhand support
  - Two-weapon fighting support
  - Built-in dice roller

- **Buff Tracking**
  - Add temporary or permanent buffs to your character
  - Track buff duration
  - Support for all Pathfinder bonus types with proper stacking rules
  - Create buff packages to quickly apply multiple buffs at once
  - Save commonly used buffs to a personal library

- **Combat Abilities**
  - Toggle combat abilities like Power Attack, Combat Expertise, etc.
  - Configure variable inputs (e.g., how much BAB to sacrifice)
  - Preconfigured abilities for common combat maneuvers
  - Add custom abilities with specific effects

- **Combat Statistics**
  - Detailed view of all calculated stats
  - See every bonus and its source
  - Support for size modifiers in calculations

### Additional Features
- Seamless light/dark mode toggle
- Local storage saves your data between sessions
- Responsive design works on desktop and mobile devices
- No server required - works entirely in your browser

## Getting Started

### Prerequisites
- Node.js (v14 or later recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Doug824/pathfinder-combat-tracker.git
   cd pathfinder-combat-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   # or if you use yarn
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open your browser and navigate to http://localhost:3000

### Building for Production

To create a production build:
```bash
npm run build
# or
yarn build
```

## How to Use

### Creating a Character

1. Start by clicking the "Create Character" button on the Character Manager screen
2. Fill in the basic character information:
   - Name
   - Level
   - Class
   - Race
   - Size
   - Alignment
3. Set your base attributes (STR, DEX, CON, INT, WIS, CHA)
4. Save the character

### Configuring Equipment

1. Navigate to the Character Setup tab
2. Scroll to the "Equipment & Gear" section
3. Add items with the appropriate:
   - Name
   - Equipment slot
   - Bonus type
   - Stat effects

### Managing Combat

1. Navigate to the Combat Tracker tab
2. Use the Playsheet to see all combat-relevant information at once
3. Toggle buffs and abilities as needed
4. Use the built-in dice roller for attack and damage rolls

### Using the Buff Library

1. Go to the "Buff Library" tab
2. Create commonly used buffs
3. Organize buffs into packages for quick application
4. Apply buffs directly from the library

## Technology Stack

- React.js - UI framework
- Redux Toolkit - State management
- Local Storage API - Data persistence
- CSS3 with custom properties - Styling and theming

## Project Structure

- `/src` - Source code
  - `/assets` - Images and static assets
  - `/components` - React components
    - `/CharacterSheet` - Character sheet components
    - `/CombatAbilities` - Combat ability components
    - `/CombatStats` - Combat statistics calculation components
    - `/CharacterManagement` - Character creation/selection components
    - `/BuffTracker` - Buff management components
  - `/hooks` - Custom React hooks
  - `/pages` - Page components
  - `/utils` - Utility functions
    - `bonusCalculator.js` - Combat stat calculations
    - `sizeUtils.js` - Size-related utilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Pathfinder is a registered trademark of Paizo Inc.
- This application is a fan project and is not affiliated with or endorsed by Paizo.

## FAQ

### Is my data secure?
All your character data is stored locally in your browser. It doesn't get uploaded to any servers.

### Can I import characters from Pathfinder character sheets?
Currently, the application doesn't support direct import. You'll need to manually enter your character information.

### Does this work offline?
Yes! Once loaded, the application works completely offline.

### Will you add support for other RPG systems?
The current focus is on Pathfinder 1e, but other systems may be considered in the future.
