import { useEffect, useState } from 'react'
import {
  cycleCellState,
  createEnvironment,
  createInitialAgentState,
  resizeEnvironment,
  serializeState,
  transition,
  updateEnvironmentSettings,
} from './environment'
import {
  chooseAction,
  createAlgorithmState,
  updateQLearning,
  updateSARSA,
} from './algorithms'

const DEFAULT_CONFIG = {
  algorithm: 'q-learning',
  cellDisplay: 'color',
  epsilon: 0.22,
  alpha: 0.45,
  gamma: 0.9,
  speed: 450,
}

const EPISODE_RESET_DELAY = 380

function createSession(environment) {
  return {
    environment,
    agentState: createInitialAgentState(environment),
    algorithmState: createAlgorithmState(environment),
    currentEpisode: 1,
    completedEpisodes: 0,
    recentRewards: [],
    lastTransition: null,
    lastEpisodeOutcome: null,
    exploreCount: 0,
    exploitCount: 0,
    pendingAction: null,
    pendingEpisodeReset: false,
    transitionSerial: 0,
  }
}

function resetEpisode(session) {
  return {
    ...session,
    agentState: createInitialAgentState(session.environment),
    pendingAction: null,
    pendingEpisodeReset: false,
  }
}

function finalizeEpisode(session, transitionResult, action, episodeReward, exploratory, fromState) {
  return {
    ...session,
    agentState: {
      position: transitionResult.nextState,
      episodeReward: Number(episodeReward.toFixed(2)),
      stepCount: session.agentState.stepCount + 1,
      lastReward: transitionResult.reward,
    },
    completedEpisodes: session.completedEpisodes + 1,
    recentRewards: [...session.recentRewards.slice(-7), Number(episodeReward.toFixed(2))],
    lastTransition: {
      id: session.transitionSerial + 1,
      ...transitionResult,
      action,
      exploratory,
      fromState,
      toState: transitionResult.nextState,
      episodeReward: Number(episodeReward.toFixed(2)),
      episode: session.currentEpisode,
    },
    lastEpisodeOutcome: transitionResult.outcome,
    pendingAction: null,
    pendingEpisodeReset: true,
    transitionSerial: session.transitionSerial + 1,
  }
}

function startNextEpisode(session) {
  if (!session.pendingEpisodeReset) return session

  return {
    ...session,
    agentState: createInitialAgentState(session.environment),
    currentEpisode: session.currentEpisode + 1,
    pendingAction: null,
    pendingEpisodeReset: false,
  }
}

function runOneStep(session, config, forcedAction = null) {
  if (session.pendingEpisodeReset) return session

  const stateKey = serializeState(session.agentState.position)
  const fromState = { ...session.agentState.position }

  const actionChoice = forcedAction
    ? { action: forcedAction, exploratory: false }
    : config.algorithm === 'sarsa' && session.pendingAction
      ? session.pendingAction
      : chooseAction(session.algorithmState, stateKey, config.epsilon)

  let transitionResult = transition(session.environment, session.agentState.position, actionChoice.action)
  const tentativeStepCount = session.agentState.stepCount + 1

  if (!transitionResult.done && tentativeStepCount >= session.environment.maxStepsPerEpisode) {
    transitionResult = {
      ...transitionResult,
      reward: Number((transitionResult.reward + session.environment.rewards.timeout).toFixed(2)),
      done: true,
      outcome: 'timeout',
      cellType: 'timeout',
    }
  }

  const nextStateKey = transitionResult.nextStateKey
  const nextActionChoice = !transitionResult.done && config.algorithm === 'sarsa'
    ? chooseAction(session.algorithmState, nextStateKey, config.epsilon)
    : null

  const updateParams = {
    stateKey,
    action: actionChoice.action,
    reward: transitionResult.reward,
    nextStateKey,
    nextAction: nextActionChoice?.action,
    done: transitionResult.done,
    alpha: config.alpha,
    gamma: config.gamma,
  }

  const algorithmState = config.algorithm === 'sarsa'
    ? updateSARSA(session.algorithmState, updateParams)
    : updateQLearning(session.algorithmState, updateParams)

  const exploreCount = session.exploreCount + (actionChoice.exploratory ? 1 : 0)
  const exploitCount = session.exploitCount + (actionChoice.exploratory ? 0 : 1)
  const episodeReward = session.agentState.episodeReward + transitionResult.reward

  if (transitionResult.done) {
    return finalizeEpisode({
      ...session,
      algorithmState,
      exploreCount,
      exploitCount,
    }, transitionResult, actionChoice.action, episodeReward, actionChoice.exploratory, fromState)
  }

  return {
    ...session,
    algorithmState,
    agentState: {
      position: transitionResult.nextState,
      episodeReward: Number(episodeReward.toFixed(2)),
      stepCount: tentativeStepCount,
      lastReward: transitionResult.reward,
    },
    exploreCount,
    exploitCount,
    pendingAction: nextActionChoice,
    lastTransition: {
      id: session.transitionSerial + 1,
      ...transitionResult,
      action: actionChoice.action,
      exploratory: actionChoice.exploratory,
      fromState,
      toState: transitionResult.nextState,
      episodeReward: Number(episodeReward.toFixed(2)),
      episode: session.currentEpisode,
    },
    transitionSerial: session.transitionSerial + 1,
  }
}

