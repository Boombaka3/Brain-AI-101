import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AdminSubmissionsPage from '../AdminSubmissionsPage'

describe('AdminSubmissionsPage', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads and renders admin submissions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          summary: {
            quizAttemptCount: 1,
            evaluationCount: 1,
            averageQuizScore: 8,
            passCount: 1,
            preCourseCount: 0,
            postCourseCount: 1,
          },
          quizAttempts: [
            {
              id: 'quiz_1',
              sessionId: 'session_1',
              source: 'course-evaluation',
              startedAt: null,
              completedAt: null,
              submittedAt: '2026-06-01T00:00:00.000Z',
              score: 8,
              maxScore: 10,
              passed: true,
              selectedAnswers: { q1: 'A' },
              moduleBreakdown: {},
            },
          ],
          evaluations: [
            {
              id: 'eval_1',
              sessionId: 'session_1',
              source: 'course-evaluation',
              startedAt: null,
              completedAt: null,
              submittedAt: '2026-06-01T00:00:00.000Z',
              skipped: false,
              likertResponses: { 'likert-1': 4 },
              openResponses: {},
              quizAttemptId: 'quiz_1',
            },
          ],
        }),
      }),
    )

    render(<AdminSubmissionsPage onBack={() => undefined} />)

    fireEvent.change(screen.getByLabelText(/Admin token/i), {
      target: { value: 'secret-token' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Load submissions/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Quiz attempts' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Evaluations' })).toBeInTheDocument()
      expect(screen.getAllByText('session_1')).toHaveLength(2)
    })
  })

  it('shows unauthorized errors clearly', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          ok: false,
          error: 'Unauthorized.',
        }),
      }),
    )

    render(<AdminSubmissionsPage onBack={() => undefined} />)

    fireEvent.change(screen.getByLabelText(/Admin token/i), {
      target: { value: 'wrong-token' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Load submissions/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Unauthorized.')
    })
  })
})
