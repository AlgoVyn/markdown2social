import React from 'react';
import './DiscordMessage.css';

interface DiscordMessageProps {
  contentText: string;
}

export const DiscordMessage: React.FC<DiscordMessageProps> = ({ contentText }) => {
  // Discord supports markdown formatting
  const formattedContent = contentText
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<u>$1</u>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/```[\s\S]*?```/g, '<pre><code>$&</code></pre>');

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

          {contentText ? (
            <div className="discord-text" dangerouslySetInnerHTML={{ __html: formattedContent }} />
          ) : (
            <p className="discord-placeholder">Message #general</p>
          )}
        </div>
      </div>
    </div>
  );
};
