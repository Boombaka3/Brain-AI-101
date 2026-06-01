import { prisma } from './_lib/prisma'
import { methodNotAllowed, readJsonBody, safeErrorMessage, sendJson, type VercelRequestLike, type VercelResponseLike } from './_lib/http'
import { scoreQuizAnswers } from './_lib/submissions'
import { validateQuizAttemptPayload } from './_lib/validation'
import { questionMap } from './_lib/courseData'

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  if (request.method !== 'POST') {
    return methodNotAllowed(response, 'POST')
  }

  try {
    const payload = validateQuizAttemptPayload(await readJsonBody(request))
    const scored = scoreQuizAnswers(payload.selectedAnswers)

    const attempt = await prisma.quizAttempt.create({
      data: {
        sessionId: payload.sessionId,
        source: payload.source || 'course-evaluation',
        startedAt: payload.startedAt ? new Date(payload.startedAt) : null,
        completedAt: payload.completedAt ? new Date(payload.completedAt) : null,
        submittedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
        score: scored.score,
        maxScore: scored.maxScore,
        passed: scored.passed,
        moduleBreakdown: scored.moduleBreakdown,
        selectedAnswers: payload.selectedAnswers,
        answers: {
          create: Object.entries(payload.selectedAnswers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
            isCorrect: questionMap.get(questionId)?.correctOptionId === selectedOptionId,
          })),
        },
      },
    })

    return sendJson(response, 201, {
      ok: true,
      attempt: {
        id: attempt.id,
        sessionId: attempt.sessionId,
        source: attempt.source,
        startedAt: attempt.startedAt?.toISOString() || null,
        completedAt: attempt.completedAt?.toISOString() || null,
        submittedAt: attempt.submittedAt.toISOString(),
        score: attempt.score,
        maxScore: attempt.maxScore,
        passed: attempt.passed,
        selectedAnswers: payload.selectedAnswers,
        moduleBreakdown: scored.moduleBreakdown,
      },
    })
  } catch (error) {
    return sendJson(response, 400, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to store quiz attempt.'),
    })
  }
}
