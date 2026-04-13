import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LivePreview } from './LivePreview';

describe('LivePreview', () => {
  const defaultProps = {
    contentText: 'Text content',
    platform: 'linkedin',
  };

  describe('LinkedIn platform', () => {
    it('should render LinkedIn preview', () => {
      render(<LivePreview {...defaultProps} />);

      expect(screen.getByText('Live Preview')).toBeInTheDocument();
      const badge = screen.getByLabelText('Platform: LinkedIn');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should pass contentText to LinkedInPost', () => {
      render(<LivePreview {...defaultProps} contentText="My post content" />);

      expect(screen.getByText('My post content')).toBeInTheDocument();
    });
  });

  describe('Twitter/X platform', () => {
    it('should render Twitter thread preview for twitter platform', () => {
      render(<LivePreview {...defaultProps} platform="twitter" contentText="Tweet content" />);

      expect(screen.getByText('Live Preview')).toBeInTheDocument();
      const badge = screen.getByLabelText('Platform: Twitter/X');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Your Name')).toBeInTheDocument();
    });

    it('should split long content into thread preview', () => {
      const longContent = 'a'.repeat(500);
      render(<LivePreview {...defaultProps} platform="twitter" contentText={longContent} />);

      expect(screen.getByText(/\/\s*\d+/)).toBeInTheDocument();
    });

    it('should handle single tweet under limit', () => {
      render(<LivePreview {...defaultProps} platform="twitter" contentText="Short tweet" />);

      expect(screen.getByText('1 / 1')).toBeInTheDocument();
    });
  });

  describe('Bluesky platform', () => {
    it('should render Bluesky preview', () => {
      render(<LivePreview {...defaultProps} platform="bluesky" contentText="Skeet content" />);

      const badge = screen.getByLabelText('Platform: Bluesky');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Skeet content')).toBeInTheDocument();
      expect(screen.getByText(/handle.bsky.social/)).toBeInTheDocument();
    });

    it('should show placeholder when empty', () => {
      render(<LivePreview {...defaultProps} platform="bluesky" contentText="" />);

      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    });
  });

  describe('Mastodon platform', () => {
    it('should render Mastodon preview', () => {
      render(<LivePreview {...defaultProps} platform="mastodon" contentText="Toot content" />);

      const badge = screen.getByLabelText('Platform: Mastodon');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Toot content')).toBeInTheDocument();
      expect(screen.getByText(/username@instance.social/)).toBeInTheDocument();
    });

    it('should show placeholder when empty', () => {
      render(<LivePreview {...defaultProps} platform="mastodon" contentText="" />);

      expect(screen.getByText("What's on your mind?")).toBeInTheDocument();
    });
  });

  describe('Threads platform', () => {
    it('should render Threads preview', () => {
      render(<LivePreview {...defaultProps} platform="threads" contentText="Thread content" />);

      const badge = screen.getByLabelText('Platform: Threads');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Thread content')).toBeInTheDocument();
    });

    it('should show placeholder when empty', () => {
      render(<LivePreview {...defaultProps} platform="threads" contentText="" />);

      expect(screen.getByText('Start a thread...')).toBeInTheDocument();
    });

    it('should show warning when content exceeds limit', () => {
      const longContent = 'a'.repeat(600);
      render(<LivePreview {...defaultProps} platform="threads" contentText={longContent} />);

      expect(screen.getByText(/exceeds 500 character limit/)).toBeInTheDocument();
    });
  });

  describe('Instagram platform', () => {
    it('should render Instagram preview', () => {
      render(<LivePreview {...defaultProps} platform="instagram" contentText="Caption here" />);

      const badge = screen.getByLabelText('Platform: Instagram');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Caption here')).toBeInTheDocument();
    });

    it('should show placeholder when empty', () => {
      render(<LivePreview {...defaultProps} platform="instagram" contentText="" />);

      expect(screen.getByText('Write a caption...')).toBeInTheDocument();
    });

    it('should show link warning when content contains URLs', () => {
      render(
        <LivePreview
          {...defaultProps}
          platform="instagram"
          contentText="Check https://example.com"
        />
      );

      expect(screen.getByText(/Links in Instagram captions are not clickable/)).toBeInTheDocument();
    });
  });

  describe('Discord platform', () => {
    it('should render Discord preview', () => {
      render(<LivePreview {...defaultProps} platform="discord" contentText="Discord message" />);

      const badge = screen.getByLabelText('Platform: Discord');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Discord message')).toBeInTheDocument();
    });

    it('should show placeholder when empty', () => {
      render(<LivePreview {...defaultProps} platform="discord" contentText="" />);

      expect(screen.getByText('Message #general')).toBeInTheDocument();
    });
  });

  describe('Reddit platform', () => {
    it('should render Reddit preview', () => {
      render(<LivePreview {...defaultProps} platform="reddit" contentText="Reddit post" />);

      const badge = screen.getByLabelText('Platform: Reddit');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Reddit post')).toBeInTheDocument();
    });

    it('should show placeholder when empty', () => {
      render(<LivePreview {...defaultProps} platform="reddit" contentText="" />);

      expect(screen.getByText('Enter your post content...')).toBeInTheDocument();
    });
  });

  describe('YouTube platform', () => {
    it('should render YouTube preview', () => {
      render(<LivePreview {...defaultProps} platform="youtube" contentText="Video description" />);

      const badge = screen.getByLabelText('Platform: YouTube');
      expect(badge).toHaveClass('preview-badge');
      expect(screen.getByText('Video description')).toBeInTheDocument();
    });

    it('should show placeholder when empty', () => {
      render(<LivePreview {...defaultProps} platform="youtube" contentText="" />);

      expect(screen.getByText('Enter your video description...')).toBeInTheDocument();
    });

    it('should highlight hashtags', () => {
      render(
        <LivePreview {...defaultProps} platform="youtube" contentText="Check out #vlog #tutorial" />
      );

      // Hashtags appear both in text and in pill form
      const hashtags = screen.getAllByText(/#vlog/);
      expect(hashtags.length).toBeGreaterThanOrEqual(1);
      const hashtags2 = screen.getAllByText(/#tutorial/);
      expect(hashtags2.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Empty content handling', () => {
    it('should handle empty content for Twitter', () => {
      render(<LivePreview {...defaultProps} platform="twitter" contentText="" />);

      expect(screen.getByText(/Enter content to see thread preview/)).toBeInTheDocument();
    });
  });

  describe('Preview header', () => {
    it('should render preview header', () => {
      render(<LivePreview {...defaultProps} platform="linkedin" />);

      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    it('should show correct platform name in badge', () => {
      render(<LivePreview {...defaultProps} platform="mastodon" />);

      const badge = screen.getByLabelText('Platform: Mastodon');
      expect(badge).toHaveClass('preview-badge');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible preview container', () => {
      render(<LivePreview {...defaultProps} />);

      const container = screen.getByLabelText('Live preview');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('should have accessible preview content region', () => {
      render(<LivePreview {...defaultProps} />);

      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
