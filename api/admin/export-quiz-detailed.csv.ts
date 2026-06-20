import { prisma } from '../_lib/prisma.js'
import { isAuthorizedAdminRequest } from '../_lib/auth.js'
import { toCsv } from '../_lib/csv.js'
import { checkRateLimit } from '../_lib/rateLimit.js'
import {
  methodNotAllowed,
  safeErrorMessage,
  sendJson,
  sendText,
  type VercelRequestLike,
  type VercelResponseLike,
} from '../_lib/http.js'

export default async function handler(
  request: VercelRequestLike,
  response: VercelResponseLike,
) {
  if (!checkRateLimit(request, response)) return
  if (request.method === 'OPTIONS') {
    response.statusCode = 200
    response.end()
    return
  }
  if (request.method !== 'GET') return methodNotAllowed(response, 'GET')

  try {
    if (!isAuthorizedAdminRequest(request)) {
      return sendJson(response, 401, { ok: false, error: 'Unauthorized.' })
    }

    const attempts = await prisma.quizAttempt.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                moduleId: true,
                section: true,
                sectionTitle: true,
                concept: true,
                prompt: true,
                correctOptionId: true,
                options: true,
              },
            },
          },
        },
      },
    })

    const rows: Array<Array<unknown>> = []

    for (const attempt of attempts) {
      for (const answer of attempt.answers) {
        const question = answer.question
        const options = question.options as Array<{ id: string; text: string }>
        const selectedOption = options.find((option) => option.id === answer.selectedOptionId)
        const correctOption = options.find((option) => option.id === question.correctOptionId)

        rows.push([
          attempt.submittedAt.toISOString(),
          attempt.sessionId,
          attempt.score,
          attempt.maxScore,
          attempt.passed ? 'Yes' : 'No',
          attempt.source,
          question.moduleId,
          question.section ?? '',
          question.sectionTitle ?? '',
          question.concept ?? '',
          question.id,
          question.prompt,
          answer.selectedOptionId,
          selectedOption?.text ?? '',
          question.correctOptionId,
          correctOption?.text ?? '',
          answer.isCorrect ? 'Yes' : 'No',
          attempt.id,
        ])
      }
    }

    const headers = [
      'Timestamp',
      'Session ID',
      'Total Score',
      'Max Score',
      'Passed',
      'Source',
      'Module',
      'Section',
      'Section Title',
      'Concept',
      'Question ID',
      'Question Text',
      'Selected Answer',
      'Selected Answer Text',
      'Correct Answer',
      'Correct Answer Text',
      'Is Correct',
      'Attempt ID',
    ]

    const csv = toCsv(headers, rows)

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="brain-ai-101-quiz-detailed.csv"',
    )
    return sendText(response, 200, csv, 'text/csv; charset=utf-8')
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to export detailed quiz CSV.'),
    })
  }
}
