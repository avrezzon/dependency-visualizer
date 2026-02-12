import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App - Add Dependency', () => {
  it('opens modal when Add Dependency button is clicked', () => {
    render(<App />);
    const addBtn = screen.getByRole('button', { name: /Add Dependency/i });
    fireEvent.click(addBtn);

    const modal = screen.getByRole('dialog', { name: 'Add New Dependency' });
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('adds a new dependency and links it to a consumer', async () => {
    render(<App />);

    // Open Modal
    fireEvent.click(screen.getByRole('button', { name: /Add Dependency/i }));

    // Fill Form
    const nameInput = screen.getByPlaceholderText(/e.g. auth-service/i);
    fireEvent.change(nameInput, { target: { value: 'New Lib' } });

    const versionInput = screen.getByPlaceholderText(/1.0.0/i);
    fireEvent.change(versionInput, { target: { value: '1.2.3' } });

    // Select Consumer (e.g. Reader A)
    // The consumer list uses checkboxes. The label contains "Reader A".
    const consumerCheckbox = screen.getByRole('checkbox', { name: /reader-a/i });
    fireEvent.click(consumerCheckbox);

    // Submit
    const createBtn = screen.getByRole('button', { name: /Create Dependency/i });
    fireEvent.click(createBtn);

    // Verify Modal Closed
    expect(screen.queryByText(/Add New Dependency/i)).not.toBeInTheDocument();

    // Verify New Node Exists
    // It might be in the graph view.
    expect(screen.getByText('New Lib')).toBeInTheDocument();

    // Verify Connection
    // Select Reader A and check if "New Lib" is in Upstream (Requires)
    const readerA = screen.getByTestId('node-app:reader-a');
    fireEvent.click(readerA);

    // Check sidebar
    expect(screen.getByText(/Immediate Dependencies/i)).toBeInTheDocument();
    // "New Lib" should be listed in the sidebar upstream list.
    // Since we clicked it in the graph, we expect to see it referenced in sidebar too.
    const newLibTexts = screen.getAllByText('New Lib');
    expect(newLibTexts.length).toBeGreaterThan(1); // One in graph, one in sidebar
  });
});
