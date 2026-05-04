export const BUCKET_TOP = 40
export const BUCKET_BOTTOM = 190
export const BUCKET_LEFT = 50
export const BUCKET_RIGHT = 150
export const BUCKET_BOTTOM_LEFT = 60
export const BUCKET_BOTTOM_RIGHT = 140

export const MAX_FILL_HEIGHT = BUCKET_BOTTOM - BUCKET_TOP - 4
export const THRESHOLD_RATIO = 0.85
export const THRESHOLD_Y = BUCKET_BOTTOM - MAX_FILL_HEIGHT * THRESHOLD_RATIO

export const DRIP_Y_START = 20
export const DRIP_Y_END = BUCKET_TOP + 6
export const DRIP_XS = [80, 100, 120]

export const BUCKET_PATH = `M ${BUCKET_LEFT} ${BUCKET_TOP} L ${BUCKET_RIGHT} ${BUCKET_TOP} L ${BUCKET_BOTTOM_RIGHT} ${BUCKET_BOTTOM} L ${BUCKET_BOTTOM_LEFT} ${BUCKET_BOTTOM} Z`

export function getBucketFillMetrics(totalInput, threshold) {
  const safeThreshold = Math.max(threshold, 1)
  const ratio = Math.min(totalInput / safeThreshold, 1.1)
  const fillHeight = Math.max(0, Math.min(ratio * MAX_FILL_HEIGHT, MAX_FILL_HEIGHT + 8))

  return {
    ratio,
    fillHeight,
    targetY: BUCKET_BOTTOM - fillHeight,
  }
}
