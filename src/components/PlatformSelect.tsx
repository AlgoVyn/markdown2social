import React, { useState, useRef, useEffect } from 'react';
import { PLATFORM_CONFIGS } from '../utils/platforms';
import { PLATFORM_ICONS } from './icons/PlatformIcons';
import './PlatformSelect.css';

interface PlatformSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const PlatformSelect: React.FC<PlatformSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const selectedConfig = PLATFORM_CONFIGS[value];
  const SelectedIcon = PLATFORM_ICONS[value];

  // Edge detection: Check if dropdown would overflow viewport
  useEffect(() => {
    if (isOpen && containerRef.current && dropdownRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const dropdownWidth = 180; // min-width from CSS
      const viewportWidth = window.innerWidth;

      // Check if dropdown would overflow right edge
      const wouldOverflowRight = containerRect.left + dropdownWidth > viewportWidth - 16;
      setAlignRight(wouldOverflowRight);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`platform-select-custom ${alignRight ? 'dropdown-align-right' : ''}`}
      ref={containerRef}
    >
      <button
        type="button"
        className="platform-select-trigger"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select social media platform"
      >
        {SelectedIcon && <SelectedIcon size={16} className="platform-icon" />}
        <span className="platform-name">{selectedConfig?.name}</span>
        <svg
          className={`platform-select-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path d="M6 8L1 3h10z" fill="currentColor" />
        </svg>
      </button>

      {isOpen && (
        <ul className="platform-select-dropdown" role="listbox" ref={dropdownRef}>
          {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => {
            const Icon = PLATFORM_ICONS[key];
            return (
              <li
                key={key}
                role="option"
                aria-selected={value === key}
                className={`platform-select-option ${value === key ? 'selected' : ''}`}
                onClick={() => handleSelect(key)}
              >
                {Icon && <Icon size={16} className="platform-icon" />}
                <span className="platform-name">{config.name}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
