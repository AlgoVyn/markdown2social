import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinkedInPost } from './LinkedInPost';

describe('LinkedInPost', () => {
  describe('rendering', () => {
    it('should render the post container', () => {
      render(<LinkedInPost contentText="Test content" />);

      expect(screen.getByLabelText('LinkedIn post preview')).toBeInTheDocument();
    });

    it('should render default author information', () => {
      render(<LinkedInPost contentText="Test content" />);

      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      expect(screen.getByText('Content Creator at SocialBoost')).toBeInTheDocument();
    });

    it('should render content text', () => {
      render(<LinkedInPost contentText="This is my LinkedIn post content" />);

      expect(screen.getByText('This is my LinkedIn post content')).toBeInTheDocument();
    });

    it('should render multi-line content', () => {
      render(<LinkedInPost contentText="Line 1\nLine 2\nLine 3" />);

      // Content is split into spans with line breaks
      const contentRegion = screen.getByLabelText('Post content');
      expect(contentRegion).toBeInTheDocument();
      expect(contentRegion.textContent).toContain('Line 1');
      expect(contentRegion.textContent).toContain('Line 2');
      expect(contentRegion.textContent).toContain('Line 3');
    });

    it('should render timestamp', () => {
      render(<LinkedInPost contentText="Test" />);

      expect(screen.getByText(/Just now/)).toBeInTheDocument();
    });

    it('should show connection degree badge', () => {
      render(<LinkedInPost contentText="Test" />);

      expect(screen.getByLabelText('First degree connection')).toBeInTheDocument();
    });
  });

  describe('post actions', () => {
    it('should render all action buttons', () => {
      render(<LinkedInPost contentText="Test" />);

      expect(screen.getByLabelText('Like this post')).toBeInTheDocument();
      expect(screen.getByLabelText('Comment on this post')).toBeInTheDocument();
      expect(screen.getByLabelText('Repost this post')).toBeInTheDocument();
      expect(screen.getByLabelText('Send this post')).toBeInTheDocument();
    });

    it('should show action button labels', () => {
      render(<LinkedInPost contentText="Test" />);

      expect(screen.getByText('Like')).toBeInTheDocument();
      expect(screen.getByText('Comment')).toBeInTheDocument();
      expect(screen.getByText('Repost')).toBeInTheDocument();
      expect(screen.getByText('Send')).toBeInTheDocument();
    });
  });

  describe('content variations', () => {
    it('should handle empty content', () => {
      render(<LinkedInPost contentText="" />);

      const content = screen.getByLabelText('Post content');
      expect(content).toBeInTheDocument();
    });

    it('should handle content with special characters', () => {
      const specialChars = 'Special chars and emoji 🚀 Unicode';
      render(<LinkedInPost contentText={specialChars} />);

      expect(screen.getByText(/Special/)).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'Word '.repeat(500);
      render(<LinkedInPost contentText={longContent} />);

      expect(screen.getByLabelText('Post content')).toBeInTheDocument();
    });

    it('should preserve line breaks', () => {
      const content = 'First paragraph\n\nSecond paragraph';
      render(<LinkedInPost contentText={content} />);

      // The plain-text fallback renders one <p> whose newlines are made
      // visible by the pre-wrap style inherited from .post-content
      const contentElement = screen.getByLabelText('Post content');
      expect(contentElement.querySelector('p')?.textContent).toBe(content);
    });
  });

  describe('markdown rendering', () => {
    it('should render markdown as formatted HTML when markdown prop is provided', () => {
      render(<LinkedInPost contentText="" markdown={'# Title\n\n**bold** text'} />);

      const content = screen.getByLabelText('Post content');
      expect(content.querySelector('h1')?.textContent).toBe('Title');
      expect(content.querySelector('strong')?.textContent).toBe('bold');
    });

    it('should sanitize script tags in markdown', () => {
      render(<LinkedInPost contentText="" markdown="**bold** <script>alert(1)</script>" />);

      const content = screen.getByLabelText('Post content');
      expect(content.querySelector('script')).toBeNull();
      expect(content.querySelector('strong')?.textContent).toBe('bold');
    });

    it('should apply format style to rendered markdown', () => {
      render(<LinkedInPost contentText="" markdown="- Item" formatStyle="bullet-optimized" />);

      const content = screen.getByLabelText('Post content');
      expect(content.textContent).toContain('✅');
    });

    it('should fall back to plain text rendering without markdown', () => {
      render(<LinkedInPost contentText="Plain line" />);

      const content = screen.getByLabelText('Post content');
      expect(content.querySelector('strong')).toBeNull();
      expect(content.textContent).toContain('Plain line');
    });

    it('should open rendered links in a new tab with noopener', () => {
      render(<LinkedInPost contentText="" markdown={'[site](https://example.com)'} />);

      const link = screen.getByLabelText('Post content').querySelector('a');
      expect(link).not.toBeNull();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render one code-line span per code block line', () => {
      render(<LinkedInPost contentText="" markdown={'```\nconst a = 1;\nconst b = 2;\n```'} />);

      const content = screen.getByLabelText('Post content');
      expect(content.querySelectorAll('.code-line')).toHaveLength(2);
      expect(content.querySelector('.code-line')?.textContent).toBe('const a = 1;');
    });
  });

  describe('accessibility', () => {
    it('should have article role', () => {
      render(<LinkedInPost contentText="Test" />);

      const article = screen.getByLabelText('LinkedIn post preview');
      expect(article.tagName.toLowerCase()).toBe('article');
    });

    it('should have labeled content region', () => {
      render(<LinkedInPost contentText="Test" />);

      expect(screen.getByLabelText('Post content')).toBeInTheDocument();
    });

    it('should have labeled actions region', () => {
      render(<LinkedInPost contentText="Test" />);

      expect(screen.getByLabelText('Post actions')).toBeInTheDocument();
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(<LinkedInPost contentText="Test" />);

      // Look for SVG elements with aria-hidden
      const ariaHiddenElements = container.querySelectorAll('[aria-hidden="true"]');
      expect(ariaHiddenElements.length).toBeGreaterThan(0);
    });
  });

  describe('structure', () => {
    it('should have post header with profile info', () => {
      render(<LinkedInPost contentText="Test" />);

      const authorName = screen.getByText('Jane Doe');
      expect(authorName).toBeInTheDocument();
    });

    it('should have profile picture placeholder', () => {
      const { container } = render(<LinkedInPost contentText="Test" />);

      const profilePic = container.querySelector('.profile-pic-placeholder');
      expect(profilePic).toBeInTheDocument();
    });

    it('should have datetime attribute on time element', () => {
      const { container } = render(<LinkedInPost contentText="Test" />);

      const timeElement = container.querySelector('time');
      expect(timeElement).toHaveAttribute('dateTime');
    });
  });
});
