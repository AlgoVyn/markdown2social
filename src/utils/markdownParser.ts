import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

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
const cssStyles: Record<string, string> = {
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

  // Apply inline styles to all elements with hljs classes
  const allElements = doc.querySelectorAll('[class*="hljs"]');
  allElements.forEach((el) => {
    const classes = el.className.split(' ');
    let style = el.getAttribute('style') || '';

    for (const cls of classes) {
      if (cssStyles[cls] && !style.includes(cssStyles[cls])) {
        style = style ? style + cssStyles[cls] : cssStyles[cls];
      }
    }

    if (style) {
      el.setAttribute('style', style);
    }
  });

  return DOMPurify.sanitize(doc.body.innerHTML);
};

export const parseMarkdown = (
  markdown: string,
  style: string = 'standard',
  forClipboard: boolean = false
): string => {
  let processedMarkdown = markdown;

  // Apply style transformations
  if (style === 'bullet-optimized') {
    processedMarkdown = processedMarkdown.replace(/^[-*]\s/gm, '✅ ');
  } else if (style === 'bold-headers') {
    processedMarkdown = processedMarkdown.replace(/^#+\s+(.*$)/gm, '**$1**');
  }

  const rawHtml = marked.parse(processedMarkdown, { async: false }) as string;
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  // Apply inline styles for clipboard copying to preserve syntax highlighting
  if (forClipboard) {
    return applyInlineStyles(cleanHtml);
  }

  return cleanHtml;
};

const toUnicodeVariant = (str: string, variant: 'bold' | 'italic'): string => {
  const offsets = {
    bold: {
      upper: 0x1d400 - 0x41,
      lower: 0x1d41a - 0x61,
      digit: 0x1d7ce - 0x30,
    },
    italic: { upper: 0x1d608 - 0x41, lower: 0x1d622 - 0x61, digit: null }, // using sans-serif italic
  };
  const off = offsets[variant];

  // We should only convert standard ASCII letters/digits, leave spaces and punctuation alone
  return str
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0);
      if (code >= 0x41 && code <= 0x5a) return String.fromCodePoint(code + off.upper);
      if (code >= 0x61 && code <= 0x7a) return String.fromCodePoint(code + off.lower);
      if (variant === 'bold' && code >= 0x30 && code <= 0x39 && off.digit) {
        return String.fromCodePoint(code + off.digit);
      }
      return c;
    })
    .join('');
};

// Unique delimiter characters from Private Use Area (PUA)
// These are unlikely to appear in normal user content
const DELIM_START = '\uE000';
const DELIM_END = '\uE001';

/**
 * Converts Markdown directly into plain text heavily utilizing
 * Unicode characters (for bold/italic) suitable for pasting into
 * social media composers like LinkedIn.
 */
export const markdownToSocialText = (markdown: string, style: string = 'standard'): string => {
  let text = markdown;

  // Protect code blocks to avoid formatting inner contents
  const codeBlocks: { lang: string; code: string }[] = [];
  const inlineCodes: string[] = [];

  // Extract code blocks with language detection
  // Use non-ASCII delimiter characters that won't be affected by text transformations
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_match, lang, code) => {
    codeBlocks.push({ lang: lang || '', code: code.trim() });
    return `${DELIM_START}CODEBLOCK${codeBlocks.length - 1}${DELIM_END}`;
  });

  text = text.replace(/`([^`]+)`/g, (match) => {
    inlineCodes.push(match);
    return `${DELIM_START}INLINECODE${inlineCodes.length - 1}${DELIM_END}`;
  });

  // Replace Headers (always apply bold)
  text = text.replace(/^#+\s+(.*$)/gm, (_, p1) => toUnicodeVariant(p1, 'bold'));

  // Apply Bullet Styles
  if (style === 'bullet-optimized') {
    text = text.replace(/^[-*]\s/gm, '✅ ');
  } else {
    text = text.replace(/^[-*]\s/gm, '• ');
  }

  // Convert Bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, (_, p1) => toUnicodeVariant(p1, 'bold'));

  // Convert Italics *text* or _text_
  // Use a compatible approach instead of lookbehind to support older browsers (Safari < 16)
  // Match single asterisks that aren't part of a double asterisk
  text = text.replace(
    /(^|[^*])\*([^*])(.*?)\*([^*]|$)/g,
    (_match, prefix, firstChar, content, suffix) => {
      // Reconstruct with italic content, keeping surrounding characters
      const italicText = toUnicodeVariant(firstChar + content, 'italic');
      return prefix + italicText + suffix;
    }
  );
  // Handle italic text at start of line
  text = text.replace(/^\*([^*])(.*?)\*([^*]|$)/gm, (_match, firstChar, content, suffix) => {
    const italicText = toUnicodeVariant(firstChar + content, 'italic');
    return italicText + suffix;
  });
  text = text.replace(/_(.*?)_/g, (_, p1) => toUnicodeVariant(p1, 'italic'));

  // Clean up any other Markdown that might leak
  // e.g. [text](url) -> text (url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // Restore inline codes as plain backticks
  inlineCodes.forEach((code, i) => {
    const content = code.slice(1, -1); // Remove surrounding backticks
    text = text.replace(
      new RegExp(`${DELIM_START}INLINECODE${i}${DELIM_END}`, 'g'),
      `\`${content}\``
    );
  });

  // Restore code blocks - LinkedIn doesn't support triple backticks
  // so we just output the raw code. Users can manually format as code in LinkedIn.
  codeBlocks.forEach((block, i) => {
    // Just output the raw code with newlines for separation
    const formatted = `\n${block.code}\n`;
    text = text.replace(new RegExp(`${DELIM_START}CODEBLOCK${i}${DELIM_END}`, 'g'), formatted);
  });

  return text;
};
