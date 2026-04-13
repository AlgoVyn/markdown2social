import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TwitterThreadPreview } from './twitter/TwitterThreadPreview';
import { ThreadPost } from '../../utils/threadSplitter';

describe('TwitterThreadPreview', () => {
  const mockPosts: ThreadPost[] = [
    { id: 1, content: 'First tweet in thread', characterCount: 21 },
    { id: 2, content: 'Second tweet in thread', characterCount: 22 },
    { id: 3, content: 'Third tweet in thread', characterCount: 21 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset clipboard mock to default success
    vi.mocked(navigator.clipboard.writeText).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render thread with posts', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      // Content may have thread indicators added (e.g., "(1/3)")
      expect(screen.getByText(/First tweet in thread/)).toBeInTheDocument();
      expect(screen.getByLabelText('Twitter thread preview')).toBeInTheDocument();
    });

    it('should show empty state when no posts', () => {
      render(<TwitterThreadPreview posts={[]} totalPosts={0} />);

      expect(screen.getByText('No content to preview')).toBeInTheDocument();
    });

    it('should have user info', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      expect(screen.getByText('Your Name')).toBeInTheDocument();
      expect(screen.getByText('@username')).toBeInTheDocument();
    });

    it('should have thread meta info', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      expect(screen.getByText('Just now')).toBeInTheDocument();
      expect(screen.getByText('0 views')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should show current post indicator', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
    });

    it('should have aria-live for indicator', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const indicator = screen.getByText('1 / 3');
      expect(indicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should navigate to next post', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const nextButton = screen.getByLabelText('Next post');
      await userEvent.click(nextButton);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();
      expect(screen.getByText(/Second tweet in thread/)).toBeInTheDocument();
    });

    it('should navigate to previous post', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      // First go to post 2
      const nextButton = screen.getByLabelText('Next post');
      await userEvent.click(nextButton);

      // Then go back to post 1
      const prevButton = screen.getByLabelText('Previous post');
      await userEvent.click(prevButton);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      expect(screen.getByText(/First tweet in thread/)).toBeInTheDocument();
    });

    it('should disable previous button on first post', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const prevButton = screen.getByLabelText('Previous post');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last post', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      // Navigate to last post
      const nextButton = screen.getByLabelText('Next post');
      await userEvent.click(nextButton);
      await userEvent.click(nextButton);

      expect(nextButton).toBeDisabled();
    });

    it('should not navigate past last post', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const nextButton = screen.getByLabelText('Next post');

      // Navigate to last post (2 clicks to get to post 3)
      await userEvent.click(nextButton);
      await userEvent.click(nextButton);

      // Should be on post 3
      expect(screen.getByText('3 / 3')).toBeInTheDocument();

      // Try to click next (should be disabled, but click anyway)
      if (!nextButton.disabled) {
        await userEvent.click(nextButton);
      }

      // Should still be on post 3
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });

    it('should not navigate before first post', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const prevButton = screen.getByLabelText('Previous post');

      // Previous button should be disabled on first post
      expect(prevButton).toBeDisabled();
    });
  });

  describe('copy functionality', () => {
    it('should have copy button with correct aria-label', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const copyButton = screen.getByLabelText('Copy post 1 to clipboard');
      expect(copyButton).toBeInTheDocument();
    });

    it('should copy post content to clipboard', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const copyButton = screen.getByLabelText('Copy post 1 to clipboard');
      await userEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it('should show copied state after successful copy', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const copyButton = screen.getByLabelText('Copy post 1 to clipboard');
      await userEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should copy different post content when on different posts', async () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      // Navigate to post 2
      const nextButton = screen.getByLabelText('Next post');
      await userEvent.click(nextButton);

      // Copy post 2
      const copyButton = screen.getByLabelText('Copy post 2 to clipboard');
      await userEvent.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it('should silently fail if clipboard API fails', async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard error'));

      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const copyButton = screen.getByLabelText('Copy post 1 to clipboard');

      // Should not throw
      await expect(userEvent.click(copyButton)).resolves.not.toThrow();
    });
  });

  describe('action buttons', () => {
    it('should have action buttons with correct aria-labels', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      expect(screen.getByLabelText('Reply')).toBeInTheDocument();
      expect(screen.getByLabelText('Repost')).toBeInTheDocument();
      expect(screen.getByLabelText('Like')).toBeInTheDocument();
      expect(screen.getByLabelText('Share')).toBeInTheDocument();
    });

    it('should have disabled action buttons', () => {
      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const replyButton = screen.getByLabelText('Reply');
      expect(replyButton).toBeDisabled();
    });
  });

  describe('edge cases', () => {
    it('should handle single post thread', () => {
      const singlePost: ThreadPost[] = [{ id: 1, content: 'Only post', characterCount: 9 }];

      render(<TwitterThreadPreview posts={singlePost} totalPosts={1} />);

      expect(screen.getByText('1 / 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous post')).toBeDisabled();
      expect(screen.getByLabelText('Next post')).toBeDisabled();
    });

    it('should reset copied state after timeout', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

      const copyButton = screen.getByLabelText('Copy post 1 to clipboard');
      await userEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      // Advance time past the 2 second timeout
      await act(async () => {
        vi.advanceTimersByTime(2100);
      });

      // Button text should revert - use findBy for async updates
      await waitFor(() => {
        expect(screen.getByText('Copy Post 1')).toBeInTheDocument();
      });
    });
  });
});
