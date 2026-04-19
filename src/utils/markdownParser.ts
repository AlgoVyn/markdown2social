import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
// DOMPurify configuration for strict sanitization
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'strike',
    'a',
    'ul',
    'ol',
    'li',
    'code',
    'pre',
    'blockquote',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'div',
  ],
  ALLOWED_ATTR: [
    'href',
    'target',
    'rel',
    'class',
    'id',
    'aria-label',
    'aria-hidden',
    'role',
    'title',
  ],
  ALLOW_DATA_ATTR: false,
  SANITIZE_DOM: true,
};

// Clipboard-specific config that allows inline styles for syntax highlighting
const CLIPBOARD_PURIFY_CONFIG = {
  ...PURIFY_CONFIG,
  ALLOWED_ATTR: [...PURIFY_CONFIG.ALLOWED_ATTR, 'style'],
};

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

// CSS styles from highlight.js github theme - inlined for clipboard compatibility
const CSS_STYLES: Record<string, string> = {
  hljs: 'color:#24292e;background:#ffffff;',
  'hljs-doctag': 'color:#d73a49;',
  'hljs-keyword': 'color:#d73a49;',
  'hljs-meta': 'color:#005cc5;',
  'hljs-template-tag': 'color:#d73a49;',
  'hljs-template-variable': 'color:#d73a49;',
  'hljs-type': 'color:#d73a49;',
  'hljs-variable': 'color:#005cc5;',
  'hljs-title': 'color:#6f42c1;',
  'hljs-title.class_': 'color:#6f42c1;',
  'hljs-title.function_': 'color:#6f42c1;',
  'hljs-attr': 'color:#005cc5;',
  'hljs-attribute': 'color:#005cc5;',
  'hljs-literal': 'color:#005cc5;',
  'hljs-number': 'color:#005cc5;',
  'hljs-operator': 'color:#005cc5;',
  'hljs-regexp': 'color:#032f62;',
  'hljs-string': 'color:#032f62;',
  'hljs-built_in': 'color:#e36209;',
  'hljs-symbol': 'color:#e36209;',
  'hljs-comment': 'color:#6a737d;',
  'hljs-code': 'color:#6a737d;',
  'hljs-formula': 'color:#6a737d;',
  'hljs-name': 'color:#22863a;',
  'hljs-quote': 'color:#22863a;',
  'hljs-selector-tag': 'color:#22863a;',
  'hljs-selector-pseudo': 'color:#22863a;',
  'hljs-subst': 'color:#24292e;',
  'hljs-section': 'color:#005cc5;font-weight:bold;',
  'hljs-bullet': 'color:#735c0f;',
  'hljs-emphasis': 'color:#24292e;font-style:italic;',
  'hljs-strong': 'color:#24292e;font-weight:bold;',
};

const applyInlineStyles = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('[class*="hljs"]').forEach((el) => {
    const style = el.className
      .split(' ')
      .filter((cls) => CSS_STYLES[cls])
      .map((cls) => CSS_STYLES[cls])
      .join('');
    if (style) el.setAttribute('style', style);
  });

  return DOMPurify.sanitize(doc.body.innerHTML, CLIPBOARD_PURIFY_CONFIG);
};

export const parseMarkdown = async (
  markdown: string,
  style: string = 'standard',
  forClipboard: boolean = false
): Promise<string> => {
  let processed = markdown;

  if (style === 'bullet-optimized') {
    processed = processed.replace(/^[-*]\s/gm, '✅ ');
  } else if (style === 'bold-headers') {
    processed = processed.replace(/^#+\s+(.*$)/gm, '**$1**');
  }

  // marked.parse returns a Promise in v10+, await it properly
  const rawHtml = await marked.parse(processed);
  const cleanHtml = DOMPurify.sanitize(rawHtml, PURIFY_CONFIG);

  return forClipboard ? applyInlineStyles(cleanHtml) : cleanHtml;
};

/**
 * Unicode Mathematical Alphanumeric Symbols block offsets.
 *
 * These Unicode code points represent stylized versions of ASCII characters
 * that appear as bold or italic text in most modern platforms.
 *
 * Limitations:
 * - Only converts ASCII A-Z, a-z, and 0-9 (for bold)
 * - Non-ASCII characters (accents, emoji, CJK, Cyrillic, etc.) are preserved as-is
 * - This is intentional: Unicode math symbols only cover basic Latin characters
 *
 * For characters outside ASCII range, standard text is preserved without styling.
 * Example: "**Café**" becomes "𝐂𝐚𝐟é" (C, a, f are bold; é remains regular)
 *
 * @see https://unicode.org/charts/PDF/U1D400.pdf Mathematical Alphanumeric Symbols
 */
const UNICODE_OFFSETS = {
  /**
   * Bold variant: Mathematical Bold Capital/Small Letters (U+1D400-U+1D433)
   * Digits: Mathematical Bold Digit Zero-Nine (U+1D7CE-U+1D7D7)
   */
  bold: {
    upper: 0x1d3bf, // 0x1d400 (bold A) - 0x41 (ASCII A)
    lower: 0x1d3b9, // 0x1d41a (bold a) - 0x61 (ASCII a)
    digit: 0x1d79e, // 0x1d7ce (bold 0) - 0x30 (ASCII 0)
  },
  /**
   * Italic variant: Mathematical Italic Capital/Small Letters (U+1D608-U+1D63B)
   * Note: No digit support for italic in the Unicode standard
   */
  italic: {
    upper: 0x1d5c7, // 0x1d608 (italic A) - 0x41 (ASCII A)
    lower: 0x1d5c1, // 0x1d622 (italic a) - 0x61 (ASCII a)
    digit: null, // No italic digits in Unicode math symbols
  },
};

/**
 * Converts ASCII characters to Unicode mathematical variant characters.
 *
 * @param str - Input string to convert
 * @param variant - 'bold' or 'italic'
 * @returns String with ASCII characters converted to Unicode variants
 *
 * @example
 * toUnicodeVariant('Hello', 'bold') // Returns '𝐇𝐞𝐥𝐥𝐨'
 * toUnicodeVariant('Hello 123', 'bold') // Returns '𝐇𝐞𝐥𝐥𝐨 𝟏𝟐𝟑' (bold digits)
 * toUnicodeVariant('Hello', 'italic') // Returns '𝐻𝑒𝑙𝑙𝑜'
 * toUnicodeVariant('Café', 'bold') // Returns '𝐂𝐚𝐟é' (é preserved as-is)
 */
const toUnicodeVariant = (str: string, variant: 'bold' | 'italic'): string => {
  const offsets = UNICODE_OFFSETS[variant];

  return str
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0);
      // ASCII A-Z -> Bold/Italic variant
      if (code >= 65 && code <= 90) {
        return String.fromCodePoint(code + offsets.upper);
      }
      // ASCII a-z -> Bold/Italic variant
      if (code >= 97 && code <= 122) {
        return String.fromCodePoint(code + offsets.lower);
      }
      // ASCII 0-9 -> Bold variant only (no italic digits in Unicode)
      if (variant === 'bold' && offsets.digit && code >= 48 && code <= 57) {
        return String.fromCodePoint(code + offsets.digit);
      }
      // Non-ASCII characters (emoji, accents, etc.) are preserved unchanged
      return c;
    })
    .join('');
};

