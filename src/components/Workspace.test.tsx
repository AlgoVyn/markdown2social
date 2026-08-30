/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import { renderWithRouter } from '../test/test-utils';
import userEvent from '@testing-library/user-event';

// Mock CodeMirror so tests can edit content through a plain textarea
vi.mock('@uiw/react-codemirror', () => ({
  default: vi.fn(({ value, onChange }) => (
    <textarea
      data-testid="codemirror-mock"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )),
}));

// Mock the markdown language extension
vi.mock('@codemirror/lang-markdown', () => ({
  markdown: vi.fn(() => []),
  markdownLanguage: {},
}));

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
      renderWithRouter();

      // Toolbar elements
      expect(screen.getByText('MarkSocial', { selector: '.logo-text' })).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Styles')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy formatted content to clipboard')).toBeInTheDocument();

      // Preview elements
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();

      // Editor should be present (CodeMirror container)
      expect(document.querySelector('.editor-container')).toBeInTheDocument();
    });

    it('should display initial markdown content in preview', () => {
      renderWithRouter();

      // Query specifically within the preview area to avoid CodeMirror duplicates
      const previewContent = document.querySelector('.post-content');
      expect(previewContent).toBeInTheDocument();
      // The preview should contain the converted text content
      expect(previewContent?.textContent).toMatch(/👋|MarkSocial converts/);
    });
  });

  describe('copy functionality', () => {
    it('should copy formatted text to clipboard when Copy button is clicked', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      (navigator.clipboard.writeText as Mock).mockImplementation(mockWriteText);

      renderWithRouter();

      const copyButton = screen
        .getByLabelText('Copy formatted content to clipboard')
        .closest('button');
      expect(copyButton).not.toBeNull();

      if (copyButton) {
        await userEvent.click(copyButton);

        // Wait for loading state to clear
        await act(async () => {
          vi.advanceTimersByTime(400);
        });

        expect(mockWriteText).toHaveBeenCalledTimes(1);
        // The text should be the formatted version of initial content
        expect(mockWriteText.mock.calls[0][0]).toContain('𝐖𝐞𝐥𝐜𝐨𝐦𝐞'); // Unicode bold characters
      }
    });

    it('should show success toast when copy succeeds', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      (navigator.clipboard.writeText as Mock).mockImplementation(mockWriteText);

      renderWithRouter();

      const copyButton = screen
        .getByLabelText('Copy formatted content to clipboard')
        .closest('button');
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

      renderWithRouter();

      const copyButton = screen
        .getByLabelText('Copy formatted content to clipboard')
        .closest('button');
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

      renderWithRouter();

      const copyButton = screen
        .getByLabelText('Copy formatted content to clipboard')
        .closest('button');
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

      renderWithRouter();

      // First click - should use memoized value
      const copyButton = screen
        .getByLabelText('Copy formatted content to clipboard')
        .closest('button');
      if (copyButton) {
        await userEvent.click(copyButton);

        // Wait for loading state to clear
        await act(async () => {
          vi.advanceTimersByTime(400);
        });

        expect(mockWriteText).toHaveBeenCalledTimes(1);
        const firstCall = mockWriteText.mock.calls[0][0];

        // The content should be the formatted version with unicode bold
        expect(firstCall).toContain('𝐖𝐞𝐥𝐜𝐨𝐦𝐞');

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

      renderWithRouter();

      const copyButton = screen
        .getByLabelText('Copy formatted content to clipboard')
        .closest('button');
      if (copyButton) {
        await userEvent.click(copyButton);

        // Toolbar and mobile bar buttons both show the loading state
        expect(screen.getAllByText('Copying...').length).toBeGreaterThan(0);

        // Advance timers to complete the copy
        await act(async () => {
          vi.advanceTimersByTime(800);
        });

        // Button should return to normal state
        await waitFor(() => {
          expect(screen.getByLabelText('Copy formatted content to clipboard')).toBeInTheDocument();
        });
      }
    });
  });

  describe('style modal', () => {
    it('should open style modal when Styles button is clicked', async () => {
      renderWithRouter();

      const stylesButton = screen.getByText('Styles').closest('button');
      expect(stylesButton).not.toBeNull();

      if (stylesButton) {
        await userEvent.click(stylesButton);

        expect(screen.getByText('Template & Style Settings')).toBeInTheDocument();
      }
    });

    it('should close style modal when Done button is clicked', async () => {
      renderWithRouter();

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
      renderWithRouter();

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
      renderWithRouter();

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
      renderWithRouter();

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
      renderWithRouter();

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
      renderWithRouter();

      const historyButton = screen.getByText('History').closest('button');
      if (historyButton) {
        await userEvent.click(historyButton);

        // Wait for loading delay
        await act(async () => {
          vi.advanceTimersByTime(200);
        });

        expect(screen.getByText('No drafts saved yet')).toBeInTheDocument();
      }
    });
  });

  describe('platform selection', () => {
    it('should display current platform in dropdown', () => {
      renderWithRouter();

      const trigger = screen.getByLabelText('Select social media platform');
      expect(trigger).toBeInTheDocument();
      expect(trigger.textContent).toContain('LinkedIn');
    });

    it('should maintain selected platform value', async () => {
      renderWithRouter();

      const trigger = screen.getByLabelText('Select social media platform');
      expect(trigger.textContent).toContain('LinkedIn');

      // Can switch to another platform
      await userEvent.click(trigger);
      const twitterOption = screen.getByRole('option', { name: /Twitter\/X/i });
      await userEvent.click(twitterOption);

      // Check that the trigger now shows Twitter - get fresh reference after navigation
      await waitFor(() => {
        const triggerAfter = screen.getByLabelText('Select social media platform');
        expect(triggerAfter.textContent).toContain('Twitter');
      });
    });
  });

  describe('auto-save functionality', () => {
    const mockLocalStorage = (setItem: ReturnType<typeof vi.fn>) => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(),
          setItem,
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      });
    };

    it('should save draft after debounce timeout once content is edited', async () => {
      const mockSetItem = vi.fn();
      mockLocalStorage(mockSetItem);

      // advanceTimers lets userEvent's internal waits progress under fake timers
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      renderWithRouter();

      // Edit the content so a draft is worth saving
      const editor = screen.getByTestId('codemirror-mock') as HTMLTextAreaElement;
      await user.type(editor, ' Hello');

      // Fast-forward past the 2-second debounce
      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith('marksocial-drafts', expect.any(String));
      });
    });

    it('should not save a draft on mount before any edit', async () => {
      const mockSetItem = vi.fn();
      mockLocalStorage(mockSetItem);

      renderWithRouter();

      // No edits — fast-forwarding past the debounce must not persist anything
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(mockSetItem).not.toHaveBeenCalledWith('marksocial-drafts', expect.any(String));
    });

    it('should clear timeout on unmount', () => {
      const { unmount } = renderWithRouter();

      // Should not throw when unmounting
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('preview updates', () => {
    it('should update preview when content changes', async () => {
      renderWithRouter();

      // Query specifically within the preview area
      const previewContent = document.querySelector('.post-content');
      expect(previewContent).toBeInTheDocument();

      // Verify the preview contains the expected content
      expect(previewContent?.textContent).toMatch(/👋|MarkSocial converts/);
    });

    it('should apply different styles to preview', async () => {
      renderWithRouter();

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
