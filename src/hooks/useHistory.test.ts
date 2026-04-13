import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistory } from '../hooks/useHistory';

describe('useHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should return empty drafts array initially', () => {
      const { result } = renderHook(() => useHistory());
      expect(result.current.drafts).toEqual([]);
    });

    it('should load drafts from localStorage on mount', () => {
      const savedDrafts = [
        { id: '1', markdown: 'Draft 1', updatedAt: Date.now() },
        { id: '2', markdown: 'Draft 2', updatedAt: Date.now() - 1000 },
      ];
      vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify(savedDrafts));

      renderHook(() => useHistory());

      expect(localStorage.getItem).toHaveBeenCalledWith('md-to-social-drafts');
    });

    it('should handle invalid localStorage data gracefully', () => {
      vi.mocked(localStorage.getItem).mockReturnValueOnce('invalid json');

      const { result } = renderHook(() => useHistory());
      expect(result.current.drafts).toEqual([]);
    });

    it('should handle empty localStorage', () => {
      vi.mocked(localStorage.getItem).mockReturnValueOnce(null);

      const { result } = renderHook(() => useHistory());
      expect(result.current.drafts).toEqual([]);
    });
  });

  describe('saveDraft', () => {
    it('should save a new draft', () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('New draft content');
      });

      expect(result.current.drafts).toHaveLength(1);
      expect(result.current.drafts[0].markdown).toBe('New draft content');
      expect(result.current.drafts[0].id).toBeDefined();
      expect(result.current.drafts[0].updatedAt).toBeDefined();
    });

    it('should not save empty or whitespace-only drafts', () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('');
      });

      act(() => {
        result.current.saveDraft('   ');
      });

      act(() => {
        result.current.saveDraft('\n\n');
      });

      expect(result.current.drafts).toHaveLength(0);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not save duplicate of most recent draft', () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('Same content');
      });

      expect(result.current.drafts).toHaveLength(1);
      const firstId = result.current.drafts[0].id;

      // Try to save identical content
      act(() => {
        result.current.saveDraft('Same content');
      });

      // Should still be 1 draft with same ID
      expect(result.current.drafts).toHaveLength(1);
      expect(result.current.drafts[0].id).toBe(firstId);
    });

    it('should save if content differs from most recent draft', () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('First content');
      });

      act(() => {
        result.current.saveDraft('Different content');
      });

      expect(result.current.drafts).toHaveLength(2);
    });

    it('should persist drafts to localStorage', () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('Draft to save');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('md-to-social-drafts', expect.any(String));
    });

    it('should add new drafts at the beginning of the array', () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('First draft');
      });

      act(() => {
        result.current.saveDraft('Second draft');
      });

      expect(result.current.drafts).toHaveLength(2);
      expect(result.current.drafts[0].markdown).toBe('Second draft');
      expect(result.current.drafts[1].markdown).toBe('First draft');
    });

    it('should limit drafts to 20 items', () => {
      const { result } = renderHook(() => useHistory());

      // Save 22 drafts
      for (let i = 0; i < 22; i++) {
        act(() => {
          result.current.saveDraft(`Draft ${i}`);
        });
      }

      expect(result.current.drafts).toHaveLength(20);
      // Most recent should be kept (Draft 21, 20, 19...)
      expect(result.current.drafts[0].markdown).toBe('Draft 21');
    });

    it('should generate unique IDs for each draft', async () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('Draft 1');
      });

      // Wait for next tick to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      act(() => {
        result.current.saveDraft('Draft 2');
      });

      const ids = result.current.drafts.map((d) => d.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should set updatedAt to current timestamp', () => {
      const beforeSave = Date.now();
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('Draft with timestamp');
      });

      const afterSave = Date.now();
      const draft = result.current.drafts[0];

      expect(draft.updatedAt).toBeGreaterThanOrEqual(beforeSave);
      expect(draft.updatedAt).toBeLessThanOrEqual(afterSave);
    });
  });

  describe('draft structure', () => {
    it('should maintain correct Draft interface structure', () => {
      const { result } = renderHook(() => useHistory());

      act(() => {
        result.current.saveDraft('Test content');
      });

      const draft = result.current.drafts[0];
      expect(draft).toHaveProperty('id');
      expect(draft).toHaveProperty('markdown');
      expect(draft).toHaveProperty('updatedAt');
      expect(typeof draft.id).toBe('string');
      expect(typeof draft.markdown).toBe('string');
      expect(typeof draft.updatedAt).toBe('number');
    });
  });
});

describe('error handling', () => {
  it('should handle localStorage quota exceeded error gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock setItem to throw QuotaExceededError
    const quotaError = new Error('QuotaExceededError');
    quotaError.name = 'QuotaExceededError';
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw quotaError;
    });

    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.saveDraft('Draft that will fail to persist');
    });

    // Draft should still be in state even if localStorage fails
    expect(result.current.drafts).toHaveLength(1);
    expect(result.current.drafts[0].markdown).toBe('Draft that will fail to persist');

    // Should log warning
    expect(consoleSpy).toHaveBeenCalledWith('Failed to save draft to localStorage:', quotaError);

    consoleSpy.mockRestore();
  });

  it('should handle localStorage being unavailable', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock setItem to throw (localStorage disabled)
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('localStorage is not available');
    });

    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.saveDraft('Draft content');
    });

    // Draft should still be added to state
    expect(result.current.drafts).toHaveLength(1);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not throw when localStorage fails', () => {
    vi.mocked(localStorage.setItem).mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const { result } = renderHook(() => useHistory());

    // Should not throw
    expect(() => {
      act(() => {
        result.current.saveDraft('Draft content');
      });
    }).not.toThrow();
  });
});

describe('ID generation', () => {
  it('should generate unique IDs using crypto.randomUUID', async () => {
    const { result } = renderHook(() => useHistory());

    act(() => {
      result.current.saveDraft('Draft 1');
    });

    // Save immediately again to test uniqueness
    act(() => {
      result.current.saveDraft('Draft 2');
    });

    const ids = result.current.drafts.map((d) => d.id);

    // All IDs should be unique
    expect(new Set(ids).size).toBe(ids.length);

    // IDs should be valid UUID format (contains dashes)
    ids.forEach((id) => {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  it('should generate different IDs even when saved in rapid succession', () => {
    const { result } = renderHook(() => useHistory());

    // Save 5 drafts as fast as possible
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.saveDraft(`Draft ${i}`);
      });
    }

    const ids = result.current.drafts.map((d) => d.id);
    expect(new Set(ids).size).toBe(5); // All 5 should be unique
  });
});
