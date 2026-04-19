// Platform-specific configurations for social media
export interface PlatformConfig {
  name: string;
  characterLimit: number;
  supportsBold: boolean;
  supportsItalic: boolean;
  supportsLinks: boolean;
  supportsHashtags: boolean;
  supportsMentions: boolean;
  supportsImages: boolean;
  supportsVideos: boolean;
  warningThreshold: number;
  /** URL shortener length - if set, URLs count as this many characters instead of actual length */
  urlShortenerLength?: number;
}

// Default configuration for most platforms
const DEFAULT_CONFIG: Omit<PlatformConfig, 'name' | 'characterLimit'> = {
  supportsBold: true,
  supportsItalic: true,
  supportsLinks: true,
  supportsHashtags: true,
  supportsMentions: true,
  supportsImages: true,
  supportsVideos: true,
  warningThreshold: 0.9,
};

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  linkedin: {
    name: 'LinkedIn',
    characterLimit: 3000,
    ...DEFAULT_CONFIG,
    warningThreshold: 0.85,
  },
  twitter: {
    name: 'Twitter/X',
    characterLimit: 280,
    ...DEFAULT_CONFIG,
    warningThreshold: 0.9,
    // Twitter's t.co shortener uses 23 characters for all URLs
    urlShortenerLength: 23,
  },
  instagram: {
    name: 'Instagram',
    characterLimit: 2200,
    ...DEFAULT_CONFIG,
    supportsLinks: false, // Only in bio
  },
  threads: {
    name: 'Threads',
    characterLimit: 500,
    ...DEFAULT_CONFIG,
  },
  mastodon: {
    name: 'Mastodon',
    characterLimit: 500,
    ...DEFAULT_CONFIG,
  },
  bluesky: {
    name: 'Bluesky',
    characterLimit: 300,
    ...DEFAULT_CONFIG,
    warningThreshold: 0.85,
  },
  discord: {
    name: 'Discord',
    characterLimit: 2000,
    ...DEFAULT_CONFIG,
    supportsHashtags: false,
  },
  reddit: {
    name: 'Reddit',
    characterLimit: 40000,
    ...DEFAULT_CONFIG,
    supportsHashtags: false,
  },
  youtube: {
    name: 'YouTube',
    characterLimit: 5000,
    ...DEFAULT_CONFIG,
  },
  facebook: {
    name: 'Facebook',
    characterLimit: 63206,
    ...DEFAULT_CONFIG,
  },
  tiktok: {
    name: 'TikTok',
    characterLimit: 2200,
    ...DEFAULT_CONFIG,
  },
  telegram: {
    name: 'Telegram',
    characterLimit: 4096,
    ...DEFAULT_CONFIG,
  },
};

// Helper function to get platform config
export const getPlatformConfig = (platform: string): PlatformConfig =>
  PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.linkedin;

/**
 * URL regex pattern that excludes trailing punctuation.
 *
 * This regex matches http/https URLs but excludes common punctuation
 * characters (.,;:!?')]}>) that might appear at the end of a URL in text,
 * which are likely sentence terminators rather than part of the URL.
 *
 * Inside the character class [], ']' must be escaped as '\]' but other
 * characters like ')', '>', and ''' do not need escaping.
 *
 * Examples:
 * - "Visit https://example.com." -> matches "https://example.com" (excludes period)
 * - "Check out https://example.com/path!" -> matches "https://example.com/path" (excludes !)
 * - "Link: (https://example.com)" -> matches "https://example.com" (excludes ))
 */
const URL_REGEX = /https?:\/\/[^\s\]>,;:!?'"]+(?:[^\s\]>,;:!?'"]*[^\s\]>,;:!?'"])?/g;

/**
 * Calculates the character count of text, accounting for URL shortening.
 *
 * For platforms with URL shorteners (like Twitter's t.co), URLs are counted
 * as a fixed length rather than their actual character count. For platforms
 * without URL shorteners, URLs are counted at their actual length.
 *
 * @param text - The text to count
 * @param platform - The platform key
 * @returns The effective character count
 */
export const calculateCharacterCount = (text: string, platform: string): number => {
  const config = getPlatformConfig(platform);

  if (!config.supportsLinks) {
    return text.length;
  }

  const urls = text.match(URL_REGEX) || [];
  if (urls.length === 0) {
    return text.length;
  }

  // If platform has a URL shortener (like Twitter's t.co), use the fixed length
  // Otherwise, count URLs at their actual length
  const urlTargetLength = config.urlShortenerLength;

  if (urlTargetLength === undefined) {
    // No URL shortener - count URLs at actual length
    return text.length;
  }

  // Apply URL shortener calculation
  return text.length - urls.reduce((sum, url) => sum + url.length - urlTargetLength, 0);
};

export interface CharacterCountStatus {
  count: number;
  limit: number;
  percentage: number;
  isOver: boolean;
  isWarning: boolean;
}

/**
 * Gets comprehensive character count status for a platform.
 *
 * @param text - The text to analyze
 * @param platform - The platform key
 * @returns Status object with count, limit, percentage, and warning states
 */
export const getCharacterCountStatus = (text: string, platform: string): CharacterCountStatus => {
  const config = getPlatformConfig(platform);
  const count = calculateCharacterCount(text, platform);
  const limit = config.characterLimit;
  const percentage = count / limit;
  const isOver = count > limit;
  const isWarning = percentage >= config.warningThreshold && !isOver;

  return { count, limit, percentage, isOver, isWarning };
};
