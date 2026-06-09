import { prisma } from '../_lib/prisma.js'
import { isAuthorizedAdminRequest } from '../_lib/auth.js'
import { toCsv } from '../_lib/csv.js'
import { methodNotAllowed, safeErrorMessage, sendJson, sendText, type VercelRequestLike, type VercelResponseLike } from '../_lib/http.js'

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

    const attempts = await prisma.quizAttempt.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
    })

    const csv = toCsv(
      ['id', 'sessionId', 'source', 'score', 'maxScore', 'passed', 'submittedAt', 'startedAt', 'completedAt'],
      attempts.map((attempt) => [
        attempt.id,
        attempt.sessionId,
        attempt.source,
        attempt.score,
        attempt.maxScore,
        attempt.passed ? 'true' : 'false',
        attempt.submittedAt.toISOString(),
        attempt.startedAt?.toISOString() || '',
        attempt.completedAt?.toISOString() || '',
      ]),
    )

    response.setHeader('Content-Disposition', 'attachment; filename="brain-ai-101-quiz-attempts.csv"')
    return sendText(response, 200, csv, 'text/csv; charset=utf-8')
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to export quiz attempts.'),
    })
  }
}
