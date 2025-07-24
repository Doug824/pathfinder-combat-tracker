import React, { useState } from 'react';

const FantasySidebar = ({ currentPage, setCurrentPage, activeCharacter, isMobile, currentUser, userRole, onLogout, logoIcon }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pages = [
    { 
      id: 'manager', 
      label: 'Heroes', 
      icon: '👑',
      alwaysShow: true,
      color: 'from-fantasy-bronze to-dark-wood',
      glow: 'shadow-fantasy-glow'
    },
    { 
      id: 'campaigns', 
      label: 'Quests', 
      icon: '🗺️',
      alwaysShow: true,
      color: 'from-dark-wood to-ink',
      glow: 'shadow-fantasy-glow'
    },
    { 
      id: 'setup', 
      label: 'Forge', 
      icon: '🛡️',
      requiresCharacter: true,
      color: 'from-fantasy-bronze to-fantasy-bronze',
      glow: 'shadow-fantasy-glow'
    },
    { 
      id: 'combat', 
      label: 'Battle', 
      icon: '⚔️',
      requiresCharacter: true,
      color: 'from-blood-red to-dark-wood',
      glow: 'shadow-fire-red'
    }
  ];

  const handleNavClick = (pageId) => {
    if (pageId === 'manager') {
      setTimeout(() => {
        setCurrentPage(pageId);
      }, 10);
    } else {
      setCurrentPage(pageId);
    }
  };

  return (
    <aside className={`
      ${isCollapsed ? 'w-20' : 'w-64'} 
      ${isMobile ? 'fixed bottom-0 left-0 right-0 h-auto w-full z-50' : 'fixed left-0 top-0 h-screen'}
      bg-gradient-to-b from-light-bg-secondary to-light-bg dark:from-black/80 dark:to-dark-wood/90 
      backdrop-blur-md 
      border-r-2 border-fantasy-bronze/50
      transition-all duration-300 ease-in-out
      flex flex-col
      shadow-2xl
    `}>
      {/* Header */}
      {!isMobile && (
        <div className="p-4 border-b-2 border-fantasy-bronze/50 bg-gradient-to-b from-black/60 to-transparent">
          {!isCollapsed ? (
            <div className="space-y-3">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <img src={logoIcon} alt="Hero's Ledger Logo" className="w-8 h-8 object-contain" />
                <div>
                  <h2 className="font-fantasy text-lg font-bold text-ornate-gold leading-tight">
                    Hero's Ledger
                  </h2>
                  <p className="text-parchment-dark text-xs leading-tight">
                    {activeCharacter ? `Playing: ${activeCharacter.name}` : 'No active character'}
                  </p>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex items-center justify-between text-xs">
                <div className="text-fantasy-gold">
                  <div className="font-semibold">
                    {currentUser?.displayName || currentUser?.email}
                  </div>
                  {userRole && (
                    <div className="text-parchment-dark">({userRole})</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={onLogout} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400/50 rounded">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-full flex justify-center text-ornate-gold hover:text-fantasy-gold transition-colors"
            >
              <span className="text-2xl">📖</span>
            </button>
          )}
          
          {/* Collapse button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-2 right-2 text-fantasy-bronze hover:text-fantasy-gold text-sm"
            >
              ←
            </button>
          )}
        </div>
      )}

      {/* Mobile user info */}
      {isMobile && (
        <div className="p-2 bg-black/60 border-b border-fantasy-bronze/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-fantasy-gold font-semibold">
              {currentUser?.displayName || currentUser?.email}
            </span>
            <div className="flex gap-2">
              <button onClick={onLogout} className="text-red-400 text-xs">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <nav className={`flex-1 ${isMobile ? 'flex' : 'block'} ${isMobile ? 'overflow-x-auto' : 'overflow-y-auto'}`}>
        <ul className={`${isMobile ? 'flex flex-row' : 'flex flex-col'} ${isCollapsed && !isMobile ? 'p-2' : 'p-4'} space-x-2 sm:space-x-0 sm:space-y-2`}>
          {pages.map(page => {
            const shouldShow = page.alwaysShow || (page.requiresCharacter && activeCharacter);
            
            if (!shouldShow) return null;
            
            const isActive = currentPage === page.id;
            const isDisabled = page.requiresCharacter && !activeCharacter;
            
            return (
              <li key={page.id} className={isMobile ? 'flex-1' : 'w-full'}>
                <button
                  onClick={() => !isDisabled && handleNavClick(page.id)}
                  disabled={isDisabled}
                  className={`
                    w-full
                    relative
                    group
                    flex items-center
                    ${isCollapsed && !isMobile ? 'justify-center' : 'justify-start'}
                    gap-3
                    px-4 py-3
                    rounded-lg
                    font-fantasy font-bold uppercase tracking-wider
                    transition-all duration-300
                    transform hover:scale-105
                    border-2
                    ${isActive 
                      ? `bg-gradient-to-r ${page.color} text-fantasy-gold shadow-lg border-fantasy-bronze` 
                      : 'bg-black/40 text-parchment-dark hover:text-fantasy-gold hover:bg-dark-wood/30 border-transparent'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${isMobile ? 'text-sm' : ''}
                  `}
                >
                  {/* Ornate corner decorations for active items */}
                  {isActive && (
                    <>
                      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-fantasy-gold rounded-tl-sm" />
                      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-fantasy-gold rounded-tr-sm" />
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-fantasy-gold rounded-bl-sm" />
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-fantasy-gold rounded-br-sm" />
                    </>
                  )}
                  
                  {/* Icon */}
                  <span className={`text-2xl z-10 ${isMobile ? 'text-xl' : ''}`}>
                    {page.icon}
                  </span>
                  
                  {/* Label */}
                  {(!isCollapsed || isMobile) && (
                    <span className="z-10 text-base">
                      {page.label}
                    </span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="
                      absolute left-full ml-2 
                      px-3 py-1 
                      bg-gray-900 text-white 
                      rounded-md 
                      opacity-0 group-hover:opacity-100 
                      pointer-events-none 
                      transition-opacity duration-200
                      whitespace-nowrap
                      z-50
                    ">
                      {page.label}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Character Info */}
      {activeCharacter && !isMobile && (
        <div className={`p-4 border-t-2 border-fantasy-bronze/50 bg-gradient-to-t from-black/60 to-transparent ${isCollapsed ? 'text-center' : ''}`}>
          <div className="text-fantasy-gold text-sm">
            {isCollapsed ? (
              <span className="text-2xl">👤</span>
            ) : (
              <>
                <p className="font-fantasy font-bold uppercase">{activeCharacter.name}</p>
                <p className="text-xs text-parchment-dark">
                  Level {activeCharacter.level} {activeCharacter.class}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FantasySidebar;