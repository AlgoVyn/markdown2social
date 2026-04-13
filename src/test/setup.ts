import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

// Mock alert
window.alert = vi.fn();

// Mock getClientRects for CodeMirror
const originalCreateRange = document.createRange.bind(document);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(document as any).createRange = () => {
  const range = originalCreateRange();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (range as any).getClientRects = () => ({
    length: 0,
    item: () => null,
    [Symbol.iterator]: function* () {},
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (range as any).getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => '',
  });
  return range;
};

// Mock getSelection for CodeMirror
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: vi.fn().mockReturnValue({
    getRangeAt: vi.fn().mockReturnValue({
      getClientRects: vi.fn().mockReturnValue([]),
      getBoundingClientRect: vi.fn().mockReturnValue({}),
    }),
    addRange: vi.fn(),
    removeAllRanges: vi.fn(),
  }),
});
