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

const createPost = (content: string, id: number): ThreadPost => ({
  id,
  content: content.trim(),
  characterCount: calculateCharacterCount(content, 'twitter'),
});

/**
 * Splits markdown content into Twitter/X thread-sized chunks.
 * Tries to split at logical boundaries (paragraphs, sentences) when possible.
 */
export const splitIntoThread = (content: string, maxLength: number = 280): SplitResult => {
  const posts: ThreadPost[] = [];
  let currentPost = '';
  let postId = 1;

  for (const paragraph of content.split(/\n\n+/)) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    const paragraphCount = calculateCharacterCount(trimmed, 'twitter');

    if (paragraphCount > maxLength) {
      // Paragraph too long - flush current post first
      if (currentPost) {
        posts.push(createPost(currentPost, postId++));
        currentPost = '';
      }

      // Split long paragraph at sentence boundaries
      for (const sentence of trimmed.split(/(?<=[.!?])\s+/)) {
        const potential = currentPost ? `${currentPost} ${sentence}` : sentence;
        const count = calculateCharacterCount(potential, 'twitter');

        if (count <= maxLength) {
          currentPost = potential;
        } else {
          if (currentPost) posts.push(createPost(currentPost, postId++));
          currentPost = sentence;
        }
      }
    } else {
      // Paragraph fits - try to add it
      const potential = currentPost ? `${currentPost}\n\n${trimmed}` : trimmed;
      const count = calculateCharacterCount(potential, 'twitter');

      if (count <= maxLength) {
        currentPost = potential;
      } else {
        if (currentPost) posts.push(createPost(currentPost, postId++));
        currentPost = trimmed;
      }
    }
  }

  // Don't forget the last post
  if (currentPost) posts.push(createPost(currentPost, postId));

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
export const addThreadIndicators = (result: SplitResult): ThreadPost[] =>
  result.needsThread
    ? result.posts.map((post, index) => ({
        ...post,
        content: `${post.content}\n\n${index + 1}/${result.totalPosts}`,
      }))
    : result.posts;
