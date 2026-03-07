import { encode } from 'gpt-tokenizer';

/**
 * Count tokens in a message content value.
 * Handles both string content and content block arrays.
 * @param {string|Array} content - Message content (string or content blocks)
 * @returns {number} Token count
 */
export function countTokens(content) {
  const text = extractText(content);
  if (!text) return 0;
  try {
    return encode(text).length;
  } catch {
    // Fallback: rough estimate of ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Extract plain text from message content.
 * Claude exports can have string content or array of content blocks.
 * @param {string|Array} content
 * @returns {string}
 */
function extractText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map(block => {
        if (typeof block === 'string') return block;
        if (block.type === 'text') return block.text || '';
        // Skip images, tool_use, etc. — we only count text tokens
        return '';
      })
      .join(' ');
  }
  return '';
}
