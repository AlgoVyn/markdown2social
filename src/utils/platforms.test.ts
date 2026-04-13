import { describe, it, expect } from 'vitest';
import {
  PLATFORM_CONFIGS,
  getPlatformConfig,
  calculateCharacterCount,
  getCharacterCountStatus,
  PlatformConfig,
} from './platforms';

describe('PLATFORM_CONFIGS', () => {
  it('should contain all supported platforms', () => {
    expect(PLATFORM_CONFIGS).toHaveProperty('linkedin');
    expect(PLATFORM_CONFIGS).toHaveProperty('twitter');
    expect(PLATFORM_CONFIGS).toHaveProperty('instagram');
    expect(PLATFORM_CONFIGS).toHaveProperty('threads');
    expect(PLATFORM_CONFIGS).toHaveProperty('mastodon');
    expect(PLATFORM_CONFIGS).toHaveProperty('bluesky');
    expect(PLATFORM_CONFIGS).toHaveProperty('discord');
    expect(PLATFORM_CONFIGS).toHaveProperty('reddit');
    expect(PLATFORM_CONFIGS).toHaveProperty('youtube');
  });

  it('should have correct character limits', () => {
    expect(PLATFORM_CONFIGS.twitter.characterLimit).toBe(280);
    expect(PLATFORM_CONFIGS.bluesky.characterLimit).toBe(300);
    expect(PLATFORM_CONFIGS.threads.characterLimit).toBe(500);
    expect(PLATFORM_CONFIGS.mastodon.characterLimit).toBe(500);
    expect(PLATFORM_CONFIGS.linkedin.characterLimit).toBe(3000);
    expect(PLATFORM_CONFIGS.instagram.characterLimit).toBe(2200);
    expect(PLATFORM_CONFIGS.discord.characterLimit).toBe(2000);
    expect(PLATFORM_CONFIGS.youtube.characterLimit).toBe(5000);
    expect(PLATFORM_CONFIGS.reddit.characterLimit).toBe(40000);
  });

  it('should have correct platform names', () => {
    expect(PLATFORM_CONFIGS.twitter.name).toBe('Twitter/X');
    expect(PLATFORM_CONFIGS.linkedin.name).toBe('LinkedIn');
    expect(PLATFORM_CONFIGS.instagram.name).toBe('Instagram');
    expect(PLATFORM_CONFIGS.threads.name).toBe('Threads');
    expect(PLATFORM_CONFIGS.mastodon.name).toBe('Mastodon');
    expect(PLATFORM_CONFIGS.bluesky.name).toBe('Bluesky');
    expect(PLATFORM_CONFIGS.discord.name).toBe('Discord');
    expect(PLATFORM_CONFIGS.reddit.name).toBe('Reddit');
    expect(PLATFORM_CONFIGS.youtube.name).toBe('YouTube');
  });

  it('should have valid warning thresholds', () => {
    Object.values(PLATFORM_CONFIGS).forEach((config: PlatformConfig) => {
      expect(config.warningThreshold).toBeGreaterThan(0);
      expect(config.warningThreshold).toBeLessThanOrEqual(1);
    });
  });

  it('should correctly identify platform features', () => {
    // Instagram doesn't support links (only in bio)
    expect(PLATFORM_CONFIGS.instagram.supportsLinks).toBe(false);

    // Discord and Reddit don't support hashtags
    expect(PLATFORM_CONFIGS.discord.supportsHashtags).toBe(false);
    expect(PLATFORM_CONFIGS.reddit.supportsHashtags).toBe(false);

    // All platforms should support bold/italic (via Unicode)
    Object.values(PLATFORM_CONFIGS).forEach((config: PlatformConfig) => {
      expect(config.supportsBold).toBe(true);
      expect(config.supportsItalic).toBe(true);
    });
  });
});

describe('getPlatformConfig', () => {
  it('should return config for valid platform', () => {
    const config = getPlatformConfig('twitter');
    expect(config.name).toBe('Twitter/X');
    expect(config.characterLimit).toBe(280);
  });

  it('should return LinkedIn config for invalid platform', () => {
    const config = getPlatformConfig('unknown-platform');
    expect(config.name).toBe('LinkedIn');
    expect(config.characterLimit).toBe(3000);
  });

  it('should return default for empty string', () => {
    const config = getPlatformConfig('');
    expect(config.name).toBe('LinkedIn');
  });
});

