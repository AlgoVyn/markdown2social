import { describe, it, expect } from 'vitest';
import {
  markdownToHtml,
  markdownToSocialText,
  markdownToSocialSegments,
} from '../utils/markdownParser';

describe('markdownToHtml', () => {
  describe('basic parsing', () => {
    it('should parse headings', () => {
      const markdown = '# Heading 1\n## Heading 2';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<h1');
      expect(result).toContain('Heading 1');
      expect(result).toContain('<h2');
      expect(result).toContain('Heading 2');
    });

    it('should parse bold text', () => {
      const markdown = '**bold text**';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<strong');
      expect(result).toContain('bold text');
    });

    it('should parse italic text', () => {
      const markdown = '*italic text*';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<em');
      expect(result).toContain('italic text');
    });

    it('should parse links', () => {
      const markdown = '[link text](https://example.com)';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<a');
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('link text');
    });

    it('should parse unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n* Item 3';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<ul');
      expect(result).toContain('<li');
      expect(result).toContain('Item 1');
      expect(result).toContain('Item 2');
      expect(result).toContain('Item 3');
    });

    it('should parse ordered lists', () => {
      const markdown = '1. First\n2. Second';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<ol');
      expect(result).toContain('<li');
      expect(result).toContain('First');
      expect(result).toContain('Second');
    });

    it('should parse code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<pre');
      expect(result).toContain('<code');
      expect(result).toContain('const');
      expect(result).toContain('x');
    });

    it('should parse inline code', () => {
      const markdown = '`inline code`';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<code');
      expect(result).toContain('inline code');
    });
  });

  describe('list and code structure', () => {
    it('should not double-wrap ordered lists', () => {
      const markdown = 'intro:\n\n1. one\n2. two\n3. three';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<ol>');
      expect(result).not.toContain('<ul>');
    });

    it('should keep multi-line code blocks intact', () => {
      const markdown = '```\nconst a = 1;\nconst b = 2;\n```';
      const result = markdownToHtml(markdown);
      expect(result).toContain('<pre><code');
      expect(result).toContain('const a = 1;');
      expect(result).toContain('const b = 2;');
      // Code lines must not be wrapped in paragraphs
      expect(result).not.toMatch(/<p>const/);
    });

    it('should escape HTML in code blocks and keep the language class', () => {
      const result = markdownToHtml('```html\n<div onclick="x">a & b</div>\n```');
      expect(result).toContain('class="language-html"');
      // DOMPurify's round-trip keeps < and & escaped; quotes stay literal in text nodes
      expect(result).toContain('&lt;div onclick="x"&gt;a &amp; b&lt;/div&gt;');
      expect(result).not.toContain('<div onclick');
    });

    it('should not italicize intraword underscores', () => {
      const result = markdownToHtml('use my_var_name here');
      expect(result).not.toContain('<em>');
      expect(result).toContain('my_var_name');
    });
  });

  describe('style transformations', () => {
    it('should apply bullet-optimized style', () => {
      const markdown = '- Item 1\n- Item 2';
      const result = markdownToHtml(markdown, 'bullet-optimized');
      expect(result).toContain('✅');
    });

    it('should apply bold-headers style', () => {
      const markdown = '# Header';
      const result = markdownToHtml(markdown, 'bold-headers');
      expect(result).toContain('<strong');
      expect(result).toContain('Header');
    });

    it('should not apply transformations for standard style', () => {
      const markdown = '# Header\n- Item';
      const result = markdownToHtml(markdown, 'standard');
      expect(result).toContain('<h1');
      expect(result).toContain('<ul');
    });
  });

  describe('sanitization', () => {
    it('should sanitize malicious HTML', () => {
      const markdown = '<script>alert("xss")</script>';
      const result = markdownToHtml(markdown);
      expect(result).not.toContain('<script');
    });
  });
});

