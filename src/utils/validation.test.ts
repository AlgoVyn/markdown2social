import { describe, it, expect } from 'vitest';
import { DraftSchema, DraftsArraySchema, validateDrafts, validateSingleDraft } from './validation';

describe('DraftSchema', () => {
  it('should validate a correct draft', () => {
    const draft = {
      id: 'valid-id-123',
      markdown: 'Hello world',
      updatedAt: Date.now(),
    };
    expect(DraftSchema.safeParse(draft).success).toBe(true);
  });

  it('should reject empty id', () => {
    const draft = {
      id: '',
      markdown: 'Hello world',
      updatedAt: Date.now(),
    };
    expect(DraftSchema.safeParse(draft).success).toBe(false);
  });

  it('should reject missing id', () => {
    const draft = {
      markdown: 'Hello world',
      updatedAt: Date.now(),
    };
    expect(DraftSchema.safeParse(draft).success).toBe(false);
  });

  it('should reject negative updatedAt', () => {
    const draft = {
      id: 'valid-id',
      markdown: 'Hello',
      updatedAt: -1,
    };
    expect(DraftSchema.safeParse(draft).success).toBe(false);
  });

  it('should accept string markdown', () => {
    const draft = {
      id: 'valid-id',
      markdown: '',
      updatedAt: Date.now(),
    };
    expect(DraftSchema.safeParse(draft).success).toBe(true);
  });

  it('should reject non-string markdown', () => {
    const draft = {
      id: 'valid-id',
      markdown: 123,
      updatedAt: Date.now(),
    };
    expect(DraftSchema.safeParse(draft).success).toBe(false);
  });
});

describe('DraftsArraySchema', () => {
  it('should validate an array of drafts', () => {
    const drafts = [
      { id: '1', markdown: 'First', updatedAt: 1000 },
      { id: '2', markdown: 'Second', updatedAt: 2000 },
    ];
    expect(DraftsArraySchema.safeParse(drafts).success).toBe(true);
  });

  it('should validate empty array', () => {
    expect(DraftsArraySchema.safeParse([]).success).toBe(true);
  });

  it('should reject non-array', () => {
    expect(DraftsArraySchema.safeParse({}).success).toBe(false);
    expect(DraftsArraySchema.safeParse('string').success).toBe(false);
    expect(DraftsArraySchema.safeParse(123).success).toBe(false);
  });

  it('should reject array with invalid draft', () => {
    const drafts = [
      { id: '1', markdown: 'First', updatedAt: 1000 },
      { id: '', markdown: 'Second', updatedAt: 2000 }, // Invalid
    ];
    expect(DraftsArraySchema.safeParse(drafts).success).toBe(false);
  });
});

describe('validateDrafts', () => {
  it('should return validated drafts for valid data', () => {
    const drafts = [
      { id: '1', markdown: 'First', updatedAt: 1000 },
      { id: '2', markdown: 'Second', updatedAt: 2000 },
    ];
    const result = validateDrafts(drafts);
    expect(result).toHaveLength(2);
    expect(result?.[0].id).toBe('1');
  });

  it('should return null for invalid data', () => {
    expect(validateDrafts([{ id: '', markdown: '', updatedAt: -1 }])).toBeNull();
  });

  it('should return null for non-array', () => {
    expect(validateDrafts({})).toBeNull();
    expect(validateDrafts('string')).toBeNull();
  });

  it('should return empty array for empty input', () => {
    expect(validateDrafts([])).toEqual([]);
  });

  it('should handle null input', () => {
    expect(validateDrafts(null)).toBeNull();
  });

  it('should handle undefined input', () => {
    expect(validateDrafts(undefined)).toBeNull();
  });
});

describe('validateSingleDraft', () => {
  it('should return validated draft for valid data', () => {
    const draft = { id: '1', markdown: 'Hello', updatedAt: 1000 };
    const result = validateSingleDraft(draft);
    expect(result).toEqual(draft);
  });

  it('should return null for invalid data', () => {
    expect(validateSingleDraft({ id: '', markdown: '', updatedAt: -1 })).toBeNull();
  });

  it('should return null for non-object', () => {
    expect(validateSingleDraft('string')).toBeNull();
    expect(validateSingleDraft(123)).toBeNull();
  });

  it('should return null for null input', () => {
    expect(validateSingleDraft(null)).toBeNull();
  });
});
