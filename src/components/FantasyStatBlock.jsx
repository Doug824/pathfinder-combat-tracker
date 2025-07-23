import React from 'react';

const FantasyStatBlock = ({ 
  title, 
  stats, 
  variant = 'default',
  className = '',
  showBorder = true 
}) => {
  const variants = {
    default: 'bg-parchment text-ink',
    dark: 'bg-gray-900/90 text-fantasy-gold',
    hero: 'bg-gradient-to-br from-fantasy-gold/10 to-fantasy-bronze/10 text-white border-fantasy-gold/50',
    danger: 'bg-gradient-to-br from-blood-red/10 to-red-900/10 text-white border-blood-red/50',
    nature: 'bg-gradient-to-br from-forest-green/10 to-green-900/10 text-white border-forest-green/50',
    magic: 'bg-gradient-to-br from-mystic-purple/10 to-purple-900/10 text-white border-mystic-purple/50'
  };

  const borderColors = {
    default: 'border-fantasy-bronze/30',
    dark: 'border-fantasy-gold/30',
    hero: 'border-fantasy-gold/50',
    danger: 'border-blood-red/50',
    nature: 'border-forest-green/50',
    magic: 'border-mystic-purple/50'
  };

  return (
    <div className={`
      relative
      ${variants[variant]}
      rounded-lg
      ${showBorder ? `border-2 ${borderColors[variant]}` : ''}
      shadow-parchment
      overflow-hidden
      ${className}
    `}>
      {/* Parchment texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('/src/assets/images/parchment-texture.png')",
          backgroundBlend: 'multiply',
          mixBlendMode: 'multiply'
        }}
      />
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-fantasy-gold/50 rounded-tl-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-fantasy-gold/50 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-fantasy-gold/50 rounded-bl-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-fantasy-gold/50 rounded-br-lg" />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {title && (
          <h3 className="font-fantasy text-xl font-bold mb-4 text-center">
            {title}
          </h3>
        )}
        
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="stat-label">{stat.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="stat-value">{stat.value}</span>
                {stat.modifier && (
                  <span className="text-sm opacity-70">
                    ({stat.modifier > 0 ? '+' : ''}{stat.modifier})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Compact version for smaller displays
export const FantasyStatBadge = ({ label, value, variant = 'default', icon }) => {
  const variants = {
    default: 'bg-parchment/90 text-ink border-fantasy-bronze/30',
    gold: 'bg-gradient-to-r from-fantasy-gold/20 to-fantasy-bronze/20 text-fantasy-gold border-fantasy-gold/50',
    health: 'bg-gradient-to-r from-blood-red/20 to-red-900/20 text-red-400 border-blood-red/50',
    mana: 'bg-gradient-to-r from-mystic-purple/20 to-purple-900/20 text-purple-400 border-mystic-purple/50',
    stamina: 'bg-gradient-to-r from-forest-green/20 to-green-900/20 text-green-400 border-forest-green/50',
    armor: 'bg-gradient-to-r from-fantasy-silver/20 to-gray-700/20 text-gray-300 border-fantasy-silver/50'
  };

  return (
    <div className={`
      inline-flex items-center gap-2 
      px-3 py-2 
      rounded-md 
      border 
      ${variants[variant]}
      backdrop-blur-sm
      shadow-sm
      transition-all duration-300
      hover:scale-105
    `}>
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex flex-col">
        <span className="text-xs font-fantasy opacity-70">{label}</span>
        <span className="text-lg font-bold font-fantasy">{value}</span>
      </div>
    </div>
  );
};

// Group of stat badges
export const FantasyStatGroup = ({ stats, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {stats.map((stat, index) => (
        <FantasyStatBadge
          key={index}
          label={stat.label}
          value={stat.value}
          variant={stat.variant}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default FantasyStatBlock;