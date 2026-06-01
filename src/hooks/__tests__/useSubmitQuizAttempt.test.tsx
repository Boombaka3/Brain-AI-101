import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSubmitQuizAttempt } from '../useSubmitQuizAttempt'

describe('useSubmitQuizAttempt', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits a quiz attempt successfully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        attempt: {
          id: 'quiz_1',
          sessionId: 'session_1',
          source: 'course-evaluation',
          startedAt: null,
          completedAt: '2026-06-01T00:00:00.000Z',
          submittedAt: '2026-06-01T00:00:00.000Z',
          score: 9,
          maxScore: 10,
          passed: true,
          selectedAnswers: { q1: 'A' },
          moduleBreakdown: {},
        },
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSubmitQuizAttempt())

    await act(async () => {
      await result.current.submit({
        sessionId: 'session_1',
        selectedAnswers: { q1: 'A' },
      })
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/quiz-attempts',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(result.current.status).toBe('success')
    expect(result.current.data?.attempt.score).toBe(9)
  })

  it('surfaces API failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          ok: false,
          error: 'Database unavailable.',
        }),
      }),
    )

    const { result } = renderHook(() => useSubmitQuizAttempt())
    let capturedError = null

    await act(async () => {
      try {
        await result.current.submit({
          sessionId: 'session_2',
          selectedAnswers: { q1: 'B' },
        })
      } catch (error) {
        capturedError = error
      }
    })

    expect(capturedError).toBeInstanceOf(Error)
    expect(capturedError.message).toBe('Database unavailable.')
    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Database unavailable.')
  })
})
