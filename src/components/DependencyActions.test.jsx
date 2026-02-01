import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DependencyActions from './DependencyActions';

describe('DependencyActions', () => {
  const mockSelectedNode = { id: 'node-a', label: 'Node A' };
  const mockAllNodes = [
    { id: 'node-a', label: 'Node A' },
    { id: 'node-b', label: 'Node B' },
    { id: 'node-c', label: 'Node C' },
  ];
  const mockUpstreamConnections = ['node-b'];

  it('renders the component with the correct title and dependencies', () => {
    render(
      <DependencyActions
        selectedNode={mockSelectedNode}
        allNodes={mockAllNodes}
        upstreamConnections={mockUpstreamConnections}
        onUpdateDependencies={() => {}}
      />
    );

    expect(screen.getByText('Edit Dependencies')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Node B/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Node C/ })).not.toBeChecked();
  });

  it('allows users to check and uncheck dependencies', () => {
    render(
      <DependencyActions
        selectedNode={mockSelectedNode}
        allNodes={mockAllNodes}
        upstreamConnections={mockUpstreamConnections}
        onUpdateDependencies={() => {}}
      />
    );

    const checkboxB = screen.getByRole('checkbox', { name: /Node B/ });
    const checkboxC = screen.getByRole('checkbox', { name: /Node C/ });

    // Uncheck an existing dependency
    fireEvent.click(checkboxB);
    expect(checkboxB).not.toBeChecked();

    // Check a new dependency
    fireEvent.click(checkboxC);
    expect(checkboxC).toBeChecked();
  });

  it('calls onUpdateDependencies with the correct IDs when the update button is clicked', () => {
    const onUpdateDependencies = vi.fn();
    render(
      <DependencyActions
        selectedNode={mockSelectedNode}
        allNodes={mockAllNodes}
        upstreamConnections={mockUpstreamConnections}
        onUpdateDependencies={onUpdateDependencies}
      />
    );

    const checkboxC = screen.getByRole('checkbox', { name: /Node C/ });
    fireEvent.click(checkboxC); // Add node-c as a dependency

    const updateButton = screen.getByRole('button', { name: 'Update Dependencies' });
    fireEvent.click(updateButton);

    expect(onUpdateDependencies).toHaveBeenCalledWith('node-a', ['node-b', 'node-c']);
  });
});