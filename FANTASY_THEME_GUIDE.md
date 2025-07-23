# Fantasy Theme Implementation Guide

## Overview
This guide shows how to apply the new fantasy theme to existing components in the Hero's Ledger app.

## Key Theme Classes

### Background Classes
- `bg-page-landing` - Deep blue mystical gradient for main pages
- `bg-page-notes` - Brown parchment gradient for notes/campaign pages  
- `bg-page-combat` - Dark red gradient for combat pages

### Component Classes
- `parchment-card` - Parchment-style card with texture and shadow
- `btn-primary` - Gold gradient button with glow effect
- `btn-secondary` - Purple mystic button
- `btn-danger` - Red blood button
- `btn-nature` - Green forest button
- `input-fantasy` - Styled input with gold borders

### Text Classes
- `font-fantasy` - Cinzel font for headings
- `font-body` - Merriweather font for body text
- `text-fantasy-gold` - Golden text color
- `glow-text` - Glowing text animation

### Effects
- `shadow-fantasy-glow` - Golden glow shadow
- `shadow-magic-purple` - Purple magic glow
- `shadow-fire-red` - Red fire glow
- `animate-glow-pulse` - Pulsing glow animation
- `animate-float` - Floating animation

## Implementation Examples

### 1. Converting a Basic Card Component

**Before:**
```jsx
<div className="character-card">
  <h3>{character.name}</h3>
  <p>Level {character.level}</p>
</div>
```

**After:**
```jsx
<div className="parchment-card p-4 hover:shadow-lg transition-all duration-300">
  <h3 className="font-fantasy text-xl text-ink">{character.name}</h3>
  <p className="text-ink/70">Level {character.level}</p>
</div>
```

### 2. Converting Buttons

**Before:**
```jsx
<button className="primary-button">Create Character</button>
<button className="delete-button">Delete</button>
```

**After:**
```jsx
<button className="btn-primary">Create Character</button>
<button className="btn-danger">Delete</button>
```

### 3. Converting Form Inputs

**Before:**
```jsx
<input type="text" className="form-input" />
```

**After:**
```jsx
<input type="text" className="input-fantasy" />
```

### 4. Adding Page Backgrounds

**Before:**
```jsx
<div className="page-container">
  {/* content */}
</div>
```

**After:**
```jsx
<div className="min-h-screen bg-page-landing">
  <div className="fantasy-overlay" />
  <div className="relative z-10">
    {/* content */}
  </div>
</div>
```

### 5. Creating Stat Displays

```jsx
import { FantasyStatBadge, FantasyStatBlock } from './components/FantasyStatBlock';

// Single stat badge
<FantasyStatBadge 
  label="Health" 
  value="45/60" 
  variant="health"
  icon="❤️"
/>

// Stat block
<FantasyStatBlock
  title="Character Stats"
  variant="hero"
  stats={[
    { label: "Strength", value: 18, modifier: 4 },
    { label: "Dexterity", value: 14, modifier: 2 },
    { label: "Constitution", value: 16, modifier: 3 }
  ]}
/>
```

## Color Palette

### Primary Colors
- Fantasy Gold: `#D4AF37`
- Fantasy Bronze: `#B87333`
- Mystic Purple: `#6B46C1`
- Blood Red: `#8B0000`
- Forest Green: `#228B22`
- Ocean Blue: `#1E3A8A`

### Parchment Colors
- Parchment: `#F4E8D0`
- Parchment Dark: `#E8D7B9`
- Ink: `#2C1810`

## Typography

- **Headings**: Use `font-fantasy` (Cinzel font)
- **Body Text**: Use `font-body` (Merriweather font)
- **Sizes**: Use Tailwind's standard text sizes (text-sm, text-base, text-lg, etc.)

## Responsive Design

The theme is fully responsive. Key patterns:
- Use Tailwind's responsive prefixes (sm:, md:, lg:)
- Sidebar collapses on mobile
- Cards stack vertically on small screens
- Touch-friendly button sizes on mobile

## Dark Mode Support

The theme works with both light and dark modes:
- Dark mode uses darker backgrounds with glowing accents
- Light mode uses parchment backgrounds with ink text
- Components automatically adapt based on parent theme class

## Migration Checklist

When converting a component:
1. [ ] Replace background colors with theme backgrounds
2. [ ] Update text colors to use theme colors
3. [ ] Apply fantasy fonts to headings
4. [ ] Replace buttons with themed button classes
5. [ ] Add hover/focus states with glow effects
6. [ ] Ensure responsive behavior
7. [ ] Test in both light and dark modes

## Performance Considerations

- Use Tailwind's PurgeCSS in production to remove unused styles
- Lazy load heavy components like stat blocks
- Use CSS transitions instead of JavaScript animations where possible
- Optimize background gradients for performance