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
  warningThreshold: number; // Percentage at which to show warning
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  linkedin: {
    name: 'LinkedIn',
    characterLimit: 3000,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.85,
  },
  twitter: {
    name: 'Twitter/X',
    characterLimit: 280,
    supportsBold: true, // Unicode bold
    supportsItalic: true, // Unicode italic
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.9,
  },
  instagram: {
    name: 'Instagram',
    characterLimit: 2200,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: false, // Only in bio
    supportsHashtags: true,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.9,
  },
  threads: {
    name: 'Threads',
    characterLimit: 500,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.9,
  },
  mastodon: {
    name: 'Mastodon',
    characterLimit: 500,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.9,
  },
  bluesky: {
    name: 'Bluesky',
    characterLimit: 300,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.85,
  },
  discord: {
    name: 'Discord',
    characterLimit: 2000,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: true,
    supportsHashtags: false,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.9,
  },
  reddit: {
    name: 'Reddit',
    characterLimit: 40000,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: true,
    supportsHashtags: false,
    supportsMentions: true,
    supportsImages: true,
    supportsVideos: true,
    warningThreshold: 0.95,
  },
  youtube: {
    name: 'YouTube',
    characterLimit: 5000,
    supportsBold: true,
    supportsItalic: true,
    supportsLinks: true,
    supportsHashtags: true,
    supportsMentions: true,
    supportsImages: false,
    supportsVideos: false,
    warningThreshold: 0.9,
  },
};

export const getPlatformConfig = (platform: string): PlatformConfig => {
  return PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.linkedin;
};

export const calculateCharacterCount = (text: string, platform: string): number => {
  if (platform === 'twitter') {
    // Twitter counts URLs as 23 characters regardless of actual length
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let count = 0;
    let lastIndex = 0;
    let match;

    while ((match = urlRegex.exec(text)) !== null) {
      count += match.index - lastIndex;
      count += 23; // Twitter URL length
      lastIndex = urlRegex.lastIndex;
    }
    count += text.length - lastIndex;
    return count;
  }

  return text.length;
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
