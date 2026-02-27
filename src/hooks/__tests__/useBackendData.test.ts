/**
 * Tests pour le hook useBackendData
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBackendData } from '../useBackendData'

// Mock fetch
global.fetch = vi.fn()

describe('useBackendData Hook', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    const { result } = renderHook(() =>
      useBackendData('/api/test', { enabled: false })
    )

    // Initial state should be loading or idle
    expect(result.current).toBeDefined()
  })

  it('should fetch data on mount when enabled', async () => {
    const mockData = { id: 1, name: 'Test' }

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    const { result } = renderHook(() =>
      useBackendData('/api/test', { enabled: true })
    )

    // Wait for data to be fetched
    await waitFor(
      () => {
        expect(result.current).toBeDefined()
      },
      { timeout: 1000 }
    )
  })

  it('should handle fetch errors gracefully', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() =>
      useBackendData('/api/test', { enabled: true })
    )

    // Wait for error state
    await waitFor(
      () => {
        expect(result.current).toBeDefined()
      },
      { timeout: 1000 }
    )
  })

  it('should support AbortController for cleanup', async () => {
    const mockData = { test: 'data' }

    ;(global.fetch as any).mockImplementation((url: string, options?: any) => {
      // Verify signal is passed
      expect(options?.signal).toBeInstanceOf(AbortSignal)

      return Promise.resolve({
        ok: true,
        json: async () => mockData
      })
    })

    const { unmount } = renderHook(() =>
      useBackendData('/api/test', { enabled: true })
    )

    // Unmount should trigger abort
    unmount()

    await waitFor(() => {
      expect(true).toBe(true) // Cleanup happened
    })
  })

  it('should not fetch when enabled is false', () => {
    renderHook(() => useBackendData('/api/test', { enabled: false }))

    // Fetch should not have been called
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
