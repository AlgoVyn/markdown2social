import React, { useMemo } from 'react';
import { Eye, FileText, Sparkles } from 'lucide-react';
import { LinkedInPost } from './LinkedInPost';
import { TwitterThreadPreview } from './twitter/TwitterThreadPreview';
import { BlueskyPost } from './bluesky/BlueskyPost';
import { MastodonPost } from './mastodon/MastodonPost';
import { ThreadsPost } from './threads/ThreadsPost';
import { InstagramPost } from './instagram/InstagramPost';
import { DiscordMessage } from './discord/DiscordMessage';
import { RedditPost } from './reddit/RedditPost';
import { YouTubeDescription } from './youtube/YouTubeDescription';
import { splitIntoThread } from '../utils/threadSplitter';
import { getPlatformConfig } from '../utils/platforms';
import 'highlight.js/styles/github.css';
import './LivePreview.css';

interface LivePreviewProps {
  contentText: string;
  platform: string;
}

interface EmptyStateProps {
  platformName: string;
  hasContent: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ platformName, hasContent }) => (
  <div className="empty-state" role="status">
    <div className="empty-state-icon">
      {hasContent ? (
        <Sparkles size={48} aria-hidden="true" />
      ) : (
        <Eye size={48} aria-hidden="true" />
      )}
    </div>
    <h3 className="empty-state-title">{hasContent ? 'Thread Created!' : 'Preview Your Content'}</h3>
    <p className="empty-state-message">
      {hasContent
        ? `Your content fits within ${platformName}'s character limit as a single post.`
        : `Start typing in the editor to see how your content will appear on ${platformName}.`}
    </p>
    {!hasContent && (
      <div className="empty-state-tips">
        <div className="tip-item">
          <FileText size={16} aria-hidden="true" />
          <span>Supports Markdown formatting</span>
        </div>
      </div>
    )}
  </div>
);

// Map platforms to their preview components
const PLATFORM_COMPONENTS: Record<string, React.FC<{ contentText: string }>> = {
  linkedin: LinkedInPost,
  bluesky: BlueskyPost,
  mastodon: MastodonPost,
  threads: ThreadsPost,
  instagram: InstagramPost,
  discord: DiscordMessage,
  reddit: RedditPost,
  youtube: YouTubeDescription,
};

export const LivePreview: React.FC<LivePreviewProps> = ({ contentText, platform }) => {
  const platformConfig = getPlatformConfig(platform);

  const threadData = useMemo(() => {
    if (platform === 'twitter' || platform === 'x') {
      return splitIntoThread(contentText, platformConfig.characterLimit);
    }
    return null;
  }, [contentText, platform, platformConfig.characterLimit]);

  const renderPreview = () => {
    // Handle Twitter/X thread preview
    if (platform === 'twitter' || platform === 'x') {
      if (threadData && threadData.posts.length > 0) {
        return <TwitterThreadPreview posts={threadData.posts} totalPosts={threadData.totalPosts} />;
      }
      return <EmptyState platformName={platformConfig.name} hasContent={contentText.length > 0} />;
    }

    // Handle platforms with dedicated components
    const PlatformComponent = PLATFORM_COMPONENTS[platform];
    if (PlatformComponent) {
      return <PlatformComponent contentText={contentText} />;
    }

    // Generic preview for unknown platforms
    return (
      <div className="generic-preview" role="region" aria-label={`${platformConfig.name} preview`}>
        <div className="generic-preview-content">
          {contentText ? (
            <p>{contentText}</p>
          ) : (
            <EmptyState platformName={platformConfig.name} hasContent={false} />
          )}
        </div>
        {contentText && (
          <div className="generic-preview-meta">
            <span>
              {contentText.length} / {platformConfig.characterLimit} characters
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="preview-container" aria-label="Live preview" aria-live="polite">
      <div className="preview-header">
        <h2 className="preview-title" id="preview-heading">
          Live Preview
        </h2>
        <span className="preview-badge" aria-label={`Platform: ${platformConfig.name}`}>
          {platformConfig.name}
        </span>
      </div>
      <div className="preview-content" role="region" aria-labelledby="preview-heading">
        {renderPreview()}
      </div>
    </section>
  );
};
