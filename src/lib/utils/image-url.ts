/**
 * Generates the correct URL for uploaded images
 * @param imagePath - The image path from the database (e.g., "uploads/image-123.jpg")
 * @returns The full URL to access the image
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  const raw = String(imagePath).trim();
  if (!raw) return null;

  // If already absolute URL, return as-is
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  // Prefer env, fallback to local dev backend
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || process.env.REACT_APP_SERVER_URL || 'http://localhost:3003')
    .replace(/\/+$/, '');

  // Normalize backslashes to forward slashes
  let path = raw.replace(/\\/g, '/');

  // Ensure it is under uploads/
  if (!/^uploads\//i.test(path)) {
    // strip any leading slashes first
    path = path.replace(/^\/+/, '');
    path = `uploads/${path}`;
  }

  // Final sanitize: remove leading slashes
  const normalizedPath = path.replace(/^\/+/, '');

  return `${base}/${normalizedPath}`;
}
