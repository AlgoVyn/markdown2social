import React from 'react';
import { FormattedContent } from '../FormattedContent';
import type { FormatStyle } from '../../utils/markdownParser';
import './DiscordMessage.css';

interface DiscordMessageProps {
  contentText: string;
  markdown?: string;
  formatStyle?: FormatStyle;
}

export const DiscordMessage: React.FC<DiscordMessageProps> = ({
  contentText,
  markdown,
  formatStyle,
}) => {
  return (
    <div className="discord-container" role="region" aria-label="Discord message preview">
      <div className="discord-channel-header">
        <span className="discord-channel-icon">#</span>
        <span className="discord-channel-name">general</span>
      </div>

      <div className="discord-message">
        <div className="discord-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>

        <div className="discord-message-content">
          <div className="discord-message-header">
            <span className="discord-username">YourName</span>
            <span className="discord-timestamp">
              Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <FormattedContent
            contentText={contentText}
            markdown={markdown}
            formatStyle={formatStyle}
            textClassName="discord-text"
            placeholder="Message #general"
            placeholderClassName="discord-placeholder"
          />
        </div>
      </div>
    </div>
  );
};
