import { Buffer } from 'node:buffer'

const DROPBOX_TOKEN_URL = 'https://api.dropboxapi.com/oauth2/token'
const DROPBOX_UPLOAD_URL = 'https://content.dropboxapi.com/2/files/upload'
const MAX_OPEN_RESPONSE_LENGTH = 4000
const MAX_TOTAL_OPEN_RESPONSE_LENGTH = 10000
const MAX_REQUEST_BYTES = 256 * 1024

const LIKERT_LABELS = {
  'likert-1': 'I can explain the basic parts of a biological neuron.',
  'likert-2': 'I understand how signals move from one neuron to another.',
  'likert-3': 'I can explain how an artificial neuron is similar to a biological neuron.',
  'likert-4': 'I understand the basic idea of how artificial neural networks use inputs, weights, and activation functions.',
  'likert-5': 'I understand the basic idea of how AI systems learn from feedback, including weight updates.',
  'likert-6': 'I am interested in learning more about neuroscience and artificial intelligence.',
}

const OPEN_RESPONSE_LABELS = {
  'open-1': 'What do you find most helpful from the website and lecture/lab?',
  'open-2': 'Where do you think this website/lecture/lab could be improved?',
  'open-3': 'Feel free to share any suggestions or comments!',
}

const QUIZ_LABELS = {
  q1: 'Module 1: meaningful input and threshold',
  q2: 'Module 1: summation and threshold',
  q3: 'Module 1: biology to artificial neuron bridge',
  q4: 'Module 2: hidden layers and feature hierarchy',
  q5: 'Module 2: ReLU activation',
  q6: 'Module 2: selectivity and weights',
  q7: 'Module 2: CNN output size',
  q8: 'Module 2: CNN filter calculation',
  q9: 'Module 3: learning types',
  q10: 'Module 3: backpropagation and weight updates',
}

const QUIZ_ANSWER_KEY = {
  q1: 'C',
  q2: 'A',
  q3: 'D',
  q4: 'A',
  q5: 'C',
  q6: 'B',
  q7: 'D',
  q8: 'C',
  q9: 'D',
  q10: 'B',
}

const QUIZ_MODULES = {
  q1: 'module1',
  q2: 'module1',
  q3: 'module1',
  q4: 'module2',
  q5: 'module2',
  q6: 'module2',
  q7: 'module2',
  q8: 'module2',
  q9: 'module3',
  q10: 'module3',
}

const MODULE_LABELS = {
  module1: 'Module 1',
  module2: 'Module 2',
  module3: 'Module 3',
}

const PASSING_SCORE = 7

function json(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body
  }

  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body)
    } catch {
      throw new Error('Request body must be valid JSON.')
    }
  }

  const chunks = []
  let totalBytes = 0

  for await (const chunk of request) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalBytes += bufferChunk.length

    if (totalBytes > MAX_REQUEST_BYTES) {
      throw new Error('Request body is too large.')
    }

    chunks.push(bufferChunk)
  }

  const rawBody = Buffer.concat(chunks).toString('utf8').trim()

  if (!rawBody) {
    throw new Error('Request body is required.')
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    throw new Error('Request body must be valid JSON.')
  }
}

function isIsoDateString(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function safeFilePart(value) {
  return String(value || 'unknown-session')
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120) || 'unknown-session'
}

