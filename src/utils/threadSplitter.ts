import { calculateCharacterCount } from './platforms';

export interface ThreadPost {
  id: number;
  content: string;
  characterCount: number;
}

export interface SplitResult {
  posts: ThreadPost[];
  totalPosts: number;
  totalCharacters: number;
  isOverLimit: boolean;
  needsThread: boolean;
}

/**
 * Splits markdown content into Twitter/X thread-sized chunks.
 * Tries to split at logical boundaries (paragraphs, sentences) when possible.
 */
export const splitIntoThread = (content: string, maxLength: number = 280): SplitResult => {
  const posts: ThreadPost[] = [];
  const paragraphs = content.split(/\n\n+/);

  let currentPost = '';
  let postId = 1;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    // Check if paragraph alone exceeds limit
    const paragraphCount = calculateCharacterCount(trimmedParagraph, 'twitter');

    if (paragraphCount > maxLength) {
      // Paragraph is too long, need to split it further
      if (currentPost) {
        posts.push({
          id: postId++,
          content: currentPost.trim(),
          characterCount: calculateCharacterCount(currentPost, 'twitter'),
        });
        currentPost = '';
      }

      // Split long paragraph at sentence boundaries
      const sentences = trimmedParagraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        const potentialPost = currentPost ? `${currentPost} ${sentence}` : sentence;
        const count = calculateCharacterCount(potentialPost, 'twitter');

        if (count <= maxLength) {
          currentPost = potentialPost;
        } else {
          if (currentPost) {
            posts.push({
              id: postId++,
              content: currentPost.trim(),
              characterCount: calculateCharacterCount(currentPost, 'twitter'),
            });
          }
          currentPost = sentence;
        }
      }
    } else {
      // Paragraph fits, try to add it to current post
      const separator = currentPost ? '\n\n' : '';
      const potentialPost = currentPost + separator + trimmedParagraph;
      const count = calculateCharacterCount(potentialPost, 'twitter');

      if (count <= maxLength) {
        currentPost = potentialPost;
      } else {
        // Current post is full, start a new one
        if (currentPost) {
          posts.push({
            id: postId++,
            content: currentPost.trim(),
            characterCount: calculateCharacterCount(currentPost, 'twitter'),
          });
        }
        currentPost = trimmedParagraph;
      }
    }
  }

  // Don't forget the last post
  if (currentPost) {
    posts.push({
      id: postId,
      content: currentPost.trim(),
      characterCount: calculateCharacterCount(currentPost, 'twitter'),
    });
  }

  const totalCharacters = posts.reduce((sum, post) => sum + post.characterCount, 0);

  return {
    posts,
    totalPosts: posts.length,
    totalCharacters,
    isOverLimit: posts.some((p) => p.characterCount > maxLength),
    needsThread: posts.length > 1,
  };
};

/**
 * Adds thread indicators (e.g., "1/5") to posts
 */
export const addThreadIndicators = (result: SplitResult): ThreadPost[] => {
  if (!result.needsThread) return result.posts;

  return result.posts.map((post, index) => ({
    ...post,
    content: `${post.content}\n\n${index + 1}/${result.totalPosts}`,
  }));
};
