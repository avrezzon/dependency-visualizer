import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WelcomeModal from './WelcomeModal';

describe('WelcomeModal Component', () => {
  const defaultProps = {
    onUpload: vi.fn(),
    onNew: vi.fn(),
    onRandom: vi.fn(),
  };

  it('renders correctly', () => {
    render(<WelcomeModal {...defaultProps} />);
    expect(screen.getByText('Welcome to DepManager')).toBeInTheDocument();
    expect(screen.getByText('Upload a Session')).toBeInTheDocument();
    expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    expect(screen.getByText('Generate Random')).toBeInTheDocument();
  });

  it('has accessible dialog role and attributes', () => {
    render(<WelcomeModal {...defaultProps} />);

    // Should have role="dialog"
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Should have aria-modal="true"
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Should generally be labelled by the title
    const title = screen.getByText('Welcome to DepManager');
    // We expect the title to have an ID, and the dialog to point to it
    const titleId = title.getAttribute('id');
    expect(titleId).toBeTruthy();
    expect(dialog).toHaveAttribute('aria-labelledby', titleId);
  });

  it('sets initial focus to the first interactive element', async () => {
    render(<WelcomeModal {...defaultProps} />);

    // The "Upload a Session" button should be focused
    // We look for the button containing the text "Upload a Session"
    const uploadButton = screen.getByRole('button', { name: /Upload a Session/i });

    await waitFor(() => {
        expect(document.activeElement).toBe(uploadButton);
    });
  });
});
