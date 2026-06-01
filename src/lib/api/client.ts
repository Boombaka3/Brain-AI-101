import type { ApiErrorPayload } from '../../types/api'

async function readErrorMessage(response: Response) {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null
  return payload?.error || `Request failed with status ${response.status}.`
}

export async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: 'same-origin',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json() as Promise<T>
}

export async function requestText(input: string, init?: RequestInit): Promise<string> {
  const response = await fetch(input, {
    credentials: 'same-origin',
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.text()
}
