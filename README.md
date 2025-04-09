# Hero's Ledger: Pathfinder Combat Tracker

![Hero's Ledger Logo](./src/assets/HerosLedgerLogo.png)

> Because tracking stats shouldn't be a quest of its own.

## Overview

Hero's Ledger is a comprehensive web application designed to simplify combat tracking for Pathfinder Role-Playing Game players. It allows players to manage characters, track buffs and combat abilities, calculate complex combat statistics accurately, and roll dice—all in a visually appealing interface that works across devices.

## Features

### Character Management
- **Create & Store Multiple Characters**: Build and save as many characters as you need
- **Basic Character Information**: Track name, level, class, race, alignment, and size
- **Size Categories**: Full support for all Pathfinder size categories (Fine to Colossal)
- **Persistent Storage**: All character data is saved locally to your browser

### Character Setup
- **Base Attributes**: Configure STR, DEX, CON, INT, WIS, CHA with automatic modifier calculation
- **Equipment Management**: Add custom gear with various bonus types
- **Equipment Slots**: Track gear by slot following Pathfinder's equipment slot rules
- **Automatic Bonus Stacking**: Correctly handles Pathfinder's bonus stacking rules

### Combat Tracking
- **PlaySheet View**: A streamlined combat interface showing all essential information
  - **Attack Calculator**: Automatically calculates all attack rolls with proper modifiers
  - **Defense Stats**: Displays AC, Touch AC, Flat-Footed AC, CMB, and CMD
  - **Saving Throws**: Calculates all three saving throws (Fortitude, Reflex, Will)
  - **Multiple Attacks**: Supports iterative attacks based on BAB
  - **Haste Support**: Toggle for adding haste attacks
  - **Two-Weapon Fighting**: Full support for dual-wielding with proper penalties

- **Weapon Configuration**
  - **Custom Weapons**: Configure primary and off-hand weapons
  - **Weapon Bonuses**: Add specific attack and damage bonuses
  - **Ability Selection**: Choose which ability scores to use for attack and damage
  - **Off-hand Settings**: Configure number of off-hand attacks and ability modifiers

- **Buff Tracking**
  - **Active Buffs**: Add and manage temporary or permanent buffs
  - **Duration Tracking**: Track rounds, minutes, hours, or permanent buffs
  - **Buff Stacking**: Full implementation of Pathfinder's bonus stacking rules
  - **Buff Library**: Save commonly used buffs for easy reapplication
  - **Buff Packages**: Group multiple buffs together for quick application

- **Combat Abilities**
  - **Toggle System**: Easily activate/deactivate abilities during combat
  - **Variable Input**: Configure abilities like Power Attack with adjustable values
  - **Predefined Abilities**: Quick access to common combat abilities
  - **Custom Abilities**: Create your own combat abilities with specific effects

- **Hit Point Tracker**
  - **Visual HP Display**: See current and maximum hit points with visual indicator
  - **Temporary HP**: Track temporary hit points separately
  - **Non-Lethal Damage**: Support for non-lethal damage tracking
  - **Negative Levels**: Track negative levels with automatic penalty application
  - **Quick Actions**: Easily apply damage, healing, temp HP, or non-lethal damage

- **Dice Roller**
  - **Multiple Dice**: Roll any combination of dice (d4, d6, d8, d10, d12, d20, d100)
  - **Modifiers**: Automatically applies damage modifiers from character stats
  - **Roll History**: Keeps track of recent rolls
  - **Average Calculator**: Quickly see the statistical average of your dice combination

- **Combat Statistics Calculator**
  - **Detailed View**: See a comprehensive breakdown of all calculated stats
  - **Bonus Sources**: Identifies every bonus and its source
  - **Real-time Updates**: All stats update immediately when buffs or abilities change

### Visual Customization
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Mobile-Optimized**: Special optimizations for mobile play

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

Deploy the contents of the `build` folder to your web server.

## How to Use

### User Account
- **Registration**: Create a new user account to save your characters
- **Login/Logout**: Securely access your characters from any device

### Creating a Character
1. Navigate to the Character Manager screen
2. Click the "Create Character" button
3. Fill in the basic character information:
   - Name
   - Level
   - Class
   - Race
   - Size
   - Alignment
4. Set your base attributes (STR, DEX, CON, INT, WIS, CHA)
5. Click "Save Character"

### Character Setup
1. Select your character from the Character Manager
2. Navigate to the Character Setup tab
3. Configure basic details and base attributes
4. Add equipment and gear:
   - Click "Add New Gear"
   - Enter item name, equipment slot, and bonus type
   - Configure attribute and combat bonuses
   - Click "Add Item"
5. All changes are automatically saved

### Using the Combat Tracker
1. Select your character from the Character Manager
2. Navigate to the Combat Tracker tab
3. The default view is the Playsheet, showing key combat information

#### Using the Playsheet
- **Attack Section**: View all attack bonuses including iterative attacks
- **Toggle Haste**: Add an extra attack from the Haste spell
- **Two-Weapon Fighting**: Toggle dual-wielding mode for off-hand attacks
- **Defense Section**: View AC, Touch AC, Flat-Footed AC, CMB, and CMD
- **Saves Section**: View calculated saving throw bonuses
- **Combat Abilities**: Toggle abilities like Power Attack or Deadly Aim
- **Hit Points**: Manage current, temporary, and non-lethal damage

#### Weapon Configuration
1. Enter your weapon's name
2. Add any specific attack or damage bonuses
3. Select which ability modifiers to use (STR, DEX, etc.)
4. For dual-wielding, configure off-hand weapon similarly
5. Set the number of off-hand attacks (based on feats)

#### Using the Dice Roller
1. Configure dice by selecting die type (d4, d6, etc.) and quantity
2. Click "Add Dice" for additional dice groups
3. Your character's damage modifier is automatically applied
4. Click "Roll Dice" to get a random result
5. Click "Show Average" to see the statistical average

#### Managing Buffs
1. Go to the "Active Buffs" tab
2. Click "Add New Buff" and configure:
   - Name
   - Duration
   - Bonus type
   - Attribute/combat effects
3. Active buffs automatically affect all calculations

#### Saving Buffs to Library
1. After creating a buff, click "Save to Library"
2. Access saved buffs in the "Buff Library" tab
3. Create buff packages by selecting multiple buffs
4. Apply buffs or packages with a single click

#### Combat Abilities
1. Navigate to the "Combat Abilities" tab
2. Click "Add Common Combat Abilities" for a starter set
3. Toggle abilities on/off as needed during combat
4. Configure variable abilities (like Power Attack) with the slider
5. Create custom abilities by filling out the form

#### Hit Point Tracking
1. Go to the "Hit Points" tab for detailed management
2. Use quick actions for damage, healing, temp HP, or non-lethal damage
3. Manage negative levels and see their effect on combat stats
4. Visual heart indicator shows relative health status

#### Combat Statistics
1. Go to the "Combat Stats" tab for detailed breakdowns
2. See every bonus applied to your character and its source
3. View specific AC types, saving throws, and combat values
4. All values update in real-time as you toggle abilities and buffs

### Tips for Mobile Use
- Use in landscape mode for better visibility on smaller screens
- The "New Character" button floats in the bottom-right corner on mobile
- Scroll down to see all content in the Combat Tracker tabs
- Touch targets are optimized for mobile interaction

## Offline Use
Hero's Ledger works completely offline once loaded. All data is stored in your browser's local storage.

## Browser Compatibility
Hero's Ledger works best in modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Frequently Asked Questions

### Is my data secure?
All your character data is stored locally in your browser. It doesn't get uploaded to any servers unless you're using the optional cloud sync feature.

### Can I transfer characters between devices?
Currently, you would need to log in with the same account on different devices. Full import/export functionality is planned for a future release.

### Can I use this for Pathfinder 2e?
Hero's Ledger is currently designed specifically for Pathfinder 1e. A Pathfinder 2e version is being considered for future development.

### What happens if I clear my browser data?
If you clear your browser's local storage, your character data will be lost unless you're using the account-based storage feature.

### Does this work on tablets and phones?
Yes! Hero's Ledger is designed to be responsive and works on devices of all sizes, with special optimizations for mobile play.

### Are there any plans for additional features?
Yes! Future plans include:
- Character sheet PDF export
- Spell management
- Feat tracking
- Character advancement tools
- Custom dice presets
- Encounter building tools

## Acknowledgements

- Pathfinder is a registered trademark of Paizo Inc.
- This application is a fan project and is not affiliated with or endorsed by Paizo.
- Special thanks to the Pathfinder community for feedback and suggestions.

## Support and Contribution

If you encounter any issues or have suggestions for improvement, please open an issue on GitHub or contact the developers.

## License

This project is available under the MIT License. See the LICENSE file for details.
