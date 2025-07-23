import React from 'react';
import './Navigation.css';

const Navigation = ({ currentPage, setCurrentPage, activeCharacter, isMobile }) => {
  const pages = [
    { id: 'manager', label: 'Character Manager', alwaysShow: true },
    { id: 'campaigns', label: 'Campaigns', alwaysShow: true },
    { id: 'setup', label: 'Character Setup', requiresCharacter: true },
    { id: 'combat', label: 'Combat Tracker', requiresCharacter: true }
  ];

  const handleNavClick = (pageId) => {
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
    <nav className={`main-nav ${isMobile ? 'mobile' : ''}`}>
      <ul className={`nav-list ${isMobile ? 'mobile' : ''}`}>
        {pages.map(page => {
          // Only show pages that are always visible or require a character when one is active
          const shouldShow = page.alwaysShow || (page.requiresCharacter && activeCharacter);
          
          if (!shouldShow) return null;
          
          return (
            <li 
              key={page.id}
              className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
              data-page={page.id}
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