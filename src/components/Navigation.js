import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, activeCharacter }) => {
  const pages = [
    { id: 'manager', label: 'Character Manager', alwaysShow: true },
    { id: 'setup', label: 'Character Setup', requiresCharacter: true },
    { id: 'combat', label: 'Combat Tracker', requiresCharacter: true }
  ];

  const handleNavClick = (pageId) => {
    console.log("Navigation clicked:", pageId);
    setCurrentPage(pageId);
  };

  return (
    <nav className="main-nav">
      <ul className="nav-list">
        {pages.map(page => {
          // Only show pages that are always visible or require a character when one is active
          const shouldShow = page.alwaysShow || (page.requiresCharacter && activeCharacter);
          
          if (!shouldShow) return null;
          
          return (
            <li 
              key={page.id}
              className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
            >
              <button 
                className="nav-button"
                onClick={() => handleNavClick(page.id)}
                disabled={page.requiresCharacter && !activeCharacter}
              >
                {page.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;