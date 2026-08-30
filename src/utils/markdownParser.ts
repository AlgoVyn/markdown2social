import { Marked } from 'marked';
import DOMPurify from 'dompurify';

export type FormatStyle = 'standard' | 'bullet-optimized' | 'bold-headers';

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
    'del',
    'ins',
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

// Dedicated instance so preview parsing never picks up global marked configuration.
// breaks: true keeps single newlines as line breaks, matching how social
// platforms render text.
const previewParser = new Marked({ gfm: true, breaks: true });

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

// One span per line lets CSS counters number the lines in the preview,
// mirroring the numbered code blocks markdownToSocialText produces for copy.
previewParser.use({
  renderer: {
    code(code: string, infostring?: string): string {
      const lang = infostring?.trim().split(/\s+/)[0] || 'plaintext';
      const lines = code.replace(/\n$/, '').split('\n');
      const body = lines
        .map((line) => `<span class="code-line">${escapeHtml(line)}</span>`)
        .join('');
      return `<pre><code class="language-${escapeHtml(lang)}">${body}</code></pre>`;
    },
  },
});

// Links in the preview must open in a new tab: a same-tab navigation would
// discard the editor state. rel="noopener noreferrer" isolates the opener.
// Applied as a post-pass on sanitized output instead of a global DOMPurify
// hook, so other sanitize callers in the app are never affected.
const addLinkTargets = (html: string): string => {
  if (!html.includes('<a')) return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const links = doc.querySelectorAll('a');
  if (links.length === 0) return html;
  links.forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
  return doc.body.innerHTML;
};

/**
 * Applies a format style to raw markdown before HTML rendering.
 *
 * markdownToSocialText implements the equivalent transformations in its own
 * line loop (bullets → ✅/•, headers → bold) — keep the two paths in sync.
 */
const applyFormatStyle = (markdown: string, style: FormatStyle): string => {
  if (style === 'bullet-optimized') {
    return markdown.replace(/^[-*]\s/gm, '✅ ');
  }
  if (style === 'bold-headers') {
    return markdown.replace(/^#+\s+(.*$)/gm, '**$1**');
  }
  return markdown;
};

/**
 * Converts markdown to sanitized HTML for preview rendering.
 *
 * Output is always passed through DOMPurify, so it is safe to inject with
 * dangerouslySetInnerHTML. Without async extensions marked returns a string
 * synchronously.
 */
export const markdownToHtml = (markdown: string, style: FormatStyle = 'standard'): string => {
  const rawHtml = previewParser.parse(applyFormatStyle(markdown, style)) as string;
  return addLinkTargets(DOMPurify.sanitize(rawHtml, PURIFY_CONFIG));
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
 * One run of converted content. Fenced code blocks become 'code' segments
 * (already line-numbered exactly as they appear in the copied text); all
 * other content is 'text'. Consumers that need to tell code apart from prose
 * (the HTML clipboard flavor) work on segments; markdownToSocialText is the
 * plain join of them.
 */
export interface SocialSegment {
  type: 'text' | 'code';
  content: string;
}

const numberCodeLines = (code: string): string => {
  const codeLines = code.split('\n');
  const lineNumberWidth = String(codeLines.length).length;
  return codeLines
    .map((line, index) => {
      const lineNum = String(index + 1).padStart(lineNumberWidth, ' ');
      return `${lineNum} | ${line}`;
    })
    .join('\n');
};

/**
 * Converts markdown into ordered text/code segments with Unicode mathematical
 * symbols for bold/italic styling suitable for pasting into social media.
 *
 * PERFORMANCE NOTES:
 * - Uses single-pass parsing with tokenization for better performance
 * - Code blocks are extracted first to avoid processing overhead
 * - String builder pattern minimizes intermediate string allocations
 */
export const markdownToSocialSegments = (
  markdown: string,
  style: FormatStyle = 'standard'
): SocialSegment[] => {
  if (!markdown) return [];

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

  // Restore inline codes before splitting so they stay part of text segments.
  // Replacements must be functions so code content containing $ patterns
  // ($&, $`, $', $$) is inserted literally.
  let restored = text;
  for (let i = 0; i < inlineCodes.length; i++) {
    const content = inlineCodes[i].slice(1, -1);
    restored = restored.replace(
      new RegExp(`${DELIM_START}INLINECODE${i}${DELIM_END}`, 'g'),
      () => `\`${content}\``
    );
  }

  // Split on the code block sentinels; everything between them is prose.
  const segments: SocialSegment[] = [];
  const sentinelRegex = new RegExp(`${DELIM_START}CODEBLOCK(\\d+)${DELIM_END}`, 'g');
  let lastIndex = 0;
  for (const match of restored.matchAll(sentinelRegex)) {
    const start = match.index ?? 0;
    segments.push({ type: 'text', content: restored.slice(lastIndex, start) });
    segments.push({ type: 'code', content: numberCodeLines(codeBlocks[Number(match[1])].code) });
    lastIndex = start + match[0].length;
  }
  segments.push({ type: 'text', content: restored.slice(lastIndex) });

  return segments;
};

export const markdownToSocialText = (markdown: string, style: FormatStyle = 'standard'): string =>
  markdownToSocialSegments(markdown, style)
    .map((segment) => (segment.type === 'code' ? `\n${segment.content}\n` : segment.content))
    .join('');
