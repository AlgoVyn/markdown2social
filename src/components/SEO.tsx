import { useEffect } from 'react';
import { PLATFORM_CONFIGS } from '../utils/platforms';

interface SEOProps {
  platform: string;
}

// Platform-specific SEO metadata - aligned with PLATFORM_CONFIGS
const PLATFORM_SEO: Record<string, { title: string; description: string; keywords: string }> = {
  linkedin: {
    title: 'LinkedIn Post Formatter - Markdown to LinkedIn Converter | Markdown2Social',
    description:
      'Convert Markdown to perfectly formatted LinkedIn posts. Auto-format bold, italic, lists, and links for professional networking content. Free online tool with live preview.',
    keywords:
      'linkedin formatter, linkedin post generator, markdown to linkedin, linkedin content tool, professional networking posts, linkedin text formatting, bold linkedin text',
  },
  twitter: {
    title: 'Twitter/X Post Formatter - Markdown to Tweet Converter | Markdown2Social',
    description:
      'Convert Markdown to Twitter/X posts with character counting. Format threads, bold text, and links. Stay within the 280 character limit. Free online tool with thread splitting.',
    keywords:
      'twitter formatter, tweet generator, markdown to twitter, twitter thread maker, X post formatter, character counter, twitter bold text, twitter thread splitter',
  },
  instagram: {
    title: 'Instagram Caption Formatter - Markdown to Instagram Converter | Markdown2Social',
    description:
      'Convert Markdown to Instagram captions with proper formatting. Bold text, lists, and hashtags for engaging social media content. Free online tool with 2,200 character support.',
    keywords:
      'instagram caption formatter, instagram post generator, markdown to instagram, caption maker, instagram content tool, bold instagram caption, instagram formatting',
  },
  threads: {
    title: 'Threads Post Formatter - Markdown to Threads Converter | Markdown2Social',
    description:
      "Convert Markdown to Threads posts with 500 character limit tracking. Format text for Meta's text-based social platform. Free online tool with live preview.",
    keywords:
      'threads formatter, threads post generator, markdown to threads, meta threads tool, threads character counter, bold threads text',
  },
  mastodon: {
    title: 'Mastodon Post Formatter - Markdown to Mastodon Converter | Markdown2Social',
    description:
      'Convert Markdown to Mastodon toots with 500 character limit. Format posts for the decentralized social network. Free online tool for fediverse content.',
    keywords:
      'mastodon formatter, toot generator, markdown to mastodon, fediverse tool, decentralized social media, mastodon bold text',
  },
  bluesky: {
    title: 'Bluesky Post Formatter - Markdown to Bluesky Converter | Markdown2Social',
    description:
      'Convert Markdown to Bluesky posts with 300 character limit tracking. Format content for the AT Protocol social network. Free online tool with live preview.',
    keywords:
      'bluesky formatter, bluesky post generator, markdown to bluesky, at protocol, bluesky character counter, bold bluesky text',
  },
  discord: {
    title: 'Discord Message Formatter - Markdown to Discord Converter | Markdown2Social',
    description:
      'Convert Markdown to Discord messages with proper formatting. Bold, italic, code blocks, and mentions for Discord communities. Free online tool for 2,000 character messages.',
    keywords:
      'discord formatter, discord message generator, markdown to discord, discord text formatting, community chat tool, discord markdown, discord bold text',
  },
  reddit: {
    title: 'Reddit Post Formatter - Markdown to Reddit Converter | Markdown2Social',
    description:
      'Convert Markdown to Reddit posts and comments. Format text for subreddit submissions with proper styling. Free online tool with 40,000 character support.',
    keywords:
      'reddit formatter, reddit post generator, markdown to reddit, subreddit tool, reddit content formatter, reddit bold text',
  },
  youtube: {
    title: 'YouTube Description Formatter - Markdown to YouTube Converter | Markdown2Social',
    description:
      'Convert Markdown to YouTube video descriptions. Format timestamps, links, and styled text for video content. Free online tool with 5,000 character support.',
    keywords:
      'youtube description formatter, youtube video tool, markdown to youtube, video description generator, youtube seo, youtube timestamps',
  },
  facebook: {
    title: 'Facebook Post Formatter - Markdown to Facebook Converter | Markdown2Social',
    description:
      'Convert Markdown to Facebook posts with proper formatting. Bold, italic, lists, and links for engaging social media content. Free online tool with 63,206 character support.',
    keywords:
      'facebook formatter, facebook post generator, markdown to facebook, social media tool, facebook content creator, bold facebook text',
  },
  tiktok: {
    title: 'TikTok Caption Formatter - Markdown to TikTok Converter | Markdown2Social',
    description:
      'Convert Markdown to TikTok captions with formatting. Bold text, hashtags, and styled content for viral video descriptions. Free online tool with 2,200 character support.',
    keywords:
      'tiktok caption formatter, tiktok description generator, markdown to tiktok, video caption tool, tiktok content creator, bold tiktok text',
  },
  telegram: {
    title: 'Telegram Message Formatter - Markdown to Telegram Converter | Markdown2Social',
    description:
      'Convert Markdown to Telegram messages with proper formatting. Bold, italic, code snippets for channels, groups, and bots. Free online tool with 4,096 character support.',
    keywords:
      'telegram formatter, telegram message generator, markdown to telegram, telegram bot formatting, channel message tool, telegram bold text',
  },
};

