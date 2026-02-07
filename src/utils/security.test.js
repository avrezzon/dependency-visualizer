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
        nodes: [{ id: '1', label: 'Node 1', version: '1.0.0' }],
        edges: [{ source: '1', target: '2' }],
        dependencyLocks: { '1': { '2': '1.0.0' } }
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

    it('returns invalid if a node lacks id or id is not a string', () => {
        const data = {
            nodes: [{ label: 'Node 1' }], // Missing id
            edges: [],
            dependencyLocks: {}
        };
        expect(validateSessionData(data).isValid).toBe(false);

        const data2 = {
            nodes: [{ id: 123, label: 'Node 1' }], // Non-string id
            edges: [],
            dependencyLocks: {}
        };
        expect(validateSessionData(data2).isValid).toBe(false);
    });

    it('returns invalid if node properties are not strings', () => {
        const data = {
            nodes: [{ id: '1', label: { invalid: 'obj' } }], // Non-string label
            edges: [],
            dependencyLocks: {}
        };
        expect(validateSessionData(data).isValid).toBe(false);

        const data2 = {
            nodes: [{ id: '1', version: 1.0 }], // Non-string version
            edges: [],
            dependencyLocks: {}
        };
        expect(validateSessionData(data2).isValid).toBe(false);
    });

    it('returns invalid if strings are too long', () => {
        const longString = 'a'.repeat(1001);
        const data = {
            nodes: [{ id: longString, label: 'Node 1' }],
            edges: [],
            dependencyLocks: {}
        };
        expect(validateSessionData(data).isValid).toBe(false);
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

    it('returns invalid if edge source/target are not strings', () => {
        const data = {
            nodes: [{ id: '1' }],
            edges: [{ source: '1', target: 2 }],
            dependencyLocks: {}
        };
        expect(validateSessionData(data).isValid).toBe(false);
    });

    it('returns invalid if dependencyLocks is missing or not object', () => {
        const data = { nodes: [], edges: [] };
        expect(validateSessionData(data).isValid).toBe(false);
        expect(validateSessionData({ ...data, dependencyLocks: [] }).isValid).toBe(false);
    });

    it('returns invalid if dependencyLocks contains invalid structure', () => {
        const data = {
            nodes: [],
            edges: [],
            dependencyLocks: { 'node1': { 'dep1': 123 } } // Version is number
        };
        expect(validateSessionData(data).isValid).toBe(false);
    });

    it('returns invalid if nodes array exceeds 200 items', () => {
      const data = {
        nodes: Array(201).fill().map((_, i) => ({ id: `node-${i}` })),
        edges: [],
        dependencyLocks: {}
      };
      expect(validateSessionData(data).isValid).toBe(false);
    });

    it('returns invalid if edges array exceeds 500 items', () => {
      const data = {
        nodes: [{ id: '1' }, { id: '2' }],
        edges: Array(501).fill().map(() => ({ source: '1', target: '2' })),
        dependencyLocks: {}
      };
      expect(validateSessionData(data).isValid).toBe(false);
    });

    it('returns invalid if node history exceeds 50 items', () => {
      const data = {
        nodes: [{
          id: '1',
          history: Array(51).fill().map((_, i) => ({ version: `1.${i}.0` }))
        }],
        edges: [],
        dependencyLocks: {}
      };
      expect(validateSessionData(data).isValid).toBe(false);
    });

    it('returns invalid if node history items are not objects', () => {
      const data = {
        nodes: [{
          id: '1',
          history: ['not-an-object']
        }],
        edges: [],
        dependencyLocks: {}
      };
      expect(validateSessionData(data).isValid).toBe(false);
    });

    it('returns invalid if node history properties are not safe strings', () => {
      const longString = 'a'.repeat(1001);
      const data = {
        nodes: [{
          id: '1',
          history: [{ version: longString }]
        }],
        edges: [],
        dependencyLocks: {}
      };
      expect(validateSessionData(data).isValid).toBe(false);

      const data2 = {
        nodes: [{
          id: '1',
          history: [{ prLink: 123 }]
        }],
        edges: [],
        dependencyLocks: {}
      };
      expect(validateSessionData(data2).isValid).toBe(false);
    });
  });
});
