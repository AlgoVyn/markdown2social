/**
 * Pure text transformations behind the editor formatting toolbar and keyboard
 * shortcuts. Operating on plain strings keeps them unit-testable; the editor
 * applies the returned text + selection to the CodeMirror view in one dispatch.
 */
export interface EditOperation {
  text: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Wraps the selected range with before/after markers (bold, italic, code...).
 * If the range is already wrapped by exactly these markers, they are removed.
 * Placeholder text for empty selections stays inside the markers and is
 * selected, so typing replaces it.
 */
export const wrapSelection = (
  text: string,
  selStart: number,
  selEnd: number,
  before: string,
  after: string = before
): EditOperation => {
  const selected = text.slice(selStart, selEnd);
  const isWrapped =
    text.slice(Math.max(0, selStart - before.length), selStart) === before &&
    text.slice(selEnd, selEnd + after.length) === after;

  if (isWrapped) {
    const start = selStart - before.length;
    const unwrapped = text.slice(0, start) + selected + text.slice(selEnd + after.length);
    return { text: unwrapped, selectionStart: start, selectionEnd: start + selected.length };
  }

  const nextText = text.slice(0, selStart) + before + selected + after + text.slice(selEnd);
  const contentStart = selStart + before.length;
  return {
    text: nextText,
    selectionStart: contentStart,
    selectionEnd: contentStart + selected.length,
  };
};

/**
 * Prefix markers that belong to the same family as `prefix`. Family markers
 * are replaced (never nested) when the prefix is added — e.g. H2 on "# Title"
 * converts to "## Title", and list buttons convert between bullet and ordered
 * lists. `removalFor` extends toggle-off to equivalent markers (returning
 * null = exact prefix only, as for headings, where only the same level
 * should toggle off).
 */
const PREFIX_FAMILY: Array<{
  match: (prefix: string) => boolean;
  removalFor: (prefix: string) => RegExp | null;
  strip: RegExp;
}> = [
  {
    // Any heading level replaces any other; only the exact level toggles off
    match: (prefix) => /^#{1,6} $/.test(prefix),
    removalFor: () => null,
    strip: /^#{1,6}\s/,
  },
  {
    // Bullet and ordered markers form one list family; each type toggles
    // off only its own markers
    match: (prefix) => /^[-*+] $/.test(prefix) || /^\d+\. $/.test(prefix),
    removalFor: (prefix) => (/^\d+\. $/.test(prefix) ? /^\d+\.\s/ : /^[-*+]\s/),
    strip: /^(?:[-*+]|\d+\.)\s/,
  },
];

/**
 * Toggles a prefix (heading, list marker, quote) on every non-empty line
 * touched by the selection. If all touched lines already carry the prefix
 * (or an equivalent family marker) it is removed, otherwise it is added,
 * replacing any same-family marker. The whole affected block ends up selected.
 */
export const toggleLinePrefix = (
  text: string,
  selStart: number,
  selEnd: number,
  prefix: string
): EditOperation => {
  const blockStart = text.lastIndexOf('\n', Math.max(0, selStart - 1)) + 1;
  const newlineAfter = text.indexOf('\n', selEnd);
  const blockEnd = newlineAfter === -1 ? text.length : newlineAfter;

  const lines = text.slice(blockStart, blockEnd).split('\n');
  const family = PREFIX_FAMILY.find((f) => f.match(prefix));
  const removal = family ? family.removalFor(prefix) : null;
  const allPrefixed = lines.every(
    (line) => line.trim() === '' || line.startsWith(prefix) || (removal?.test(line) ?? false)
  );

  const updated = lines
    .map((line) => {
      if (line.trim() === '') return line;
      if (allPrefixed) {
        return removal && !line.startsWith(prefix)
          ? line.replace(removal, '')
          : line.slice(prefix.length);
      }
      const base = family ? line.replace(family.strip, '') : line;
      return prefix + base;
    })
    .join('\n');

  return {
    text: text.slice(0, blockStart) + updated + text.slice(blockEnd),
    selectionStart: blockStart,
    selectionEnd: blockStart + updated.length,
  };
};

/** Inserts text at a cursor position and places the caret after it. */
export const insertAtCursor = (text: string, pos: number, insert: string): EditOperation => ({
  text: text.slice(0, pos) + insert + text.slice(pos),
  selectionStart: pos + insert.length,
  selectionEnd: pos + insert.length,
});
