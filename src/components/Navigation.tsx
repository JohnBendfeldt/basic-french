import React from 'react';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  _onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  setActiveSection,
  isOpen,
  _onClose,
}) => {
  const navItems = [
    { id: 'alphabet', label: 'Alphabet' },
    { id: 'phrases', label: 'Basic Phrases' },
    { id: 'words', label: 'Common Words' },
    { id: 'numbers', label: 'Numbers & Time' },
    { id: 'quiz', label: 'Quiz' },
  ];

  const isActive = (id: string) =>
    id === 'numbers'
      ? activeSection === 'numbers' || activeSection === 'time'
      : activeSection === id;

  return (
    <nav className={`navigation ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
      <ul>
        {navItems.map(item => (
          <li
            key={item.id}
            className={isActive(item.id) ? 'active' : ''}
            onClick={() => setActiveSection(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
