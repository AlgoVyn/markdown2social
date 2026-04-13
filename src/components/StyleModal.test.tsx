import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StyleModal } from './StyleModal';

describe('StyleModal', () => {
  const mockOnClose = vi.fn();
  const mockSetFormatStyle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <StyleModal
          isOpen={false}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('header', () => {
    it('should render title with correct heading level', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Template & Style Settings');
      expect(title).toHaveAttribute('id', 'style-modal-title');
    });

    it('should have aria-labelledby pointing to title', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'style-modal-title');
    });
  });

  describe('style options', () => {
    it('should render all three style options as radio buttons', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const radioButtons = screen.getAllByRole('radio');
      expect(radioButtons).toHaveLength(3);
    });

    it('should render standard professional option', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const standardRadio = screen.getByRole('radio', { name: /Standard Professional/i });
      expect(standardRadio).toHaveAttribute('value', 'standard');
      expect(standardRadio).toHaveAttribute('checked');
    });

    it('should render bullet point optimized option', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const bulletRadio = screen.getByRole('radio', { name: /Bullet Point Optimized/i });
      expect(bulletRadio).toHaveAttribute('value', 'bullet-optimized');
    });

    it('should render bold headers option', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const boldRadio = screen.getByRole('radio', { name: /Bold Headers/i });
      expect(boldRadio).toHaveAttribute('value', 'bold-headers');
    });

    it('should have correct aria-describedby for each option', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      expect(screen.getByRole('radio', { name: /Standard Professional/i })).toHaveAttribute(
        'aria-describedby',
        'style-standard-desc'
      );
      expect(screen.getByRole('radio', { name: /Bullet Point Optimized/i })).toHaveAttribute(
        'aria-describedby',
        'style-bullet-desc'
      );
      expect(screen.getByRole('radio', { name: /Bold Headers/i })).toHaveAttribute(
        'aria-describedby',
        'style-bold-desc'
      );
    });

    it('should have legend for fieldset', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const legend = screen.getByText('Select formatting style');
      expect(legend).toHaveClass('visually-hidden');
    });

    it('should have descriptions for each option', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      expect(screen.getByText(/Default parsing for clean, readable posts/)).toBeInTheDocument();
      expect(
        screen.getByText(/Converts lists to checkmarks for better engagement/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Makes top-level headers extra bold/)).toBeInTheDocument();
    });
  });

  describe('radio selection', () => {
    it('should call setFormatStyle when radio is selected', async () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const bulletRadio = screen.getByRole('radio', { name: /Bullet Point Optimized/i });
      await userEvent.click(bulletRadio);

      expect(mockSetFormatStyle).toHaveBeenCalledWith('bullet-optimized');
    });

    it('should have correct radio checked for bullet-optimized formatStyle', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="bullet-optimized"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const bulletRadio = screen.getByRole('radio', { name: /Bullet Point Optimized/i });
      expect(bulletRadio).toHaveAttribute('checked');
    });

    it('should have correct radio checked for bold-headers formatStyle', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="bold-headers"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const boldRadio = screen.getByRole('radio', { name: /Bold Headers/i });
      expect(boldRadio).toHaveAttribute('checked');
    });
  });

  describe('close button', () => {
    it('should render done button with correct accessibility', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const doneButton = screen.getByRole('button', { name: 'Close style settings' });
      expect(doneButton).toBeInTheDocument();
      expect(doneButton).toHaveTextContent('Done');
    });

    it('should call onClose when done button is clicked', async () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const doneButton = screen.getByRole('button', { name: 'Close style settings' });
      await userEvent.click(doneButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('overlay click', () => {
    it('should close modal when overlay is clicked', async () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const overlay = screen.getByRole('presentation');
      await userEvent.click(overlay);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking modal content', async () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const dialog = screen.getByRole('dialog');
      await userEvent.click(dialog);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('visual states', () => {
    it('should have active class on selected style option', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const standardLabel = screen.getByText('Standard Professional').closest('label');
      expect(standardLabel).toHaveClass('active');
    });
  });

  describe('aria attributes', () => {
    it('should have aria-modal attribute', () => {
      render(
        <StyleModal
          isOpen={true}
          onClose={mockOnClose}
          formatStyle="standard"
          setFormatStyle={mockSetFormatStyle}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
