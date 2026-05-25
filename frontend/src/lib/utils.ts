/**
 * Format bytes to human-readable string.
 * @example
 *   formatBytes(500) // "500 B"
 *   formatBytes(1024) // "1.0 KB"
 *   formatBytes(1048576) // "1.00 MB"
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Check if a filename has one of the allowed extensions.
 * Case-insensitive.
 * @example
 *   isValidFileExtension('test.docx', ['docx', 'doc']) // true
 *   isValidFileExtension('test.DOCX', ['docx']) // true
 *   isValidFileExtension('test.pdf', ['docx', 'doc']) // false
 */
export function isValidFileExtension(filename: string, extensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return false;
  const allowed = extensions.map(e => e.toLowerCase());
  return allowed.includes(ext);
}