function escapeLatex(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([{}#$%&_])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\r\n|\r|\n/g, '\n\n')
}

function formatLatexValue(value, fallback = 'Not provided') {
  const normalized = value === null || value === undefined || value === ''
    ? fallback
    : String(value)

  return escapeLatex(normalized)
}

function buildQuizReportRows(payload) {
  return Object.entries(QUIZ_LABELS).map(([id, label]) => {
    const selectedAnswer = payload.quizAnswers[id] || 'No answer'
    const correctAnswer = QUIZ_ANSWER_KEY[id] || null
    const correctness = correctAnswer
      ? selectedAnswer === correctAnswer
        ? 'Correct'
        : 'Incorrect'
      : 'Not available'

    return {
      id,
      label,
      selectedAnswer,
      correctness,
    }
  })
}

function validateLikertResponses(likertResponses = {}) {
  const sanitized = {}

  for (const id of Object.keys(LIKERT_LABELS)) {
    const value = likertResponses[id]

    if (value === undefined || value === null || value === '') {
      sanitized[id] = null
      continue
    }

    const numericValue = Number(value)
    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 5) {
      throw new Error(`Likert response "${id}" must be an integer from 1 to 5.`)
    }

    sanitized[id] = numericValue
  }

  return sanitized
}

function buildServerKnowledgeSummary(quizAnswers = {}) {
  const questionResults = Object.entries(QUIZ_LABELS).map(([id, label]) => {
    const selectedAnswer = quizAnswers[id] || null
    const correctAnswer = QUIZ_ANSWER_KEY[id] || null
    const module = QUIZ_MODULES[id] || 'module3'
    const isCorrect = Boolean(correctAnswer) && selectedAnswer === correctAnswer

    return {
      id,
      label,
      module,
      selectedAnswer,
      correctAnswer,
      isCorrect,
    }
  })

  const score = questionResults.filter((item) => item.isCorrect).length
  const maxScore = questionResults.length
  const moduleBreakdown = questionResults.reduce((acc, item) => {
    const current = acc[item.module] || {
      module: item.module,
      label: MODULE_LABELS[item.module] || item.module,
      correct: 0,
      total: 0,
    }

    current.total += 1
    if (item.isCorrect) {
      current.correct += 1
    }

    acc[item.module] = current
    return acc
  }, {})

  return {
    score,
    maxScore,
    passed: score >= PASSING_SCORE,
    moduleBreakdown,
    questionResults,
  }
}

function sanitizeOpenResponses(openResponses = {}) {
  const sanitized = {}
  let totalLength = 0

  for (const [key, value] of Object.entries(openResponses)) {
    const normalized = typeof value === 'string' ? value.trim() : ''
    if (normalized.length > MAX_OPEN_RESPONSE_LENGTH) {
      throw new Error(`Open response "${key}" is too long.`)
    }
    totalLength += normalized.length
    sanitized[key] = normalized
  }

  if (totalLength > MAX_TOTAL_OPEN_RESPONSE_LENGTH) {
    throw new Error('Open responses are too large.')
  }

  return sanitized
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be a JSON object.')
  }

  const {
    schemaVersion,
    sessionId,
    source,
    submittedAt,
    quizAnswers,
    summary,
  } = payload

  if (typeof schemaVersion !== 'string' || schemaVersion.trim().length === 0) {
    throw new Error('schemaVersion is required.')
  }

  if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    throw new Error('sessionId is required.')
  }

  if (typeof source !== 'string' || source.trim().length === 0) {
    throw new Error('source is required.')
  }

  if (!isIsoDateString(submittedAt)) {
    throw new Error('submittedAt must be a valid ISO date string.')
  }

  if (!quizAnswers || typeof quizAnswers !== 'object' || Array.isArray(quizAnswers) || Object.keys(quizAnswers).length === 0) {
    throw new Error('quizAnswers is required.')
  }

  for (const [questionId, answer] of Object.entries(quizAnswers)) {
    if (typeof questionId !== 'string' || questionId.trim().length === 0) {
      throw new Error('quizAnswers contains an invalid question id.')
    }

    const normalizedAnswer = typeof answer === 'string' ? answer.trim().toUpperCase() : ''
    if (!['A', 'B', 'C', 'D'].includes(normalizedAnswer)) {
      throw new Error(`quizAnswers contains an invalid answer for "${questionId}".`)
    }

    quizAnswers[questionId] = normalizedAnswer
  }

  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) {
    throw new Error('summary is required.')
  }

  const likertResponses = validateLikertResponses(summary.likertResponses || {})
  const openResponses = sanitizeOpenResponses(summary.openResponses || {})
  const serverKnowledgeSummary = buildServerKnowledgeSummary(quizAnswers)

  return {
    schemaVersion: schemaVersion.trim(),
    sessionId: sessionId.trim(),
    source: source.trim(),
    submittedAt: new Date(submittedAt).toISOString(),
    quizAnswers,
    summary: {
      attemptId: typeof summary.attemptId === 'string' ? summary.attemptId.trim() : '',
      startedAt: isIsoDateString(summary.startedAt) ? new Date(summary.startedAt).toISOString() : null,
      completedAt: isIsoDateString(summary.completedAt) ? new Date(summary.completedAt).toISOString() : null,
      likertResponses,
      openResponses,
      score: serverKnowledgeSummary.score,
      maxScore: serverKnowledgeSummary.maxScore,
      moduleBreakdown: serverKnowledgeSummary.moduleBreakdown,
      passed: serverKnowledgeSummary.passed,
    },
    questionResults: serverKnowledgeSummary.questionResults,
  }
}

