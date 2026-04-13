import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer, ToastItem } from './Toast';
import { Toast } from '../hooks/useToast';

describe('Toast', () => {
  const mockToast: Toast = {
    id: '1',
    message: 'Test message',
    type: 'success',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ToastItem', () => {
    it('should not auto-focus the close button on render', () => {
      // Create a focused element before rendering toast
      const previousButton = document.createElement('button');
      previousButton.setAttribute('data-testid', 'previous-button');
      document.body.appendChild(previousButton);
      previousButton.focus();

      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);

      // The previous button should still have focus (toast didn't steal it)
      expect(document.activeElement).toBe(previousButton);

      // Cleanup
      document.body.removeChild(previousButton);
    });

    it('should render success toast with correct icon and message', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);

      expect(screen.getByText('Test message')).toBeInTheDocument();
      expect(screen.getByLabelText('Success notification')).toBeInTheDocument();
    });

    it('should render error toast with correct icon and message', () => {
      const errorToast: Toast = {
        id: '2',
        message: 'Error occurred',
        type: 'error',
      };

      render(<ToastItem toast={errorToast} onClose={mockOnClose} />);

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.getByLabelText('Error notification')).toBeInTheDocument();
    });

    it('should render info toast with correct icon and message', () => {
      const infoToast: Toast = {
        id: '3',
        message: 'Info message',
        type: 'info',
      };

      render(<ToastItem toast={infoToast} onClose={mockOnClose} />);

      expect(screen.getByText('Info message')).toBeInTheDocument();
      expect(screen.getByLabelText('Information notification')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', async () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Dismiss notification');
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should have accessible close button', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Dismiss notification');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Dismiss notification');
    });
  });

  describe('ToastContainer', () => {
    it('should render multiple toasts', () => {
      const toasts: Toast[] = [
        { id: '1', message: 'First toast', type: 'success' },
        { id: '2', message: 'Second toast', type: 'error' },
        { id: '3', message: 'Third toast', type: 'info' },
      ];

      render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />);

      expect(screen.getByText('First toast')).toBeInTheDocument();
      expect(screen.getByText('Second toast')).toBeInTheDocument();
      expect(screen.getByText('Third toast')).toBeInTheDocument();
    });

    it('should render nothing when toasts array is empty', () => {
      const { container } = render(<ToastContainer toasts={[]} onRemove={vi.fn()} />);

      expect(container.firstChild).toBeNull();
    });

    it('should have accessible region for notifications', () => {
      const toasts: Toast[] = [{ id: '1', message: 'Test', type: 'info' }];

      render(<ToastContainer toasts={toasts} onRemove={vi.fn()} />);

      const region = screen.getByLabelText('Notifications');
      expect(region).toHaveAttribute('role', 'region');
      expect(region).toHaveAttribute('aria-live', 'polite');
    });

    it('should call onRemove with correct id when toast is closed', async () => {
      const mockRemove = vi.fn();
      const toasts: Toast[] = [{ id: 'toast-1', message: 'Test', type: 'success' }];

      render(<ToastContainer toasts={toasts} onRemove={mockRemove} />);

      const closeButton = screen.getByLabelText('Dismiss notification');
      await userEvent.click(closeButton);

      expect(mockRemove).toHaveBeenCalledWith('toast-1');
    });
  });
});
