import { prisma } from './_lib/prisma.js'
import { methodNotAllowed, readJsonBody, safeErrorMessage, sendJson, type VercelRequestLike, type VercelResponseLike } from './_lib/http.js'
import { mapEvaluationSource, scoreQuizAnswers } from './_lib/submissions.js'
import { validateEvaluationPayload, validateQuizAttemptPayload } from './_lib/validation.js'
import { questionMap } from './_lib/courseData.js'

function toLegacyQuizPayload(payload: Record<string, unknown>) {
  return {
    sessionId: payload.sessionId,
    startedAt: (payload.summary as Record<string, unknown> | undefined)?.startedAt || null,
    completedAt: (payload.summary as Record<string, unknown> | undefined)?.completedAt || payload.submittedAt || null,
    selectedAnswers: payload.quizAnswers || {},
    source: payload.source || 'course-evaluation',
  }
}

function toLegacyEvaluationPayload(payload: Record<string, unknown>, quizAttemptId: string) {
  return {
    sessionId: payload.sessionId,
    source: payload.source === 'pre-course' ? 'pre-course' : 'course-evaluation',
    startedAt: (payload.summary as Record<string, unknown> | undefined)?.startedAt || null,
    completedAt: (payload.summary as Record<string, unknown> | undefined)?.completedAt || payload.submittedAt || null,
    skipped: false,
    likertResponses: (payload.summary as Record<string, unknown> | undefined)?.likertResponses || {},
    openResponses: (payload.summary as Record<string, unknown> | undefined)?.openResponses || {},
    quizAttemptId,
  }
}

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  if (request.method !== 'POST') {
    return methodNotAllowed(response, 'POST')
  }

  try {
    const legacyPayload = (await readJsonBody(request)) as Record<string, unknown>
    const quizPayload = validateQuizAttemptPayload(toLegacyQuizPayload(legacyPayload))
    const scored = scoreQuizAnswers(quizPayload.selectedAnswers)

    const attempt = await prisma.quizAttempt.create({
      data: {
        sessionId: quizPayload.sessionId,
        source: quizPayload.source || 'course-evaluation',
        startedAt: quizPayload.startedAt ? new Date(quizPayload.startedAt) : null,
        completedAt: quizPayload.completedAt ? new Date(quizPayload.completedAt) : null,
        submittedAt: quizPayload.completedAt ? new Date(quizPayload.completedAt) : new Date(),
        score: scored.score,
        maxScore: scored.maxScore,
        passed: scored.passed,
        moduleBreakdown: scored.moduleBreakdown,
        selectedAnswers: quizPayload.selectedAnswers,
        answers: {
          create: Object.entries(quizPayload.selectedAnswers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
            isCorrect: questionMap.get(questionId)?.correctOptionId === selectedOptionId,
          })),
        },
      },
    })

    const evaluationPayload = validateEvaluationPayload(toLegacyEvaluationPayload(legacyPayload, attempt.id))

    await prisma.evaluationSubmission.create({
      data: {
        sessionId: evaluationPayload.sessionId,
        source: mapEvaluationSource(evaluationPayload.source),
        startedAt: evaluationPayload.startedAt ? new Date(evaluationPayload.startedAt) : null,
        completedAt: evaluationPayload.completedAt ? new Date(evaluationPayload.completedAt) : null,
        submittedAt: evaluationPayload.completedAt ? new Date(evaluationPayload.completedAt) : new Date(),
        skipped: evaluationPayload.skipped || false,
        likertResponses: evaluationPayload.likertResponses,
        openResponses: evaluationPayload.openResponses || {},
        quizAttemptId: attempt.id,
      },
    })

    return sendJson(response, 200, {
      ok: true,
      files: [
        { type: 'quiz-attempt', path: attempt.id },
        { type: 'evaluation', path: attempt.id },
      ],
    })
  } catch (error) {
    return sendJson(response, 400, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to submit evaluation.'),
    })
  }
}
