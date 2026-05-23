/**
 * WeChat Chat History Generator — data models
 *
 * These types are the single source of truth for the chat-mockup state
 * shared between the control panel, the mobile viewer, and the PC viewer.
 * Everything is plain JSON-safe — no functions, no Dates, no class
 * instances — so the state can be round-tripped through localStorage,
 * postMessage, or future export formats without surprises.
 */

export type ViewMode = "mobile" | "pc";

export type MessageSender = "me" | "other";

export type MessageType = "text" | "image" | "time";

export interface ChatMessage {
  /** Stable client-side id (crypto.randomUUID at append time). */
  id: string;
  /** Who the bubble belongs to. `time` rows ignore this. */
  sender: MessageSender;
  type: MessageType;
  /**
   * For `text`  → the message string.
   * For `image` → a Base64 data URI rendered as an inline image bubble.
   * For `time`  → the system-row label (e.g. "Today 14:30").
   */
  content: string;
  /**
   * Optional ISO-8601 timestamp. Surfaced as a tooltip on bubbles and used
   * by future export formats. Not displayed inline — `time` rows handle the
   * visible date dividers.
   */
  timestamp?: string;
}

export interface ChatSession {
  /** "Other party" avatar — Base64 data URI, falsy → built-in placeholder. */
  avatar: string;
  /** Display name shown in the top header. */
  nickname: string;
  viewMode: ViewMode;
  messages: ChatMessage[];
}

export const DEFAULT_AVATAR_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" rx="6" fill="#cfd1d6"/>' +
    '<circle cx="32" cy="26" r="11" fill="#fff"/>' +
    '<path d="M12 56c2-12 12-18 20-18s18 6 20 18z" fill="#fff"/>' +
  '</svg>'
);

export const ME_AVATAR_PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" rx="6" fill="#cc785c"/>' +
    '<circle cx="32" cy="26" r="11" fill="#faf9f5"/>' +
    '<path d="M12 56c2-12 12-18 20-18s18 6 20 18z" fill="#faf9f5"/>' +
  '</svg>'
);

export function createEmptyChatSession(): ChatSession {
  return {
    avatar: DEFAULT_AVATAR_PLACEHOLDER,
    nickname: "Friend",
    viewMode: "mobile",
    messages: [],
  };
}
