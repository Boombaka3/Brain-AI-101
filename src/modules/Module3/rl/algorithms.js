import { ACTIONS, getAllStates, serializeState } from './environment'

function emptyActionValues() {
  return ACTIONS.reduce((acc, action) => ({ ...acc, [action]: 0 }), {})
}

export function createAlgorithmState(environment) {
  const qTable = {}
  getAllStates(environment).forEach((position) => {
    qTable[serializeState(position)] = emptyActionValues()
  })
  return { qTable }
}

export function getActionValues(algorithmState, stateKey) {
  return algorithmState.qTable[stateKey] ?? emptyActionValues()
}

export function getGreedyAction(algorithmState, stateKey) {
  const values = getActionValues(algorithmState, stateKey)
  return ACTIONS.reduce((best, action) => (
    values[action] > values[best] ? action : best
  ), ACTIONS[0])
}

export function getStateValue(algorithmState, stateKey) {
  const values = getActionValues(algorithmState, stateKey)
  return Math.max(...ACTIONS.map((action) => values[action]))
}

export function chooseAction(algorithmState, stateKey, epsilon) {
  const values = getActionValues(algorithmState, stateKey)
  const exploratory = Math.random() < epsilon

  if (exploratory) {
    return {
      action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
      exploratory: true,
    }
  }

  const maxValue = Math.max(...ACTIONS.map((action) => values[action]))
  const bestActions = ACTIONS.filter((action) => values[action] === maxValue)
  return {
    action: bestActions[Math.floor(Math.random() * bestActions.length)],
    exploratory: false,
  }
}

function nextBestValue(algorithmState, nextStateKey) {
  return getStateValue(algorithmState, nextStateKey)
}

export function updateQLearning(algorithmState, params) {
  const { stateKey, action, reward, nextStateKey, done, alpha, gamma } = params
  const current = getActionValues(algorithmState, stateKey)[action]
  const target = done ? reward : reward + gamma * nextBestValue(algorithmState, nextStateKey)
  const updated = Number((current + alpha * (target - current)).toFixed(3))

  return {
    qTable: {
      ...algorithmState.qTable,
      [stateKey]: {
        ...getActionValues(algorithmState, stateKey),
        [action]: updated,
      },
    },
  }
}

export function updateSARSA(algorithmState, params) {
  const { stateKey, action, reward, nextStateKey, nextAction, done, alpha, gamma } = params
  const current = getActionValues(algorithmState, stateKey)[action]
  const nextValue = done || !nextAction ? 0 : getActionValues(algorithmState, nextStateKey)[nextAction]
  const target = reward + gamma * nextValue
  const updated = Number((current + alpha * (target - current)).toFixed(3))

  return {
    qTable: {
      ...algorithmState.qTable,
      [stateKey]: {
        ...getActionValues(algorithmState, stateKey),
        [action]: updated,
      },
    },
  }
}
