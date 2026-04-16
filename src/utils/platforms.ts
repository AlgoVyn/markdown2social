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

// Helper function to calculate character count considering URLs
export const calculateCharacterCount = (text: string, platform: string): number => {
  const config = getPlatformConfig(platform);

  if (!config.supportsLinks) {
    return text.length;
  }

  const urls = text.match(/https?:\/\/[^\s]+/g) || [];
  if (urls.length === 0) {
    return text.length;
  }

  // Twitter counts all URLs as 23 characters
  const urlPlaceholderLength = 23;
  return text.length - urls.reduce((sum, url) => sum + url.length - urlPlaceholderLength, 0);
};

export const getCharacterCountStatus = (
  text: string,
  platform: string
): { count: number; limit: number; percentage: number; isOver: boolean; isWarning: boolean } => {
  const config = getPlatformConfig(platform);
  const count = calculateCharacterCount(text, platform);
  const limit = config.characterLimit;
  const percentage = count / limit;
  const isOver = count > limit;
  const isWarning = percentage >= config.warningThreshold && !isOver;

  return { count, limit, percentage, isOver, isWarning };
};
