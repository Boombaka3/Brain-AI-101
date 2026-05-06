export function normalizeClassroomSignal(phrase = '') {
  return phrase.toLowerCase().trim().replace(/\s+/g, ' ')
}

function includesAny(text, candidates) {
  return candidates.some((candidate) => text.includes(candidate))
}

export default function scoreClassroomSignal(phrase = '') {
  const normalized = normalizeClassroomSignal(phrase)

  if (!normalized) {
    return 0
  }

  if (normalized.includes('teacher') && normalized.includes('alex')) {
    return 100
  }

  if (normalized.includes('alex')) {
    return 80
  }

  if (normalized.includes('everyone listen')) {
    return 55
  }

  if (normalized.includes('listen')) {
    return 35
  }

  if (normalized.includes('everyone') || normalized.includes('class')) {
    return 35
  }

  if (includesAny(normalized, ['page', 'paper', 'notebook'])) {
    return 15
  }

  if (includesAny(normalized, ['chair', 'desk', 'door'])) {
    return 20
  }

  if (includesAny(normalized, ['noise', 'talking', 'chatter'])) {
    return 10
  }

  return 10
}
