/**
 * Converts a standard Google Drive share, view, or uc URL into a direct, 
 * web-embeddable CDN stream URL (lh3.googleusercontent.com/d/FILE_ID) which 
 * works reliably under modern iframe security policies, sandbox environments,
 * and standard referrer restrictions.
 */
export function getDirectPhotoUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  
  // Regular expression to extract file ID from various Google Drive URL patterns
  const driveRegex = /(?:drive\.google\.com\/(?:uc\?.*?id=|open\?id=|file\/d\/)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i;
  const match = url.match(driveRegex);
  
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  
  return url;
}
