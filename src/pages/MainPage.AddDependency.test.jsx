import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainPage from './MainPage';

describe('MainPage Add Dependency', () => {
  it('opens add dependency modal and adds a new node via accessible form', async () => {
    render(<MainPage />);

    // Generate Random Graph to dismiss Welcome Modal and have some nodes
    const randomBtn = screen.getByRole('button', { name: /Generate Random/i });
    fireEvent.click(randomBtn);

    // Click 'Add Dependency' button
    const addBtn = screen.getByRole('button', { name: /Add Dependency/i });
    fireEvent.click(addBtn);

    // Modal should appear
    const modal = await screen.findByRole('dialog', { name: /Add New Dependency/i });
    expect(modal).toBeInTheDocument();

    // Scope queries to the modal to avoid matching nodes in the background
    const modalWithin = within(modal);

    // Inputs should be accessible by label
    const nameInput = modalWithin.getByLabelText(/Dependency Name/i);
    const orgInput = modalWithin.getByLabelText(/Organization/i);
    const artifactInput = modalWithin.getByLabelText(/Artifact ID/i);
    // Use exact match or specific regex to avoid matching "Version Control" in header or aria-labels
    const versionInput = modalWithin.getByLabelText(/^Version$/i);
    const categorySelect = modalWithin.getByLabelText(/Category/i);

    // Fill form
    fireEvent.change(nameInput, { target: { value: 'new-service' } });
    fireEvent.change(orgInput, { target: { value: 'my-org' } });
    fireEvent.change(artifactInput, { target: { value: 'service-x' } });
    fireEvent.change(versionInput, { target: { value: '1.2.3' } });
    fireEvent.change(categorySelect, { target: { value: 'Processors' } });

    // Select consumer - checking the first available node
    // Using a more generic query since node names are dynamic
    const checkboxes = modalWithin.getAllByRole('checkbox');
    if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
    }

    // Submit
    const createBtn = modalWithin.getByRole('button', { name: /Create Dependency/i });
    fireEvent.click(createBtn);

    // Modal should close
    await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /Add New Dependency/i })).not.toBeInTheDocument();
    });

    // New node should be in graph
    expect(screen.getByText('new-service')).toBeInTheDocument();
  });
});
