import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App - Create Dependency Attributes', () => {
  it('adds a new dependency with org and artifactId', async () => {
    render(<App />);

    // Open Modal
    fireEvent.click(screen.getByRole('button', { name: /Add Dependency/i }));

    // Fill Form
    // Note: These placeholders/labels don't exist yet, so this test will fail initially.
    fireEvent.change(screen.getByPlaceholderText(/e.g. auth-service/i), { target: { value: 'My Service' } });
    
    // We expect these inputs to be available
    fireEvent.change(screen.getByPlaceholderText(/e.g. my-org/i), { target: { value: 'test-org' } });
    fireEvent.change(screen.getByPlaceholderText(/e.g. my-artifact/i), { target: { value: 'test-artifact' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Dependency/i }));

    // Verify New Node Exists
    await waitFor(() => {
      expect(screen.getByText('My Service')).toBeInTheDocument();
    });

    // Check if org and artifactId are displayed in the dashboard card
    // The text in the card is formatted as "test-org / test-artifact" but heavily nested.
    // However, getByText with exact: false or regex should find it if it renders text nodes.
    // Our render: <span>{node.org} / </span> ... <span>{node.artifactId}</span>
    
    expect(screen.getAllByText(/test-org/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/test-artifact/).length).toBeGreaterThan(0);
  });
});
