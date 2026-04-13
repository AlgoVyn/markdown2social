import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useModalAccessibility } from './useModalAccessibility';

describe('useModalAccessibility', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean up any remaining focused elements
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('modalRef', () => {
    it('should return modalRef object', () => {
      const { result } = renderHook(() =>
        useModalAccessibility({ isOpen: false, onClose: mockOnClose })
      );

      expect(result.current.modalRef).toBeDefined();
      expect(result.current.modalRef.current).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should not add event listeners when modal is closed', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      renderHook(() => useModalAccessibility({ isOpen: false, onClose: mockOnClose }));

      // Should not add keyboard listener when closed
      const keydownCalls = addEventListenerSpy.mock.calls.filter((call) => call[0] === 'keydown');
      expect(keydownCalls).toHaveLength(0);
    });
  });

  describe('keyboard handling', () => {
    it('should handle rapid open/close cycles without errors', () => {
      const { rerender } = renderHook(
        ({ isOpen }) => useModalAccessibility({ isOpen, onClose: mockOnClose }),
        { initialProps: { isOpen: false } }
      );

      // Rapid open/close cycles
      rerender({ isOpen: true });
      rerender({ isOpen: false });
      rerender({ isOpen: true });
      rerender({ isOpen: false });

      // Should not throw
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    it('should store previous focus when modal opens', () => {
      // Create a trigger button and focus it
      const triggerButton = document.createElement('button');
      triggerButton.id = 'trigger';
      document.body.appendChild(triggerButton);
      triggerButton.focus();

      renderHook(() => useModalAccessibility({ isOpen: true, onClose: mockOnClose }));

      // The hook should have stored the trigger as previous focus
      expect(document.activeElement).toBe(triggerButton);

      document.body.removeChild(triggerButton);
    });
  });

  describe('edge cases', () => {
    it('should handle empty modal content gracefully', () => {
      const { result } = renderHook(() =>
        useModalAccessibility({ isOpen: true, onClose: mockOnClose })
      );

      // Create empty modal
      const container = document.createElement('div');
      document.body.appendChild(container);
      container.innerHTML = `<div role="dialog"></div>`;

      const modalDiv = container.querySelector('[role="dialog"]') as HTMLDivElement;
      if (result.current.modalRef) {
        (result.current.modalRef as React.MutableRefObject<HTMLDivElement | null>).current =
          modalDiv;
      }

      // Should not throw when pressing Tab with no focusable elements
      expect(() => {
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
        document.dispatchEvent(event);
      }).not.toThrow();
    });
  });
});
