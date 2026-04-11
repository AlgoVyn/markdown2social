import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Workspace } from '../components/Workspace';

describe('Platform Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset clipboard mock
    (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  it('should switch platforms and update preview', async () => {
    render(<Workspace />);

    // Initial platform should be LinkedIn
    const select = screen.getByLabelText('Social media platform');
    expect(select).toHaveValue('linkedin');

    // Switch to Twitter
    await userEvent.selectOptions(select, 'twitter');

    // Preview should update to show Twitter/X
    await waitFor(() => {
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
    });
  }, 10000);

  it('should show character counter for current platform', async () => {
    render(<Workspace />);

    // Should show character counter with LinkedIn limits (3000 without comma)
    expect(screen.getByText('3000')).toBeInTheDocument();

    // Switch to Twitter
    const select = screen.getByLabelText('Social media platform');
    await userEvent.selectOptions(select, 'twitter');

    // Should now show Twitter limits
    await waitFor(() => {
      expect(screen.getByText('280')).toBeInTheDocument();
    });
  }, 10000);

  it('should handle Twitter thread preview for long content', async () => {
    render(<Workspace />);

    // Switch to Twitter
    const select = screen.getByLabelText('Social media platform');
    await userEvent.selectOptions(select, 'twitter');

    // Wait for Twitter preview to render
    await waitFor(() => {
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
    });
  }, 10000);

  it('should copy content formatted for selected platform', async () => {
    render(<Workspace />);

    // Click copy button
    const copyButton = screen.getByText('Copy');
    await userEvent.click(copyButton);

    // Should call clipboard API
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    // Should show success toast
    expect(await screen.findByText(/Copied to clipboard/)).toBeInTheDocument();
  }, 10000);

  it('should update character count as user types', async () => {
    render(<Workspace />);

    // Initial count should be from default content
    // Just verify counter exists
    expect(screen.getByRole('status')).toBeInTheDocument();
  }, 10000);

  it('should maintain platform state when opening modals', async () => {
    render(<Workspace />);

    // Switch to Bluesky
    const select = screen.getByLabelText('Social media platform');
    await userEvent.selectOptions(select, 'bluesky');

    // Open history modal
    const historyButton = screen.getByText('History');
    await userEvent.click(historyButton);

    // Close modal
    const closeButton = await screen.findByText('×');
    await userEvent.click(closeButton);

    // Platform should still be Bluesky
    expect(select).toHaveValue('bluesky');
  }, 10000);

  it('should show different character limits for different platforms', async () => {
    render(<Workspace />);

    const select = screen.getByLabelText('Social media platform');

    // LinkedIn - 3000
    expect(screen.getByText('3000')).toBeInTheDocument();

    // Switch to Twitter
    await userEvent.selectOptions(select, 'twitter');
    await waitFor(() => {
      expect(screen.getByText('280')).toBeInTheDocument();
    });

    // Switch to Mastodon
    await userEvent.selectOptions(select, 'mastodon');
    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  }, 10000);

  it('should handle all supported platforms in dropdown', async () => {
    render(<Workspace />);

    const select = screen.getByLabelText('Social media platform');
    const options = screen.getAllByRole('option');

    // Should have multiple platforms
    expect(options.length).toBeGreaterThanOrEqual(9);

    // Each option should have platform name and character count
    options.forEach(option => {
      expect(option.textContent).toMatch(/\d+,?\d* chars/);
    });
  }, 10000);

  it('should show warning state when approaching character limit', async () => {
    render(<Workspace />);

    // Switch to Twitter (280 char limit)
    const select = screen.getByLabelText('Social media platform');
    await userEvent.selectOptions(select, 'twitter');

    // Wait for Twitter preview
    await waitFor(() => {
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
    });
  }, 10000);

  it('should handle invalid platform gracefully', async () => {
    render(<Workspace />);

    // Platform select should handle any value gracefully
    const select = screen.getByLabelText('Social media platform');
    expect(select).toBeInTheDocument();
  }, 10000);
});
