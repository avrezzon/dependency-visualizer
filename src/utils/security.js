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

  const MAX_STRING_LENGTH = 1000;
  const isSafeString = (str, maxLength = MAX_STRING_LENGTH) => typeof str === 'string' && str.length <= maxLength;

  // Validate nodes
  if (!Array.isArray(data.nodes)) {
    return { isValid: false, error: 'Session data must contain a "nodes" array.' };
  }
  for (const node of data.nodes) {
    if (!node || typeof node !== 'object') {
       return { isValid: false, error: 'All nodes must be objects.' };
    }

    // Required string fields
    if (!isSafeString(node.id)) {
       return { isValid: false, error: 'All nodes must have a valid string "id" (max 1000 chars).' };
    }

    // Optional fields validation
    if (node.label !== undefined && !isSafeString(node.label)) {
       return { isValid: false, error: 'Node "label" must be a string (max 1000 chars).' };
    }
    if (node.version !== undefined && !isSafeString(node.version)) {
       return { isValid: false, error: 'Node "version" must be a string.' };
    }
    if (node.org !== undefined && !isSafeString(node.org)) {
       return { isValid: false, error: 'Node "org" must be a string.' };
    }
    if (node.artifactId !== undefined && !isSafeString(node.artifactId)) {
       return { isValid: false, error: 'Node "artifactId" must be a string.' };
    }
    if (node.category !== undefined && !isSafeString(node.category)) {
       return { isValid: false, error: 'Node "category" must be a string.' };
    }

    // Validate history if present
    if (node.history !== undefined) {
      if (!Array.isArray(node.history)) {
        return { isValid: false, error: 'Node "history" must be an array.' };
      }
      if (node.history.length > 50) {
        return { isValid: false, error: 'Node "history" cannot have more than 50 items.' };
      }
      for (const item of node.history) {
        if (!item || typeof item !== 'object') {
          return { isValid: false, error: 'History items must be objects.' };
        }
        if (item.version !== undefined && !isSafeString(item.version, 100)) {
           return { isValid: false, error: 'History "version" must be a string (max 100 chars).' };
        }
        if (item.date !== undefined && !isSafeString(item.date, 100)) {
           return { isValid: false, error: 'History "date" must be a string (max 100 chars).' };
        }
        if (item.changelog !== undefined && !isSafeString(item.changelog, 2000)) {
           return { isValid: false, error: 'History "changelog" must be a string (max 2000 chars).' };
        }
        if (item.prLink !== undefined) {
          if (!isSafeString(item.prLink, 500)) {
             return { isValid: false, error: 'History "prLink" must be a string (max 500 chars).' };
          }
          if (!isValidUrl(item.prLink)) {
             return { isValid: false, error: 'History "prLink" must be a valid http/https URL.' };
          }
        }
      }
    }
  }

  // Validate edges
  if (!Array.isArray(data.edges)) {
    return { isValid: false, error: 'Session data must contain an "edges" array.' };
  }
  for (const edge of data.edges) {
    if (!edge || typeof edge !== 'object') {
      return { isValid: false, error: 'All edges must be objects.' };
    }
    if (!isSafeString(edge.source) || !isSafeString(edge.target)) {
      return { isValid: false, error: 'All edges must have valid string "source" and "target" properties.' };
    }
  }

  // Validate dependencyLocks
  if (!data.dependencyLocks || typeof data.dependencyLocks !== 'object' || Array.isArray(data.dependencyLocks)) {
    return { isValid: false, error: 'Session data must contain a "dependencyLocks" object.' };
  }

  // Validate dependencyLocks structure
  for (const [key, locks] of Object.entries(data.dependencyLocks)) {
      if (!isSafeString(key)) return { isValid: false, error: 'Invalid key in dependencyLocks.' };
      if (typeof locks !== 'object' || locks === null) return { isValid: false, error: 'Values in dependencyLocks must be objects.' };

      for (const [depId, version] of Object.entries(locks)) {
          if (!isSafeString(depId)) return { isValid: false, error: 'Invalid dependency ID in locks.' };
          if (!isSafeString(version)) return { isValid: false, error: 'Invalid version string in locks.' };
      }
  }

  return { isValid: true };
};