// Private Use Area delimiter characters for temporarily masking code blocks
const DELIM_START = '\uE000';
const DELIM_END = '\uE001';

/**
 * Converts Markdown directly into plain text utilizing Unicode mathematical
 * symbols for bold/italic styling suitable for pasting into social media.
 *
 * PERFORMANCE NOTES:
 * - Uses single-pass parsing with tokenization for better performance
 * - Code blocks are extracted first to avoid processing overhead
 * - String builder pattern minimizes intermediate string allocations
 */
export const markdownToSocialText = (markdown: string, style: string = 'standard'): string => {
  if (!markdown) return '';

  // Phase 1: Extract and mask code content using single-pass replace with callback
  const codeBlocks: { lang: string; code: string }[] = [];
  let text = markdown.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_match, lang, code) => {
    const index = codeBlocks.length;
    codeBlocks.push({ lang: lang || '', code: code.trim() });
    return `${DELIM_START}CODEBLOCK${index}${DELIM_END}`;
  });

  // Extract inline codes with single-pass approach
  const inlineCodes: string[] = [];
  text = text.replace(/`([^`]+)`/g, (match) => {
    const index = inlineCodes.length;
    inlineCodes.push(match);
    return `${DELIM_START}INLINECODE${index}${DELIM_END}`;
  });

  // Phase 2: Process markdown formatting (combined where possible)
  const lines = text.split('\n');
  const processedLines: string[] = [];

  for (const line of lines) {
    let processed = line;

    // Headers: convert to bold
    if (processed.match(/^#+\s+/)) {
      processed = processed.replace(/^#+\s+(.*$)/, (_, p1) => toUnicodeVariant(p1, 'bold'));
    }

    // Bullet points
    else if (processed.match(/^[-*]\s/)) {
      processed = processed.replace(/^[-*]\s/, style === 'bullet-optimized' ? '✅ ' : '• ');
    }

    processedLines.push(processed);
  }

  text = processedLines.join('\n');

  // Phase 3: Inline formatting (bold, italic, links)
  // Use a single pass with ordered replacements

  // Bold - process before italic to avoid conflicts with asterisks
  text = text.replace(/\*\*(.*?)\*\*/g, (_, p1) => toUnicodeVariant(p1, 'bold'));

  // Italic with underscores (process before asterisk-italic)
  text = text.replace(/_(.*?)_/g, (_, p1) => toUnicodeVariant(p1, 'italic'));

  // Italic with asterisks - handle more carefully
  text = text.replace(
    /(^|[^*])\*([^*])(.*?)\*([^*]|$)/g,
    (_match, prefix, firstChar, content, suffix) =>
      prefix + toUnicodeVariant(firstChar + content, 'italic') + suffix
  );

  // Clean up any remaining single asterisks at line start
  text = text.replace(
    /^\*([^*])(.*?)\*([^*]|$)/gm,
    (_match, firstChar, content, suffix) => toUnicodeVariant(firstChar + content, 'italic') + suffix
  );

  // Links: [text](url) -> text (url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // Phase 4: Restore code content
  // Use string builder pattern for efficiency
  let result = text;

  // Restore inline codes
  for (let i = 0; i < inlineCodes.length; i++) {
    const content = inlineCodes[i].slice(1, -1);
    result = result.replace(
      new RegExp(`${DELIM_START}INLINECODE${i}${DELIM_END}`, 'g'),
      `\`${content}\``
    );
  }

  // Restore code blocks
  for (let i = 0; i < codeBlocks.length; i++) {
    result = result.replace(
      new RegExp(`${DELIM_START}CODEBLOCK${i}${DELIM_END}`, 'g'),
      `\n${codeBlocks[i].code}\n`
    );
  }

  return result;
};
