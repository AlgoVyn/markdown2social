import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HistoryModal } from './HistoryModal';
import { Draft } from '../hooks/useHistory';

describe('HistoryModal', () => {
  const mockOnClose = vi.fn();
  const mockOnLoadDraft = vi.fn();

  const createDrafts = (count: number): Draft[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `draft-${i + 1}`,
      markdown: `Draft content ${i + 1}`,
      updatedAt: Date.now() - i * 1000,
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <HistoryModal
          isOpen={false}
          onClose={mockOnClose}
          drafts={createDrafts(3)}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={createDrafts(3)}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('should render title with correct heading level', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Conversion History');
      expect(title).toHaveAttribute('id', 'history-modal-title');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'history-modal-title');
    });

    it('should render close button with correct accessibility', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const closeButton = screen.getByLabelText('Close history modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const closeButton = screen.getByLabelText('Close history modal');
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('should show empty state message when no drafts', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      expect(screen.getByText(/No drafts saved yet/)).toBeInTheDocument();
    });

    it('should have status role for empty state', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const emptyMessage = screen.getByRole('status');
      expect(emptyMessage).toHaveTextContent(/No drafts saved yet/);
    });
  });

  describe('draft list', () => {
    it('should render list with list role', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={createDrafts(2)}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const list = screen.getByRole('list', { name: 'Saved drafts' });
      expect(list).toBeInTheDocument();
    });

    it('should render each draft as listitem', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={createDrafts(3)}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });

    it('should display draft preview text', () => {
      const drafts = [{ id: '1', markdown: 'This is a draft', updatedAt: Date.now() }];

      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={drafts}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      expect(screen.getByText('This is a draft')).toBeInTheDocument();
    });

    it('should truncate long drafts', () => {
      const longContent = 'A'.repeat(150);
      const drafts = [{ id: '1', markdown: longContent, updatedAt: Date.now() }];

      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={drafts}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const preview = screen.getByText(/A{100}\.{3}$/);
      expect(preview).toBeInTheDocument();
    });

    it('should display formatted timestamp', () => {
      const drafts = [{ id: '1', markdown: 'Draft', updatedAt: Date.now() }];

      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={drafts}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      // Should have timestamp with aria-label
      const timeElement = screen.getByLabelText(/Saved on/);
      expect(timeElement).toBeInTheDocument();
    });

    it('should have load button with correct accessibility', () => {
      const drafts = [
        { id: '1', markdown: 'Draft 1', updatedAt: Date.now() },
        { id: '2', markdown: 'Draft 2', updatedAt: Date.now() - 1000 },
      ];

      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={drafts}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const loadButtons = screen.getAllByRole('button', { name: /Load draft/ });
      expect(loadButtons).toHaveLength(2);
      expect(loadButtons[0]).toHaveAttribute('aria-describedby', 'draft-1-preview');
      expect(loadButtons[1]).toHaveAttribute('aria-describedby', 'draft-2-preview');
    });

    it('should call onLoadDraft and onClose when load button is clicked', async () => {
      const drafts = [{ id: '1', markdown: 'Draft to load', updatedAt: Date.now() }];

      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={drafts}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const loadButton = screen.getByRole('button', { name: /Load draft/ });
      await userEvent.click(loadButton);

      expect(mockOnLoadDraft).toHaveBeenCalledWith(drafts[0]);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('overlay click', () => {
    it('should close modal when overlay is clicked', async () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const overlay = screen.getByRole('presentation');
      await userEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking modal content', async () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={createDrafts(1)}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const dialog = screen.getByRole('dialog');
      await userEvent.click(dialog);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('aria attributes', () => {
    it('should have aria-modal attribute', () => {
      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={[]}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have correct aria-label on load buttons', () => {
      const drafts = [
        { id: '1', markdown: 'Draft 1', updatedAt: Date.now() },
        { id: '2', markdown: 'Draft 2', updatedAt: Date.now() - 1000 },
      ];

      render(
        <HistoryModal
          isOpen={true}
          onClose={mockOnClose}
          drafts={drafts}
          onLoadDraft={mockOnLoadDraft}
        />
      );

      const loadButtons = screen.getAllByRole('button', { name: /Load draft/ });
      expect(loadButtons[0]).toHaveAttribute('aria-label', 'Load draft 1 of 2');
      expect(loadButtons[1]).toHaveAttribute('aria-label', 'Load draft 2 of 2');
    });
  });
});
