import { prisma } from '../_lib/prisma.js'
import { isAuthorizedAdminRequest } from '../_lib/auth.js'
import { toCsv } from '../_lib/csv.js'
import { checkRateLimit } from '../_lib/rateLimit.js'
import { serializeEvaluationSource } from '../_lib/submissions.js'
import {
  methodNotAllowed,
  safeErrorMessage,
  sendJson,
  sendText,
  type VercelRequestLike,
  type VercelResponseLike,
} from '../_lib/http.js'

const LIKERT_IDS = [
  'likert-1',
  'likert-2',
  'likert-3',
  'likert-4',
  'likert-5',
  'likert-6',
]

const LIKERT_SHORT_LABELS = [
  'Neuron parts',
  'Signal flow',
  'Bio vs artificial neuron',
  'Inputs weights activation',
  'Learning from feedback',
  'Interest in AI/neuro',
]

const OPEN_IDS = ['pre-goal', 'open-1', 'open-2', 'open-3']
const OPEN_SHORT_LABELS = [
  'Pre: Learning goal',
  'Post: Most helpful',
  'Post: Could improve',
  'Post: Other comments',
]

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

    const evaluations = await prisma.evaluationSubmission.findMany({
      orderBy: { submittedAt: 'desc' },
    })

    const headers = [
      'Timestamp',
      'Session ID',
      'Source',
      'Skipped',
      'Quiz Attempt ID',
      ...LIKERT_SHORT_LABELS.map((label) => `Likert: ${label} (1-5)`),
      ...OPEN_SHORT_LABELS,
    ]

    const rows = evaluations.map((submission) => {
      const likert = submission.likertResponses as Record<string, number>
      const open = submission.openResponses as Record<string, string>

      return [
        submission.submittedAt.toISOString(),
        submission.sessionId,
        serializeEvaluationSource(submission.source),
        submission.skipped ? 'Yes' : 'No',
        submission.quizAttemptId ?? '',
        ...LIKERT_IDS.map((id) => likert[id] ?? ''),
        ...OPEN_IDS.map((id) => open[id] ?? ''),
      ]
    })

    const csv = toCsv(headers, rows)

    response.setHeader(
      'Content-Disposition',
      'attachment; filename="brain-ai-101-evaluations-detailed.csv"',
    )
    return sendText(response, 200, csv, 'text/csv; charset=utf-8')
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to export detailed evaluations CSV.'),
    })
  }
}
