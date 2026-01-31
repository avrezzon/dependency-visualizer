import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainPage from './MainPage';

describe('Dependency Interaction', () => {
  it('allows deleting a dependency', async () => {
    render(<MainPage />);

    // Check node exists
    expect(screen.getByTestId('node-repo-a')).toBeInTheDocument();

    // Select a node
    fireEvent.click(screen.getByTestId('node-repo-a'));

    // Find Delete button (Trash icon)
    // The button has title "Delete Dependency"
    const deleteBtn = screen.getByTitle('Delete Dependency');
    fireEvent.click(deleteBtn);

    // Confirmation Modal should appear
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();

    // Click Delete in Modal
    const confirmDeleteBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteBtn);

    // Node should be gone
    await waitFor(() => {
      expect(screen.queryByTestId('node-repo-a')).not.toBeInTheDocument();
    });
  });

  it('allows creating a release with custom version and optional fields', async () => {
    render(<MainPage />);

    const node = screen.getByTestId('node-repo-b');
    fireEvent.click(node);

    // Initial version is 1.0.0. Click Patch.
    fireEvent.click(screen.getByRole('button', { name: /Patch/i }));

    // Modal opens with version 1.0.1
    expect(screen.getByText('Create New Release')).toBeInTheDocument();
    const versionInput = screen.getByPlaceholderText('1.0.0'); // The placeholder is fixed '1.0.0', checking value
    expect(versionInput.value).toBe('1.0.1');

    // Change version to 1.1.0 custom
    fireEvent.change(versionInput, { target: { value: '1.1.0' } });

    // Add PR Link
    const prInput = screen.getByPlaceholderText('https://github.com/...');
    fireEvent.change(prInput, { target: { value: 'https://github.com/org/repo/pull/123' } });

    // Add Changelog
    const changelogInput = screen.getByPlaceholderText('What changed in this release...');
    fireEvent.change(changelogInput, { target: { value: 'Fixed critical bug' } });

    // Publish
    fireEvent.click(screen.getByRole('button', { name: /Publish Release/i }));

    // Check if version updated on the node
    // We need to wait for the node to update.
    // The node text should now contain "v1.1.0"
    await waitFor(() => {
        const versions = screen.getAllByText('v1.1.0');
        expect(versions.length).toBeGreaterThan(0);
    });
  });
});
