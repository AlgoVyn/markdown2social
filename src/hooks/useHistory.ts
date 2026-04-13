import { useState, useEffect, useCallback } from 'react';

export interface Draft {
  id: string;
  markdown: string;
  updatedAt: number;
}

export interface UseHistoryReturn {
  drafts: Draft[];
  saveDraft: (markdown: string) => void;
  loadError: string | null;
  clearLoadError: () => void;
}

// Generate unique ID with fallback for older browsers
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Calculate approximate size of draft data in bytes
const calculateDraftSize = (drafts: Draft[]): number => {
  const jsonString = JSON.stringify(drafts);
  // UTF-16 is used by JavaScript internally, but localStorage stores UTF-16
  // Each char is approximately 2 bytes in UTF-16
  return jsonString.length * 2;
};

// Maximum size for drafts storage (4MB to leave room for other data)
const MAX_STORAGE_SIZE = 4 * 1024 * 1024;

export function useHistory(): UseHistoryReturn {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('md-to-social-drafts');
      if (saved) {
        const parsed = JSON.parse(saved);
        setDrafts(parsed);
      }
    } catch {
      setLoadError('Failed to load saved drafts. Storage may be corrupted.');
    }
  }, []);

  const saveDraft = useCallback((markdown: string) => {
    if (!markdown.trim()) return;

    setDrafts((prev) => {
      // Don't save if identical to most recent draft
      if (prev[0]?.markdown === markdown) return prev;

      const newDraft: Draft = {
        id: generateId(),
        markdown,
        updatedAt: Date.now(),
      };

      // Keep only last 20
      const next = [newDraft, ...prev].slice(0, 20);

      // Check size before attempting to save
      const draftSize = calculateDraftSize(next);
      if (draftSize > MAX_STORAGE_SIZE) {
        const errorMsg = `Draft is too large (${Math.round(draftSize / 1024)}KB). Maximum is ${MAX_STORAGE_SIZE / 1024 / 1024}MB.`;
        setLoadError(`Failed to save draft: ${errorMsg}`);
        console.warn('Draft size exceeds limit:', draftSize);
        return prev; // Return previous state without the new draft
      }

      try {
        localStorage.setItem('md-to-social-drafts', JSON.stringify(next));
        setLoadError(null); // Clear any previous error on success
      } catch (e) {
        // localStorage is not available or quota exceeded
        const errorMsg = e instanceof Error ? e.message : 'Storage quota exceeded or unavailable';
        setLoadError(`Failed to save draft: ${errorMsg}`);
        console.warn('Failed to save draft to localStorage:', e);
      }
      return next;
    });
  }, []);

  const clearLoadError = useCallback(() => {
    setLoadError(null);
  }, []);

  return { drafts, saveDraft, loadError, clearLoadError };
}
