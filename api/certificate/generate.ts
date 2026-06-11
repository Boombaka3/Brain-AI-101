import { buildCertificateFilename, generateCertificatePdf, normalizeRecipientName } from '../_lib/certificate.js'
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

interface CertificateRequestPayload {
  recipientName?: string
}

function currentIssueMonth() {
  return new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase()
}

function currentIssueYear() {
  return String(new Date().getFullYear())
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

    const fileBuffer = await generateCertificatePdf({
      recipientName,
      issueMonth: currentIssueMonth(),
      issueYear: currentIssueYear(),
      signerName: 'Professor Ruogu Fang, Ph.D.',
    })

    return sendBuffer(
      response,
      200,
      fileBuffer,
      'application/pdf',
      buildCertificateFilename(recipientName, 'pdf'),
    )
  } catch (error) {
    return sendJson(response, 500, {
      ok: false,
      error: safeErrorMessage(error, 'Unable to generate certificate.'),
    })
  }
}
