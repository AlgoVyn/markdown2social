import React, { useMemo } from 'react';
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

export const LivePreview: React.FC<LivePreviewProps> = ({ contentText, platform }) => {
  const platformConfig = getPlatformConfig(platform);

  // Calculate thread preview for Twitter/X
  const threadData = useMemo(() => {
    if (platform === 'twitter' || platform === 'x') {
      return splitIntoThread(contentText, platformConfig.characterLimit);
    }
    return null;
  }, [contentText, platform, platformConfig.characterLimit]);

  const renderPreview = () => {
    switch (platform) {
      case 'linkedin':
        return <LinkedInPost contentText={contentText} />;

      case 'twitter':
      case 'x':
        if (threadData && threadData.posts.length > 0) {
          return (
            <TwitterThreadPreview posts={threadData.posts} totalPosts={threadData.totalPosts} />
          );
        }
        return (
          <div className="empty-preview" role="status">
            <p>Enter content to see thread preview</p>
          </div>
        );

      case 'bluesky':
        return <BlueskyPost contentText={contentText} />;

      case 'mastodon':
        return <MastodonPost contentText={contentText} />;

      case 'threads':
        return <ThreadsPost contentText={contentText} />;

      case 'instagram':
        return <InstagramPost contentText={contentText} />;

      case 'discord':
        return <DiscordMessage contentText={contentText} />;

      case 'reddit':
        return <RedditPost contentText={contentText} />;

      case 'youtube':
        return <YouTubeDescription contentText={contentText} />;

      default:
        return (
          <div
            className="generic-preview"
            role="region"
            aria-label={`${platformConfig.name} preview`}
          >
            <div className="generic-preview-content">
              <p>{contentText || 'Enter content to preview...'}</p>
            </div>
            <div className="generic-preview-meta">
              <span>
                {contentText.length} / {platformConfig.characterLimit} characters
              </span>
            </div>
          </div>
        );
    }
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
