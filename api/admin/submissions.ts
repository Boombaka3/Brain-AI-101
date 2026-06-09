import { prisma } from '../_lib/prisma.js'
import { isAuthorizedAdminRequest } from '../_lib/auth.js'
import { buildAdminSummary, serializeEvaluationSource } from '../_lib/submissions.js'
import { methodNotAllowed, safeErrorMessage, sendJson, type VercelRequestLike, type VercelResponseLike } from '../_lib/http.js'

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  if (request.method !== 'GET') {
    return methodNotAllowed(response, 'GET')
  }

  try {
    if (!isAuthorizedAdminRequest(request)) {
      return sendJson(response, 401, {
        ok: false,
        error: 'Unauthorized.',
      })
    }

    const [quizAttempts, evaluations] = await Promise.all([
      prisma.quizAttempt.findMany({
        include: {
          answers: true,
        },
        orderBy: {
          submittedAt: 'desc',
        },
      }),
      prisma.evaluationSubmission.findMany({
        orderBy: {
          submittedAt: 'desc',
        },
      }),
    ])

    const summary = buildAdminSummary(quizAttempts, evaluations)

    return sendJson(response, 200, {
      ok: true,
      summary,
      quizAttempts: quizAttempts.map((attempt) => ({
        id: attempt.id,
        sessionId: attempt.sessionId,
        source: attempt.source,
        startedAt: attempt.startedAt?.toISOString() || null,
        completedAt: attempt.completedAt?.toISOString() || null,
        submittedAt: attempt.submittedAt.toISOString(),
        score: attempt.score,
        maxScore: attempt.maxScore,
        passed: attempt.passed,
        selectedAnswers: attempt.selectedAnswers,
        moduleBreakdown: attempt.moduleBreakdown,
      })),
      evaluations: evaluations.map((submission) => ({
        id: submission.id,
        sessionId: submission.sessionId,
        source: serializeEvaluationSource(submission.source),
        startedAt: submission.startedAt?.toISOString() || null,
        completedAt: submission.completedAt?.toISOString() || null,
        submittedAt: submission.submittedAt.toISOString(),
        skipped: submission.skipped,
        likertResponses: submission.likertResponses,
        openResponses: submission.openResponses,
        quizAttemptId: submission.quizAttemptId || null,
      })),
    })
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to load admin submissions.'),
    })
  }
}
