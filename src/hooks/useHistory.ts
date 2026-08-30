import { useState, useEffect, useCallback, useRef } from 'react';
import { generateId } from '../utils';
import { validateDrafts, type ValidatedDraft } from '../utils/validation';

export type Draft = ValidatedDraft;

export interface UseHistoryReturn {
  drafts: Draft[];
  saveDraft: (markdown: string) => void;
  loadError: string | null;
  clearLoadError: () => void;
}

// Maximum number of drafts to keep in history
const MAX_DRAFTS = 20;

// Storage key for drafts
const STORAGE_KEY = 'marksocial-drafts';

const isQuotaError = (e: unknown): boolean =>
  e instanceof Error && (e.name === 'QuotaExceededError' || e.message.includes('quota'));

/**
 * Attempts to save drafts to localStorage with auto-trimming on quota exceeded.
 * Will progressively reduce the number of drafts until save succeeds or minimum is reached.
 *
 * @param drafts - Array of drafts to save
 * @param minDrafts - Minimum number of drafts to try (default: 1, just the newest)
 * @returns Number of drafts actually saved, or null if failed
 */
function trySaveWithTrimming(drafts: Draft[], minDrafts = 1): number | null {
  let count = drafts.length;

  while (count >= minDrafts) {
    const toSave = drafts.slice(0, count);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      return count;
    } catch (e) {
      if (!isQuotaError(e) || count <= minDrafts) {
        throw e; // Re-throw non-quota errors or when we can't trim further
      }
      // Reduce by half (but not below minDrafts) and retry
      count = Math.max(minDrafts, Math.floor(count / 2));
      console.warn(`[useHistory] Quota exceeded, trying with ${count} drafts`);
    }
  }

  return null; // Failed even with minimum drafts
}

/**
 * Custom hook for managing draft history in localStorage.
 *
 * Note: Size checking relies on the browser's actual quota enforcement
 * via try/catch, as localStorage limits vary by browser (typically 5-10MB total).
 * This approach is more reliable than pre-calculating size, which can be
 * inaccurate due to UTF-16 encoding, compression, and browser-specific storage mechanics.
 */
export function useHistory(): UseHistoryReturn {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Use a ref to track latest drafts for duplicate check without adding dependency
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = validateDrafts(parsed);

        if (validated) {
          setDrafts(validated);
        } else {
          setLoadError('Saved drafts data is corrupted. History will reset on next save.');
        }
      }
    } catch {
      setLoadError('Failed to load saved drafts. Storage may be corrupted or unavailable.');
    }
  }, []);

  const saveDraft = useCallback(
    (markdown: string) => {
      if (!markdown.trim()) return;

      setDrafts((prev) => {
        // Don't save if identical to most recent draft
        if (prev[0]?.markdown === markdown) return prev;

        const newDraft: Draft = {
          id: generateId(),
          markdown,
          updatedAt: Date.now(),
        };

        // Keep only last N drafts
        const next = [newDraft, ...prev].slice(0, MAX_DRAFTS);

        try {
          const savedCount = trySaveWithTrimming(next, 1);

          if (savedCount !== null) {
            // Clear any previous error on success - use setTimeout to avoid setState in render
            if (loadError) {
              setTimeout(() => setLoadError(null), 0);
            }

            // If we had to trim drafts, return the trimmed array
            if (savedCount < next.length) {
              console.warn(
                `[useHistory] Trimmed drafts from ${next.length} to ${savedCount} due to storage limits`
              );
              return next.slice(0, savedCount);
            }
          }
        } catch (e) {
          // localStorage is not available or quota exceeded even with minimum
          let errorMsg: string;

          if (e instanceof Error) {
            if (e.name === 'QuotaExceededError' || e.message.includes('quota')) {
              errorMsg =
                'Storage is full. Cannot save even a single draft. Try clearing browser data.';
            } else if (e.name === 'SecurityError' || e.message.includes('secure')) {
              errorMsg = 'Storage access blocked. Check browser privacy settings.';
            } else {
              errorMsg = `Save failed: ${e.message}`;
            }
          } else {
            errorMsg = 'Storage unavailable or quota exceeded. Your draft was not saved.';
          }

          // Schedule error update outside of render cycle
          setTimeout(() => setLoadError(`Failed to save draft: ${errorMsg}`), 0);
          console.warn('[useHistory] Failed to save draft to localStorage:', e);
        }

        // Always return next so UI reflects the draft even if storage failed
        return next;
      });
    },
    [loadError]
  ); // Only depend on loadError for the cleanup logic

  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  return { drafts, saveDraft, loadError, clearLoadError };
}