function buildEvaluationJson(payload) {
  return {
    schemaVersion: payload.schemaVersion,
    sessionId: payload.sessionId,
    source: payload.source,
    submittedAt: payload.submittedAt,
    summary: payload.summary,
    quizAnswers: payload.quizAnswers,
    labels: {
      likert: LIKERT_LABELS,
      openResponses: OPEN_RESPONSE_LABELS,
      quiz: QUIZ_LABELS,
    },
    questionResults: payload.questionResults,
  }
}

function buildEvaluationText(payload) {
  const lines = [
    'Brain x AI 101 Course Evaluation',
    '',
    `Session ID: ${payload.sessionId}`,
    `Source: ${payload.source}`,
    `Submitted At: ${payload.submittedAt}`,
  ]

  if (payload.summary.attemptId) {
    lines.push(`Attempt ID: ${payload.summary.attemptId}`)
  }

  if (payload.summary.startedAt) {
    lines.push(`Started At: ${payload.summary.startedAt}`)
  }

  if (payload.summary.completedAt) {
    lines.push(`Completed At: ${payload.summary.completedAt}`)
  }

  lines.push('')
  lines.push('Likert Responses')

  for (const [id, prompt] of Object.entries(LIKERT_LABELS)) {
    const answer = payload.summary.likertResponses[id] ?? 'No response'
    lines.push(`- ${prompt}: ${answer}`)
  }

  lines.push('')
  lines.push('Open-Ended Responses')

  for (const [id, prompt] of Object.entries(OPEN_RESPONSE_LABELS)) {
    const answer = payload.summary.openResponses[id] || 'No response'
    lines.push(`- ${prompt}`)
    lines.push(`  ${answer}`)
  }

  lines.push('')
  lines.push('Knowledge Check')

  for (const [id, label] of Object.entries(QUIZ_LABELS)) {
    const answer = payload.quizAnswers[id] || 'No answer'
    lines.push(`- ${id} (${label}): ${answer}`)
  }

  lines.push('')
  lines.push('Score Summary')
  lines.push(`- Score: ${payload.summary.score ?? 'N/A'}`)
  lines.push(`- Max Score: ${payload.summary.maxScore ?? 'N/A'}`)
  lines.push(`- Passed: ${payload.summary.passed === null ? 'N/A' : payload.summary.passed ? 'Yes' : 'No'}`)

  lines.push('')
  lines.push('Module Breakdown')

  const moduleEntries = Object.entries(payload.summary.moduleBreakdown || {})
  if (moduleEntries.length === 0) {
    lines.push('- None provided')
  } else {
    for (const [, value] of moduleEntries) {
      const label = value?.label || value?.module || 'Unknown module'
      const correct = Number.isFinite(value?.correct) ? value.correct : 'N/A'
      const total = Number.isFinite(value?.total) ? value.total : 'N/A'
      lines.push(`- ${label}: ${correct} / ${total}`)
    }
  }

  return `${lines.join('\n')}\n`
}

