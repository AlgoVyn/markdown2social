import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { ThreadPost, addThreadIndicators } from '../../utils/threadSplitter';
import './TwitterThreadPreview.css';

interface TwitterThreadPreviewProps {
  posts: ThreadPost[];
  totalPosts: number;
}

export const TwitterThreadPreview: React.FC<TwitterThreadPreviewProps> = ({
  posts,
  totalPosts,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const postsWithIndicators = addThreadIndicators({
    posts,
    totalPosts,
    totalCharacters: 0,
    isOverLimit: false,
    needsThread: totalPosts > 1,
  });
  const currentPost = postsWithIndicators[currentIndex];

  const handleCopy = async (post: ThreadPost) => {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Silently fail
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(totalPosts - 1, prev + 1));
  };

  if (!posts.length) {
    return (
      <div className="twitter-thread-empty" role="status">
        <p>No content to preview</p>
      </div>
    );
  }

  return (
    <div className="twitter-thread-preview" role="region" aria-label="Twitter thread preview">
      <div className="thread-header">
        <div className="thread-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <div className="thread-user-info">
          <span className="thread-display-name">Your Name</span>
          <span className="thread-username">@username</span>
        </div>
      </div>

      <div className="thread-content">
        <p className="thread-text">{currentPost.content}</p>
        <div className="thread-meta">
          <span className="thread-timestamp">Just now</span>
          <span className="thread-views">0 views</span>
        </div>
      </div>

      <div className="thread-actions-bar">
        <button className="thread-action-btn" aria-label="Reply" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20.5c-4.694 0-8.5-3.206-8.5-7.5s3.806-7.5 8.5-7.5 8.5 3.206 8.5 7.5-3.806 7.5-8.5 7.5z" />
            <path d="M12 11v6M9 14h6" />
          </svg>
        </button>
        <button className="thread-action-btn" aria-label="Repost" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7" />
            <path d="M16 6l-4-4-4 4M12 2v13" />
          </svg>
        </button>
        <button className="thread-action-btn" aria-label="Like" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <button className="thread-action-btn" aria-label="Share" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      <div className="thread-navigation">
        <button
          className="nav-btn"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          aria-label="Previous post"
        >
          <ChevronLeft size={20} />
        </button>

        <span className="thread-indicator" aria-live="polite">
          {currentIndex + 1} / {totalPosts}
        </span>

        <button
          className="nav-btn"
          onClick={goToNext}
          disabled={currentIndex === totalPosts - 1}
          aria-label="Next post"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="thread-copy-actions">
        <button
          className={`copy-btn ${copiedId === currentPost.id ? 'copied' : ''}`}
          onClick={() => handleCopy(currentPost)}
          aria-label={`Copy post ${currentPost.id} to clipboard`}
        >
          {copiedId === currentPost.id ? (
            <>
              <Check size={16} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>Copy Post {currentPost.id}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
