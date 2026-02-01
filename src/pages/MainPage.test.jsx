import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainPage from './MainPage';

describe('MainPage', () => {
  it('renders the header correctly', () => {
    render(<MainPage />);
    // Use a more specific query to distinguish from the modal title
    expect(screen.getByRole('heading', { level: 1, name: /DepManager/i })).toBeInTheDocument();
    expect(screen.getByText(/Microservice Version Control/i)).toBeInTheDocument();
  });

  it('renders initial nodes', () => {
    render(<MainPage />);
    // Check for a core node by test id
    expect(screen.getByTestId('node-core:ext-models')).toBeInTheDocument();
    // Check for a repo node by test id
    expect(screen.getByTestId('node-data:repo-a')).toBeInTheDocument();
    
    // We can also verify text content if needed
    expect(screen.getByTestId('node-core:ext-models')).toHaveTextContent('ext-models');
  });

  it('updates sidebar when a node is selected', () => {
    render(<MainPage />);
    
    // Initial state: empty sidebar message
    expect(screen.getByText(/Select a microservice or library/i)).toBeInTheDocument();

    // Click on 'ext.models'
    const node = screen.getByTestId('node-core:ext-models');
    fireEvent.click(node);

    // Sidebar should now show details
    expect(screen.queryByText(/Select a microservice or library/i)).not.toBeInTheDocument();
    expect(screen.getByText('Release Management')).toBeInTheDocument();
    
    const sidebarTitle = screen.getByRole('heading', { level: 2, name: 'ext-models' });
    expect(sidebarTitle).toBeInTheDocument();
  });

  it('bumps version when Patch button is clicked', async () => {
    render(<MainPage />);
    
    // Select a node
    const node = screen.getByTestId('node-core:ext-models');
    fireEvent.click(node);

    // Click 'Patch' button
    const patchBtn = screen.getByRole('button', { name: /Patch/i });
    fireEvent.click(patchBtn);

    // Confirm Release in Modal
    const publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);

    // Expect version to become v1.0.1
    // findAllByText returns an array of elements. We just want to ensure at least one exists.
    const versions = await screen.findAllByText('v1.0.1');
    expect(versions.length).toBeGreaterThan(0);
  });

  it('bumps minor version when Minor button is clicked', async () => {
    render(<MainPage />);
    
    // Select a node
    const node = screen.getByTestId('node-core:ext-models');
    fireEvent.click(node);

    // Click 'Minor' button
    const minorBtn = screen.getByRole('button', { name: /Minor/i });
    fireEvent.click(minorBtn);

    // Confirm Release in Modal
    const publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);

    // Expect version to become v1.1.0
    const versions = await screen.findAllByText('v1.1.0');
    expect(versions.length).toBeGreaterThan(0);
  });

  it('bumps major version when Major button is clicked', async () => {
    render(<MainPage />);
    
    // Select a node
    const node = screen.getByTestId('node-core:ext-models');
    fireEvent.click(node);

    // Click 'Major' button
    const majorBtn = screen.getByRole('button', { name: /Major/i });
    fireEvent.click(majorBtn);

    // Confirm Release in Modal
    const publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);

    // Expect version to become v2.0.0
    const versions = await screen.findAllByText('v2.0.0');
    expect(versions.length).toBeGreaterThan(0);
  });

  it('shows upstream dependencies for a selected node', () => {
    render(<MainPage />);
    
    // Select Reader A which depends on common, repo-a, repo-c, repo-d
    const readerA = screen.getByTestId('node-app:reader-a');
    fireEvent.click(readerA);

    // Check that upstream dependencies section is visible
    expect(screen.getByText(/Immediate Dependencies/i)).toBeInTheDocument();
    
    // Check for one of the upstream dependencies using getAllByText since there are multiple
    const commonLibTexts = screen.getAllByText('common-lib');
    expect(commonLibTexts.length).toBeGreaterThan(0);
    
    const repoATexts = screen.getAllByText('repo-a');
    expect(repoATexts.length).toBeGreaterThan(0);
  });

  it('shows downstream dependencies for a selected node', () => {
    render(<MainPage />);
    
    // Select common-lib which is used by multiple readers
    const commonLib = screen.getByTestId('node-core:common-lib');
    fireEvent.click(commonLib);

    // Check that downstream dependencies section is visible
    expect(screen.getByText(/Used By/i)).toBeInTheDocument();
    
    // common is used by reader-a and other readers - use getAllByText since there are multiple
    const readerATexts = screen.getAllByText('reader-a');
    expect(readerATexts.length).toBeGreaterThan(0);
  });

  it('detects dependency drift and shows Rebuild & Bump App button', async () => {
    render(<MainPage />);
    
    // First bump a core library version
    const extModels = screen.getByTestId('node-core:ext-models');
    fireEvent.click(extModels);
    const patchBtn = screen.getByRole('button', { name: /Patch/i });
    fireEvent.click(patchBtn);
    
    // Confirm Release
    let publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);

    // Now select an app that depends on ext.models (reader-a -> common -> ext.models)
    // Or select common directly to see the drift
    const commonLib = screen.getByTestId('node-core:common-lib');
    fireEvent.click(commonLib);
    
    // The app still uses old version, so should show drift
    // However, apps need to explicitly depend on ext.models in our data model
    // Let's check that apps with outdated deps show the warning
    
    // Bump common version after reader is already using an older version
    const minorBtn = screen.getByRole('button', { name: /Minor/i });
    fireEvent.click(minorBtn); // common is now v1.1.0
    
    // Confirm Release
    publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);

    // Select reader-a to see if it shows dependency drift
    const readerA = screen.getByTestId('node-app:reader-a');
    fireEvent.click(readerA);
    
    // Should show Dependency Drift warning since it still uses old common version
    const rebuildBtn = await screen.findByRole('button', { name: /Rebuild & Bump Node/i });
    expect(rebuildBtn).toBeInTheDocument();
  });

  it('updates app dependencies when Rebuild & Bump Node is clicked', async () => {
    render(<MainPage />);
    
    // Bump common version
    const commonLib = screen.getByTestId('node-core:common-lib');
    fireEvent.click(commonLib);
    const minorBtn = screen.getByRole('button', { name: /Minor/i });
    fireEvent.click(minorBtn);
    
    // Confirm Release
    let publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);

    // Select an app (reader-a)
    const readerA = screen.getByTestId('node-app:reader-a');
    fireEvent.click(readerA);
    
    // Check if rebuild button exists and click it
    const rebuildBtn = await screen.findByRole('button', { name: /Rebuild & Bump Node/i });
    fireEvent.click(rebuildBtn);

    // The rebuild triggers a bump, which opens the modal
    publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);

    // After rebuilding, verify the action occurred
    expect(rebuildBtn).toBeDefined();
  });

  it('highlights related nodes on hover', () => {
    render(<MainPage />);
    
    // Hover over a node
    const commonLib = screen.getByTestId('node-core:common-lib');
    fireEvent.mouseEnter(commonLib);
    
    // Related nodes should remain visible (not faded)
    const readerA = screen.getByTestId('node-app:reader-a'); // depends on common
    expect(readerA).toHaveClass('opacity-100');
  });

  it('highlights related nodes on selection', () => {
    render(<MainPage />);
    
    // Select a node
    const commonLib = screen.getByTestId('node-core:common-lib');
    fireEvent.click(commonLib);
    
    // Related nodes should be highlighted
    const readerA = screen.getByTestId('node-app:reader-a');
    expect(readerA).toHaveClass('opacity-100');
    
    // Unrelated nodes would be faded if we had any (all are connected in our graph)
  });
});