describe('markdownToSocialText', () => {
  describe('heading conversion', () => {
    it('should convert h1 to unicode bold', () => {
      const markdown = '# Hello World';
      const result = markdownToSocialText(markdown);
      // Unicode bold "Hello World"
      expect(result).toContain('𝐇');
      expect(result).toContain('𝐞');
      expect(result).not.toContain('#');
    });

    it('should convert h2 to unicode bold', () => {
      const markdown = '## Second Heading';
      const result = markdownToSocialText(markdown);
      expect(result).not.toContain('##');
      expect(result).toContain('𝐒');
    });
  });

  describe('bold text conversion', () => {
    it('should convert **text** to unicode bold', () => {
      const markdown = '**bold**';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('𝐛');
      expect(result).toContain('𝐨');
      expect(result).not.toContain('**');
    });

    it('should handle multiple bold sections', () => {
      const markdown = '**first** and **second**';
      const result = markdownToSocialText(markdown);
      expect(result).not.toContain('**');
      expect(result).toContain('𝐟');
      expect(result).toContain('𝐬');
    });
  });

  describe('italic text conversion', () => {
    it('should convert *text* to unicode italic', () => {
      const markdown = '*italic*';
      const result = markdownToSocialText(markdown);
      // Mathematical Sans-Serif Italic characters
      expect(result).toContain('𝘪');
      expect(result).toContain('𝘵');
      expect(result).not.toContain('*');
    });

    it('should convert _text_ to unicode italic', () => {
      const markdown = '_italic_';
      const result = markdownToSocialText(markdown);
      // Mathematical Sans-Serif Italic characters
      expect(result).toContain('𝘪');
      expect(result).toContain('𝘵');
      expect(result).not.toContain('_');
    });
  });

  describe('bullet point styles', () => {
    it('should convert dashes to checkmarks in bullet-optimized style', () => {
      const markdown = '- Item';
      const result = markdownToSocialText(markdown, 'bullet-optimized');
      expect(result).toContain('✅');
      expect(result).not.toContain('- Item');
    });

    it('should convert dashes to bullets in standard style', () => {
      const markdown = '- Item';
      const result = markdownToSocialText(markdown, 'standard');
      expect(result).toContain('•');
      expect(result).not.toContain('- Item');
    });

    it('should convert asterisks to checkmarks in bullet-optimized style', () => {
      const markdown = '* Item';
      const result = markdownToSocialText(markdown, 'bullet-optimized');
      expect(result).toContain('✅');
    });
  });

  describe('link conversion', () => {
    it('should convert [text](url) to text (url)', () => {
      const markdown = '[Click here](https://example.com)';
      const result = markdownToSocialText(markdown);
      expect(result).toBe('Click here (https://example.com)');
    });

    it('should convert multiple links', () => {
      const markdown = '[Link1](url1) and [Link2](url2)';
      const result = markdownToSocialText(markdown);
      expect(result).toBe('Link1 (url1) and Link2 (url2)');
    });
  });

  describe('code handling', () => {
    it('should preserve inline code with backticks', () => {
      const markdown = 'Use `const x = 1` for assignment';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('`const x = 1`');
    });

    it('should preserve code blocks as plain text with newlines', () => {
      const markdown = '```javascript\nconst x = 1;\nconsole.log(x);\n```';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('const x = 1;');
      expect(result).toContain('console.log(x);');
      expect(result).not.toContain('```');
    });

    it('should handle code blocks with language specification', () => {
      const markdown = '```python\nprint("hello")\n```';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('print("hello")');
    });

    it('should add line numbers to code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\nconsole.log(x);\n```';
      const result = markdownToSocialText(markdown);
      // Check for line number format: "1 | " and "2 | "
      expect(result).toContain('1 | const x = 1;');
      expect(result).toContain('2 | console.log(x);');
    });

    it('should pad line numbers for multi-line code blocks', () => {
      const markdown =
        '```\nline1\nline2\nline3\nline4\nline5\nline6\nline7\nline8\nline9\nline10\n```';
      const result = markdownToSocialText(markdown);
      // Single digit lines should be padded
      expect(result).toContain(' 1 | line1');
      expect(result).toContain(' 9 | line9');
      // Double digit lines should not be padded
      expect(result).toContain('10 | line10');
    });

    it('should preserve $& in code blocks', () => {
      // $ patterns in code content must not be treated as replacement patterns
      const markdown = '```\nprice = "$&" total\n```';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('1 | price = "$&" total');
      expect(result).not.toContain('CODEBLOCK0');
    });

    it('should preserve $$ and $& in inline code', () => {
      const markdown = 'Use `a $$ b $& c` here';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('`a $$ b $& c`');
      expect(result).not.toContain('INLINECODE0');
    });
  });

  describe('edge cases', () => {
    it('should handle empty markdown', () => {
      const markdown = '';
      const result = markdownToSocialText(markdown);
      expect(result).toBe('');
    });

    it('should handle markdown with only whitespace', () => {
      const markdown = '   \n\n   ';
      const result = markdownToSocialText(markdown);
      expect(result).toBe('   \n\n   ');
    });

    it('should handle nested formatting correctly', () => {
      const markdown = '# **Bold Header**';
      const result = markdownToSocialText(markdown);
      // Both header and bold should result in bold unicode
      expect(result).not.toContain('**');
      expect(result).not.toContain('#');
    });

    it('should handle complex mixed content', () => {
      const markdown = `# Title

**Bold text** and *italic text*

- Bullet 1
- Bullet 2

\`\`\`code\nconst x = 1;\n\`\`\`

[Link](https://example.com)`;
      const result = markdownToSocialText(markdown);
      expect(result).not.toContain('#');
      expect(result).not.toContain('**');
      expect(result).not.toContain('*');
      expect(result).not.toContain('```');
      expect(result).toContain('•');
      expect(result).toContain('const x = 1;');
    });

    it('should handle text with special characters', () => {
      const markdown = 'Text with @mentions #hashes $dollars %percent';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('@mentions');
      expect(result).toContain('#hashes');
      expect(result).toContain('$dollars');
      expect(result).toContain('%percent');
    });

    it('should preserve numbers in bold conversion', () => {
      const markdown = '**Version 2.0**';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('𝟐');
      expect(result).toContain('𝟎');
    });

    it('should handle multiple paragraphs', () => {
      const markdown = 'Para 1\n\nPara 2\n\nPara 3';
      const result = markdownToSocialText(markdown);
      expect(result).toContain('Para 1');
      expect(result).toContain('Para 2');
      expect(result).toContain('Para 3');
    });
  });

  describe('style parameter', () => {
    it('should work with standard style', () => {
      const markdown = '# Test';
      const result = markdownToSocialText(markdown, 'standard');
      expect(result).toContain('𝐓');
    });

    it('should work with bullet-optimized style', () => {
      const markdown = '- Test item';
      const result = markdownToSocialText(markdown, 'bullet-optimized');
      expect(result).toContain('✅');
    });
  });
});

