import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from '../components/ui/Badge';

describe('Badge Component', () => {
  it('renders badge label correctly', () => {
    render(<Badge variant="brand">Featured Tutor</Badge>);
    expect(screen.getByText('Featured Tutor')).toBeInTheDocument();
  });

  it('renders success variant with proper styling class', () => {
    render(<Badge variant="success">Confirmed</Badge>);
    const badge = screen.getByText('Confirmed');
    expect(badge).toBeInTheDocument();
  });
});
