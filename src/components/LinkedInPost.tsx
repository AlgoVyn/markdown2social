import React from 'react';
import { Share2, ThumbsUp, MessageSquare, Send, User } from 'lucide-react';
import { FormattedContent } from './FormattedContent';
import type { FormatStyle } from '../utils/markdownParser';
import './LinkedInPost.css';

interface LinkedInPostProps {
  contentText: string;
  markdown?: string;
  formatStyle?: FormatStyle;
}

export const LinkedInPost: React.FC<LinkedInPostProps> = ({
  contentText,
  markdown,
  formatStyle = 'standard',
}) => {
  return (
    <article className="linkedin-post" aria-label="LinkedIn post preview">
      <header className="post-header">
        <div className="profile-pic-placeholder" aria-hidden="true">
          <User size={28} strokeWidth={1.5} />
        </div>
        <div className="post-meta">
          <div className="post-author">
            <span className="author-name">Jane Doe</span>
            <span className="connection-degree" aria-label="First degree connection">
              • 1st
            </span>
          </div>
          <div className="author-headline">Content Creator at SocialBoost</div>
          <time className="post-time" dateTime={new Date().toISOString()}>
            Just now • 🌐
          </time>
        </div>
      </header>

      <div className="post-content" aria-label="Post content">
        <FormattedContent
          contentText={contentText}
          markdown={markdown}
          formatStyle={formatStyle}
          textClassName="linkedin-text"
        />
      </div>

      <footer className="post-footer" aria-label="Post actions">
        <button className="footer-action" aria-label="Like this post">
          <ThumbsUp size={16} aria-hidden="true" /> Like
        </button>
        <button className="footer-action" aria-label="Comment on this post">
          <MessageSquare size={16} aria-hidden="true" /> Comment
        </button>
        <button className="footer-action" aria-label="Repost this post">
          <Share2 size={16} aria-hidden="true" /> Repost
        </button>
        <button className="footer-action" aria-label="Send this post">
          <Send size={16} aria-hidden="true" /> Send
        </button>
      </footer>
    </article>
  );
};
