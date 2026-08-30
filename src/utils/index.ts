// Platform utilities
export {
  PLATFORM_CONFIGS,
  getPlatformConfig,
  calculateCharacterCount,
  getCharacterCountStatus,
} from './platforms';
export type { PlatformConfig, CharacterCountStatus } from './platforms';

// Markdown parsing
export { markdownToHtml, markdownToSocialText, markdownToSocialSegments } from './markdownParser';
export type { FormatStyle, SocialSegment } from './markdownParser';

// Thread splitting
export { splitIntoThread, addThreadIndicators } from './threadSplitter';
export type { ThreadPost, SplitResult } from './threadSplitter';

// Templates
export { PLATFORM_TEMPLATES } from './templates';

// Validation
export { DraftSchema, DraftsArraySchema, validateDrafts, validateSingleDraft } from './validation';
export type { ValidatedDraft } from './validation';

// ID generation
export { generateId } from './id';
