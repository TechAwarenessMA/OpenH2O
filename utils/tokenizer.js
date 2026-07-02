import { encode } from 'gpt-tokenizer';

/**
 * Count tokens in a text string using GPT-4 BPE encoding.
 * Claude's tokenizer is not publicly available; GPT-4 tiktoken produces
 * counts within ~5% for typical English text (disclosed to users).
 *
 * @param {string} text - Plain text to tokenize
 * @returns {number} Token count
 */
export function countTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  try {
    return encode(text).length;
  } catch {
    // Fallback: rough estimate of ~4 chars per token
    return Math.ceil(text.length / 4);
  }
}

/**
 * Extract plain text from a single message's content field.
 * Claude exports use content: [ { type: 'text', text: '...' }, ... ]
 *
 * Handles multiple content block types:
 *   - { type: 'text', text: '...' }         → extract text
 *   - { type: 'tool_result', content: ... }  → recurse into content
 *   - All other types (tool_use, images)     → skip
 *
 * @param {string|Array} content - message.content value
 * @returns {string} Extracted plain text
 */
export function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  const parts = [];
  for (const block of content) {
    if (!block) continue;
    if (block.type === 'text' && block.text) {
      parts.push(block.text);
    } else if (block.type === 'tool_result' && block.content) {
      // tool_result blocks can contain nested text
      const nested = extractText(block.content);
      if (nested) parts.push(nested);
    }
  }
  return parts.join(' ');
}
