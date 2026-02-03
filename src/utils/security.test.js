import { describe, it, expect } from 'vitest';
import { isValidUrl, validateSessionData } from './security';

describe('security utils', () => {
  describe('isValidUrl', () => {
    it('returns true for valid http urls', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('returns true for valid https urls', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('returns false for javascript: urls', () => {
      expect(isValidUrl('javascript:alert(1)')).toBe(false);
    });

    it('returns false for data: urls', () => {
        expect(isValidUrl('data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isValidUrl('not a url')).toBe(false);
    });

    it('returns false for non-string inputs', () => {
      expect(isValidUrl(null)).toBe(false);
      expect(isValidUrl(123)).toBe(false);
    });
  });

  describe('validateSessionData', () => {
    it('returns valid for correct session data', () => {
      const data = {
        nodes: [{ id: '1', label: 'Node 1' }],
        edges: [{ source: '1', target: '2' }],
        dependencyLocks: { '1': {} }
      };
      const result = validateSessionData(data);
      expect(result.isValid).toBe(true);
    });

    it('returns invalid if data is not an object', () => {
      expect(validateSessionData(null).isValid).toBe(false);
      expect(validateSessionData([]).isValid).toBe(false);
      expect(validateSessionData('string').isValid).toBe(false);
    });

    it('returns invalid if nodes is missing or not array', () => {
      const data = { edges: [], dependencyLocks: {} };
      expect(validateSessionData(data).isValid).toBe(false);
      expect(validateSessionData({ ...data, nodes: {} }).isValid).toBe(false);
    });

    it('returns invalid if a node lacks id', () => {
        const data = {
            nodes: [{ label: 'Node 1' }], // Missing id
            edges: [],
            dependencyLocks: {}
        };
        const result = validateSessionData(data);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('id');
    });

    it('returns invalid if edges is missing or not array', () => {
        const data = { nodes: [], dependencyLocks: {} };
        expect(validateSessionData(data).isValid).toBe(false);
        expect(validateSessionData({ ...data, edges: {} }).isValid).toBe(false);
    });

    it('returns invalid if an edge lacks source or target', () => {
        const data = {
            nodes: [{ id: '1' }],
            edges: [{ source: '1' }], // Missing target
            dependencyLocks: {}
        };
        expect(validateSessionData(data).isValid).toBe(false);
    });

    it('returns invalid if dependencyLocks is missing or not object', () => {
        const data = { nodes: [], edges: [] };
        expect(validateSessionData(data).isValid).toBe(false);
        expect(validateSessionData({ ...data, dependencyLocks: [] }).isValid).toBe(false);
    });
  });
});
