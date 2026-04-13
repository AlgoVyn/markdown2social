import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlueskyPost } from './bluesky/BlueskyPost';
import { InstagramPost } from './instagram/InstagramPost';
import { ThreadsPost } from './threads/ThreadsPost';
import { MastodonPost } from './mastodon/MastodonPost';
import { RedditPost } from './reddit/RedditPost';
import { YouTubeDescription } from './youtube/YouTubeDescription';
import { DiscordMessage } from './discord/DiscordMessage';

describe('Platform Preview Components', () => {
  describe('BlueskyPost', () => {
    it('should render with content', () => {
      render(<BlueskyPost contentText="Hello Bluesky!" />);

      expect(screen.getByText('Hello Bluesky!')).toBeInTheDocument();
      expect(screen.getByLabelText('Bluesky post preview')).toBeInTheDocument();
    });

    it('should render placeholder when no content', () => {
      render(<BlueskyPost contentText="" />);

      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    });

    it('should have user info', () => {
      render(<BlueskyPost contentText="Test" />);

      expect(screen.getByText('Your Name')).toBeInTheDocument();
      expect(screen.getByText('@handle.bsky.social')).toBeInTheDocument();
    });

    it('should have action buttons with correct aria-labels', () => {
      render(<BlueskyPost contentText="Test" />);

      expect(screen.getByLabelText('Reply')).toBeInTheDocument();
      expect(screen.getByLabelText('Repost')).toBeInTheDocument();
      expect(screen.getByLabelText('Like')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
    });

    it('should have timestamp', () => {
      render(<BlueskyPost contentText="Test" />);

      expect(screen.getByText('Just now')).toBeInTheDocument();
    });
  });

  describe('InstagramPost', () => {
    it('should render with content', () => {
      render(<InstagramPost contentText="Instagram caption here" />);

      expect(screen.getByText('Instagram caption here')).toBeInTheDocument();
      expect(screen.getByLabelText('Instagram post preview')).toBeInTheDocument();
    });

    it('should render placeholder when no content', () => {
      render(<InstagramPost contentText="" />);

      expect(screen.getByText('Write a caption...')).toBeInTheDocument();
    });

    it('should have username', () => {
      render(<InstagramPost contentText="Test" />);

      expect(screen.getAllByText('username')).toHaveLength(2); // header and caption
    });

    it('should have action buttons', () => {
      render(<InstagramPost contentText="Test" />);

      expect(screen.getByLabelText('Like')).toBeInTheDocument();
      expect(screen.getByLabelText('Comment')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Save')).toBeInTheDocument();
    });

    it('should show link warning when content has URL', () => {
      render(<InstagramPost contentText="Check out https://example.com" />);

      expect(screen.getByText(/Links in Instagram captions are not clickable/)).toBeInTheDocument();
    });

    it('should not show link warning when no URL', () => {
      render(<InstagramPost contentText="No links here" />);

      expect(screen.queryByText(/Links in Instagram/)).not.toBeInTheDocument();
    });
  });

  describe('ThreadsPost', () => {
    it('should render with content', () => {
      render(<ThreadsPost contentText="Thread content" />);

      expect(screen.getByText('Thread content')).toBeInTheDocument();
      expect(screen.getByLabelText('Threads post preview')).toBeInTheDocument();
    });

    it('should render placeholder when no content', () => {
      render(<ThreadsPost contentText="" />);

      expect(screen.getByText('Start a thread...')).toBeInTheDocument();
    });

    it('should have user info', () => {
      render(<ThreadsPost contentText="Test" />);

      expect(screen.getByText('username')).toBeInTheDocument();
    });

    it('should show warning when over 500 characters', () => {
      const longContent = 'A'.repeat(501);
      render(<ThreadsPost contentText={longContent} />);

      expect(screen.getByRole('alert')).toHaveTextContent(/exceeds 500 character limit/);
    });

    it('should not show warning when under limit', () => {
      render(<ThreadsPost contentText="Short content" />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should have action buttons', () => {
      render(<ThreadsPost contentText="Test" />);

      expect(screen.getByLabelText('Like')).toBeInTheDocument();
      expect(screen.getByLabelText('Comment')).toBeInTheDocument();
      expect(screen.getByLabelText('Repost')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
    });
  });

  describe('MastodonPost', () => {
    it('should render with content', () => {
      render(<MastodonPost contentText="Mastodon content" />);

      expect(screen.getByText('Mastodon content')).toBeInTheDocument();
      expect(screen.getByLabelText('Mastodon post preview')).toBeInTheDocument();
    });

    it('should render placeholder when no content', () => {
      render(<MastodonPost contentText="" />);

      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    });

    it('should have user info', () => {
      render(<MastodonPost contentText="Test" />);

      expect(screen.getByText('Your Name')).toBeInTheDocument();
      expect(screen.getByText('@username@instance.social')).toBeInTheDocument();
    });

    it('should have action buttons', () => {
      render(<MastodonPost contentText="Test" />);

      expect(screen.getByLabelText('Reply')).toBeInTheDocument();
      expect(screen.getByLabelText('Boost')).toBeInTheDocument();
      expect(screen.getByLabelText('Favorite')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
    });

    it('should have visibility indicator', () => {
      render(<MastodonPost contentText="Test" />);

      expect(screen.getByText('Public')).toBeInTheDocument();
    });
  });

  describe('RedditPost', () => {
    it('should render with content', () => {
      render(<RedditPost contentText="Reddit post content" />);

      expect(screen.getByText('Reddit post content')).toBeInTheDocument();
      expect(screen.getByLabelText('Reddit post preview')).toBeInTheDocument();
    });

    it('should render placeholder when no content', () => {
      render(<RedditPost contentText="" />);

      expect(screen.getByText('Enter your post content...')).toBeInTheDocument();
    });

    it('should have subreddit and meta info', () => {
      render(<RedditPost contentText="Test" />);

      expect(screen.getByText('r/test')).toBeInTheDocument();
      expect(screen.getByText(/Posted by u\/username/)).toBeInTheDocument();
    });

    it('should have vote buttons', () => {
      render(<RedditPost contentText="Test" />);

      expect(screen.getByLabelText('Upvote')).toBeInTheDocument();
      expect(screen.getByLabelText('Downvote')).toBeInTheDocument();
    });

    it('should format markdown bold as strong HTML', () => {
      render(<RedditPost contentText="**Bold text**" />);

      const strongElement = document.querySelector('strong');
      expect(strongElement).toBeInTheDocument();
      expect(strongElement).toHaveTextContent('Bold text');
    });

    it('should format markdown italic as em HTML', () => {
      render(<RedditPost contentText="*Italic text*" />);

      const emElement = document.querySelector('em');
      expect(emElement).toBeInTheDocument();
      expect(emElement).toHaveTextContent('Italic text');
    });

    it('should have action buttons', () => {
      render(<RedditPost contentText="Test" />);

      expect(screen.getByLabelText('Comments')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
      expect(screen.getByLabelText('Save')).toBeInTheDocument();
      expect(screen.getByLabelText('More options')).toBeInTheDocument();
    });
  });

  describe('YouTubeDescription', () => {
    it('should render with content', () => {
      render(<YouTubeDescription contentText="Video description" />);

      expect(screen.getByText('Video description')).toBeInTheDocument();
      expect(screen.getByLabelText('YouTube video description preview')).toBeInTheDocument();
    });

    it('should render placeholder when no content', () => {
      render(<YouTubeDescription contentText="" />);

      expect(screen.getByText('Enter your video description...')).toBeInTheDocument();
    });

    it('should have video title and channel', () => {
      render(<YouTubeDescription contentText="Test" />);

      expect(screen.getByText('Your Video Title')).toBeInTheDocument();
      expect(screen.getByText('Your Channel')).toBeInTheDocument();
    });

    it('should show hashtags section when hashtags exist', () => {
      const { container } = render(<YouTubeDescription contentText="#hashtag1 #hashtag2" />);

      const hashtagSection = container.querySelector('.youtube-hashtags');
      expect(hashtagSection).toBeInTheDocument();
      expect(hashtagSection?.textContent).toContain('#hashtag1');
      expect(hashtagSection?.textContent).toContain('#hashtag2');
    });

    it('should highlight hashtags in content', () => {
      const { container } = render(<YouTubeDescription contentText="#test" />);

      const hashtagSpan = container.querySelector('.yt-hashtag');
      expect(hashtagSpan).toBeInTheDocument();
      expect(hashtagSpan).toHaveTextContent('#test');
    });

    it('should have subscribe button', () => {
      render(<YouTubeDescription contentText="Test" />);

      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeInTheDocument();
    });

    it('should have comments section', () => {
      render(<YouTubeDescription contentText="Test" />);

      expect(screen.getByText('0 Comments')).toBeInTheDocument();
    });
  });

  describe('DiscordMessage', () => {
    it('should render with content', () => {
      render(<DiscordMessage contentText="Discord message" />);

      expect(screen.getByText('Discord message')).toBeInTheDocument();
      expect(screen.getByLabelText('Discord message preview')).toBeInTheDocument();
    });

    it('should render placeholder when no content', () => {
      render(<DiscordMessage contentText="" />);

      expect(screen.getByText('Message #general')).toBeInTheDocument();
    });

    it('should have channel header', () => {
      const { container } = render(<DiscordMessage contentText="Test" />);

      const channelHeader = container.querySelector('.discord-channel-header');
      expect(channelHeader).toBeInTheDocument();
      expect(channelHeader?.textContent).toContain('#general');
    });

    it('should have user info', () => {
      render(<DiscordMessage contentText="Test" />);

      expect(screen.getByText('YourName')).toBeInTheDocument();
      expect(screen.getByText(/Today at/)).toBeInTheDocument();
    });

    it('should format bold markdown as strong HTML', () => {
      render(<DiscordMessage contentText="**bold**" />);

      const strongElement = document.querySelector('strong');
      expect(strongElement).toBeInTheDocument();
      expect(strongElement).toHaveTextContent('bold');
    });

    it('should format italic markdown as em HTML', () => {
      render(<DiscordMessage contentText="*italic*" />);

      const emElement = document.querySelector('em');
      expect(emElement).toBeInTheDocument();
      expect(emElement).toHaveTextContent('italic');
    });

    it('should format code markdown as code HTML', () => {
      render(<DiscordMessage contentText="`code`" />);

      const codeElement = document.querySelector('code');
      expect(codeElement).toBeInTheDocument();
      expect(codeElement).toHaveTextContent('code');
    });

    it('should format underline markdown as u HTML', () => {
      render(<DiscordMessage contentText="__underline__" />);

      const uElement = document.querySelector('u');
      expect(uElement).toBeInTheDocument();
      expect(uElement).toHaveTextContent('underline');
    });
  });
});
