# Hero's Ledger: Campaign Companion Module

## Overview

Hero's Ledger is expanding! This Campaign Companion Module introduces shared and private note tracking, clue management, and a DM vault—turning Hero's Ledger into a collaborative campaign HQ for both players and DMs.

## 🚀 Goal

Create a flexible campaign tracking experience within Hero's Ledger for Pathfinder players and GMs, focusing on smart organization, DM-player role separation, and seamless note-sharing.

## 🧱 Tech Stack

- **Frontend:** React + Tailwind
- **Backend:** Firebase (Firestore, Firebase Auth)
- **Authentication Roles:** DM / Player

## 📦 Phase 1: Core Notes System (MVP)

### Features

**Campaign Creation (DM-only)**
- Set campaign name, description, and invite code/link

**User Roles & Invites**
- Players join campaigns using unique invite link

**Note Types**
- Player Notes (private to user)
- Shared Notes (editable/viewable by all players)
- DM Notes (private to DM only)

**Tagging**
- Basic tags: NPC, Location, Clue, Quest, Item, Lore

**Permissions**
- Players: can view/edit their own notes + shared notes
- DM: can view/edit all notes

## ✍ Phase 2: Collaboration & Clarity

### Features

**Note Threading / Linking**
- Create inline links between notes (ex: NPC linked to a location or quest)

**Real-Time Collaboration**
- Shared notes sync across users instantly (Firepad or similar lightweight live editor)

**Clue Reveal System**
- DM drafts private notes then clicks "reveal to players" to move it to shared notes

**UI Enhancements**
- Filter/sort by tag
- Session View: toggle for current session notes only

## 🗃 Phase 3: Organizational Power Tools

### Features

**Session Timeline**
- Auto-group notes by session with date labels

**Smart Recap**
- Auto-generate summary of last session's shared notes (summary block at top)

**Redundancy Detection**
- Alerts when a new note resembles an existing one

**Search & Navigation**
- Full-text search
- Recent Changes: highlights newly added/edited notes since last login

## 🔐 Phase 4: Advanced DM Tools

### Features

**DM Vault**
- Hidden NPC motivations, plot twists, notes never shown to players

**Handouts**
- Upload images, maps, letters
- Players unlock or receive handouts during play

**Worldbuilding Wiki**
- Nested wiki-style notes (optional)
- Campaign encyclopedia for detailed lore

## 🔁 Integration Plan

- Add a new "Campaign" tab to Hero's Ledger dashboard
- Leverage Firebase Auth roles to control visibility and access
- Campaigns are stored in Firestore with structure:
  ```
  /campaigns/{campaignId}
    /notes/{noteId}
    players[]
    dmId
  ```

## 🧪 Testing & Feedback

- Run 2–3 real Pathfinder sessions using this module
- Collect live feedback from both DMs and players
- Include simple feedback form/buttons

## 🌟 Optional Module Names (Branding)

- Lorekeeper
- Session Scrolls
- Codex
- Vault of Knowledge
- The Archivist

## ✅ Future Add-Ons

- Markdown support
- PDF export
- In-app dice rolls or initiative tracker integration
- Offline support
- Push notifications for new notes revealed

---

*This README serves as a development and tracking roadmap for integrating campaign management tools into Hero's Ledger. Build iteratively, test frequently, and stay focused on user clarity.*