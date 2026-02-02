import { describe, it, expect } from 'vitest';
import { validateSessionData } from './security';

describe('validateSessionData', () => {
  it('returns true for valid session data', () => {
    const validData = {
      nodes: [{ id: 'node-1', label: 'Node 1' }],
      edges: [],
      dependencyLocks: {}
    };
    expect(validateSessionData(validData)).toBe(true);
  });

  it('returns false for null or undefined input', () => {
    expect(validateSessionData(null)).toBe(false);
    expect(validateSessionData(undefined)).toBe(false);
  });

  it('returns false for non-object input', () => {
    expect(validateSessionData('invalid')).toBe(false);
    expect(validateSessionData(123)).toBe(false);
  });

  it('returns false when required properties are missing', () => {
    expect(validateSessionData({ edges: [], dependencyLocks: {} })).toBe(false); // Missing nodes
    expect(validateSessionData({ nodes: [], dependencyLocks: {} })).toBe(false); // Missing edges
    expect(validateSessionData({ nodes: [], edges: [] })).toBe(false); // Missing dependencyLocks
  });

  it('returns false when properties have incorrect types', () => {
    expect(validateSessionData({ nodes: 'not-array', edges: [], dependencyLocks: {} })).toBe(false);
    expect(validateSessionData({ nodes: [], edges: 'not-array', dependencyLocks: {} })).toBe(false);
    expect(validateSessionData({ nodes: [], edges: [], dependencyLocks: 'not-object' })).toBe(false);
  });

  it('returns false when nodes are missing id property', () => {
    const invalidNodes = {
      nodes: [{ label: 'Node without ID' }],
      edges: [],
      dependencyLocks: {}
    };
    expect(validateSessionData(invalidNodes)).toBe(false);
  });

  it('returns false when nodes contain non-object items', () => {
    const invalidNodes = {
      nodes: ['not-an-object'],
      edges: [],
      dependencyLocks: {}
    };
    expect(validateSessionData(invalidNodes)).toBe(false);
  });
});
