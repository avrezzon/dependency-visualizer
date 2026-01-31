import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MainPage from './pages/MainPage';

describe('Transitive Dependency Drift', () => {
  it('displays transitive outliers when a deep dependency is updated', async () => {
    render(<MainPage />);
    
    // Chain: reader-a -> common-lib -> ext.models
    
    // 1. Bump ext.models (Foundation) to v1.0.1
    const extModels = screen.getByTestId('node-ext.models');
    fireEvent.click(extModels);
    
    const patchBtn = screen.getByRole('button', { name: /Patch/i });
    fireEvent.click(patchBtn);
    
    const publishBtn = await screen.findByRole('button', { name: /Publish Release/i });
    fireEvent.click(publishBtn);
    
    // Now ext.models is v1.0.1.
    // common-lib (v1.0.0) is drifted (locks ext.models@1.0.0).
    // reader-a (v2.1.0) locks common-lib@1.0.0.
    
    // reader-a should be transitively outdated because common-lib is outdated.
    
    const readerA = screen.getByTestId('node-reader-a');
    fireEvent.click(readerA);
    
    // Expect "Dependency Drift" warning
    expect(screen.getByText('Dependency Drift')).toBeInTheDocument();
    
    // Expect to see ext.models listed in the drift details
    // This is currently failing because the app doesn't propagate the details
    const driftSection = screen.getByText('Dependency Drift').closest('div.bg-amber-50');
    expect(within(driftSection).getByText(/ext.models/)).toBeInTheDocument();
  });
});
