import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('toggles mobile menu aria-expanded state', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    const menuButton = screen.getByRole('button', { name: /open main menu/i });

    // Initially closed (false)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    // Click to open
    fireEvent.click(menuButton);

    // Should be open (true)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    // Click to close
    fireEvent.click(menuButton);

    // Should be closed (false)
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders skip to main content link', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Note: Use a more flexible matcher or getByText
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });
});
