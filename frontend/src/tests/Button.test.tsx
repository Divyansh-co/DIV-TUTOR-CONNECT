import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button } from '../components/ui/Button';

describe('Button Component', () => {
  it('renders child text correctly', () => {
    render(<Button>Book Session</Button>);
    expect(screen.getByText('Book Session')).toBeInTheDocument();
  });

  it('handles loading state with spinner', () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
