import React from 'react';
import './RedditPost.css';

interface RedditPostProps {
  contentText: string;
}

export const RedditPost: React.FC<RedditPostProps> = ({ contentText }) => {
  // Format text to show markdown rendering similar to Reddit
  const formattedContent = contentText
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

  const voteCount = 1;
  const commentCount = 0;

  return (
    <article className="reddit-post" role="article" aria-label="Reddit post preview">
      <div className="reddit-vote-column">
        <button className="reddit-vote-btn reddit-upvote" aria-label="Upvote" disabled>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M4 14l8-10 8 10h-6v8h-4v-8H4z" />
          </svg>
        </button>
        <span className="reddit-vote-count">{voteCount}</span>
        <button className="reddit-vote-btn reddit-downvote" aria-label="Downvote" disabled>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20 10l-8 10-8-10h6V0h4v10h6z" />
          </svg>
        </button>
      </div>

      <div className="reddit-content">
        <header className="reddit-header">
          <div className="reddit-avatar-small" aria-hidden="true" />
          <span className="reddit-subreddit">r/test</span>
          <span className="reddit-dot">•</span>
          <span className="reddit-meta">Posted by u/username Just now</span>
        </header>

        <h3 className="reddit-title">Your Post Title</h3>

        <div className="reddit-body">
          {contentText ? (
            <div className="reddit-text" dangerouslySetInnerHTML={{ __html: formattedContent }} />
          ) : (
            <p className="reddit-placeholder">Enter your post content...</p>
          )}
        </div>

        <footer className="reddit-actions">
          <button className="reddit-action-btn" aria-label="Comments" disabled>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
            <span>{commentCount} comments</span>
          </button>
          <button className="reddit-action-btn" aria-label="Share" disabled>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <path d="M16 6l-4-4-4 4" />
              <path d="M12 2v13" />
            </svg>
            <span>Share</span>
          </button>
          <button className="reddit-action-btn" aria-label="Save" disabled>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
            <span>Save</span>
          </button>
          <button className="reddit-action-btn" aria-label="More options" disabled>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </footer>
      </div>
    </article>
  );
};
