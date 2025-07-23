/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'fantasy-gold': '#D4AF37',
        'fantasy-bronze': '#B87333',
        'fantasy-silver': '#C0C0C0',
        'parchment': '#D2B48C',
        'parchment-dark': '#BC9A6A',
        'parchment-light': '#F5DEB3',
        'ink': '#2C1810',
        'blood-red': '#8B0000',
        'mystic-purple': '#6B46C1',
        'forest-green': '#228B22',
        'ocean-blue': '#1E3A8A',
        'shadow': 'rgba(0, 0, 0, 0.8)',
        'dark-wood': '#3E2723',
        'ornate-gold': '#FFD700',
        'old-gold': '#CFB53B',
        'antique-brass': '#CD9575',
      },
      fontFamily: {
        'fantasy': ['Cinzel', 'Georgia', 'serif'],
        'body': ['Merriweather', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'page-main': "url('/src/assets/images/background_main.png')",
        'page-notes': "url('/src/assets/images/background_notes.png')",
        'page-combat': "url('/src/assets/images/background_combat.png')",
        'parchment-texture': "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(212, 175, 55, 0.1) 2px, rgba(212, 175, 55, 0.1) 4px)",
        'ornate-border': "linear-gradient(to right, #B8860B, #FFD700, #B8860B)",
      },
      boxShadow: {
        'fantasy-glow': '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)',
        'magic-purple': '0 0 20px rgba(107, 70, 193, 0.5), 0 0 40px rgba(107, 70, 193, 0.3)',
        'fire-red': '0 0 20px rgba(139, 0, 0, 0.5), 0 0 40px rgba(139, 0, 0, 0.3)',
        'nature-green': '0 0 20px rgba(34, 139, 34, 0.5), 0 0 40px rgba(34, 139, 34, 0.3)',
        'parchment': '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}