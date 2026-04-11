import React from 'react';
import './YouTubeDescription.css';

interface YouTubeDescriptionProps {
  contentText: string;
}

export const YouTubeDescription: React.FC<YouTubeDescriptionProps> = ({ contentText }) => {
  // Format hashtags to be highlighted
  const formatContent = (text: string) => {
    return text.replace(/(#\w+)/g, '<span class="yt-hashtag">$1</span>');
  };

  const formattedContent = formatContent(contentText);

  // Extract hashtags for display
  const hashtags = contentText.match(/#\w+/g) || [];

  return (
    <div className="youtube-container" role="region" aria-label="YouTube video description preview">
      <div className="youtube-video-section">
        <div className="youtube-video-placeholder" aria-label="Video thumbnail">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </svg>
          <span className="youtube-play-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        <div className="youtube-video-info">
          <h3 className="youtube-video-title">Your Video Title</h3>
          <div className="youtube-channel-row">
            <div className="youtube-channel-avatar" />
            <span className="youtube-channel-name">Your Channel</span>
            <button className="youtube-subscribe-btn" disabled>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="youtube-description-box">
        <div className="youtube-description-header">
          <span>Description</span>
        </div>

        <div className="youtube-description-content">
          {contentText ? (
            <div className="youtube-text" dangerouslySetInnerHTML={{ __html: formattedContent }} />
          ) : (
            <p className="youtube-placeholder">Enter your video description...</p>
          )}
        </div>

        {hashtags.length > 0 && (
          <div className="youtube-hashtags">
            {hashtags.map((tag, i) => (
              <span key={i} className="youtube-hashtag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="youtube-show-more">
          <button disabled>Show more</button>
        </div>
      </div>

      <div className="youtube-comments-section">
        <div className="youtube-comments-header">
          <span>0 Comments</span>
          <button className="youtube-sort-btn" disabled>
            Sort by
          </button>
        </div>
        <div className="youtube-comment-input">
          <div className="youtube-comment-avatar" />
          <div className="youtube-comment-placeholder">Add a comment...</div>
        </div>
      </div>
    </div>
  );
};
