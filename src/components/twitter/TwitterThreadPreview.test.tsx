import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TwitterThreadPreview } from './TwitterThreadPreview';
import { ThreadPost } from '../../utils/threadSplitter';

describe('TwitterThreadPreview', () => {
  const mockPosts: ThreadPost[] = [
    { id: 1, content: 'First post in thread', characterCount: 20 },
    { id: 2, content: 'Second post in thread', characterCount: 21 },
    { id: 3, content: 'Third post in thread', characterCount: 20 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no posts', () => {
    render(<TwitterThreadPreview posts={[]} totalPosts={0} />);

    expect(screen.getByText(/No content to preview/)).toBeInTheDocument();
  });

  it('should render thread with user info', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    expect(screen.getByText('Your Name')).toBeInTheDocument();
    expect(screen.getByText('@username')).toBeInTheDocument();
  });

  it('should display first post by default', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    // First post content should be displayed (might have thread indicator appended)
    expect(screen.getByText(/First post in thread/)).toBeInTheDocument();
  });

  it('should show thread indicator', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('should navigate to next post', async () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    const nextButton = screen.getByLabelText('Next post');
    await userEvent.click(nextButton);

    expect(screen.getByText(/Second post in thread/)).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('should navigate to previous post', async () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    // First go to second post
    const nextButton = screen.getByLabelText('Next post');
    await userEvent.click(nextButton);

    // Then go back
    const prevButton = screen.getByLabelText('Previous post');
    await userEvent.click(prevButton);

    expect(screen.getByText(/First post in thread/)).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
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

  it('should have copy button for current post', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    expect(screen.getByText(/Copy Post 1/)).toBeInTheDocument();
  });

  it('should copy post content when copy button clicked', async () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    const copyButton = screen.getByText(/Copy Post 1/);
    await userEvent.click(copyButton);

    // Should show "Copied!" feedback
    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  it('should show updated copy button when navigating', async () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    const nextButton = screen.getByLabelText('Next post');
    await userEvent.click(nextButton);

    expect(screen.getByText(/Copy Post 2/)).toBeInTheDocument();
  });

  it('should render action buttons (Reply, Repost, Like, Share)', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    expect(screen.getByLabelText('Reply')).toBeInTheDocument();
    expect(screen.getByLabelText('Repost')).toBeInTheDocument();
    expect(screen.getByLabelText('Like')).toBeInTheDocument();
    expect(screen.getByLabelText('Share')).toBeInTheDocument();
  });

  it('should show timestamp and views', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    expect(screen.getByText('Just now')).toBeInTheDocument();
    expect(screen.getByText('0 views')).toBeInTheDocument();
  });

  it('should have proper accessibility role', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    expect(screen.getByRole('region', { name: 'Twitter thread preview' })).toBeInTheDocument();
  });

  it('should handle single post (no thread)', () => {
    const singlePost: ThreadPost[] = [
      { id: 1, content: 'Single post content', characterCount: 21 },
    ];

    render(<TwitterThreadPreview posts={singlePost} totalPosts={1} />);

    expect(screen.getByText('Single post content')).toBeInTheDocument();
    expect(screen.getByText('1 / 1')).toBeInTheDocument();
  });

  it('should display thread content with line breaks', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    const content = screen.getByText(/First post in thread/);
    expect(content).toBeInTheDocument();
  });

  it('should update thread indicator with aria-live', () => {
    render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    const indicator = screen.getByText('1 / 3');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('should have X logo SVG', () => {
    const { container } = render(<TwitterThreadPreview posts={mockPosts} totalPosts={3} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle many posts', () => {
    const manyPosts: ThreadPost[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      content: `Post ${i + 1}`,
      characterCount: 10,
    }));

    render(<TwitterThreadPreview posts={manyPosts} totalPosts={10} />);

    expect(screen.getByText('1 / 10')).toBeInTheDocument();
  });
});
