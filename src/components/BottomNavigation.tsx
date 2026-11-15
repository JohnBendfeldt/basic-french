import React from 'react';
import { FaFont, FaComment, FaListUl, FaCalculator, FaQuestionCircle } from 'react-icons/fa';

interface BottomNavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeSection,
  setActiveSection,
}) => {
  const navItems = [
    { id: 'alphabet', label: 'Alphabet', icon: <FaFont aria-hidden="true" /> },
    { id: 'phrases', label: 'Phrases', icon: <FaComment aria-hidden="true" /> },
    { id: 'words', label: 'Words', icon: <FaListUl aria-hidden="true" /> },
    { id: 'numbers', label: 'Numbers', icon: <FaCalculator aria-hidden="true" /> },
    { id: 'quiz', label: 'Quiz', icon: <FaQuestionCircle aria-hidden="true" /> },
  ];

  const isActive = (id: string) =>
    id === 'numbers'
      ? activeSection === 'numbers' || activeSection === 'time'
      : activeSection === id;

  const handleNavClick = (id: string) => {
    const element = document.querySelector(`.bottom-nav-item[data-section="${id}"]`);
    if (element) {
      element.classList.add('nav-click-effect');
      setTimeout(() => {
        element.classList.remove('nav-click-effect');
      }, 200);
    }
    setActiveSection(id);
  };

  return (
    <nav className="bottom-navigation" aria-label="Bottom navigation">
      {navItems.map(item => {
        const active = isActive(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
            aria-label={`Switch to ${item.label} section`}
            aria-current={active ? 'page' : undefined}
            data-section={item.id}
          >
            <div className="bottom-nav-icon" aria-hidden="true">
              {item.icon}
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