const DEFAULT_SEO = {
  title: 'Markdown2Social - Free Markdown to Social Media Converter | 12+ Platforms',
  description:
    'Free online tool to convert Markdown to formatted posts for LinkedIn, Twitter/X, Instagram, Mastodon, Bluesky, Reddit, YouTube, Discord, Facebook, TikTok, Telegram, and Threads. Features live preview, character counting, one-click copy, multiple formatting styles, thread splitting, and draft history.',
  keywords:
    'markdown converter, social media formatter, markdown to linkedin, markdown to twitter, markdown to instagram, markdown to mastodon, markdown to bluesky, markdown to facebook, markdown to tiktok, markdown to telegram, markdown to threads, markdown to discord, markdown to reddit, markdown to youtube, live preview, character counter, social media tool, content formatter, markdown editor, social post generator, unicode formatter, bold text generator, italic text formatter, thread splitter',
};

// Base URL configurable via environment variable
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://algovyn.com/markdown2social';

// OG Image dimensions for better social sharing
const OG_IMAGE_WIDTH = '1200';
const OG_IMAGE_HEIGHT = '630';

// NOTE: This FAQ data is duplicated in index.html for server-side rendering.
// When updating FAQs, make sure to update BOTH locations.
// FAQ structured data for rich snippets
const FAQ_STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Markdown2Social?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Markdown2Social is a free online tool that converts Markdown formatting into styled text for social media platforms. It supports LinkedIn, Twitter/X, Instagram, Mastodon, Bluesky, Reddit, YouTube, Discord, Facebook, TikTok, Telegram, and Threads.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I convert Markdown to social media posts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Simply write your content using Markdown syntax (like **bold** or _italic_) in the editor, select your target platform, and click Copy. The formatted text is automatically generated and ready to paste into your social media platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which social media platforms are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Markdown2Social supports 12+ platforms including LinkedIn, Twitter/X (with thread splitting), Instagram, Threads, Mastodon, Bluesky, Discord, Reddit, YouTube, Facebook, TikTok, and Telegram. Each platform has accurate character limits and formatting options.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Markdown2Social free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Markdown2Social is completely free to use. All processing happens client-side in your browser, so your content never leaves your device. No signup or account required.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it support Twitter/X threads?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes! When you exceed Twitter's 280 character limit, Markdown2Social automatically splits your content into a thread. The preview shows each post with navigation arrows so you can copy individual posts in sequence.",
      },
    },
    {
      '@type': 'Question',
      name: 'What formatting options are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool supports bold (**text**), italic (_text_ or *text*), strikethrough (~text~), code (`code` or ```code blocks```), lists (- items), numbered lists (1. items), links ([text](url)), and headers (# Header).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I save my drafts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes! Markdown2Social automatically saves your drafts with timestamps to your browser's local storage. You can access your history anytime and restore previous versions with one click.",
      },
    },
  ],
};