describe('nested bold and italic patterns', () => {
  it('should handle combined bold and italic with triple asterisks as all bold', () => {
    const markdown = '***bold and italic***';
    const result = markdownToSocialText(markdown);
    // Should contain both bold and italic unicode characters
    expect(result).toContain('𝐛'); // bold b (outer bold wins)
    expect(result).toContain('𝐨'); // bold o
    expect(result).not.toContain('***');
  });

  it('should handle nested italic inside bold', () => {
    const markdown = '**bold *and italic* text**';
    const result = markdownToSocialText(markdown);
    expect(result).not.toContain('**');
    expect(result).not.toContain('*');
    // All text should be bold (outer wins)
    expect(result).toContain('𝐛'); // bold b
    expect(result).toContain('𝐭'); // bold t
  });

  it('should handle bold inside italic', () => {
    const markdown = '*italic **and bold** text*';
    const result = markdownToSocialText(markdown);
    expect(result).not.toContain('**');
    expect(result).not.toContain('*');
    // Should handle gracefully without crashing
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle consecutive bold and italic patterns', () => {
    const markdown = '**bold***italic*';
    const result = markdownToSocialText(markdown);
    expect(result).not.toContain('**');
    expect(result).not.toContain('*');
    // Should contain both bold and italic characters
    expect(result).toContain('𝐛'); // bold b
    expect(result).toContain('𝘪'); // italic i
  });

  it('should handle multiple asterisks at line boundaries', () => {
    const markdown = '*first line\n*second line';
    const result = markdownToSocialText(markdown);
    // Should not crash and should process each line
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle bold with underscores inside', () => {
    const markdown = '**bold_with_underscores**';
    const result = markdownToSocialText(markdown);
    expect(result).not.toContain('**');
    expect(result).toContain('𝐛'); // bold b
    expect(result).toContain('𝐰'); // bold w
  });

  it('should handle italic with asterisks at word boundaries', () => {
    const markdown = '*start*middle*end*';
    const result = markdownToSocialText(markdown);
    // Should only process valid italic patterns
    expect(result).not.toContain('*');
  });

  it('should handle bold at start of line', () => {
    const markdown = '**start bold** then normal';
    const result = markdownToSocialText(markdown);
    expect(result).toContain('𝐬'); // bold s
    expect(result).toContain('𝐭'); // bold t
    expect(result).toContain('then normal');
  });

  it('should handle italic at start of line', () => {
    const markdown = '*start italic* then normal';
    const result = markdownToSocialText(markdown);
    expect(result).toContain('𝘴'); // italic s
    expect(result).toContain('𝘵'); // italic t
    expect(result).toContain('then normal');
  });

  it('should handle partial italic patterns (unmatched asterisks)', () => {
    const markdown = '*unclosed italic';
    const result = markdownToSocialText(markdown);
    // Should preserve unmatched asterisks or handle gracefully
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle bold-italic-bold pattern', () => {
    const markdown = '**bold***italic***bold again**';
    const result = markdownToSocialText(markdown);
    expect(result).not.toContain('**');
    expect(result).not.toContain('*');
    // Should contain both bold and italic
    expect(result).toContain('𝐛'); // bold b
    expect(result).toContain('𝘪'); // italic i
  });
});

