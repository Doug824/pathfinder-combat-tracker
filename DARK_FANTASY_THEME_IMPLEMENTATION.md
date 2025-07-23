# Dark Fantasy Theme Implementation Guide

## Overview
The app now features a rich dark fantasy theme inspired by classic RPG interfaces, with ornate golden borders, parchment-style panels, and atmospheric backgrounds.

## Key Components

### 1. OrnatePanel Component
The main component for creating fantasy-styled panels with golden borders.

```jsx
import OrnatePanel from '../components/OrnatePanel';

<OrnatePanel 
  title="Character Stats"
  variant="default" // options: 'default', 'dark', 'parchment'
  showCorners={true}
>
  {/* Your content */}
</OrnatePanel>
```

### 2. OrnateStatInput Component
For stat inputs matching the style example:

```jsx
import { OrnateStatInput } from '../components/OrnatePanel';

<OrnateStatInput
  label="Strength"
  value={18}
  onChange={(value) => handleChange(value)}
  modifier={4}
/>
```

### 3. OrnateTab Component
For navigation tabs:

```jsx
import { OrnateTab } from '../components/OrnatePanel';

<OrnateTab
  label="Race"
  icon="🧝"
  active={activeTab === 'race'}
  onClick={() => setActiveTab('race')}
/>
```

### 4. OrnateButton Component
For styled buttons:

```jsx
import { OrnateButton } from '../components/OrnatePanel';

<OrnateButton
  variant="primary" // options: 'primary', 'secondary', 'danger'
  icon="⚔️"
  onClick={handleClick}
>
  Next
</OrnateButton>
```

## Color Palette

### Primary Colors
- **Ornate Gold**: `#FFD700` - Main accent color
- **Old Gold**: `#CFB53B` - Secondary gold
- **Antique Brass**: `#CD9575` - Tertiary metallic

### Background Colors
- **Dark Wood**: `#3E2723` - Panel backgrounds
- **Parchment**: `#D2B48C` - Light panels
- **Amber tones**: Various `amber-*` Tailwind classes

### Text Colors
- **Yellow-300/400**: Primary text on dark backgrounds
- **Amber-200**: Secondary text
- **Black/Ink**: Text on parchment backgrounds

## Background Images

The app uses three main background images:
- `background_main.png` - For character manager and setup pages
- `background_notes.png` - For campaign/quest pages  
- `background_combat.png` - For combat tracker pages

These are automatically applied based on the current page.

## Styling Guidelines

### 1. Panel Structure
All content panels should use the OrnatePanel component:
```jsx
<OrnatePanel variant="default">
  <div className="space-y-4">
    {/* Content with proper spacing */}
  </div>
</OrnatePanel>
```

### 2. Typography
- Headers: `font-fantasy text-ornate-gold uppercase tracking-wider`
- Body text: `font-body text-amber-200`
- Important text: `text-yellow-400 font-bold`

### 3. Borders and Decorations
- Main borders: `border-2 border-amber-700/50`
- Hover states: `hover:border-yellow-500`
- Corner decorations are automatically added by OrnatePanel

### 4. Shadows and Effects
- Panel shadows: `shadow-2xl`
- Glow effects: `shadow-yellow-500/50`
- Hover transforms: `hover:scale-105 transition-all duration-300`

## Implementation Examples

### Character Card
```jsx
<OrnatePanel variant="default" className="hover:scale-102 transition-all">
  <h3 className="font-fantasy text-xl text-yellow-400 uppercase mb-2">
    {character.name}
  </h3>
  <div className="text-amber-200 space-y-1">
    <p>Level {character.level} {character.class}</p>
    <p className="text-sm">{character.race}</p>
  </div>
</OrnatePanel>
```

### Form Inputs
```jsx
<div className="space-y-2">
  <label className="font-fantasy text-amber-200 uppercase text-sm">
    Character Name
  </label>
  <input
    type="text"
    className="w-full bg-black/60 border-2 border-amber-700/50 rounded px-4 py-2 
               text-yellow-300 focus:border-yellow-500 focus:outline-none"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
</div>
```

### Navigation Integration
The sidebar navigation automatically matches the theme with:
- Dark gradient background
- Ornate corner decorations on active items
- Golden text and borders
- Uppercase fantasy font

## Responsive Considerations

- Mobile: Sidebar becomes bottom navigation
- Panels stack vertically on small screens
- Touch-friendly button sizes
- Reduced decorations on mobile for performance

## Performance Tips

1. Background images are only loaded once per page type
2. Use Tailwind's PurgeCSS in production
3. Corner decorations use CSS instead of images
4. Gradients are GPU-accelerated

## Migration Checklist

When updating existing components:
- [ ] Replace panels with OrnatePanel
- [ ] Update color classes to amber/yellow theme
- [ ] Add uppercase and tracking-wider to headers
- [ ] Replace buttons with OrnateButton
- [ ] Add proper hover states and transitions
- [ ] Test on both desktop and mobile
- [ ] Ensure text is readable on all backgrounds