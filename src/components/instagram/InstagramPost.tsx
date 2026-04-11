import React from 'react';
import './InstagramPost.css';

interface InstagramPostProps {
  contentText: string;
}

export const InstagramPost: React.FC<InstagramPostProps> = ({ contentText }) => {
  // Instagram doesn't support clickable links in captions (only in bio)
  const hasLinks = /https?:\/\/[^\s]+/.test(contentText);

  return (
    <article className="instagram-post" role="article" aria-label="Instagram post preview">
      <header className="instagram-header">
        <div className="instagram-avatar-ring">
          <div className="instagram-avatar">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
        </div>
        <span className="instagram-username">username</span>
        <button className="instagram-more-btn" aria-label="More options" disabled>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </header>

      <div className="instagram-image-placeholder" aria-label="Image placeholder">
        <svg
          viewBox="0 0 24 24"
          width="48"
          height="48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>

      <div className="instagram-content">
        <div className="instagram-actions-bar">
          <div className="instagram-actions-left">
            <button className="instagram-action-btn" aria-label="Like" disabled>
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
            <button className="instagram-action-btn" aria-label="Comment" disabled>
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
            <button className="instagram-action-btn" aria-label="Share" disabled>
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                <path d="M16 6l-4-4-4 4" />
                <path d="M12 2v15" />
              </svg>
            </button>
          </div>
          <button className="instagram-action-btn" aria-label="Save" disabled>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        </div>

        <div className="instagram-likes">0 likes</div>

        <div className="instagram-caption">
          <span className="instagram-caption-username">username</span>
          {contentText ? (
            <span className="instagram-caption-text">{contentText}</span>
          ) : (
            <span className="instagram-caption-placeholder">Write a caption...</span>
          )}
        </div>

        {hasLinks && (
          <div className="instagram-link-warning" role="note">
            Note: Links in Instagram captions are not clickable. Add the link to your bio instead.
          </div>
        )}

        <div className="instagram-time">Just now</div>
      </div>
    </article>
  );
};
