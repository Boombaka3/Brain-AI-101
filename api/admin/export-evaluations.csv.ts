import { prisma } from '../_lib/prisma.js'
import { isAuthorizedAdminRequest } from '../_lib/auth.js'
import { toCsv } from '../_lib/csv.js'
import { methodNotAllowed, safeErrorMessage, sendJson, sendText, type VercelRequestLike, type VercelResponseLike } from '../_lib/http.js'
import { serializeEvaluationSource } from '../_lib/submissions.js'

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

    const evaluations = await prisma.evaluationSubmission.findMany({
      orderBy: {
        submittedAt: 'desc',
      },
    })

    const csv = toCsv(
      ['id', 'sessionId', 'source', 'skipped', 'submittedAt', 'startedAt', 'completedAt', 'quizAttemptId', 'likertResponses', 'openResponses'],
      evaluations.map((submission) => [
        submission.id,
        submission.sessionId,
        serializeEvaluationSource(submission.source),
        submission.skipped ? 'true' : 'false',
        submission.submittedAt.toISOString(),
        submission.startedAt?.toISOString() || '',
        submission.completedAt?.toISOString() || '',
        submission.quizAttemptId || '',
        JSON.stringify(submission.likertResponses),
        JSON.stringify(submission.openResponses),
      ]),
    )

    response.setHeader('Content-Disposition', 'attachment; filename="brain-ai-101-evaluations.csv"')
    return sendText(response, 200, csv, 'text/csv; charset=utf-8')
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to export evaluations.'),
    })
  }
}
