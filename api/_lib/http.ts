import { Buffer } from 'node:buffer'

const MAX_REQUEST_BYTES = 256 * 1024

export interface VercelRequestLike extends AsyncIterable<Uint8Array | Buffer | string> {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
}

export interface VercelResponseLike {
  statusCode: number
  setHeader(name: string, value: string | string[]): void
  end(body?: string | Buffer): void
}

export function sendJson(response: VercelResponseLike, statusCode: number, payload: unknown) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

export function sendText(
  response: VercelResponseLike,
  statusCode: number,
  body: string,
  contentType = 'text/plain; charset=utf-8',
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', contentType)
  response.end(body)
}

export function sendBuffer(
  response: VercelResponseLike,
  statusCode: number,
  body: Buffer,
  contentType: string,
  filename?: string,
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', contentType)
  response.setHeader('Content-Length', String(body.byteLength))

  if (filename) {
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename.replace(/"/g, '')}"`,
    )
  }

  response.end(body)
}

export async function readJsonBody<T>(request: VercelRequestLike): Promise<T> {
  if (request.body && typeof request.body === 'object') {
    return request.body as T
  }

  if (typeof request.body === 'string') {
    return JSON.parse(request.body) as T
  }

  const chunks: Buffer[] = []
  let totalBytes = 0

  for await (const chunk of request) {
    const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    totalBytes += bufferChunk.length

    if (totalBytes > MAX_REQUEST_BYTES) {
      throw new Error('Request body is too large.')
    }

    chunks.push(bufferChunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim()

  if (!raw) {
    throw new Error('Request body is required.')
  }

  return JSON.parse(raw) as T
}

export function methodNotAllowed(response: VercelResponseLike, ...allowedMethods: string[]) {
  response.setHeader('Allow', allowedMethods)
  return sendJson(response, 405, {
    ok: false,
    error: `Method not allowed. Use ${allowedMethods.join(', ')}.`,
  })
}

export function safeErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

export function sendDbUnavailableIfNeeded(error: unknown, response: VercelResponseLike) {
  if (
    error instanceof Error &&
    (error.message.includes('DATABASE_URL') ||
      error.message.includes("Can't reach database") ||
      error.message.includes('Connection refused'))
  ) {
    return sendJson(response, 503, {
      error: 'Database not available',
      message: 'The study database is not configured on this deployment. Responses are saved locally in the browser.',
      code: 'DB_UNAVAILABLE',
    })
  }
  return null
}
