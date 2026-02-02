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

/**
 * Validates the structure of imported session data to prevent crashes and data corruption.
 *
 * @param {object} data - The parsed JSON data from the uploaded file
 * @returns {boolean} - True if the data structure is valid, false otherwise
 */
export const validateSessionData = (data) => {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.nodes)) return false;
  if (!Array.isArray(data.edges)) return false;
  if (!data.dependencyLocks || typeof data.dependencyLocks !== 'object') return false;

  // Ensure all nodes have an ID string to prevent crashes during rendering
  // We check for id because it's used as key and for lookups
  if (!data.nodes.every(n => n && typeof n === 'object' && typeof n.id === 'string')) return false;

  return true;
};
