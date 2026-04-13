import React from 'react';
import './MastodonPost.css';

interface MastodonPostProps {
  contentText: string;
}

export const MastodonPost: React.FC<MastodonPostProps> = ({ contentText }) => {
  return (
    <article className="mastodon-post" aria-label="Mastodon post preview">
      <header className="mastodon-header">
        <div className="mastodon-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>
        <div className="mastodon-user-info">
          <span className="mastodon-display-name">Your Name</span>
          <span className="mastodon-handle">@username@instance.social</span>
        </div>
      </header>

      <div className="mastodon-content">
        {contentText ? (
          <div className="mastodon-text">{contentText}</div>
        ) : (
          <p className="mastodon-placeholder">What's on your mind?</p>
        )}
      </div>

      <div className="mastodon-meta">
        <time dateTime={new Date().toISOString()}>Just now</time>
        <span className="mastodon-visibility">Public</span>
      </div>

      <footer className="mastodon-actions">
        <button className="mastodon-action-btn" aria-label="Reply" disabled>
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>0</span>
        </button>
        <button className="mastodon-action-btn" aria-label="Boost" disabled>
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          <span>0</span>
        </button>
        <button className="mastodon-action-btn" aria-label="Favorite" disabled>
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          <span>0</span>
        </button>
        <button className="mastodon-action-btn" aria-label="Share" disabled>
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </footer>
    </article>
  );
};
