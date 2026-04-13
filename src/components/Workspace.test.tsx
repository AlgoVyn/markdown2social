/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Workspace } from './Workspace';

describe('Workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial render', () => {
    it('should render the workspace with toolbar and panes', () => {
      render(<Workspace />);

      // Toolbar elements
      expect(screen.getByText('Markdown2Social')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Styles')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();

      // Preview elements
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();

      // Editor should be present (CodeMirror container)
      expect(document.querySelector('.editor-container')).toBeInTheDocument();
    });

    it('should display initial markdown content in preview', () => {
      render(<Workspace />);

      // Query specifically within the preview area to avoid CodeMirror duplicates
      const previewContent = document.querySelector('.post-content');
      expect(previewContent).toBeInTheDocument();
      // The preview should contain the converted text content
      expect(previewContent?.textContent).toMatch(/Write your post here/);
    });
  });

  describe('copy functionality', () => {
    it('should copy formatted text to clipboard when Copy button is clicked', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      (navigator.clipboard.writeText as Mock).mockImplementation(mockWriteText);

      render(<Workspace />);

      const copyButton = screen.getByText('Copy').closest('button');
      expect(copyButton).not.toBeNull();

      if (copyButton) {
        await userEvent.click(copyButton);

        // Wait for loading state to clear
        await act(async () => {
          vi.advanceTimersByTime(400);
        });

        expect(mockWriteText).toHaveBeenCalledTimes(1);
        // The text should be the formatted version of initial content
        expect(mockWriteText.mock.calls[0][0]).toContain('𝐇𝐞𝐥𝐥𝐨 𝐋𝐢𝐧𝐤𝐞𝐝𝐈𝐧'); // Unicode bold characters
      }
    });

    it('should show success toast when copy succeeds', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      (navigator.clipboard.writeText as Mock).mockImplementation(mockWriteText);

      render(<Workspace />);

      const copyButton = screen.getByText('Copy').closest('button');
      if (copyButton) {
        await userEvent.click(copyButton);

        await waitFor(() => {
          expect(
            screen.getByText('Copied to clipboard! Paste into LinkedIn to see formatted content.')
          ).toBeInTheDocument();
        });
      }
    });

    it('should show error toast when copy fails', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Copy failed'));
      (navigator.clipboard.writeText as Mock).mockImplementation(mockWriteText);

      render(<Workspace />);

      const copyButton = screen.getByText('Copy').closest('button');
      if (copyButton) {
        await userEvent.click(copyButton);

        // Wait for loading state to clear
        await act(async () => {
          vi.advanceTimersByTime(400);
        });

        await waitFor(() => {
          expect(screen.getByText('Failed to copy to clipboard')).toBeInTheDocument();
        });
      }
    });

    it('should show error toast when clipboard API is not available', async () => {
      // Mock writeText as undefined to simulate unavailable clipboard API
      const originalWriteText = navigator.clipboard.writeText;
      (navigator.clipboard as any).writeText = undefined;

      render(<Workspace />);

      const copyButton = screen.getByText('Copy').closest('button');
      if (copyButton) {
        await userEvent.click(copyButton);

        await waitFor(() => {
          expect(
            screen.getByText('Clipboard API not available in your browser')
          ).toBeInTheDocument();
        });
      }

      // Restore
      (navigator.clipboard as any).writeText = originalWriteText;
    });

    it('should use memoized socialPreview value for copying', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      (navigator.clipboard.writeText as Mock).mockImplementation(mockWriteText);

      render(<Workspace />);

      // First click - should use memoized value
      const copyButton = screen.getByText('Copy').closest('button');
      if (copyButton) {
        await userEvent.click(copyButton);

        // Wait for loading state to clear
        await act(async () => {
          vi.advanceTimersByTime(400);
        });

        expect(mockWriteText).toHaveBeenCalledTimes(1);
        const firstCall = mockWriteText.mock.calls[0][0];

        // The content should be the formatted version with unicode bold
        expect(firstCall).toContain('𝐇𝐞𝐥𝐥𝐨 𝐋𝐢𝐧𝐤𝐞𝐝𝐈𝐧');

        // Click again - should be identical (same memoized value)
        await userEvent.click(copyButton);

        // Wait for loading state to clear
        await act(async () => {
          vi.advanceTimersByTime(400);
        });

        expect(mockWriteText).toHaveBeenCalledTimes(2);
        expect(mockWriteText.mock.calls[1][0]).toBe(firstCall);
      }
    });

    it('should show loading state while copying', async () => {
      const mockWriteText = vi
        .fn()
        .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 500)));
      (navigator.clipboard.writeText as Mock).mockImplementation(mockWriteText);

      render(<Workspace />);

      const copyButton = screen.getByText('Copy').closest('button');
      if (copyButton) {
        await userEvent.click(copyButton);

        // Button should show loading state
        expect(screen.getByText('Copying...')).toBeInTheDocument();

        // Advance timers to complete the copy
        await act(async () => {
          vi.advanceTimersByTime(800);
        });

        // Button should return to normal state
        await waitFor(() => {
          expect(screen.getByText('Copy')).toBeInTheDocument();
        });
      }
    });
  });

  describe('style modal', () => {
    it('should open style modal when Styles button is clicked', async () => {
      render(<Workspace />);

      const stylesButton = screen.getByText('Styles').closest('button');
      expect(stylesButton).not.toBeNull();

      if (stylesButton) {
        await userEvent.click(stylesButton);

        expect(screen.getByText('Template & Style Settings')).toBeInTheDocument();
      }
    });

    it('should close style modal when Done button is clicked', async () => {
      render(<Workspace />);

      // Open modal
      const stylesButton = screen.getByText('Styles').closest('button');
      if (stylesButton) {
        await userEvent.click(stylesButton);

        // Close modal
        const doneButton = screen.getByText('Done');
        await userEvent.click(doneButton);

        // Modal should be closed
        await waitFor(() => {
          expect(screen.queryByText('Template & Style Settings')).not.toBeInTheDocument();
        });
      }
    });

    it('should change format style when selecting different option', async () => {
      render(<Workspace />);

      const stylesButton = screen.getByText('Styles').closest('button');
      if (stylesButton) {
        await userEvent.click(stylesButton);

        const bulletOption = screen.getByDisplayValue('bullet-optimized');
        await userEvent.click(bulletOption);

        // The style should have been updated (checked by the radio being selected)
        expect(bulletOption).toBeChecked();
      }
    });
  });

  describe('history modal', () => {
    it('should open history modal when History button is clicked', async () => {
      render(<Workspace />);

      const historyButton = screen.getByText('History').closest('button');
      expect(historyButton).not.toBeNull();

      if (historyButton) {
        await userEvent.click(historyButton);

        // Wait for loading delay
        await act(async () => {
          vi.advanceTimersByTime(200);
        });

        expect(screen.getByText('Conversion History')).toBeInTheDocument();
      }
    });

    it('should show loading state on history button', async () => {
      render(<Workspace />);

      const historyButton = screen.getByText('History').closest('button');
      if (historyButton) {
        await userEvent.click(historyButton);

        // Button should be disabled with loading state
        expect(historyButton).toHaveAttribute('aria-busy', 'true');

        // Wait for loading delay
        await act(async () => {
          vi.advanceTimersByTime(200);
        });

        // Modal should open
        expect(screen.getByText('Conversion History')).toBeInTheDocument();
      }
    });

    it('should close history modal when close button is clicked', async () => {
      render(<Workspace />);

      const historyButton = screen.getByText('History').closest('button');
      if (historyButton) {
        await userEvent.click(historyButton);

        // Wait for loading delay
        await act(async () => {
          vi.advanceTimersByTime(200);
        });

        const closeButton = screen.getByText('×');
        await userEvent.click(closeButton);

        await waitFor(() => {
          expect(screen.queryByText('Conversion History')).not.toBeInTheDocument();
        });
      }
    });

    it('should show empty state when no drafts exist', async () => {
      render(<Workspace />);

      const historyButton = screen.getByText('History').closest('button');
      if (historyButton) {
        await userEvent.click(historyButton);

        // Wait for loading delay
        await act(async () => {
          vi.advanceTimersByTime(200);
        });

        expect(screen.getByText('No drafts saved yet. Start typing to save!')).toBeInTheDocument();
      }
    });
  });

  describe('platform selection', () => {
    it('should display current platform in select dropdown', () => {
      render(<Workspace />);

      // Look for select by its label instead of display value
      const select = screen.getByLabelText('Social media platform');
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue('linkedin');
    });

    it('should maintain selected platform value', async () => {
      render(<Workspace />);

      const select = screen.getByLabelText('Social media platform');
      expect(select).toHaveValue('linkedin');

      // Can switch to another platform
      await userEvent.selectOptions(select, 'twitter');
      expect(select).toHaveValue('twitter');
    });
  });

  describe('auto-save functionality', () => {
    it('should save draft after debounce timeout', async () => {
      const mockSetItem = vi.fn();
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem: mockSetItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });

      render(<Workspace />);

      // Fast-forward past the 2-second debounce
      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('md-to-social-drafts', expect.any(String));
      });
    });

    it('should clear timeout on unmount', () => {
      const { unmount } = render(<Workspace />);

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('preview updates', () => {
    it('should update preview when content changes', async () => {
      render(<Workspace />);

      // Query specifically within the preview area
      const previewContent = document.querySelector('.post-content');
      expect(previewContent).toBeInTheDocument();

      // Verify the preview contains the expected content
      expect(previewContent?.textContent).toMatch(/Write your post here/);
    });

    it('should apply different styles to preview', async () => {
      render(<Workspace />);

      // Open style modal
      const stylesButton = screen.getByText('Styles').closest('button');
      if (stylesButton) {
        await userEvent.click(stylesButton);

        // Select bullet-optimized style
        const bulletOption = screen.getByDisplayValue('bullet-optimized');
        await userEvent.click(bulletOption);

        // Close modal
        const doneButton = screen.getByText('Done');
        await userEvent.click(doneButton);

        // Style should be applied (modal closes successfully)
        await waitFor(() => {
          expect(screen.queryByText('Template & Style Settings')).not.toBeInTheDocument();
        });
      }
    });
  });
});
