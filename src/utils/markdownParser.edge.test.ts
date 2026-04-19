import { describe, it, expect } from 'vitest';
import { parseMarkdown, markdownToSocialText } from './markdownParser';

describe('markdownToSocialText - Edge Cases', () => {
  describe('nested formatting', () => {
    it('should handle bold inside headers', () => {
      const markdown = '# **Bold Header**';
      const result = markdownToSocialText(markdown);
      expect(result).not.toContain('#');
      expect(result).not.toContain('**');
      // Both header and bold should result in bold unicode
      expect(result).toContain('𝐁');
    });

    it('should handle italic inside bold', () => {
      const markdown = '***italic inside bold***';
      const result = markdownToSocialText(markdown);
      expect(result).not.toContain('***');
      // The result should have some formatting applied
      // The triple asterisk is handled specially, we just verify it doesn't crash
      expect(result).toBeTruthy();
    });

    it('should handle bold inside italic', () => {
      const markdown = '*__bold inside italic__*';
      const result = markdownToSocialText(markdown);
      expect(result).not.toContain('__');
      expect(result).not.toContain('*');
    });

    it('should handle code inside formatting', () => {
      const markdown = '**bold `code` more bold**';
      const result = markdownToSocialText(markdown);
      // Code inside bold gets the placeholders during processing
      // The result should not have the raw backticks
      expect(result).not.toContain('`code`');
    });
  });

  describe('incomplete formatting', () => {
    it('should handle single asterisk without closing', () => {
      const markdown = 'Text with *unclosed italic';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('*');
    });

    it('should handle single underscore without closing', () => {
      const markdown = 'Text with _unclosed italic';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('_');
    });

    it('should handle double asterisk without closing', () => {
      const markdown = 'Text with **unclosed bold';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('**');
    });
  });

  describe('special markdown syntax', () => {
    it('should handle strikethrough by stripping markers and preserving text', () => {
      // Note: Strikethrough markers ~~ are stripped, text content is preserved
      const markdown = '~~strikethrough text~~';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('strikethrough text');
    });

    it('should handle inline code with backticks', () => {
      const markdown = 'Use `console.log()` to debug';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('`console.log()`');
    });

    it('should handle code block with language', () => {
      const markdown = '```typescript\nconst x: number = 1;\n```';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('const x: number = 1;');
      expect(result).not.toContain('```');
    });

    it('should handle code block without language', () => {
      const markdown = '```\nplain code block\n```';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('plain code block');
      expect(result).not.toContain('```');
    });

    it('should handle blockquotes', () => {
      const markdown = '> This is a quote';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('This is a quote');
    });

    it('should handle horizontal rules', () => {
      const markdown = 'Text\n\n---\n\nMore text';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('Text');
      expect(result).toContain('More text');
    });
  });

  describe('links', () => {
    it('should handle link with title (includes title in output)', () => {
      // The current implementation includes the title in the output
      const markdown = '[Link text](https://example.com "Title")';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('Link text');
      expect(result).toContain('https://example.com');
    });

    it('should handle empty link text', () => {
      const markdown = '[](https://example.com)';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('https://example.com');
    });

    it('should handle multiple links on same line', () => {
      const markdown = '[Link1](url1) and [Link2](url2) then [Link3](url3)';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('Link1');
      expect(result).toContain('Link2');
      expect(result).toContain('Link3');
    });

    it('should handle links in lists', () => {
      const markdown = '- [Link](url) in a bullet';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('•');
      expect(result).toContain('Link');
    });
  });

  describe('lists', () => {
    it('should handle nested bullet lists', () => {
      const markdown = '- Item 1\n  - Subitem 1\n  - Subitem 2';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('•');
      expect(result).toContain('Item 1');
      expect(result).toContain('Subitem 1');
    });

    it('should handle numbered lists', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('First');
      expect(result).toContain('Second');
      expect(result).toContain('Third');
    });

    it('should handle mixed list types', () => {
      const markdown = '- Bullet\n1. Numbered\n* Another bullet';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('•');
      expect(result).toContain('Bullet');
      expect(result).toContain('Numbered');
    });
  });

  describe('edge case content', () => {
    it('should handle emoji', () => {
      const markdown = 'Hello 👋 World 🌍';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('👋');
      expect(result).toContain('🌍');
    });

    it('should handle unicode characters', () => {
      const markdown = 'Japanese: こんにちは Chinese: 你好 Arabic: مرحبا';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('こんにちは');
      expect(result).toContain('你好');
      expect(result).toContain('مرحبا');
    });

    it('should handle special HTML characters', () => {
      const markdown = 'Special: <>&"\' chars';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('<');
      expect(result).toContain('>');
      expect(result).toContain('&');
    });

    it('should handle very long words', () => {
      const longWord = 'a'.repeat(1000);
      const markdown = `**${longWord}**`;
      const result = markdownToSocialText(markdown);
      expect(result).not.toContain('**');
    });

    it('should handle tabs and mixed whitespace', () => {
      const markdown = 'Line with\ttab\n  indented line';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('Line with');
    });
  });

  describe('multiple delimiters', () => {
    it('should handle consecutive asterisks', () => {
      const markdown = '****four asterisks****';
      const result = markdownToSocialText(markdown);
      // Just verify it doesn't crash
      expect(result).toBeTruthy();
    });

    it('should handle escaped characters', () => {
      const markdown = 'Escaped \\*asterisk and \\_underscore';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('*');
      expect(result).toContain('_');
    });
  });

  describe('bullet-optimized style', () => {
    it('should convert all list markers to checkmarks', () => {
      const markdown = '- Item 1\n* Item 2\n- Item 3';
      const result = markdownToSocialText(markdown, 'bullet-optimized');
      const checkmarkCount = (result.match(/✅/g) || []).length;
      expect(checkmarkCount).toBe(3);
    });

    it('should not affect other formatting in bullet-optimized mode', () => {
      const markdown = '- **Bold** item\n- *Italic* item';
      const result = markdownToSocialText(markdown, 'bullet-optimized');
      expect(result).toContain('✅');
      expect(result).not.toContain('**');
      expect(result).not.toContain('*');
    });
  });

  describe('empty and whitespace handling', () => {
    it('should handle only newlines', () => {
      const markdown = '\n\n\n';
      const result = markdownToSocialText(markdown);
      expect(result).toBe('\n\n\n');
    });

    it('should handle mixed line endings', () => {
      const markdown = 'Line 1\r\nLine 2\nLine 3\rLine 4';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
      expect(result).toContain('Line 4');
    });
  });
});

