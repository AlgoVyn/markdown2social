import React from 'react';
import { Settings, Copy, Monitor, Clock } from 'lucide-react';
import { PLATFORM_CONFIGS } from '../utils/platforms';
import './Toolbar.css';

interface ToolbarProps {
  onCopy: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  platform: string;
  setPlatform: (val: string) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onCopy,
  onOpenSettings,
  onOpenHistory,
  platform,
  setPlatform,
}) => {
  return (
    <header className="toolbar" role="banner" aria-label="Application toolbar">
      <div className="toolbar-logo">
        <Monitor className="logo-icon" aria-hidden="true" />
        <span className="logo-text">MDtoSocial</span>
      </div>

      <nav className="toolbar-actions" aria-label="Main actions">
        <label htmlFor="platform-select" className="visually-hidden">
          Select social media platform
        </label>
        <select
          id="platform-select"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="platform-select"
          aria-label="Social media platform"
        >
          {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => (
            <option key={key} value={key}>
              {config.name} ({config.characterLimit.toLocaleString()} chars)
            </option>
          ))}
        </select>

        <button
          className="action-button"
          onClick={onOpenHistory}
          aria-haspopup="dialog"
          aria-label="Open conversion history"
        >
          <Clock size={18} aria-hidden="true" />
          <span>History</span>
        </button>

        <button
          className="action-button"
          onClick={onOpenSettings}
          aria-haspopup="dialog"
          aria-label="Open style settings"
        >
          <Settings size={18} aria-hidden="true" />
          <span>Styles</span>
        </button>

        <button
          className="action-button primary"
          onClick={onCopy}
          aria-label="Copy formatted content to clipboard"
        >
          <Copy size={18} aria-hidden="true" />
          <span>Copy</span>
        </button>
      </nav>
    </header>
  );
};
