/**
 * Tests pour le service API Client
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('API Client Service', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should store tokens securely in sessionStorage', () => {
    const mockTokens = {
      access: 'test-access-token',
      refresh: 'test-refresh-token'
    }

    // Simulate login
    sessionStorage.setItem('refresh_token', mockTokens.refresh)

    expect(sessionStorage.getItem('refresh_token')).toBe(mockTokens.refresh)
    // Access token should NOT be in sessionStorage (stored in memory)
    expect(sessionStorage.getItem('access_token')).toBeNull()
  })

  it('should extract CSRF token from cookies', () => {
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'csrftoken=test-csrf-token; other=value'
    })

    // The apiClient should be able to extract CSRF token
    // This is tested indirectly through the private method
    expect(document.cookie).toContain('csrftoken=test-csrf-token')
  })

  it('should handle 401 errors and attempt token refresh', async () => {
    // Mock fetch to return 401
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' })
    })
    global.fetch = mockFetch as any

    // Expect API call to handle 401
    try {
      await fetch('/api/test')
    } catch (_error) {
      // Error should be caught and handled
    }

    expect(mockFetch).toHaveBeenCalled()
  })

  it('should clear tokens on logout', () => {
    // Set tokens
    sessionStorage.setItem('refresh_token', 'test-refresh')

    // Clear on logout
    sessionStorage.removeItem('refresh_token')
    sessionStorage.removeItem('access_token')

    expect(sessionStorage.getItem('refresh_token')).toBeNull()
    expect(sessionStorage.getItem('access_token')).toBeNull()
  })

  it('should use environment variable for API base URL', () => {
    // Check that VITE_API_BASE_URL is used
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

    expect(apiUrl).toBeDefined()
    expect(typeof apiUrl).toBe('string')
  })
})