describe('calculateCharacterCount', () => {
  it('should return text length for non-Twitter platforms', () => {
    const text = 'Hello world';
    expect(calculateCharacterCount(text, 'linkedin')).toBe(11);
    expect(calculateCharacterCount(text, 'instagram')).toBe(11);
    expect(calculateCharacterCount(text, 'discord')).toBe(11);
  });

  it('should count URLs as 23 characters on Twitter', () => {
    const text = 'Check out https://example.com/some/long/url';
    const count = calculateCharacterCount(text, 'twitter');
    // "Check out " = 10 chars + 23 for URL = 33 total
    expect(count).toBe(33);
  });

  it('should handle multiple URLs on Twitter', () => {
    const text = 'Visit https://a.com and https://b.com';
    const count = calculateCharacterCount(text, 'twitter');
    // "Visit " = 6 + 23 + " and " = 5 + 23 = 57 total
    expect(count).toBe(57);
  });

  it('should handle text with no URLs on Twitter', () => {
    const text = 'Just plain text without links';
    expect(calculateCharacterCount(text, 'twitter')).toBe(29);
  });

  it('should handle empty text', () => {
    expect(calculateCharacterCount('', 'twitter')).toBe(0);
    expect(calculateCharacterCount('', 'linkedin')).toBe(0);
  });

  it('should handle very long URLs on Twitter', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(1000);
    const text = `Link: ${longUrl}`;
    const count = calculateCharacterCount(text, 'twitter');
    // "Link: " = 6 + 23 = 29 total
    expect(count).toBe(29);
  });

  it('should handle URLs at different positions', () => {
    const text = 'https://first.com middle https://second.com';
    const count = calculateCharacterCount(text, 'twitter');
    // 23 + " middle " = 8 + 23 = 54 total
    expect(count).toBe(54);
  });
});

describe('getCharacterCountStatus', () => {
  it('should return ok status when under limit', () => {
    const status = getCharacterCountStatus('Hello', 'twitter');
    expect(status.count).toBe(5);
    expect(status.limit).toBe(280);
    expect(status.percentage).toBe(5 / 280);
    expect(status.isOver).toBe(false);
    expect(status.isWarning).toBe(false);
  });

  it('should return over status when exceeding limit', () => {
    const longText = 'a'.repeat(300);
    const status = getCharacterCountStatus(longText, 'twitter');
    expect(status.count).toBe(300);
    expect(status.isOver).toBe(true);
    expect(status.isWarning).toBe(false);
    expect(status.percentage).toBe(300 / 280);
  });

  it('should return warning status near limit', () => {
    // Twitter warning threshold is 0.9 (252 chars)
    const text = 'a'.repeat(260);
    const status = getCharacterCountStatus(text, 'twitter');
    expect(status.isWarning).toBe(true);
    expect(status.isOver).toBe(false);
  });

  it('should not show warning when well under limit', () => {
    const text = 'a'.repeat(200); // 200/280 = 71%, below 90% threshold
    const status = getCharacterCountStatus(text, 'twitter');
    expect(status.isWarning).toBe(false);
    expect(status.isOver).toBe(false);
  });

  it('should handle exact limit boundary', () => {
    const text = 'a'.repeat(280);
    const status = getCharacterCountStatus(text, 'twitter');
    expect(status.isOver).toBe(false);
    expect(status.percentage).toBe(1);
  });

  it('should calculate correct percentage', () => {
    const status = getCharacterCountStatus('a'.repeat(140), 'twitter');
    expect(status.percentage).toBe(0.5);
  });

  it('should handle different platforms correctly', () => {
    const text = 'a'.repeat(500);

    const twitterStatus = getCharacterCountStatus(text, 'twitter');
    expect(twitterStatus.isOver).toBe(true); // 500 > 280

    const linkedinStatus = getCharacterCountStatus(text, 'linkedin');
    expect(linkedinStatus.isOver).toBe(false); // 500 < 3000

    const mastodonStatus = getCharacterCountStatus(text, 'mastodon');
    expect(mastodonStatus.isOver).toBe(false); // 500 = 500
  });

  it('should handle URLs in character count status for Twitter', () => {
    const text = 'a'.repeat(250) + ' https://example.com/some/long/url/path';
    const status = getCharacterCountStatus(text, 'twitter');
    // 250 + 1 space + 23 for URL = 274, which is over 90% of 280
    expect(status.isWarning).toBe(true);
    expect(status.isOver).toBe(false);
  });
});