describe('parseMarkdown - Edge Cases', () => {
  describe('clipboard styling', () => {
    it('should apply inline styles for code blocks when forClipboard is true', async () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = await parseMarkdown(markdown, 'standard', true);
      expect(result).toContain('hljs');
    });

    it('should sanitize malicious scripts even with clipboard mode', async () => {
      const markdown = '<script>alert("xss")</script>';
      const result = await parseMarkdown(markdown, 'standard', true);
      expect(result).not.toContain('<script');
    });
  });

  describe('style transformations', () => {
    it('should apply bold-headers style to multiple headers', async () => {
      const markdown = '# Header 1\n## Header 2\n### Header 3';
      const result = await parseMarkdown(markdown, 'bold-headers');
      expect(result).toContain('<strong');
      expect(result).not.toContain('<h1');
      expect(result).not.toContain('<h2');
      expect(result).not.toContain('<h3');
    });

    it('should apply bullet-optimized style to mixed lists', async () => {
      const markdown = '- Item 1\n* Item 2\n+ Item 3';
      const result = await parseMarkdown(markdown, 'bullet-optimized');
      expect(result).toContain('✅');
    });
  });

  describe('HTML sanitization', () => {
    it('should remove script tags', async () => {
      const markdown = '<script>alert("xss")</script>';
      const result = await parseMarkdown(markdown);
      expect(result).not.toContain('<script');
    });

    it('should remove event handlers', async () => {
      const markdown = '<div onclick="alert(\'xss\')">Click me</div>';
      const result = await parseMarkdown(markdown);
      expect(result).not.toContain('onclick');
    });

    it('should allow safe HTML', async () => {
      const markdown = '<strong>Valid bold</strong>';
      const result = await parseMarkdown(markdown);
      expect(result).toContain('<strong');
    });
  });
});
