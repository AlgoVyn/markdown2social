import React from 'react';
import './ThreadsPost.css';

interface ThreadsPostProps {
  contentText: string;
}

export const ThreadsPost: React.FC<ThreadsPostProps> = ({ contentText }) => {
  // Check if content exceeds Threads limit (500 chars)
  const charCount = contentText.length;
  const isOverLimit = charCount > 500;

  return (
    <article className="threads-post" role="article" aria-label="Threads post preview">
      <header className="threads-header">
        <div className="threads-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
          </svg>
        </div>
        <div className="threads-user-info">
          <span className="threads-username">username</span>
          <span className="threads-time">Just now</span>
        </div>
      </header>

      <div className="threads-content">
        {contentText ? (
          <p className="threads-text">{contentText}</p>
        ) : (
          <p className="threads-placeholder">Start a thread...</p>
        )}
      </div>

      {isOverLimit && (
        <div className="threads-warning" role="alert">
          Content exceeds 500 character limit. Consider splitting into multiple posts.
        </div>
      )}

      <footer className="threads-actions">
        <button className="threads-action-btn" aria-label="Like" disabled>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <button className="threads-action-btn" aria-label="Comment" disabled>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        </button>
        <button className="threads-action-btn" aria-label="Repost" disabled>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M17 1l4 4-4 4" />
            <path d="M3 11V9a4 4 0 014-4h14" />
            <path d="M7 23l-4-4 4-4" />
            <path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
        </button>
        <button className="threads-action-btn" aria-label="Share" disabled>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
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
