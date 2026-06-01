import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useSubmitEvaluation } from '../useSubmitEvaluation'

describe('useSubmitEvaluation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits evaluation responses successfully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          submission: {
            id: 'eval_1',
            sessionId: 'session_1',
            source: 'pre-course',
            startedAt: null,
            completedAt: '2026-06-01T00:00:00.000Z',
            submittedAt: '2026-06-01T00:00:00.000Z',
            skipped: false,
            likertResponses: { 'likert-1': 4 },
            openResponses: {},
            quizAttemptId: null,
          },
        }),
      }),
    )

    const { result } = renderHook(() => useSubmitEvaluation())

    await act(async () => {
      await result.current.submit({
        sessionId: 'session_1',
        source: 'pre-course',
        likertResponses: { 'likert-1': 4, 'likert-2': 4, 'likert-3': 4, 'likert-4': 4, 'likert-5': 4, 'likert-6': 4 },
        openResponses: {},
      })
    })

    expect(result.current.status).toBe('success')
    expect(result.current.data?.submission.id).toBe('eval_1')
  })
})
