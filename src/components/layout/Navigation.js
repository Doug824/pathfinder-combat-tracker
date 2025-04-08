import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, activeCharacter, isMobile }) => {
  const pages = [
    { id: 'manager', label: 'Character Manager', alwaysShow: true },
    { id: 'setup', label: 'Character Setup', requiresCharacter: true },
    { id: 'combat', label: 'Combat Tracker', requiresCharacter: true }
  ];

  const handleNavClick = (pageId) => {
    console.log("Navigation clicked:", pageId);
    // Add a small delay for 'manager' to ensure state updates properly
    if (pageId === 'manager') {
      // Prevents the page from immediately changing back
      setTimeout(() => {
        setCurrentPage(pageId);
      }, 10);
    } else {
      setCurrentPage(pageId);
    }
  };

  const mobileView = window.innerWidth <= 768;

  return (
    <nav className="main-nav" style={{ 
      display: 'flex', 
      justifyContent: isMobile ? 'center' : 'flex-end',
      width: isMobile ? '100%' : 'auto'
    }}>
      <ul className="nav-list" style={{ 
        display: 'flex',
        flexWrap: isMobile ? 'wrap' : 'nowrap',
        justifyContent: isMobile ? 'center' : 'flex-end',
        listStyle: 'none',
        padding: 0,
        margin: 0,
        gap: '10px'
      }}>
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
                style={{ whiteSpace: 'nowrap' }}
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