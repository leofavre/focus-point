/**
 * Escapes HTML special characters in a string to prevent XSS and render them as text.
 * Replaces `&`, `<`, `>`, `"`, and `'` with their HTML entity equivalents.
 *
 * @param unsafe - The string that may contain HTML special characters.
 * @returns The escaped string safe for insertion into HTML text content.
 */
export function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
