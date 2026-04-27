import { neuronFires } from '../../utils/neuronLogic'

export const INITIAL_THRESHOLD = 5
export const THRESHOLD = 4
export const SMOOTH_LOW = 2
export const SMOOTH_HIGH = 6
export const RELU_SCALE = 0.15

export const PATTERN_A = [5, 1, 0, 0]
export const PATTERN_B = [1, 2, 2, 1]

export const SINGLE_WEIGHTS = [1, 1, 1, 1, 1, 1, 1, 1, 1]

export const NEURON_CONFIGS = {
  alpha: {
    symbol: 'N₁',
    revealedName: 'Vertical',
    weights: [2, 0, 2, 2, 0, 2, 2, 0, 2],
    color: '#3B82F6'
  },
  beta: {
    symbol: 'N₂',
    revealedName: 'Horizontal',
    weights: [2, 2, 2, 0, 0, 0, 2, 2, 2],
    color: '#8B5CF6'
  },
  gamma: {
    symbol: 'N₃',
    revealedName: 'Diagonal',
    weights: [2, 0, 0, 0, 2, 0, 0, 0, 2],
    color: '#EC4899'
  }
}

export const DEFAULT_KERNEL = [
  1, 0, -1,
  1, 0, -1,
  1, 0, -1
]

export const KERNEL_PRESETS = {
  verticalEdge: [1, 0, -1, 1, 0, -1, 1, 0, -1],
  horizontalEdge: [1, 1, 1, 0, 0, 0, -1, -1, -1],
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  blur: [1, 1, 1, 1, 1, 1, 1, 1, 1],
}

export const LAB_KERNEL_PRESETS = {
  identity: {
    name: 'Identity',
    kernel: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    category: 'none',
    description: 'No change — passes through unchanged.'
  },
  blur: {
    name: 'Blur (Box)',
    kernel: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    category: 'blur',
    description: 'Like pooling / smoothing noise.'
  },
  gaussian: {
    name: 'Blur (Gaussian)',
    kernel: [1, 2, 1, 2, 4, 2, 1, 2, 1],
    category: 'blur',
    description: 'Like pooling / smoothing noise.'
  },
  sharpen: {
    name: 'Sharpen',
    kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0],
    category: 'sharpen',
    description: 'Like enhancing contrast boundaries.'
  },
  verticalEdge: {
    name: 'Vertical Edge',
    kernel: [1, 0, -1, 2, 0, -2, 1, 0, -1],
    category: 'edge',
    description: 'Like simple cells detecting vertical edges.'
  },
  horizontalEdge: {
    name: 'Horizontal Edge',
    kernel: [1, 2, 1, 0, 0, 0, -1, -2, -1],
    category: 'edge',
    description: 'Like simple cells detecting horizontal edges.'
  },
  emboss: {
    name: 'Emboss',
    kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    category: 'edge',
    description: 'Like detecting directional gradients.'
  }
}

export const LAB_BIO_BRIDGE = {
  none: 'The kernel passes signals through unchanged.',
  edge: 'Like simple cells in V1 detecting edges.',
  blur: 'Like pooling — smoothing noise and averaging.',
  sharpen: 'Like enhancing contrast at boundaries.'
}

export const LAB_MAX_IMAGE_SIZE = 400

export const TRANSITION_ARRANGEMENTS = [
  { inputs: [0, 2, 0, 0, 2, 0, 0, 2, 0], label: 'vertical line' },
  { inputs: [2, 0, 0, 0, 2, 0, 0, 0, 2], label: 'diagonal' },
  { inputs: [1, 1, 0, 0, 0, 0, 2, 0, 2], label: 'scattered' }
]

export const SAMPLE_IMAGE = [
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
  0, 0, 1, 1, 1,
]

export const GRID_PRESETS = {
  clear: [0,0,0, 0,0,0, 0,0,0],
  verticalLeft: [1,0,0, 1,0,0, 1,0,0],
  verticalRight: [0,0,1, 0,0,1, 0,0,1],
  horizontalTop: [1,1,1, 0,0,0, 0,0,0],
  horizontalBot: [0,0,0, 0,0,0, 1,1,1],
  diagonal: [1,0,0, 0,1,0, 0,0,1],
  antiDiag: [0,0,1, 0,1,0, 1,0,0],
  cross: [0,1,0, 1,1,1, 0,1,0],
}

export function computeOutput(sum, threshold, mode) {
  switch (mode) {
    case 'smooth':
      if (sum <= SMOOTH_LOW) return 0
      if (sum >= SMOOTH_HIGH) return 1
      return (sum - SMOOTH_LOW) / (SMOOTH_HIGH - SMOOTH_LOW)
    case 'proportional':
      return Math.max(0, sum)
    case 'yesno':
    default:
      return sum >= threshold ? 1 : 0
  }
}

export function computeActivation(sum, threshold, type) {
  if (type === 'relu') {
    return Math.max(0, sum - threshold)
  }
  return sum >= threshold ? 1 : 0
}

export function getDisplayOutput(output, mode) {
  if (mode === 'proportional') {
    if (output > 9) return '9+'
    return output.toString()
  }
  if (mode === 'smooth') {
    return (output * 100).toFixed(0) + '%'
  }
  return output.toString()
}

export function computeWeightedSum(grid, weights) {
  return grid.reduce((sum, val, i) => sum + val * weights[i], 0)
}

export function getReceptiveFieldValues(image, row, col, imageWidth = 5) {
  const values = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const idx = (row + r) * imageWidth + (col + c)
      values.push(image[idx] ?? 0)
    }
  }
  return values
}

export function computeOutputMap(image, weights, threshold) {
  const outputSize = 3
  const output = []
  for (let r = 0; r < outputSize; r++) {
    for (let c = 0; c < outputSize; c++) {
      const receptiveField = getReceptiveFieldValues(image, r, c)
      const sum = computeWeightedSum(receptiveField, weights)
      const activation = computeActivation(sum, threshold, 'relu')
      output.push({ row: r, col: c, sum, activation })
    }
  }
  return output
}