function buildEvaluationTex(payload) {
  const quizRows = payload.questionResults || buildQuizReportRows(payload)
  const likertItems = Object.entries(LIKERT_LABELS)
    .map(([id, prompt]) => `\\item \\textbf{${escapeLatex(prompt)}}: ${formatLatexValue(payload.summary.likertResponses[id], 'No response')}`)
    .join('\n')

  const openItems = Object.entries(OPEN_RESPONSE_LABELS)
    .map(([id, prompt]) => `\\item \\textbf{${escapeLatex(prompt)}}\\\\${formatLatexValue(payload.summary.openResponses[id], 'No response')}`)
    .join('\n')

  const quizItems = quizRows
    .map(({ id, label, selectedAnswer, correctness, isCorrect }) => (
      `\\item \\textbf{${escapeLatex(id)}} (${escapeLatex(label)}): ` +
      `Selected answer ${formatLatexValue(selectedAnswer, 'No answer')} ` +
      `--- ${formatLatexValue(correctness ?? (typeof isCorrect === 'boolean' ? (isCorrect ? 'Correct' : 'Incorrect') : 'Not available'), 'Not available')}`
    ))
    .join('\n')

  const moduleItems = Object.entries(payload.summary.moduleBreakdown || {})
    .map(([, value]) => {
      const label = value?.label || value?.module || 'Unknown module'
      const correct = Number.isFinite(value?.correct) ? value.correct : 'N/A'
      const total = Number.isFinite(value?.total) ? value.total : 'N/A'
      return `\\item ${escapeLatex(label)}: ${escapeLatex(`${correct} / ${total}`)}`
    })
    .join('\n') || '\\item None provided'

  const scoreValue = payload.summary.score ?? 'N/A'
  const passedValue = payload.summary.passed === null ? 'N/A' : payload.summary.passed ? 'Yes' : 'No'

  return `\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem}
\\setlist[itemize]{leftmargin=1.4em}
\\begin{document}

\\title{Brain x AI 101 Course Evaluation}
\\author{}
\\date{}
\\maketitle

\\section*{Header}
\\begin{itemize}
\\item Session ID: ${formatLatexValue(payload.sessionId)}
\\item Submitted At: ${formatLatexValue(payload.submittedAt)}
\\item Score: ${formatLatexValue(scoreValue, 'N/A')}
\\item Passed: ${formatLatexValue(passedValue, 'N/A')}
\\end{itemize}

\\section*{Likert Responses}
\\begin{itemize}
${likertItems}
\\end{itemize}

\\section*{Open-Ended Responses}
\\begin{itemize}
${openItems}
\\end{itemize}

\\section*{Knowledge Check}
\\begin{itemize}
${quizItems}
\\end{itemize}

\\section*{Module Breakdown}
\\begin{itemize}
${moduleItems}
\\end{itemize}

\\end{document}
`
}

async function getDropboxAccessToken() {
  const appKey = process.env.Dropbox_BanbooKey
  const appSecret = process.env.Dropbox_Banboosecret
  const refreshToken = process.env.DROPBOX_banboo_TOKEN

  if (!appKey || !appSecret || !refreshToken) {
    throw new Error('Dropbox credentials are not configured.')
  }

  const auth = Buffer.from(`${appKey}:${appSecret}`).toString('base64')
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  const response = await fetch(DROPBOX_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok || !data?.access_token) {
    throw new Error('Could not authenticate with Dropbox.')
  }

  return data.access_token
}

async function uploadToDropbox(accessToken, path, content, contentType = 'application/octet-stream') {
  const body = Buffer.isBuffer(content) ? content : Buffer.from(String(content), 'utf8')

  const response = await fetch(DROPBOX_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': contentType,
      'Dropbox-API-Arg': JSON.stringify({
        path,
        mode: 'overwrite',
        autorename: false,
        mute: true,
        strict_conflict: false,
      }),
    },
    body,
  })

  if (!response.ok) {
    throw new Error('Dropbox upload failed.')
  }

  return response.json().catch(() => ({}))
}

function buildDropboxPaths(payload) {
  const date = payload.submittedAt.slice(0, 10)
  const sessionId = safeFilePart(payload.sessionId)
  return {
    json: `/quiz-evaluations/${date}/${sessionId}.json`,
    txt: `/quiz-evaluations/${date}/${sessionId}.txt`,
    tex: `/quiz-evaluations/${date}/${sessionId}.tex`,
  }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return json(response, 405, {
      ok: false,
      error: 'Method not allowed.',
    })
  }

  try {
    const rawPayload = await readJsonBody(request)
    const payload = validatePayload(rawPayload)
    const accessToken = await getDropboxAccessToken()
    const paths = buildDropboxPaths(payload)

    const evaluationJson = buildEvaluationJson(payload)
    const evaluationText = buildEvaluationText(payload)
    const evaluationTex = buildEvaluationTex(payload)

    await uploadToDropbox(accessToken, paths.json, JSON.stringify(evaluationJson, null, 2), 'application/octet-stream')
    await uploadToDropbox(accessToken, paths.txt, evaluationText, 'application/octet-stream')
    await uploadToDropbox(accessToken, paths.tex, evaluationTex, 'application/octet-stream')

    return json(response, 200, {
      ok: true,
      files: [
        { type: 'json', path: paths.json },
        { type: 'txt', path: paths.txt },
        { type: 'tex', path: paths.tex },
      ],
    })
  } catch (error) {
    const safeMessage = error instanceof Error && error.message
      ? error.message
      : 'Unable to submit evaluation.'

    return json(response, 400, {
      ok: false,
      error: safeMessage,
    })
  }
}
