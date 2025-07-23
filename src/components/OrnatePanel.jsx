import React from 'react';

const OrnatePanel = ({ 
  children, 
  title, 
  className = '',
  variant = 'default',
  showCorners = true 
}) => {
  const variants = {
    default: 'bg-gradient-to-b from-amber-900/80 to-amber-950/90',
    dark: 'bg-gradient-to-b from-gray-900/90 to-black/95',
    parchment: 'bg-gradient-to-b from-amber-100/90 to-amber-50/90',
  };

  return (
    <div className={`relative ${className}`}>
      {/* Ornate border wrapper */}
      <div className="relative p-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-lg">
        {/* Inner border */}
        <div className="relative p-0.5 bg-gradient-to-r from-amber-800 via-amber-700 to-amber-800 rounded-lg">
          {/* Main content panel */}
          <div className={`relative ${variants[variant]} rounded-lg overflow-hidden`}>
            {/* Corner decorations */}
            {showCorners && (
              <>
                <div className="absolute top-0 left-0 w-8 h-8">
                  <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-yellow-500/70 rounded-tl-sm" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-yellow-400/50" />
                </div>
                <div className="absolute top-0 right-0 w-8 h-8">
                  <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-yellow-500/70 rounded-tr-sm" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-yellow-400/50" />
                </div>
                <div className="absolute bottom-0 left-0 w-8 h-8">
                  <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-yellow-500/70 rounded-bl-sm" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-yellow-400/50" />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8">
                  <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-yellow-500/70 rounded-br-sm" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-yellow-400/50" />
                </div>
              </>
            )}

            {/* Title bar if provided */}
            {title && (
              <div className="border-b border-amber-700/50 bg-black/20 px-6 py-3">
                <h3 className="text-center font-fantasy text-xl font-bold text-yellow-400 uppercase tracking-wider">
                  {title}
                </h3>
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab component matching the style example
export const OrnateTab = ({ label, active, onClick, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-2 font-fantasy text-sm uppercase tracking-wider
        transition-all duration-300
        ${active 
          ? 'bg-gradient-to-b from-amber-700 to-amber-800 text-yellow-300 shadow-lg' 
          : 'bg-gradient-to-b from-gray-800 to-gray-900 text-amber-600 hover:text-yellow-400'
        }
        border border-amber-700/50
        ${active ? 'border-b-0' : ''}
        rounded-t-md
      `}
    >
      {/* Tab decoration */}
      <div className="absolute inset-0 rounded-t-md bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span>{label}</span>
      </div>

      {/* Active tab glow */}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
      )}
    </button>
  );
};

// Stat input matching the style example
export const OrnateStatInput = ({ label, value, onChange, modifier }) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-amber-800/30">
      <span className="font-fantasy text-amber-200 text-lg">{label}</span>
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <button 
            onClick={() => onChange(Math.max(1, value - 1))}
            className="w-8 h-8 bg-black/40 border border-amber-700/50 text-amber-400 hover:bg-amber-900/40 hover:text-yellow-400 transition-colors rounded-l"
          >
            -
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 1)}
            className="w-12 h-8 bg-black/60 border-t border-b border-amber-700/50 text-center text-yellow-300 font-bold focus:outline-none focus:bg-black/80"
          />
          <button 
            onClick={() => onChange(value + 1)}
            className="w-8 h-8 bg-black/40 border border-amber-700/50 text-amber-400 hover:bg-amber-900/40 hover:text-yellow-400 transition-colors rounded-r"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2 min-w-[60px]">
          <span className="text-amber-600">+{modifier}</span>
          <span className="text-amber-500">=</span>
          <span className="text-yellow-400 font-bold">{modifier > 0 ? `+${modifier}` : modifier}</span>
        </div>
      </div>
    </div>
  );
};

// Ornate button matching the style
export const OrnateButton = ({ children, onClick, variant = 'primary', className = '', icon }) => {
  const variants = {
    primary: 'bg-gradient-to-b from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-yellow-100 border-amber-700',
    secondary: 'bg-gradient-to-b from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-amber-400 border-gray-700',
    danger: 'bg-gradient-to-b from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-yellow-100 border-red-800',
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative px-6 py-3 
        ${variants[variant]}
        border-2 rounded-md
        font-fantasy uppercase tracking-wider font-bold
        shadow-lg hover:shadow-xl
        transform hover:scale-105
        transition-all duration-200
        ${className}
      `}
    >
      {/* Button shine effect */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-50 pointer-events-none" />
      
      {/* Content */}
      <div className="relative flex items-center gap-2 justify-center">
        {icon && <span className="text-xl">{icon}</span>}
        <span>{children}</span>
      </div>
    </button>
  );
};

export default OrnatePanel;