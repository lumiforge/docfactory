import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary', 'text-white');
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    let button = screen.getByRole('button', { name: /delete/i });
    expect(button).toHaveClass('bg-error');

    rerender(<Button variant="outline">Cancel</Button>);
    button = screen.getByRole('button', { name: /cancel/i });
    expect(button).toHaveClass('border', 'border-border');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole('button', { name: /small/i });
    expect(button).toHaveClass('h-8');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button', { name: /large/i });
    expect(button).toHaveClass('h-12');
  });

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button', { name: /loading/i });
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-wait');
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render with left icon', () => {
    render(<Button leftIcon={<span data-testid="left-icon">→</span>}>Next</Button>);
    
    const icon = screen.getByTestId('left-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass('mr-2');
  });

  it('should render with right icon', () => {
    render(<Button rightIcon={<span data-testid="right-icon">→</span>}>Next</Button>);
    
    const icon = screen.getByTestId('right-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.parentElement).toHaveClass('ml-2');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button', { name: /disabled/i });
    
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('should not show icons when loading', () => {
    render(
      <Button 
        loading 
        leftIcon={<span data-testid="left-icon">→</span>}
        rightIcon={<span data-testid="right-icon">→</span>}
      >
        Loading
      </Button>
    );
    
    expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument();
  });
});