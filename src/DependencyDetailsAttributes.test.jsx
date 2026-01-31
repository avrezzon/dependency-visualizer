import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DependencyDetails from './components/DependencyDetails';

describe('DependencyDetails Attributes', () => {
  const mockNode = {
    id: 'test-node',
    org: 'my-org',
    artifactId: 'my-artifact',
    label: 'Test Node',
    type: 'core',
    version: '2.0.0',
    category: 'Foundation',
    history: []
  };

  const mockNodesMap = new Map([
    ['test-node', mockNode]
  ]);

  it('renders organization and artifactId', () => {
    render(
      <DependencyDetails
        node={mockNode}
        onBack={vi.fn()}
        upstreamIds={[]}
        downstreamIds={[]}
        nodesMap={mockNodesMap}
        onNodeSelect={vi.fn()}
      />
    );

    // These are expected to fail initially
    expect(screen.getByText('my-org')).toBeInTheDocument();
    expect(screen.getByText('my-artifact')).toBeInTheDocument();
    // Version is already there
    expect(screen.getAllByText(/v2.0.0/)).not.toHaveLength(0);
  });
});
