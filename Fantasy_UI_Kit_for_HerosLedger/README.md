# 🧙‍♂️ Hero's Ledger Fantasy UI Kit

This folder contains the core layout and styling components needed to reskin your Pathfinder app with a fantasy-themed interface using Tailwind CSS and layered fantasy visuals.

---

## 📦 Files Included

- `tailwind.config.js` – Tailwind config with fantasy theme extensions.
- `postcss.config.js` – Required for Tailwind processing.
- `src/index.css` – Global Tailwind import + fantasy fonts.
- `src/components/FantasySidebar.jsx` – Sidebar navigation with glowing fantasy buttons.
- `src/components/FantasyStatBlock.jsx` – Stat card styled like parchment blocks.
- `src/assets/fonts/` – Cinzel and Merriweather fonts.
- `src/assets/images/` – Fantasy backgrounds (landing, notes, combat).

---

## 🧰 Setup Instructions

1. **Install Tailwind & Dependencies**

In your project root:

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

2. **Replace Configs**

Copy these files into your root directory:

- `tailwind.config.js`
- `postcss.config.js`

3. **Update CSS**

Replace the contents of `src/index.css` with what's in this pack’s `index.css`.

4. **Add Fantasy Components**

Place `FantasySidebar.jsx` and `FantasyStatBlock.jsx` into `src/components/`.

Replace or adapt your existing sidebar and stat block using these.

5. **Add Fonts & Images**

Place fonts in `src/assets/fonts/` and backgrounds in `src/assets/images/`.

6. **Wrap Your App with Tailwind Styling**

Update your main layout or `App.jsx` to wrap your pages in fantasy backgrounds and use Tailwind classes:

```jsx
<div className="bg-page-landing min-h-screen text-white font-serif">
  <FantasySidebar />
  <main className="p-6 max-w-7xl mx-auto">
    {/* Your Routes or Page Content */}
  </main>
</div>
```

---

## 🛡️ Pro Tip

You can use `bg-page-landing`, `bg-page-notes`, and `bg-page-combat` as full-page classes with different background images applied in Tailwind.

---

Reach out with any implementation questions or help wiring up the transitions!