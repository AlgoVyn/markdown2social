import { describe, it, expect } from 'vitest';
import { parseMarkdown, markdownToSocialText } from './markdownParser';
import { splitIntoThread } from './threadSplitter';
import { calculateCharacterCount } from './platforms';

describe('Performance Tests', () => {
  describe('markdown parsing performance', () => {
    it('should handle content with 10,000 words in reasonable time', () => {
      const content = 'Word '.repeat(10000);
      const start = performance.now();
      const result = markdownToSocialText(content);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle content with 1,000 lines', () => {
      const lines = Array(1000).fill('This is a line of text.');
      const content = lines.join('\n');
      const start = performance.now();
      const result = markdownToSocialText(content);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(1000);
    });

    it('should handle deeply nested formatting', () => {
      // Create deeply nested bold/italic
      let markdown = 'text';
      for (let i = 0; i < 100; i++) {
        markdown = `**${markdown}**`;
      }

      const start = performance.now();
      const result = markdownToSocialText(markdown);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(500);
    });

    it('should handle many code blocks', () => {
      const codeBlocks = Array(50)
        .fill(null)
        .map((_, i) => `\`\`\`javascript\nconst x${i} = ${i};\n\`\`\``)
        .join('\n\n');

      const start = performance.now();
      const result = markdownToSocialText(codeBlocks);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(1000);
    });

    it('should handle many inline code segments', () => {
      const content = Array(100).fill('`code` word').join(' ');

      const start = performance.now();
      const result = markdownToSocialText(content);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(500);
    });

    it('should handle content with many URLs', () => {
      const urls = Array(100)
        .fill(null)
        .map((_, i) => `[Link ${i}](https://example.com/page${i})`)
        .join(' ');

      const start = performance.now();
      const result = markdownToSocialText(urls);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(500);
    });

    it('should handle HTML clipboard formatting for large content', async () => {
      const content = Array(100)
        .fill(null)
        .map((_, i) => `\`\`\`javascript\nconst code${i} = ${i};\n\`\`\``)
        .join('\n\n');

      const start = performance.now();
      const result = await parseMarkdown(content, 'standard', true);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(5000); // HTML parsing is slower
    });
  });

  describe('thread splitting performance', () => {
    it('should split very long content into thread efficiently', () => {
      // Create content with sentence boundaries that will be split
      const sentence = 'This is a complete sentence that is about fifty characters long. ';
      const content = sentence.repeat(100); // ~5000 characters with sentences

      const start = performance.now();
      const result = splitIntoThread(content, 280);
      const end = performance.now();

      // With sentences, it should create multiple posts or mark as over limit
      expect(result.posts.length).toBeGreaterThan(0);
      expect(result.totalCharacters).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(500);
    });

    it('should handle content with many paragraphs', () => {
      const paragraphs = Array(500).fill('This is a paragraph with about fifty characters.');
      const content = paragraphs.join('\n\n');

      const start = performance.now();
      const result = splitIntoThread(content, 280);
      const end = performance.now();

      expect(result.posts.length).toBeGreaterThan(0);
      expect(end - start).toBeLessThan(500);
    });

    it('should handle Twitter character counting for large text', () => {
      const text = 'https://example.com/ '.repeat(100); // 100 URLs

      const start = performance.now();
      const count = calculateCharacterCount(text, 'twitter');
      const end = performance.now();

      // Should count each URL as 23 characters plus spaces
      // 100 URLs * 23 chars + 99 spaces = 2399 (or similar depending on implementation)
      expect(count).toBeGreaterThan(100 * 20); // At least 20 chars per URL
      expect(count).toBeLessThan(100 * 30); // Less than 30 chars per URL
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('memory efficiency', () => {
    it('should not crash with 50,000 character content', () => {
      const content = 'x'.repeat(50000);

      expect(() => {
        markdownToSocialText(content);
      }).not.toThrow();
    });

    it('should handle complex nested structures', () => {
      const sections = Array(100)
        .fill(null)
        .map(
          (_, i) => `
# Section ${i}

**Bold text** and *italic text*

- Bullet 1
- Bullet 2

\`\`\`code
const x${i} = ${i};
\`\`\`

[Link ${i}](https://example.com/${i})
        `
        )
        .join('\n\n');

      const start = performance.now();
      const result = markdownToSocialText(sections);
      const end = performance.now();

      expect(result).toBeTruthy();
      expect(end - start).toBeLessThan(2000);
    });
  });

  describe('concurrent-like operations', () => {
    it('should handle multiple parsing operations', () => {
      const contents = Array(10)
        .fill(null)
        .map((_, i) => `Content ${i} `.repeat(1000));

      const start = performance.now();
      const results = contents.map((content) => markdownToSocialText(content));
      const end = performance.now();

      expect(results).toHaveLength(10);
      expect(end - start).toBeLessThan(2000);
    });

    it('should handle thread splitting for multiple platforms', () => {
      const content = 'Word '.repeat(2000);
      const limits = [280, 300, 500, 2000, 2200, 3000, 4096, 5000];

      const start = performance.now();
      const results = limits.map((limit) => splitIntoThread(content, limit));
      const end = performance.now();

      expect(results).toHaveLength(limits.length);
      expect(end - start).toBeLessThan(1000);
    });
  });
});
