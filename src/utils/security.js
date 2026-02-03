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
 * Validates the session data imported from a JSON file.
 * Checks for existence and correct type of nodes, edges, and dependencyLocks.
 * Also verifies basic structure of nodes.
 *
 * @param {any} data - The parsed JSON data
 * @returns {{isValid: boolean, error?: string}} - Validation result
 */
export const validateSessionData = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, error: 'Session data must be an object.' };
  }

  // Validate nodes
  if (!Array.isArray(data.nodes)) {
    return { isValid: false, error: 'Session data must contain a "nodes" array.' };
  }
  for (const node of data.nodes) {
    if (!node || typeof node !== 'object' || !node.id) {
       return { isValid: false, error: 'All nodes must be objects with an "id" property.' };
    }
  }

  // Validate edges
  if (!Array.isArray(data.edges)) {
    return { isValid: false, error: 'Session data must contain an "edges" array.' };
  }
  for (const edge of data.edges) {
    if (!edge || typeof edge !== 'object' || !edge.source || !edge.target) {
      return { isValid: false, error: 'All edges must be objects with "source" and "target" properties.' };
    }
  }

  // Validate dependencyLocks
  if (!data.dependencyLocks || typeof data.dependencyLocks !== 'object' || Array.isArray(data.dependencyLocks)) {
    return { isValid: false, error: 'Session data must contain a "dependencyLocks" object.' };
  }

  return { isValid: true };
};
