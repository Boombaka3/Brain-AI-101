import type { VercelRequestLike } from './http.js'

function extractAuthorizationHeader(request: VercelRequestLike) {
  const value = request.headers?.authorization ?? request.headers?.Authorization
  return Array.isArray(value) ? value[0] : value
}

export function isAuthorizedAdminRequest(request: VercelRequestLike) {
  const expectedToken = process.env.ADMIN_READ_TOKEN

  if (!expectedToken) {
    throw new Error('ADMIN_READ_TOKEN is not configured.')
  }

  const authorizationHeader = extractAuthorizationHeader(request)

  if (!authorizationHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authorizationHeader.slice('Bearer '.length).trim()
  return token.length > 0 && token === expectedToken
}
