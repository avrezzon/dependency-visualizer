/**
 * Checks if a URL is safe to be used in an href attribute.
 * Only allows http and https protocols.
 *
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is valid and safe, false otherwise
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};
