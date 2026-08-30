import { describe, it, expect } from 'vitest';
import { insertAtCursor, toggleLinePrefix, wrapSelection } from './editorCommands';

describe('wrapSelection', () => {
  it('wraps the selected range', () => {
    const result = wrapSelection('hello world', 6, 11, '**');
    expect(result.text).toBe('hello **world**');
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(13);
  });

  it('wraps an empty selection with placeholder selected', () => {
    const result = wrapSelection('hello ', 6, 6, '**');
    expect(result.text).toBe('hello ****');
    expect(result.selectionStart).toBe(8);
    expect(result.selectionEnd).toBe(8);
  });

  it('uses different open and close markers', () => {
    const result = wrapSelection('click here', 0, 10, '[', '](https://example.com)');
    expect(result.text).toBe('[click here](https://example.com)');
    expect(result.selectionStart).toBe(1);
    expect(result.selectionEnd).toBe(11);
  });

  it('removes the markers when the range is already wrapped', () => {
    const result = wrapSelection('hello **world**', 8, 13, '**');
    expect(result.text).toBe('hello world');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(11);
  });

  it('does not unwrap when only one side matches', () => {
    const result = wrapSelection('**bold only', 2, 6, '**');
    expect(result.text).toBe('****bold** only');
  });
});

describe('toggleLinePrefix', () => {
  it('adds a heading prefix to the current line', () => {
    const result = toggleLinePrefix('Title here', 0, 10, '## ');
    expect(result.text).toBe('## Title here');
    expect(result.selectionStart).toBe(0);
    expect(result.selectionEnd).toBe(13);
  });

  it('removes the prefix when every touched line has it', () => {
    const result = toggleLinePrefix('## One\n## Two', 0, 13, '## ');
    expect(result.text).toBe('One\nTwo');
  });

  it('applies the prefix to every line in a multi-line selection', () => {
    const result = toggleLinePrefix('one\ntwo\nthree', 4, 9, '- ');
    expect(result.text).toBe('one\n- two\n- three');
  });

  it('leaves empty lines untouched', () => {
    const result = toggleLinePrefix('one\n\ntwo', 0, 8, '- ');
    expect(result.text).toBe('- one\n\n- two');
  });

  it('only affects lines the selection touches', () => {
    const result = toggleLinePrefix('first\nsecond\nthird', 9, 15, '> ');
    expect(result.text).toBe('first\n> second\n> third');
  });

  it('replaces a different heading level instead of nesting', () => {
    const result = toggleLinePrefix('# Title', 0, 7, '## ');
    expect(result.text).toBe('## Title');
  });

  it('converts a deeper heading to the requested level', () => {
    const result = toggleLinePrefix('### Title', 0, 9, '# ');
    expect(result.text).toBe('# Title');
  });

  it('still toggles off when every line has the exact heading level', () => {
    const result = toggleLinePrefix('## One\n## Two', 0, 13, '## ');
    expect(result.text).toBe('One\nTwo');
  });

  it('toggles off auto-numbered ordered lists, not just literal "1. " lines', () => {
    const result = toggleLinePrefix('1. One\n2. Two', 0, 13, '1. ');
    expect(result.text).toBe('One\nTwo');
  });

  it('converts bullet lists to ordered lists', () => {
    const result = toggleLinePrefix('- One\n- Two', 0, 11, '1. ');
    expect(result.text).toBe('1. One\n1. Two');
  });

  it('converts ordered lists to bullet lists', () => {
    const result = toggleLinePrefix('1. One\n2. Two', 0, 13, '- ');
    expect(result.text).toBe('- One\n- Two');
  });

  it('toggles off asterisk bullets with the bullet prefix', () => {
    const result = toggleLinePrefix('* One\n* Two', 0, 11, '- ');
    expect(result.text).toBe('One\nTwo');
  });

  it('does not nest the quote prefix into a heading', () => {
    const result = toggleLinePrefix('# Title', 0, 7, '> ');
    expect(result.text).toBe('> # Title');
  });
});

describe('insertAtCursor', () => {
  it('inserts text and moves the caret after it', () => {
    const result = insertAtCursor('abef', 2, 'cd');
    expect(result.text).toBe('abcdef');
    expect(result.selectionStart).toBe(4);
    expect(result.selectionEnd).toBe(4);
  });
});
