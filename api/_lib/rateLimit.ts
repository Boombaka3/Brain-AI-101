import type { VercelRequestLike, VercelResponseLike } from './http.js'
import { sendJson } from './http.js'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 20

const ipMap = new Map<string, { count: number; resetAt: number }>()

function getIp(req: VercelRequestLike): string {
  const forwarded = req.headers?.['x-forwarded-for']
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0]
  return (ip ?? 'unknown').trim()
}

export function checkRateLimit(
  req: VercelRequestLike,
  res: VercelResponseLike,
): boolean {
  const ip = getIp(req)
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  entry.count += 1

  if (entry.count > MAX_REQUESTS) {
    res.setHeader('Retry-After', '60')
    sendJson(res, 429, {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Try again in 60 seconds.',
      code: 'RATE_LIMITED',
    })
    return false
  }

  return true
}
