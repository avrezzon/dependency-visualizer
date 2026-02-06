import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainPage from './MainPage';

describe('Add Dependency Modal', () => {
  it('opens modal when Add Dependency button is clicked', () => {
    render(<MainPage />);

    // Find the "Add Dependency" button. It might be hidden by text on small screens, so look for text or icon.
    // The button has "Add Dependency" text (hidden sm:inline) and "Add" (sm:hidden).
    // Let's target by role button and name.
    const addBtn = screen.getByRole('button', { name: /Add Dependency/i });
    fireEvent.click(addBtn);

    // Check if Modal title appears
    expect(screen.getByRole('heading', { level: 3, name: /Add New Dependency/i })).toBeInTheDocument();
  });

  it('closes modal when Cancel is clicked', () => {
    render(<MainPage />);

    // Open modal
    const addBtn = screen.getByRole('button', { name: /Add Dependency/i });
    fireEvent.click(addBtn);

    // Find Cancel button in the modal footer
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    // Modal title should disappear
    expect(screen.queryByRole('heading', { level: 3, name: /Add New Dependency/i })).not.toBeInTheDocument();
  });

  it('closes modal when Escape key is pressed', () => {
    render(<MainPage />);

    // Open modal
    const addBtn = screen.getByRole('button', { name: /Add Dependency/i });
    fireEvent.click(addBtn);

    // Verify it's open
    expect(screen.getByRole('heading', { level: 3, name: /Add New Dependency/i })).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    // Modal title should disappear
    expect(screen.queryByRole('heading', { level: 3, name: /Add New Dependency/i })).not.toBeInTheDocument();
  });

  it('creates a new dependency when form is submitted', () => {
    render(<MainPage />);

    // Open modal
    const addBtn = screen.getByRole('button', { name: /Add Dependency/i });
    fireEvent.click(addBtn);

    // Fill form
    // Name
    const nameInput = screen.getByPlaceholderText(/e.g. auth-service/i);
    fireEvent.change(nameInput, { target: { value: 'new-service' } });

    // Org
    const orgInput = screen.getByPlaceholderText(/e.g. my-org/i);
    fireEvent.change(orgInput, { target: { value: 'my-org' } });

    // Artifact
    const artifactInput = screen.getByPlaceholderText(/e.g. my-artifact/i);
    fireEvent.change(artifactInput, { target: { value: 'service-x' } });

    // Version
    const versionInput = screen.getByPlaceholderText(/1.0.0/i);
    fireEvent.change(versionInput, { target: { value: '1.0.0' } });

    // Create
    const createBtn = screen.getByRole('button', { name: /Create Dependency/i });
    expect(createBtn).not.toBeDisabled();
    fireEvent.click(createBtn);

    // Modal should close
    expect(screen.queryByRole('heading', { level: 3, name: /Add New Dependency/i })).not.toBeInTheDocument();

    // Verify new node exists
    // The ID will be "my-org:service-x"
    expect(screen.getByTestId('node-my-org:service-x')).toBeInTheDocument();
    expect(screen.getByText('new-service')).toBeInTheDocument();
  });
});
