import { buildCertificateFilename, generateCertificateDocument, normalizeRecipientName } from '../_lib/certificate.js'
import {
  methodNotAllowed,
  readJsonBody,
  safeErrorMessage,
  sendBuffer,
  sendJson,
  type VercelRequestLike,
  type VercelResponseLike,
} from '../_lib/http.js'
import { checkRateLimit } from '../_lib/rateLimit.js'

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
]

interface CertificateRequestPayload {
  recipientName?: string
}

export default async function handler(request: VercelRequestLike, response: VercelResponseLike) {
  if (!checkRateLimit(request, response)) return

  if (request.method !== 'POST') {
    return methodNotAllowed(response, 'POST')
  }

  try {
    const payload = await readJsonBody<CertificateRequestPayload>(request)
    const recipientName = normalizeRecipientName(payload.recipientName || '')

    if (!recipientName) {
      return sendJson(response, 400, {
        ok: false,
        error: 'Recipient name is required.',
      })
    }

    const now = new Date()
    const issueMonth = MONTHS[now.getMonth()]
    const issueYear = String(now.getFullYear())

    const result = await generateCertificateDocument({ recipientName, issueMonth, issueYear })

    return sendBuffer(
      response,
      200,
      result.buffer,
      result.mimeType,
      buildCertificateFilename(recipientName, result.extension),
    )
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to generate certificate.'),
    })
  }
}
