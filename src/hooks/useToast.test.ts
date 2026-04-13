import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addToast', () => {
    it('should add a toast with success type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Success message', 'success');
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Success message');
      expect(result.current.toasts[0].type).toBe('success');
    });

    it('should add a toast with error type', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Error message', 'error');
      });

      expect(result.current.toasts[0].type).toBe('error');
    });

    it('should add a toast with info type by default', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Info message');
      });

      expect(result.current.toasts[0].type).toBe('info');
    });

    it('should generate UUID for toast id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message');
      });

      const toastId = result.current.toasts[0].id;

      // Should be valid UUID format
      expect(toastId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs for multiple toasts', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('First');
        result.current.addToast('Second');
        result.current.addToast('Third');
      });

      const ids = result.current.toasts.map((t) => t.id);
      expect(new Set(ids).size).toBe(3); // All unique
    });

    it('should return the toast id', () => {
      const { result } = renderHook(() => useToast());

      let toastId: string;
      act(() => {
        toastId = result.current.addToast('Test');
      });

      expect(toastId!).toBe(result.current.toasts[0].id);
    });

    it('should auto-remove toast after 3 seconds', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message');
      });

      expect(result.current.toasts).toHaveLength(1);

      // Fast-forward 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not remove toast before 3 seconds', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test message');
      });

      // Fast-forward 2.9 seconds
      act(() => {
        vi.advanceTimersByTime(2999);
      });

      expect(result.current.toasts).toHaveLength(1);
    });

    it('should handle multiple toasts with different timers', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('First');
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      act(() => {
        result.current.addToast('Second');
      });

      expect(result.current.toasts).toHaveLength(2);

      // Advance 2 more seconds (first toast should be removed, second should remain)
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Second');
    });
  });

  describe('removeToast', () => {
    it('should remove toast by id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('First');
        result.current.addToast('Second');
      });

      const firstId = result.current.toasts[0].id;

      act(() => {
        result.current.removeToast(firstId);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].message).toBe('Second');
    });

    it('should not throw when removing non-existent id', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test');
      });

      expect(() => {
        act(() => {
          result.current.removeToast('non-existent-id');
        });
      }).not.toThrow();

      expect(result.current.toasts).toHaveLength(1);
    });

    it('should clear all toasts when all ids are removed', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        const id1 = result.current.addToast('First');
        const id2 = result.current.addToast('Second');
        result.current.removeToast(id1);
        result.current.removeToast(id2);
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  describe('initial state', () => {
    it('should start with empty toasts array', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.toasts).toEqual([]);
    });
  });

  describe('ID uniqueness with crypto.randomUUID', () => {
    it('should never generate duplicate IDs even with rapid calls', () => {
      const { result } = renderHook(() => useToast());
      const ids: string[] = [];

      // Add 50 toasts as fast as possible
      act(() => {
        for (let i = 0; i < 50; i++) {
          const id = result.current.addToast(`Toast ${i}`);
          ids.push(id);
        }
      });

      // All 50 should be unique
      expect(new Set(ids).size).toBe(50);
    });

    it('should produce valid UUID v4 format', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.addToast('Test');
      });

      const id = result.current.toasts[0].id;

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      // where y is 8, 9, a, or b
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });
});
