import type { SocialSegment } from './markdownParser';

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Formats converted content for the HTML clipboard flavor.
 *
 * Text segments become <p> paragraphs (blank lines → <br>); code segments —
 * already identified structurally by the parser — become styled <pre> blocks
 * that preserve indentation. No content-based guessing happens here: lines in
 * prose that merely look like code (hashtags, dashes) stay paragraphs.
 *
 * @param segments - Segments from markdownToSocialSegments
 * @returns HTML string formatted for clipboard
 */
export const formatForHtmlClipboard = (segments: SocialSegment[]): string => {
  if (segments.length === 0) return '';

  const parts = segments.map((segment) => {
    if (segment.type === 'code') {
      return wrapCodeBlock(segment.content.split('\n'));
    }
    return segment.content
      .split('\n')
      .map((line) => (line.trim() === '' ? '<br>' : `<p>${escapeHtml(line)}</p>`))
      .join('');
  });

  return parts.join('');
};

/**
 * Wraps code block lines in a styled <pre> tag to preserve formatting.
 */
const wrapCodeBlock = (lines: string[]): string => {
  const content = lines
    .map((line) => {
      // Escape HTML but preserve the actual characters
      return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    })
    .join('\n');

  // Use <pre> with white-space: pre to preserve all whitespace
  // Note: Hardcoded colors are optimized for light mode. Dark mode support
  // would require theme-aware styling or CSS custom properties.
  return `<pre style="margin:8px 0;padding:12px;background:#f6f8fa;border-radius:6px;font-family:SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;font-size:85%;line-height:1.45;white-space:pre;word-wrap:normal;overflow-x:auto;color:#24292e;">${content}</pre>`;
};

/**
 * Message of the error thrown when no clipboard API is available.
 */
export const CLIPBOARD_UNAVAILABLE_MESSAGE = 'Clipboard API not available';

/**
 * Thrown when the browser exposes no clipboard API at all. Callers branch on
 * this class (not on the message text) to show a dedicated toast.
 */
export class ClipboardUnavailableError extends Error {
  constructor() {
    super(CLIPBOARD_UNAVAILABLE_MESSAGE);
    this.name = 'ClipboardUnavailableError';
  }
}

/**
 * Copies content to clipboard with both HTML and plain text formats.
 *
 * Uses the modern Clipboard API with ClipboardItem to write multiple formats.
 * This allows rich text editors like LinkedIn to receive HTML with proper formatting,
 * while plain text paste targets receive the text version.
 *
 * @param text - The plain text content (from markdownToSocialText)
 * @param html - Optional pre-rendered HTML flavor (formatForHtmlClipboard output);
 *   when omitted, the plain text is wrapped in paragraphs instead
 * @returns Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text: string, html?: string): Promise<void> => {
  if (!text) {
    throw new Error('No content to copy');
  }

  // Check if modern Clipboard API with write() is supported
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    const htmlPayload = html ?? formatForHtmlClipboard([{ type: 'text', content: text }]);

    const htmlBlob = new Blob([htmlPayload], { type: 'text/html' });
    const textBlob = new Blob([text], { type: 'text/plain' });

    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob,
    });

    await navigator.clipboard.write([clipboardItem]);
  } else if (navigator.clipboard?.writeText) {
    // Fallback to plain text only
    await navigator.clipboard.writeText(text);
  } else {
    throw new ClipboardUnavailableError();
  }
};
