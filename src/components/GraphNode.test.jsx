import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GraphNode from './GraphNode';

describe('GraphNode', () => {
  const mockNode = {
    id: 'core:test-lib',
    label: 'test-lib',
    type: 'core',
    version: '1.0.0',
    category: 'Foundation',
    org: 'core',
    artifactId: 'test-lib'
  };

  const defaultProps = {
    node: mockNode,
    isSelected: false,
    isHighlighted: true,
    isOutdated: false,
    hasUpstream: false,
    hasDownstream: false,
    onSelect: vi.fn(),
    onHover: vi.fn()
  };

  it('renders correctly with basic props', () => {
    render(<GraphNode {...defaultProps} />);
    const nodeElement = screen.getByTestId('node-core:test-lib');
    expect(nodeElement).toBeInTheDocument();
    expect(nodeElement).toHaveTextContent('test-lib');
    expect(nodeElement).toHaveTextContent('v1.0.0');
  });

  it('has correct accessibility attributes when not outdated', () => {
    render(<GraphNode {...defaultProps} />);
    const nodeElement = screen.getByRole('button');
    expect(nodeElement).toHaveAttribute('aria-label', 'test-lib version 1.0.0, Foundation dependency');
  });

  it('indicates outdated status in aria-label and shows alert icon', () => {
    render(<GraphNode {...defaultProps} isOutdated={true} />);

    // Check aria-label
    const nodeElement = screen.getByRole('button');
    expect(nodeElement).toHaveAttribute('aria-label', 'Outdated test-lib version 1.0.0, Foundation dependency');

    // Check for alert icon with title
    // Lucide icons render as SVGs. We can query by title text if present in the SVG or a title attribute.
    // In our implementation we added title attribute to the icon component which renders on the SVG.
    // However, react-testing-library might not see the title attribute on the SVG element directly
    // depending on how lucide-react renders it, but standard HTML attributes should pass through.
    // Let's check for the title in the document.
    const alertIcon = screen.getByTitle('Outdated dependency');
    expect(alertIcon).toBeInTheDocument();
    expect(alertIcon).toHaveAttribute('aria-hidden', 'true');
  });
});
