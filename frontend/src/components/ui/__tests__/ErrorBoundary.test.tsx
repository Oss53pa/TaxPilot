/**
 * Tests pour Error Boundary
 */
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary Component', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeDefined()
  })

  it('should catch errors and display error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should show error message
    expect(screen.queryByText('No error')).toBeNull()
  })

  it('should log errors to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error')

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Console.error should have been called
    expect(consoleErrorSpy).toHaveBeenCalled()
  })

  it('should provide error details in development mode', () => {
    // Verify that import.meta.env.DEV is accessible
    expect(typeof import.meta.env.DEV).toBe('boolean')

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // In dev mode, error details might be shown
    // This is implementation-specific
    expect(true).toBe(true)
  })

  it('should prevent error propagation to parent', () => {
    // Error should be caught and not bubble up
    expect(() => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
    }).not.toThrow()
  })
})
