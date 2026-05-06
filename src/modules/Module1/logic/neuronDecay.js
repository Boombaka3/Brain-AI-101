export const DECAY_STEP = 5
export const DECAY_INTERVAL_MS = 500

export function clampSomaInput(value, maxInput = 100) {
  return Math.max(0, Math.min(maxInput, value))
}

export function decaySomaInput(value, step = DECAY_STEP) {
  return Math.max(0, value - step)
}
