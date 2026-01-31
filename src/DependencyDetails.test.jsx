import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DependencyDetails from './components/DependencyDetails';

describe('DependencyDetails', () => {
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
        prLink: 'http://github.com/pr/1'
      },
      {
        version: '2.0.0',
        date: '2023-02-01T12:00:00Z',
        changelog: 'Major update',
        prLink: 'http://github.com/pr/2'
      }
    ]
  };

  const mockUpstreamIds = ['upstream-1'];
  const mockDownstreamIds = ['downstream-1'];

  const mockNodesMap = new Map([
    ['upstream-1', { id: 'upstream-1', label: 'Upstream One', type: 'repo', version: '1.0.0' }],
    ['downstream-1', { id: 'downstream-1', label: 'Downstream One', type: 'app', version: '3.0.0' }],
    ['test-node', mockNode]
  ]);

  const mockOnBack = vi.fn();

  it('renders node details correctly', () => {
    render(
      <DependencyDetails
        node={mockNode}
        onBack={mockOnBack}
        upstreamIds={mockUpstreamIds}
        downstreamIds={mockDownstreamIds}
        nodesMap={mockNodesMap}
      />
    );

    expect(screen.getByText('Test Node')).toBeInTheDocument();
    // Use getAllByText because version might appear multiple times
    expect(screen.getAllByText('v2.0.0').length).toBeGreaterThan(0);
    expect(screen.getByText('Foundation')).toBeInTheDocument();
  });

  it('renders history items', () => {
    render(
      <DependencyDetails
        node={mockNode}
        onBack={mockOnBack}
        upstreamIds={mockUpstreamIds}
        downstreamIds={mockDownstreamIds}
        nodesMap={mockNodesMap}
      />
    );

    // Should see history versions
    expect(screen.getByText('v1.5.0')).toBeInTheDocument();

    // Should see changelogs
    expect(screen.getByText('Initial Release')).toBeInTheDocument();
    expect(screen.getByText('Major update')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <DependencyDetails
        node={mockNode}
        onBack={mockOnBack}
        upstreamIds={mockUpstreamIds}
        downstreamIds={mockDownstreamIds}
        nodesMap={mockNodesMap}
      />
    );

    fireEvent.click(screen.getByText('Back to Dashboard'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('renders upstream and downstream dependencies', () => {
    render(
      <DependencyDetails
        node={mockNode}
        onBack={mockOnBack}
        upstreamIds={mockUpstreamIds}
        downstreamIds={mockDownstreamIds}
        nodesMap={mockNodesMap}
      />
    );

    expect(screen.getByText('Upstream One')).toBeInTheDocument();
    expect(screen.getByText('Downstream One')).toBeInTheDocument();
  });
});
