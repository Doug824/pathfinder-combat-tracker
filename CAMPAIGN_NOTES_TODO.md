# Campaign Notes Tracker - AI-Enhanced D&D Collaboration Tool

This app allows Dungeon Masters and Players to collaboratively manage and organize campaign notes in a clean, role-based format with AI-enhanced features.

---

## 🔧 Tech Stack

- **Frontend:** React (Latest with Hooks & Context), Tailwind CSS
- **Backend:** Firebase (Auth, Firestore, Functions)
- **AI:** OpenAI (Summarization, tagging)
- **Deployment:** Vercel or Firebase Hosting

---

## 🗂 Project Structure To-Do

- [ ] Initialize project with Vite + React + Tailwind
- [ ] Set up Firebase project and connect to app
- [ ] Implement Firebase Authentication (Google + Email/Password)
- [ ] Define Firestore data structure
- [ ] Add role-based access: DM vs Player

---

## 🧑‍🏫 Campaign & User System

- [ ] DM can create campaigns
- [ ] DM can invite players (via email or code)
- [ ] Players join existing campaigns
- [ ] Role is determined on join (DM/Player)
- [ ] DM can assign custom permissions or restrict edit access

---

## 📒 Notes System

### Player-Side
- [ ] Personal notes (only visible to that player)
- [ ] Shared notes (available to party)
- [ ] View notes by session or topic

### DM-Side
- [ ] Private notes (DM-only)
- [ ] Share clues or lore items
- [ ] Create custom tags and folders

---

## 🤖 AI Features

- [ ] AI-generated session recaps from shared notes
- [ ] Auto-suggest tags for notes
- [ ] Lore linking: auto-connect references to previously mentioned NPCs, places, etc.
- [ ] Detect redundant notes and suggest merges

---

## 🧩 Additional Features

- [ ] Note reactions (emojis or markers)
- [ ] Attach images or handouts to notes
- [ ] Rich text support (Markdown or WYSIWYG editor)
- [ ] Version history or edit tracking
- [ ] Quick Search and Filters (tag, player, session)
- [ ] Session threads/timeline view

---

## 🔐 Security and Sync

- [ ] Firebase rules for field-level access (DM/private vs shared)
- [ ] Real-time sync across users
- [ ] Offline note access with sync queue

---

## 📱 Future Enhancements

- [ ] Mobile-friendly design
- [ ] Export campaign notes to PDF
- [ ] Optional map or character tracker integrations
- [ ] Email session summaries to users

---

## 🚀 Launch Plan

- [ ] Build MVP with campaign creation, auth, personal/shared notes
- [ ] Test with small groups (DM + Players)
- [ ] Gather feedback on usability + missing features
- [ ] Launch v1 with AI recaps, tagging, and search