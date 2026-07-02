/**
 * Parser for ChatGPT exported conversations.json.
 *
 * ChatGPT exports use a tree structure (mapping of node UUIDs)
 * rather than a flat messages array. This module flattens that
 * tree into normalized messages compatible with calculator.js.
 */

/**
 * Extract text from a ChatGPT message content object.
 * ChatGPT format: { content_type: 'text', parts: ['...'] }
 */
function extractChatGPTText(content) {
  if (!content || !content.parts) return '';
  return content.parts
    .filter(p => typeof p === 'string')
    .join(' ')
    .trim();
}

/**
 * Flatten a ChatGPT mapping tree into a sorted array of messages.
 * Walks the canonical path (last child at each branch) to avoid
 * double-counting regenerated responses.
 *
 * @param {Object} mapping - The convo.mapping object keyed by node UUID
 * @returns {Array<{ role: string, text: string }>}
 */
export function flattenChatGPTMessages(mapping) {
  if (!mapping || typeof mapping !== 'object') return [];

  // Find root node (no parent or parent not in mapping)
  let rootId = null;
  for (const [id, node] of Object.entries(mapping)) {
    if (!node.parent || !mapping[node.parent]) {
      rootId = id;
      break;
    }
  }
  if (!rootId) return [];

  // Walk canonical path: always follow last child (active branch)
  const messages = [];
  let currentId = rootId;

  while (currentId) {
    const node = mapping[currentId];
    if (!node) break;

    if (node.message) {
      const msg = node.message;
      const role = msg.author?.role;

      if (role && role !== 'system' && role !== 'tool') {
        const text = extractChatGPTText(msg.content);
        if (text) {
          messages.push({
            role,
            text,
            create_time: msg.create_time || 0,
          });
        }
      }
    }

    // Follow last child (active/latest branch)
    const children = node.children;
    currentId = children && children.length > 0
      ? children[children.length - 1]
      : null;
  }

  return messages;
}

/**
 * Normalize a single ChatGPT conversation into the shape expected
 * by processConversations in calculator.js.
 *
 * @param {Object} rawConvo - A raw ChatGPT conversation object
 * @returns {{ title: string, createdAt: string|null, messages: Array }}
 */
export function normalizeChatGPTConversation(rawConvo) {
  const title = rawConvo.title || 'Untitled';

  // ChatGPT uses Unix float timestamps
  let createdAt = null;
  if (rawConvo.create_time) {
    createdAt = new Date(rawConvo.create_time * 1000).toISOString();
  }

  const messages = flattenChatGPTMessages(rawConvo.mapping);

  return { title, createdAt, messages };
}

/**
 * Detect whether a parsed JSON is a ChatGPT export.
 * ChatGPT conversations have a `mapping` key with node UUIDs.
 *
 * @param {Array|Object} json - Parsed JSON
 * @returns {boolean}
 */
export function isChatGPTFormat(json) {
  const arr = Array.isArray(json) ? json : json?.conversations || [];
  if (!Array.isArray(arr) || arr.length === 0) return false;
  // ChatGPT convos have a `mapping` object; Claude convos have `chat_messages`
  return arr[0]?.mapping != null && typeof arr[0].mapping === 'object';
}
