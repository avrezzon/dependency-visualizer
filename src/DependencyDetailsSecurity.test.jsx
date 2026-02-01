import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DependencyDetails from './components/DependencyDetails';

describe('DependencyDetails Security', () => {
  const mockNode = {
    id: 'test-node',
    label: 'Test Node',
    type: 'core',
    version: '2.0.0',
    category: 'Foundation',
    history: [
      {
        version: '1.5.0',
        date: '2023-01-01T12:00:00Z',
        changelog: 'Initial Release',
        prLink: 'javascript:alert("XSS")'
      }
    ]
  };

  const mockNodesMap = new Map([
    ['test-node', mockNode]
  ]);

  it('prevents XSS by not rendering invalid javascript: URI in PR link', () => {
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

    // Should not find the "View PR" link because the URL is invalid
    const link = screen.queryByText('View PR');
    expect(link).not.toBeInTheDocument();
  });

  it('renders valid https: PR link', () => {
      const validNode = {
        ...mockNode,
        history: [{
             version: '1.5.0',
             date: '2023-01-01T12:00:00Z',
             changelog: 'Initial Release',
             prLink: 'https://github.com/pr/1'
        }]
      };

    render(
      <DependencyDetails
        node={validNode}
        onBack={vi.fn()}
        upstreamIds={[]}
        downstreamIds={[]}
        nodesMap={mockNodesMap}
        onNodeSelect={vi.fn()}
      />
    );

    const link = screen.getByText('View PR').closest('a');
    expect(link).toHaveAttribute('href', 'https://github.com/pr/1');
  });
});
