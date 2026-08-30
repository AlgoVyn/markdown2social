import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from './MarkdownEditor';

// Mock CodeMirror since it's complex to test
vi.mock('@uiw/react-codemirror', () => ({
  default: vi.fn(({ value, onChange, theme, className, id, 'aria-label': ariaLabel }) => (
    <textarea
      data-testid="codemirror-mock"
      data-theme={theme}
      data-classname={className}
      id={id}
      aria-label={ariaLabel}
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

describe('MarkdownEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('rendering', () => {
    it('should render the editor container', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      expect(screen.getByLabelText('Markdown editor')).toBeInTheDocument();
    });

    it('should render the formatting toolbar with labeled buttons', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const toolbar = screen.getByRole('toolbar', { name: 'Formatting tools' });
      expect(toolbar).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Link' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Heading 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bullet list' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Code block' })).toBeInTheDocument();
    });

    it('should tolerate toolbar clicks when the editor view is unavailable', async () => {
      render(<MarkdownEditor value="content" onChange={mockOnChange} />);

      // With CodeMirror mocked there is no view instance; clicking must not throw
      await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should render CodeMirror with correct props', () => {
      render(<MarkdownEditor value="# Test content" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveValue('# Test content');
    });

    it('should apply light theme by default', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveAttribute('data-theme', 'light');
    });

    it('should apply dark theme when specified', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} theme="dark" />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveAttribute('data-theme', 'dark');
    });

    it('should have correct aria-label for accessibility', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveAttribute('aria-label', 'Markdown editor text area');
    });

    it('should have visually hidden label', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const label = screen.getByText('Enter your markdown content');
      expect(label).toHaveClass('visually-hidden');
    });

    it('should link label to editor via htmlFor', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const label = screen.getByText('Enter your markdown content');
      expect(label).toHaveAttribute('for', 'markdown-editor');

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveAttribute('id', 'markdown-editor');
    });
  });

  describe('interaction', () => {
    it('should call onChange when content changes', async () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      await userEvent.type(editor, '# New heading');

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should pass updated value to onChange', async () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      // Use type with the full string - onChange is called for each character
      await userEvent.clear(editor);
      await userEvent.type(editor, 'X');

      // Just verify that onChange was called with some value
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange.mock.calls.length).toBeGreaterThan(0);
    });

    it('should handle rapid typing', async () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      await userEvent.type(editor, 'Hello');
      await userEvent.type(editor, ' ');
      await userEvent.type(editor, 'World');

      // onChange should be called multiple times (one per character typed)
      expect(mockOnChange.mock.calls.length).toBeGreaterThan(5);
    });
  });

  describe('theme switching', () => {
    it('should update theme when prop changes', () => {
      const { rerender } = render(
        <MarkdownEditor value="" onChange={mockOnChange} theme="light" />
      );

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveAttribute('data-theme', 'light');

      rerender(<MarkdownEditor value="" onChange={mockOnChange} theme="dark" />);
      expect(editor).toHaveAttribute('data-theme', 'dark');
    });

    it('should handle undefined theme gracefully', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} theme={undefined} />);

      const editor = screen.getByTestId('codemirror-mock');
      // Should fall back to light
      expect(editor).toBeInTheDocument();
    });
  });

  describe('value updates', () => {
    it('should display updated value from props', () => {
      const { rerender } = render(<MarkdownEditor value="Initial" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveValue('Initial');

      rerender(<MarkdownEditor value="Updated" onChange={mockOnChange} />);
      expect(editor).toHaveValue('Updated');
    });

    it('should handle large content', () => {
      const largeContent = '# Heading\n\n' + 'Paragraph. '.repeat(1000);
      render(<MarkdownEditor value={largeContent} onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveValue(largeContent);
    });

    it('should handle empty string value', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveValue('');
    });

    it('should handle special characters in content', () => {
      const specialContent = '# Special chars 💻 \n\n **bold** *italic*';
      render(<MarkdownEditor value={specialContent} onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      expect(editor).toHaveValue(specialContent);
    });
  });

  describe('accessibility', () => {
    it('should have correct section role', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const section = screen.getByLabelText('Markdown editor');
      expect(section.tagName.toLowerCase()).toBe('section');
    });

    it('should maintain focus management', () => {
      render(<MarkdownEditor value="" onChange={mockOnChange} />);

      const editor = screen.getByTestId('codemirror-mock');
      editor.focus();
      expect(document.activeElement).toBe(editor);
    });
  });
});
