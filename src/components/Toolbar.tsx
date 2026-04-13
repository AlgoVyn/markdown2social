import React from 'react';
import { Settings, Copy, Clock, Sun, Moon, Loader2 } from 'lucide-react';
import { PLATFORM_CONFIGS } from '../utils/platforms';
import logoUrl from '../../logo/logo.svg';
import './Toolbar.css';

interface ToolbarProps {
  onCopy: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  platform: string;
  setPlatform: (val: string) => void;
  theme: string;
  toggleTheme: () => void;
  isCopying?: boolean;
  isLoadingHistory?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onCopy,
  onOpenSettings,
  onOpenHistory,
  platform,
  setPlatform,
  theme,
  toggleTheme,
  isCopying = false,
  isLoadingHistory = false,
}) => {
  return (
    <header className="toolbar" role="banner" aria-label="Application toolbar">
      <div className="toolbar-logo">
        <img src={logoUrl} alt="" className="logo-icon" aria-hidden="true" />
        <span className="logo-text">Markdown2Social</span>
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
          disabled={isLoadingHistory}
          aria-busy={isLoadingHistory}
        >
          {isLoadingHistory ? (
            <Loader2 size={18} aria-hidden="true" className="spin-animation" />
          ) : (
            <Clock size={18} aria-hidden="true" />
          )}
          <span>History</span>
        </button>

        <button
          className="action-button icon-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Moon size={18} aria-hidden="true" />
          ) : (
            <Sun size={18} aria-hidden="true" />
          )}
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
          disabled={isCopying}
          aria-busy={isCopying}
        >
          {isCopying ? (
            <Loader2 size={18} aria-hidden="true" className="spin-animation" />
          ) : (
            <Copy size={18} aria-hidden="true" />
          )}
          <span>{isCopying ? 'Copying...' : 'Copy'}</span>
        </button>
      </nav>
    </header>
  );
};
