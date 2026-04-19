import { describe, it, expect } from 'vitest';
import { parseMarkdown, markdownToSocialText } from '../markdownParser';
import { sanitizeMarkdown, validateDrafts } from '../validation';

describe('Security - XSS Prevention', () => {
  describe('parseMarkdown sanitization', () => {
    it('should remove script tags', async () => {
      const markdown = '<script>alert("xss")</script>Hello';
      const result = await parseMarkdown(markdown);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
    });

    it('should remove event handlers from HTML', async () => {
      const markdown = '<p onclick="alert(\'xss\')">Click me</p>';
      const result = await parseMarkdown(markdown);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should remove javascript: URLs', async () => {
      const markdown = '[Click me](javascript:alert("xss"))';
      const result = await parseMarkdown(markdown);
      expect(result).not.toContain('javascript:');
    });

    it('should sanitize nested malicious content', async () => {
      const markdown = '<div><script>alert(1)</script><p>Safe</p></div>';
      const result = await parseMarkdown(markdown);
      expect(result).not.toContain('<script');
      expect(result).toContain('Safe');
    });

    it('should handle data: URLs safely', async () => {
      const markdown = '<img src="data:text/html,<script>alert(1)</script>">';
      const result = await parseMarkdown(markdown);
      // DOMPurify should strip dangerous data URLs
      expect(result).not.toContain('data:text/html');
    });
  });

  describe('markdownToSocialText content handling', () => {
    it('should convert markdown formatting while preserving other content', () => {
      // markdownToSocialText produces plain text, not HTML, so script tags
      // are preserved as text (not executed). The security concern is only
      // relevant when outputting HTML (handled by parseMarkdown).
      const markdown = '**Bold** <script>alert(1)</script>';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('𝐁'); // Unicode bold
      // Script tag is preserved as text in plain text output
      expect(result).toContain('<script>');
    });

    it('should handle content in code blocks', () => {
      const markdown = '```\n<script>alert(1)</script>\n```';
      const result = markdownToSocialText(markdown);
      // Code content should be preserved as plain text
      expect(result).toContain('<script>alert(1)</script>');
    });

    it('should process links safely', () => {
      const markdown = '[Link](javascript:alert(1))';
      const result = markdownToSocialText(markdown);
      // Links are converted to "text (url)" format
      expect(result).toContain('Link');
      expect(result).toContain('(javascript:alert(1))');
    });
  });

  describe('sanitizeMarkdown utility', () => {
    it('should remove script tags', () => {
      const markdown = 'Hello<script>alert(1)</script>World';
      const result = sanitizeMarkdown(markdown);
      expect(result).not.toContain('<script');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove event handlers', () => {
      const markdown = 'Text onmouseover="alert(1)" more text';
      const result = sanitizeMarkdown(markdown);
      expect(result).not.toContain('onmouseover');
    });

    it('should remove all event handler variants', () => {
      const handlers = [
        'onclick',
        'onload',
        'onerror',
        'onmouseover',
        'onfocus',
        'onblur',
        'onchange',
        'onsubmit',
      ];
      handlers.forEach((handler) => {
        const markdown = `<div ${handler}="alert(1)">Test</div>`;
        const result = sanitizeMarkdown(markdown);
        expect(result).not.toContain(handler);
      });
    });

    it('should handle empty input', () => {
      expect(sanitizeMarkdown('')).toBe('');
    });

    it('should handle input without malicious content', () => {
      const markdown = 'Normal **markdown** content';
      expect(sanitizeMarkdown(markdown)).toBe(markdown);
    });
  });

  describe('draft validation security', () => {
    it('should reject drafts with invalid IDs', () => {
      const invalidDrafts = [
        { id: '', markdown: 'test', updatedAt: Date.now() },
        { id: 123, markdown: 'test', updatedAt: Date.now() }, // wrong type
        { markdown: 'test', updatedAt: Date.now() }, // missing id
      ];
      invalidDrafts.forEach((draft) => {
        expect(validateDrafts([draft])).toBeNull();
      });
    });

    it('should reject drafts with negative timestamps', () => {
      const draft = { id: '123', markdown: 'test', updatedAt: -1 };
      expect(validateDrafts([draft])).toBeNull();
    });

    it('should reject non-array data', () => {
      expect(validateDrafts({})).toBeNull();
      expect(validateDrafts('string')).toBeNull();
      expect(validateDrafts(123)).toBeNull();
      expect(validateDrafts(null)).toBeNull();
    });

    it('should accept valid drafts', () => {
      const drafts = [
        { id: 'abc123', markdown: 'Hello', updatedAt: Date.now() },
        { id: 'def456', markdown: 'World', updatedAt: Date.now() - 1000 },
      ];
      const result = validateDrafts(drafts);
      expect(result).toHaveLength(2);
      expect(result?.[0].id).toBe('abc123');
    });

    it('should handle nested malicious content in markdown', () => {
      const drafts = [
        {
          id: 'xss-test',
          markdown: '<script>alert(1)</script>Hello',
          updatedAt: Date.now(),
        },
      ];
      // Validation should pass but sanitization happens separately
      const result = validateDrafts(drafts);
      expect(result).toHaveLength(1);
      expect(result?.[0].markdown).toContain('<script>');
    });
  });

  describe('URL handling security', () => {
    it('should handle URLs with special characters', async () => {
      const markdown = '[Link](https://example.com/path(1))';
      const result = await parseMarkdown(markdown);
      expect(result).toContain('https://example.com/path(1)');
    });

    it('should sanitize URLs with javascript protocol', async () => {
      const markdown = '[Link](javascript:alert(1))';
      const result = await parseMarkdown(markdown);
      // DOMPurify should remove or neutralize javascript: URLs
      expect(result).not.toMatch(/javascript:/i);
    });

    it('should handle data URLs safely', async () => {
      const markdown = '![Alt](data:image/svg+xml,<svg></svg>)';
      const result = await parseMarkdown(markdown);
      // Image tags might be stripped entirely based on DOMPurify config
      expect(result).not.toContain('data:image');
    });
  });

  describe('HTML entity encoding', () => {
    it('should handle HTML entities properly', async () => {
      const markdown = '&lt;script&gt;alert(1)&lt;/script&gt;';
      const result = await parseMarkdown(markdown);
      // Entities should be decoded or preserved safely
      expect(result).not.toContain('<script>');
    });

    it('should handle mixed content safely', async () => {
      const markdown = 'Text <b>bold</b> <script>evil</script> more';
      const result = await parseMarkdown(markdown);
      expect(result).toContain('<b>bold</b>');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('evil');
    });
  });
});
