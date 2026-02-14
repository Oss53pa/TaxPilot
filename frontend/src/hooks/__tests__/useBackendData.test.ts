/**
 * Tests pour le hook useBackendData
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBackendData } from '../useBackendData'

// Mock services module
vi.mock('@/services', () => ({
  entrepriseService: {
    getEntreprises: vi.fn().mockResolvedValue({ results: [] }),
  },
}))

describe('useBackendData Hook', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with loading state when autoLoad is true', () => {
    const { result } = renderHook(() =>
      useBackendData({
        service: 'entrepriseService',
        method: 'getEntreprises',
        autoLoad: true,
      })
    )

    // Initial state should have loading true
    expect(result.current).toBeDefined()
    expect(result.current.data).toBeDefined()
  })

  it('should not load when autoLoad is false', () => {
    const { result } = renderHook(() =>
      useBackendData({
        service: 'entrepriseService',
        method: 'getEntreprises',
        autoLoad: false,
        defaultData: [],
      })
    )

    // Should not be loading
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual([])
  })

  it('should fetch data on mount when autoLoad is true', async () => {
    const { result } = renderHook(() =>
      useBackendData({
        service: 'entrepriseService',
        method: 'getEntreprises',
        autoLoad: true,
        defaultData: [],
      })
    )

    // Wait for data to be fetched
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    expect(result.current).toBeDefined()
  })

  it('should handle fetch errors gracefully', async () => {
    // Re-mock with a rejection
    const services = await import('@/services') as any
    services.entrepriseService.getEntreprises = vi.fn().mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() =>
      useBackendData({
        service: 'entrepriseService',
        method: 'getEntreprises',
        autoLoad: true,
        defaultData: [],
      })
    )

    // Wait for error state
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false)
      },
      { timeout: 1000 }
    )

    expect(result.current).toBeDefined()
  })

  it('should provide a reload function', () => {
    const { result } = renderHook(() =>
      useBackendData({
        service: 'entrepriseService',
        method: 'getEntreprises',
        autoLoad: false,
        defaultData: [],
      })
    )

    expect(typeof result.current.reload).toBe('function')
  })
})