describe('markdownToSocialSegments', () => {
  const joinSegments = (markdown: string, style?: Parameters<typeof markdownToSocialText>[1]) =>
    markdownToSocialSegments(markdown, style)
      .map((s) => (s.type === 'code' ? `\n${s.content}\n` : s.content))
      .join('');

  it('should return an empty array for empty input', () => {
    expect(markdownToSocialSegments('')).toEqual([]);
  });

  it('should match markdownToSocialText output when joined', () => {
    const markdown =
      '# Launch\n\nSome **bold** and `inline code` text.\n\n```js\nconst x = 1;\nreturn x;\n```\n\n- bullet one\n- bullet two\n\n#hashtag line';
    expect(joinSegments(markdown)).toBe(markdownToSocialText(markdown));
  });

  it('should classify hashtag-only lines as text, not code', () => {
    const segments = markdownToSocialSegments('Update!\n\n#marketing #growth');
    expect(segments).toHaveLength(1);
    expect(segments[0].type).toBe('text');
    expect(segments[0].content).toContain('#marketing #growth');
  });

  it('should emit a code segment for each fenced block', () => {
    const segments = markdownToSocialSegments(
      'Before\n\n```\nconst a = 1;\nconst b = 2;\n```\n\nAfter'
    );
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ type: 'text', content: 'Before\n\n' });
    expect(segments[1].type).toBe('code');
    expect(segments[1].content).toBe('1 | const a = 1;\n2 | const b = 2;');
    expect(segments[2]).toEqual({ type: 'text', content: '\n\nAfter' });
  });

  it('should keep code content with $ patterns literal inside segments', () => {
    const segments = markdownToSocialSegments('```\nconst s = "$&";\n```');
    expect(segments.map((s) => s.type)).toEqual(['text', 'code', 'text']);
    expect(segments[1].content).toBe('1 | const s = "$&";');
  });
});
