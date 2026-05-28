export const ACTIONS = ['up', 'right', 'down', 'left']
export const GRID_MIN_SIZE = 2
export const GRID_MAX_SIZE = 6

const CELL_CYCLE = {
  empty: 'goal',
  goal: 'hazard',
  hazard: 'wall',
  wall: 'empty',
}

export function serializeState(position) {
  return `${position.x},${position.y}`
}

function clampSize(size) {
  return Math.min(Math.max(size, GRID_MIN_SIZE), GRID_MAX_SIZE)
}

function uniqueCells(cells) {
  return [...new Set(cells)]
}

function createDefaultCells(size) {
  const safeSize = clampSize(size)
  const goal = serializeState({ x: safeSize - 1, y: 0 })
  const hazard = serializeState({ x: safeSize - 1, y: safeSize - 1 })
  const walls = []

  if (safeSize >= 4) {
    const barrierX = Math.floor(safeSize / 2)
    const gapY = Math.floor(safeSize / 2)

    for (let y = 1; y < safeSize - 1; y += 1) {
      if (y !== gapY) {
        walls.push(serializeState({ x: barrierX, y }))
      }
    }
  }

  return {
    goals: [goal],
    hazards: [hazard],
    walls: uniqueCells(walls),
  }
}

function maxStepsForSize(size) {
  return Math.max(100, size * size * 2)
}

function defaultRewards() {
  return {
    goal: 10,
    hazard: -10,
    step: -0.1,
    timeout: -0.35,
  }
}

function normalizeRewards(rewards = {}) {
  const defaults = defaultRewards()

  return {
    goal: rewards.goal ?? defaults.goal,
    hazard: rewards.hazard ?? defaults.hazard,
    step: rewards.step ?? defaults.step,
    timeout: rewards.timeout ?? defaults.timeout,
  }
}

function normalizeCells(size, start, cells) {
  const startKey = serializeState(start)
  const allowed = new Set()

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      allowed.add(serializeState({ x, y }))
    }
  }

  const sanitize = (items) => uniqueCells(
    items.filter((key) => key !== startKey && allowed.has(key)),
  )

  const goals = sanitize(cells.goals ?? [])
  const hazards = sanitize((cells.hazards ?? []).filter((key) => !goals.includes(key)))
  const walls = sanitize((cells.walls ?? []).filter((key) => !goals.includes(key) && !hazards.includes(key)))

  return {
    goals,
    hazards,
    walls,
  }
}

export function createEnvironment(size = 5, overrides = {}) {
  const safeSize = clampSize(size)
  const start = { x: 0, y: safeSize - 1 }
  const defaults = createDefaultCells(safeSize)
  const cells = normalizeCells(safeSize, start, {
    goals: overrides.goals ?? defaults.goals,
    hazards: overrides.hazards ?? defaults.hazards,
    walls: overrides.walls ?? defaults.walls,
  })

  return {
    width: safeSize,
    height: safeSize,
    size: safeSize,
    start,
    goals: cells.goals,
    hazards: cells.hazards,
    walls: cells.walls,
    rewards: normalizeRewards(overrides.rewards),
    maxStepsPerEpisode: overrides.maxStepsPerEpisode ?? maxStepsForSize(safeSize),
  }
}

export function resizeEnvironment(size, currentEnvironment = null) {
  return createEnvironment(size, currentEnvironment ? {
    rewards: currentEnvironment.rewards,
    maxStepsPerEpisode: currentEnvironment.maxStepsPerEpisode,
  } : {})
}

export function updateEnvironmentSettings(environment, overrides = {}) {
  return createEnvironment(environment.size, {
    goals: environment.goals,
    hazards: environment.hazards,
    walls: environment.walls,
    rewards: {
      ...environment.rewards,
      ...(overrides.rewards ?? {}),
    },
    maxStepsPerEpisode: overrides.maxStepsPerEpisode ?? environment.maxStepsPerEpisode,
  })
}

export function cycleCellState(environment, position) {
  const currentType = getCellType(environment, position)

  if (currentType === 'start') {
    return environment
  }

  const stateKey = serializeState(position)
  const nextType = CELL_CYCLE[currentType] ?? 'goal'
  const nextGoals = environment.goals.filter((key) => key !== stateKey)
  const nextHazards = environment.hazards.filter((key) => key !== stateKey)
  const nextWalls = environment.walls.filter((key) => key !== stateKey)

  if (nextType === 'goal') nextGoals.push(stateKey)
  if (nextType === 'hazard') nextHazards.push(stateKey)
  if (nextType === 'wall') nextWalls.push(stateKey)

  return createEnvironment(environment.size, {
    goals: nextGoals,
    hazards: nextHazards,
    walls: nextWalls,
    rewards: environment.rewards,
    maxStepsPerEpisode: environment.maxStepsPerEpisode,
  })
}

export function createInitialAgentState(environment) {
  return {
    position: { ...environment.start },
    episodeReward: 0,
    stepCount: 0,
    lastReward: 0,
  }
}

export function isInside(environment, position) {
  return (
    position.x >= 0 &&
    position.x < environment.width &&
    position.y >= 0 &&
    position.y < environment.height
  )
}

export function isWall(environment, position) {
  return environment.walls.includes(serializeState(position))
}

export function getCellType(environment, position) {
  if (position.x === environment.start.x && position.y === environment.start.y) return 'start'
  const stateKey = serializeState(position)
  if (environment.goals.includes(stateKey)) return 'goal'
  if (environment.hazards.includes(stateKey)) return 'hazard'
  if (isWall(environment, position)) return 'wall'
  return 'empty'
}

function move(position, action) {
  if (action === 'up') return { x: position.x, y: position.y - 1 }
  if (action === 'right') return { x: position.x + 1, y: position.y }
  if (action === 'down') return { x: position.x, y: position.y + 1 }
  return { x: position.x - 1, y: position.y }
}

export function transition(environment, currentPosition, action) {
  const candidate = move(currentPosition, action)
  const blocked = !isInside(environment, candidate) || isWall(environment, candidate)
  const nextPosition = blocked ? currentPosition : candidate
  const cellType = getCellType(environment, nextPosition)

  let reward = environment.rewards.step
  let done = false
  let outcome = 'move'

  if (cellType === 'goal') {
    reward = environment.rewards.goal
    done = true
    outcome = 'goal'
  } else if (cellType === 'hazard') {
    reward = environment.rewards.hazard
    done = true
    outcome = 'hazard'
  } else if (blocked) {
    outcome = 'blocked'
  }

  return {
    nextState: { ...nextPosition },
    nextStateKey: serializeState(nextPosition),
    reward,
    done,
    outcome,
    blocked,
    cellType,
  }
}

export function getAllStates(environment) {
  const states = []
  for (let y = 0; y < environment.height; y += 1) {
    for (let x = 0; x < environment.width; x += 1) {
      const position = { x, y }
      if (!isWall(environment, position)) {
        states.push(position)
      }
    }
  }
  return states
}
