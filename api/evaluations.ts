import { prisma } from './_lib/prisma'
import { methodNotAllowed, readJsonBody, safeErrorMessage, sendJson, type VercelRequestLike, type VercelResponseLike } from './_lib/http'
import { mapEvaluationSource, serializeEvaluationSource } from './_lib/submissions'
import { validateEvaluationPayload } from './_lib/validation'

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  if (request.method !== 'POST') {
    return methodNotAllowed(response, 'POST')
  }

  try {
    const payload = validateEvaluationPayload(await readJsonBody(request))

    if (payload.quizAttemptId) {
      const linkedAttempt = await prisma.quizAttempt.findUnique({
        where: { id: payload.quizAttemptId },
        select: { id: true },
      })

      if (!linkedAttempt) {
        return sendJson(response, 404, {
          ok: false,
          error: 'Referenced quiz attempt was not found.',
        })
      }
    }

    const submission = await prisma.evaluationSubmission.create({
      data: {
        sessionId: payload.sessionId,
        source: mapEvaluationSource(payload.source),
        startedAt: payload.startedAt ? new Date(payload.startedAt) : null,
        completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
        submittedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
        skipped: payload.skipped || false,
        likertResponses: payload.likertResponses,
        openResponses: payload.openResponses || {},
        quizAttemptId: payload.quizAttemptId,
      },
    })

    return sendJson(response, 201, {
      ok: true,
      submission: {
        id: submission.id,
        sessionId: submission.sessionId,
        source: serializeEvaluationSource(submission.source),
        startedAt: submission.startedAt?.toISOString() || null,
        completedAt: submission.completedAt?.toISOString() || null,
        submittedAt: submission.submittedAt.toISOString(),
        skipped: submission.skipped,
        likertResponses: payload.likertResponses,
        openResponses: payload.openResponses || {},
        quizAttemptId: submission.quizAttemptId || null,
      },
    })
  } catch (error) {
    return sendJson(response, 400, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to store evaluation.'),
    })
  }
}
