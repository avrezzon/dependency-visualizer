import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the header correctly', () => {
    render(<App />);
    expect(screen.getByText(/DepManager/i)).toBeInTheDocument();
    expect(screen.getByText(/Microservice Version Control/i)).toBeInTheDocument();
  });

  it('renders initial nodes', () => {
    render(<App />);
    // Check for a core node by test id
    expect(screen.getByTestId('node-ext.models')).toBeInTheDocument();
    // Check for a repo node by test id
    expect(screen.getByTestId('node-repo-a')).toBeInTheDocument();
    
    // We can also verify text content if needed
    expect(screen.getByTestId('node-ext.models')).toHaveTextContent('ext.models');
  });

  it('updates sidebar when a node is selected', () => {
    render(<App />);
    
    // Initial state: empty sidebar message
    expect(screen.getByText(/Select a microservice or library/i)).toBeInTheDocument();

    // Click on 'ext.models'
    const node = screen.getByTestId('node-ext.models');
    fireEvent.click(node);

    // Sidebar should now show details
    expect(screen.queryByText(/Select a microservice or library/i)).not.toBeInTheDocument();
    expect(screen.getByText('Release Management')).toBeInTheDocument();
    
    const sidebarTitle = screen.getByRole('heading', { level: 2, name: 'ext.models' });
    expect(sidebarTitle).toBeInTheDocument();
  });

  it('bumps version when Patch button is clicked', async () => {
    render(<App />);
    
    // Select a node
    const node = screen.getByTestId('node-ext.models');
    fireEvent.click(node);

    // Click 'Patch' button
    const patchBtn = screen.getByRole('button', { name: /Patch/i });
    fireEvent.click(patchBtn);

    // Expect version to become v1.0.1
    // findAllByText returns an array of elements. We just want to ensure at least one exists.
    const versions = await screen.findAllByText('v1.0.1');
    expect(versions.length).toBeGreaterThan(0);
  });
});