export const SEO: React.FC<SEOProps> = ({ platform }) => {
  const config = PLATFORM_CONFIGS[platform];
  // Use DEFAULT_SEO for home page ('default'), otherwise use platform-specific SEO
  const seo = platform === 'default' ? DEFAULT_SEO : PLATFORM_SEO[platform] || DEFAULT_SEO;
  // For canonical URL: home page is just BASE_URL, linkedin is also BASE_URL (same as home),
  // other platforms get their own URL
  const canonicalUrl =
    !platform || platform === 'default' || platform === 'linkedin'
      ? `${BASE_URL}/`
      : `${BASE_URL}/#/${platform}`;

  useEffect(() => {
    // Update document title
    document.title = seo.title;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement | null;

      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        // Mark as dynamically created for cleanup
        element.setAttribute('data-seo-dynamic', 'true');
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to update or create link tags
    const updateLinkTag = (rel: string, href: string, attributes?: Record<string, string>) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        element.setAttribute('data-seo-dynamic', 'true');
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          element!.setAttribute(key, value);
        });
      }
    };

    // Update standard meta tags
    updateMetaTag('title', seo.title);
    updateMetaTag('description', seo.description);
    updateMetaTag('keywords', seo.keywords);

    // Update Open Graph tags
    updateMetaTag('og:title', seo.title, true);
    updateMetaTag('og:description', seo.description, true);
    updateMetaTag('og:url', canonicalUrl, true);
    // Use PNG for better social platform compatibility
    updateMetaTag('og:image', `${BASE_URL}/logo/og-image.png`, true);
    updateMetaTag('og:image:secure_url', `${BASE_URL}/logo/og-image.png`, true);
    updateMetaTag('og:image:width', OG_IMAGE_WIDTH, true);
    updateMetaTag('og:image:height', OG_IMAGE_HEIGHT, true);
    updateMetaTag('og:image:type', 'image/png', true);
    updateMetaTag(
      'og:image:alt',
      `${config?.name || 'Markdown2Social'} - Convert Markdown to Social Media Posts`,
      true
    );
    updateMetaTag('og:updated_time', new Date().toISOString(), true);

    // Update Twitter tags - NOTE: twitter:image:alt uses "name" prefix, not "property"
    updateMetaTag('twitter:title', seo.title, true);
    updateMetaTag('twitter:description', seo.description, true);
    updateMetaTag('twitter:url', canonicalUrl, true);
    // Use PNG for better Twitter card compatibility
    updateMetaTag('twitter:image', `${BASE_URL}/logo/og-image.png`, true);
    // Twitter image alt must use "name" attribute, not "property"
    updateMetaTag(
      'twitter:image:alt',
      `${config?.name || 'Markdown2Social'} - Convert Markdown to Social Media Posts`,
      false // use "name" prefix, not "property"
    );

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('data-seo-dynamic', 'true');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update alternate language link
    updateLinkTag('alternate', canonicalUrl, { hreflang: 'en' });

    // Update JSON-LD structured data
    let jsonLdScript = document.querySelector(
      'script[type="application/ld+json"]'
    ) as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('data-seo-dynamic', 'true');
      document.head.appendChild(jsonLdScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Markdown2Social',
      url: canonicalUrl,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      description: seo.description,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: `Markdown parsing, ${config?.name || 'Social media'} preview, One-click copy, Character counting, Thread splitting, Format optimization, Draft history`,
      softwareVersion: '1.0.0',
      author: {
        '@type': 'Organization',
        name: 'Markdown2Social',
        url: BASE_URL,
      },
      image: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo/og-image.png`,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
      },
    };

    jsonLdScript.textContent = JSON.stringify(structuredData);

    // Update FAQ structured data (only for home/default page)
    let faqScript = document.querySelector(
      'script[data-seo-faq="true"]'
    ) as HTMLScriptElement | null;
    if (platform === 'default') {
      if (!faqScript) {
        faqScript = document.createElement('script');
        faqScript.setAttribute('type', 'application/ld+json');
        faqScript.setAttribute('data-seo-faq', 'true');
        faqScript.setAttribute('data-seo-dynamic', 'true');
        document.head.appendChild(faqScript);
      }
      faqScript.textContent = JSON.stringify(FAQ_STRUCTURED_DATA);
    } else if (faqScript) {
      faqScript.remove();
    }

    // Update BreadcrumbList structured data
    let breadcrumbScript = document.querySelector(
      'script[data-seo-breadcrumb="true"]'
    ) as HTMLScriptElement | null;
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.setAttribute('type', 'application/ld+json');
      breadcrumbScript.setAttribute('data-seo-breadcrumb', 'true');
      breadcrumbScript.setAttribute('data-seo-dynamic', 'true');
      document.head.appendChild(breadcrumbScript);
    }

    const breadcrumbData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${BASE_URL}/`,
        },
        ...(platform !== 'default'
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: config?.name || 'Platform',
                item: canonicalUrl,
              },
            ]
          : []),
      ],
    };
    breadcrumbScript.textContent = JSON.stringify(breadcrumbData);

    // Cleanup function - remove ALL dynamically created elements
    // This prevents orphaned elements when platform changes rapidly
    return () => {
      document.querySelectorAll('[data-seo-dynamic="true"]').forEach((element) => {
        element.remove();
      });
    };
  }, [platform, seo, canonicalUrl, config?.name]);

  return null; // This component doesn't render anything visible
};

export default SEO;
