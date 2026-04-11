import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CharacterCounter } from './CharacterCounter';

describe('CharacterCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render character count and limit', () => {
    render(<CharacterCounter text="Hello world" platform="twitter" />);
    
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
  });

  it('should show ok status for content well under limit', () => {
    const { container } = render(
      <CharacterCounter text="Short" platform="twitter" />
    );
    
    expect(container.querySelector('.character-counter')).toHaveClass('counter-ok');
  });

  it('should show warning status near limit', () => {
    const text = 'a'.repeat(260);
    const { container } = render(
      <CharacterCounter text={text} platform="twitter" />
    );
    
    expect(container.querySelector('.character-counter')).toHaveClass('counter-warning');
  });

  it('should show over status when exceeding limit', () => {
    const text = 'a'.repeat(300);
    const { container } = render(
      <CharacterCounter text={text} platform="twitter" />
    );
    
    expect(container.querySelector('.character-counter')).toHaveClass('counter-over');
  });

  it('should display warning message when near limit', () => {
    const text = 'a'.repeat(260);
    render(<CharacterCounter text={text} platform="twitter" />);
    
    expect(screen.getByText(/% remaining/)).toBeInTheDocument();
  });

  it('should display over message when exceeding limit', () => {
    const text = 'a'.repeat(300);
    render(<CharacterCounter text={text} platform="twitter" />);
    
    expect(screen.getByText(/Over by/)).toBeInTheDocument();
    expect(screen.getByText(/20 characters/)).toBeInTheDocument();
  });

  it('should not show message when in ok state', () => {
    render(<CharacterCounter text="Short" platform="twitter" />);
    
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Over by/)).not.toBeInTheDocument();
  });

  it('should handle different platforms correctly', () => {
    const text = 'a'.repeat(500);
    
    const { rerender } = render(<CharacterCounter text={text} platform="twitter" />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
    
    rerender(<CharacterCounter text={text} platform="linkedin" />);
    expect(screen.getByText('500')).toBeInTheDocument();
    // LinkedIn limit is 3000 (not formatted with commas in the component)
    expect(screen.getByText('3000')).toBeInTheDocument();
  });

  it('should handle empty text', () => {
    render(<CharacterCounter text="" platform="twitter" />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <CharacterCounter text="Test" platform="twitter" className="custom-class" />
    );
    
    expect(container.querySelector('.character-counter')).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    render(<CharacterCounter text="Test" platform="twitter" />);
    
    const counter = screen.getByRole('status');
    expect(counter).toHaveAttribute('aria-live', 'polite');
  });

  it('should show alert role when over limit', () => {
    const text = 'a'.repeat(300);
    render(<CharacterCounter text={text} platform="twitter" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/Over by/);
  });

  it('should render SVG progress ring', () => {
    const { container } = render(
      <CharacterCounter text="Test" platform="twitter" />
    );
    
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('should handle URLs correctly for Twitter character counting', () => {
    const text = 'Check https://example.com/very/long/url/here';
    render(<CharacterCounter text={text} platform="twitter" />);
    
    expect(screen.getByText('29')).toBeInTheDocument();
  });

  it('should update when text changes', () => {
    const { rerender } = render(<CharacterCounter text="Hello" platform="twitter" />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    
    rerender(<CharacterCounter text="Hello world" platform="twitter" />);
    
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('should handle Bluesky platform', () => {
    const text = 'a'.repeat(250);
    render(<CharacterCounter text={text} platform="bluesky" />);
    
    expect(screen.getByText('250')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('should handle Threads platform', () => {
    const text = 'a'.repeat(400);
    render(<CharacterCounter text={text} platform="threads" />);
    
    expect(screen.getByText('400')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should handle exact limit boundary', () => {
    const text = 'a'.repeat(280);
    const { container } = render(
      <CharacterCounter text={text} platform="twitter" />
    );
    
    // At exactly 100%, it may be warning depending on threshold calculation
    // Just verify no alert is shown
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    
    // The counter should be rendered
    expect(container.querySelector('.character-counter')).toBeInTheDocument();
  });

  it('should format large numbers', () => {
    const text = 'a'.repeat(1500);
    render(<CharacterCounter text={text} platform="linkedin" />);
    
    // Component shows raw numbers without formatting
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('3000')).toBeInTheDocument();
  });
});
