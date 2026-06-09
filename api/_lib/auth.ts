import { timingSafeEqual } from 'node:crypto'
import type { VercelRequestLike } from './http.js'

function extractAuthorizationHeader(request: VercelRequestLike) {
  const value = request.headers?.authorization ?? request.headers?.Authorization
  return Array.isArray(value) ? value[0] : value
}

export function isAuthorizedAdminRequest(request: VercelRequestLike) {
  const expectedToken = process.env.ADMIN_READ_TOKEN
  if (!expectedToken) throw new Error('ADMIN_READ_TOKEN is not configured.')
  const authorizationHeader = extractAuthorizationHeader(request)
  if (!authorizationHeader?.startsWith('Bearer ')) return false
  const token = authorizationHeader.slice('Bearer '.length).trim()
  if (token.length === 0) return false

  try {
    const tokenBuf    = Buffer.from(token)
    const expectedBuf = Buffer.from(expectedToken)
    if (tokenBuf.length !== expectedBuf.length) return false
    return timingSafeEqual(tokenBuf, expectedBuf)
  } catch {
    return false
  }
}
