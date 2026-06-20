function escapeCsvCell(value: unknown) {
  const normalized = value === null || value === undefined ? '' : String(value)
  if (/[",\r\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

export function toCsv(headers: string[], rows: Array<Array<unknown>>) {
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]

  return `\uFEFF${lines.join('\r\n')}\r\n`
}
