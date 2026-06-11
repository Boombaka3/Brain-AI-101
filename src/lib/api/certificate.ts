function extractFilename(contentDisposition: string | null) {
  if (!contentDisposition) {
    return 'BrainxAI_101_Certificate.pdf'
  }

  const match = contentDisposition.match(/filename="([^"]+)"/i)
  return match?.[1] || 'BrainxAI_101_Certificate.pdf'
}

export async function generateCertificateDocument(recipientName: string) {
  let response: Response

  try {
    response = await fetch('/api/certificate/generate', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipientName }),
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'Certificate generation is unavailable in this environment. Use the Vercel deployment or run `npm run dev:full` locally.',
      )
    }

    throw error
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null)

    if (response.status === 404) {
      throw new Error(
        'Certificate generation is unavailable in this environment. Use the Vercel deployment or run `npm run dev:full` locally.',
      )
    }

    throw new Error(payload?.error || `Request failed with status ${response.status}.`)
  }

  return {
    blob: await response.blob(),
    filename: extractFilename(response.headers.get('Content-Disposition')),
  }
}
