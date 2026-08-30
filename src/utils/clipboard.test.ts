import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatForHtmlClipboard,
  copyToClipboard,
  ClipboardUnavailableError,
  CLIPBOARD_UNAVAILABLE_MESSAGE,
} from './clipboard';
import { markdownToSocialSegments } from './markdownParser';

describe('clipboard utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('formatForHtmlClipboard', () => {
    it('should return empty string for empty input', () => {
      expect(formatForHtmlClipboard([])).toBe('');
    });

    it('should wrap plain text in paragraph tags', () => {
      const result = formatForHtmlClipboard([{ type: 'text', content: 'Hello world' }]);
      expect(result).toBe('<p>Hello world</p>');
    });

    it('should convert empty lines to <br> tags', () => {
      const result = formatForHtmlClipboard([{ type: 'text', content: 'Line 1\n\nLine 2' }]);
      expect(result).toContain('<p>Line 1</p>');
      expect(result).toContain('<br>');
      expect(result).toContain('<p>Line 2</p>');
    });

    it('should wrap code segments in <pre> tags', () => {
      const result = formatForHtmlClipboard([{ type: 'code', content: '1 | def hello():' }]);
      expect(result).toContain('<pre');
      expect(result).toContain('</pre>');
      expect(result).toContain('white-space:pre');
    });

    it('should preserve indentation and escape HTML in code segments', () => {
      const result = formatForHtmlClipboard([
        { type: 'code', content: '1 |     indented_line\n2 | const x = "<div>"' },
      ]);
      expect(result).toContain('    indented_line');
      expect(result).toContain('&lt;div&gt;');
    });

    it('should escape HTML special characters in text segments', () => {
      const result = formatForHtmlClipboard([
        { type: 'text', content: 'Text with <script> & "quotes"' },
      ]);
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&amp;');
      expect(result).toContain('&quot;quotes&quot;');
    });

    it('should interleave paragraphs and pre blocks for mixed segments', () => {
      const result = formatForHtmlClipboard([
        { type: 'text', content: 'Before\n' },
        { type: 'code', content: '1 | code();' },
        { type: 'text', content: '\nAfter' },
      ]);
      expect(result).toBe(
        '<p>Before</p><br><pre style="margin:8px 0;padding:12px;background:#f6f8fa;border-radius:6px;font-family:SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;font-size:85%;line-height:1.45;white-space:pre;word-wrap:normal;overflow-x:auto;color:#24292e;">1 | code();</pre><br><p>After</p>'
      );
    });

    it('should not treat hashtag or dash lines as code (regression)', () => {
      const markdown = 'Exciting update!\n\nWe just shipped something big.\n\n#marketing #growth';
      const result = formatForHtmlClipboard(markdownToSocialSegments(markdown));
      expect(result).not.toContain('<pre');
      expect(result).toContain('<p>#marketing #growth</p>');
    });

    it('should produce <pre> only for real fenced code blocks (integration)', () => {
      const markdown = 'Intro here\n\n```js\nconst x = 1;\n```\n\nOutro #tag';
      const result = formatForHtmlClipboard(markdownToSocialSegments(markdown));
      expect(result).toContain('<pre');
      expect(result).toContain('1 | const x = 1;');
      expect(result).toContain('<p>Intro here</p>');
      expect(result).toContain('<p>Outro #tag</p>');
    });
  });

  describe('copyToClipboard', () => {
    it('should throw error for empty content', async () => {
      await expect(copyToClipboard('')).rejects.toThrow('No content to copy');
    });

    it('should use rich text clipboard API when available', async () => {
      // Ensure ClipboardItem is defined (it might have been set to undefined by a previous test)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (globalThis as any).ClipboardItem === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).ClipboardItem = class ClipboardItem {
          constructor(public data: Record<string, Blob>) {}
        };
      }

      const mockWrite = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator.clipboard, 'write', {
        value: mockWrite,
        writable: true,
      });

      await copyToClipboard('Test content');

      expect(mockWrite).toHaveBeenCalledTimes(1);
      const clipboardItems = mockWrite.mock.calls[0][0];
      expect(clipboardItems).toHaveLength(1);
      expect(clipboardItems[0]).toBeInstanceOf(ClipboardItem);
    });

    it('should fallback to writeText when ClipboardItem is not available', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalClipboardItem = (globalThis as any).ClipboardItem;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).ClipboardItem = undefined;

      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator.clipboard, 'writeText', {
        value: mockWriteText,
        writable: true,
      });

      await copyToClipboard('Test content');

      expect(mockWriteText).toHaveBeenCalledTimes(1);
      expect(mockWriteText).toHaveBeenCalledWith('Test content');

      // Restore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).ClipboardItem = originalClipboardItem;
    });

    it('should throw ClipboardUnavailableError when clipboard API is not available', async () => {
      const originalWrite = navigator.clipboard.write;
      const originalWriteText = navigator.clipboard.writeText;

      Object.defineProperty(navigator.clipboard, 'write', {
        value: undefined,
        writable: true,
      });
      Object.defineProperty(navigator.clipboard, 'writeText', {
        value: undefined,
        writable: true,
      });

      await expect(copyToClipboard('Test')).rejects.toThrow(CLIPBOARD_UNAVAILABLE_MESSAGE);
      await expect(copyToClipboard('Test')).rejects.toBeInstanceOf(ClipboardUnavailableError);

      // Restore
      Object.defineProperty(navigator.clipboard, 'write', {
        value: originalWrite,
        writable: true,
      });
      Object.defineProperty(navigator.clipboard, 'writeText', {
        value: originalWriteText,
        writable: true,
      });
    });

    it('should use the provided html flavor when given', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (globalThis as any).ClipboardItem === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).ClipboardItem = class ClipboardItem {
          constructor(public data: Record<string, Blob>) {}
        };
      }

      const mockWrite = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator.clipboard, 'write', {
        value: mockWrite,
        writable: true,
      });

      await copyToClipboard('Plain', '<p><strong>Rich</strong></p>');

      const item = mockWrite.mock.calls[0][0][0] as { data: Record<string, Blob> };
      const htmlBlob = item.data['text/html'];
      expect(htmlBlob.type).toBe('text/html');
      expect(await htmlBlob.text()).toBe('<p><strong>Rich</strong></p>');
    });
  });
});