export default function useReinforcementLearning() {
  const [environment, setEnvironment] = useState(() => createEnvironment())
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [isRunning, setIsRunning] = useState(false)
  const [session, setSession] = useState(() => createSession(environment))

  useEffect(() => {
    if (!isRunning) return undefined

    const id = window.setInterval(() => {
      setSession((current) => runOneStep(current, config))
    }, config.speed)

    return () => window.clearInterval(id)
  }, [config, isRunning])

  useEffect(() => {
    if (!session.pendingEpisodeReset) return undefined

    const id = window.setTimeout(() => {
      setSession((current) => startNextEpisode(current))
    }, EPISODE_RESET_DELAY)

    return () => window.clearTimeout(id)
  }, [session.pendingEpisodeReset])

  const stepSimulation = (action = null) => {
    setSession((current) => runOneStep(current, config, action))
  }

  const runEpisodeStep = () => {
    stepSimulation()
  }

  const resetLearning = () => {
    setIsRunning(false)
    setSession(createSession(environment))
  }

  const resetEnvironment = () => {
    setIsRunning(false)
    setSession((current) => resetEpisode(current))
  }

  const setAlgorithm = (algorithm) => {
    setConfig((current) => ({ ...current, algorithm }))
    setIsRunning(false)
    setSession(createSession(environment))
  }

  const setGridSize = (size) => {
    const nextEnvironment = resizeEnvironment(size, environment)
    setIsRunning(false)
    setEnvironment(nextEnvironment)
    setSession(createSession(nextEnvironment))
  }

  const cycleEnvironmentCell = (position) => {
    const nextEnvironment = cycleCellState(environment, position)
    setIsRunning(false)
    setEnvironment(nextEnvironment)
    setSession(createSession(nextEnvironment))
  }

  const setParameter = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const setEnvironmentSetting = (key, value) => {
    const nextEnvironment = updateEnvironmentSettings(environment, key === 'maxStepsPerEpisode'
      ? { maxStepsPerEpisode: value }
      : { rewards: { [key]: value } })

    setIsRunning(false)
    setEnvironment(nextEnvironment)
    setSession(createSession(nextEnvironment))
  }

  const averageReward = session.recentRewards.length
    ? session.recentRewards.reduce((sum, reward) => sum + reward, 0) / session.recentRewards.length
    : 0

  return {
    environment,
    config,
    isRunning,
    setIsRunning,
    setAlgorithm,
    setParameter,
    setGridSize,
    setEnvironmentSetting,
    cycleEnvironmentCell,
    stepSimulation,
    runEpisodeStep,
    resetLearning,
    resetEnvironment,
    agentState: session.agentState,
    algorithmState: session.algorithmState,
    currentEpisode: session.currentEpisode,
    completedEpisodes: session.completedEpisodes,
    recentRewards: session.recentRewards,
    lastTransition: session.lastTransition,
    lastEpisodeOutcome: session.lastEpisodeOutcome,
    pendingEpisodeReset: session.pendingEpisodeReset,
    exploreCount: session.exploreCount,
    exploitCount: session.exploitCount,
    averageReward: Number(averageReward.toFixed(2)),
  }
}
