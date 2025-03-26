import React from 'react';

const Navigation = ({ currentPage, setCurrentPage, activeCharacter }) => {
  const pages = [
    { id: 'manager', label: 'Character Manager', alwaysShow: true },
    { id: 'setup', label: 'Character Setup', requiresCharacter: true },
    { id: 'combat', label: 'Combat Tracker', requiresCharacter: true }
  ];

  return (
    <nav className="main-nav">
      <ul className="nav-list">
        {pages.map(page => (
          (page.alwaysShow || (page.requiresCharacter && activeCharacter)) && (
            <li 
              key={page.id}
              className={`nav-item ${currentPage === page.id ? 'active' : ''}`}
            >
              <button 
                className="nav-button"
                onClick={() => setCurrentPage(page.id)}
                disabled={page.requiresCharacter && !activeCharacter}
              >
                {page.label}
              </button>
            </li>
          )
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;