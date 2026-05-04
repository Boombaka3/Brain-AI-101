import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getGreedyAction, getStateValue } from '../rl/algorithms'
import { getCellType, serializeState } from '../rl/environment'

const ARROWS = {
  up: '↑',
  right: '→',
  down: '↓',
  left: '←',
}

function getTint(value, minValue, maxValue) {
  if (maxValue === minValue) return 'rgba(248, 250, 252, 0.95)'

  const ratio = (value - minValue) / (maxValue - minValue)
  const blue = `rgba(59, 130, 246, ${0.12 + ratio * 0.25})`
  const coral = `rgba(244, 63, 94, ${0.1 + (1 - ratio) * 0.18})`

  if (value > 0.02) return blue
  if (value < -0.02) return coral
  return 'rgba(248, 250, 252, 0.95)'
}

function cellBadge(type) {
  if (type === 'goal') return 'Gem'
  if (type === 'hazard') return 'Pit'
  if (type === 'wall') return 'Wall'
  if (type === 'start') return 'Start'
  return 'State'
}

function renderCellVisual(type) {
  if (type === 'goal') {
    return <span className="m3-rl-cell-icon m3-rl-cell-icon--goal">💎</span>
  }

  if (type === 'hazard') {
    return (
      <span className="m3-rl-pit" aria-hidden="true">
        <span className="m3-rl-pit-ring" />
        <span className="m3-rl-pit-core" />
      </span>
    )
  }

  if (type === 'wall') {
    return (
      <span className="m3-rl-wall" aria-hidden="true">
        <span className="m3-rl-wall-brick m3-rl-wall-brick--wide" />
        <span className="m3-rl-wall-row">
          <span className="m3-rl-wall-brick" />
          <span className="m3-rl-wall-brick" />
        </span>
        <span className="m3-rl-wall-brick m3-rl-wall-brick--wide" />
      </span>
    )
  }

  if (type === 'start') {
    return <span className="m3-rl-start-pad" aria-hidden="true" />
  }

  return null
}

function stateRange(environment, algorithmState) {
  const values = []
  for (let y = 0; y < environment.height; y += 1) {
    for (let x = 0; x < environment.width; x += 1) {
      const stateKey = serializeState({ x, y })
      if (getCellType(environment, { x, y }) !== 'wall') {
        values.push(getStateValue(algorithmState, stateKey))
      }
    }
  }

  return {
    minValue: Math.min(...values, 0),
    maxValue: Math.max(...values, 0),
  }
}

function pct(value, total) {
  return `${((value + 0.5) / total) * 100}%`
}

function isStepMove(previous, next) {
  if (!previous || !next) return false
  return Math.abs(previous.x - next.x) + Math.abs(previous.y - next.y) <= 1
}

function ReinforcementGrid({
  cellDisplay,
  environment,
  algorithmState,
  agentState,
  lastTransition,
  onCellClick,
  pendingEpisodeReset,
}) {
  const { minValue, maxValue } = stateRange(environment, algorithmState)
  const [rewardToast, setRewardToast] = useState(null)

  const agentMotion = useMemo(() => {
    const previous = lastTransition?.fromState
    const current = agentState.position
    const duration = pendingEpisodeReset || isStepMove(previous, current) ? 0.22 : 0.01

    return {
      left: pct(current.x, environment.width),
      top: pct(current.y, environment.height),
      duration,
    }
  }, [agentState.position, environment.height, environment.width, lastTransition, pendingEpisodeReset])

  useEffect(() => {
    if (!lastTransition || lastTransition.reward === 0) return undefined

    const toast = {
      id: lastTransition.id,
      reward: lastTransition.reward,
      position: lastTransition.fromState ?? agentState.position,
    }
    setRewardToast(toast)

    const id = window.setTimeout(() => {
      setRewardToast((current) => (current?.id === toast.id ? null : current))
    }, 620)

    return () => window.clearTimeout(id)
  }, [agentState.position, lastTransition])

  return (
    <div className="m3-rl-board-shell">
      <div className="m3-rl-grid" style={{ gridTemplateColumns: `repeat(${environment.width}, minmax(0, 1fr))` }}>
        {Array.from({ length: environment.width * environment.height }).map((_, index) => {
          const x = index % environment.width
          const y = Math.floor(index / environment.width)
          const position = { x, y }
          const type = getCellType(environment, position)
          const stateKey = serializeState(position)
          const value = getStateValue(algorithmState, stateKey)
          const greedyAction = getGreedyAction(algorithmState, stateKey)
          const visual = renderCellVisual(type)
          const isEditable = type !== 'start'
          const showNumbers = cellDisplay === 'numbers' && type !== 'wall'

          return (
            <motion.button
              key={stateKey}
              type="button"
              className={`m3-rl-cell m3-rl-cell--${type}${isEditable ? ' is-editable' : ' is-locked'}`}
              style={type === 'wall' ? undefined : { background: getTint(value, minValue, maxValue) }}
              animate={{ scale: lastTransition?.toState?.x === x && lastTransition?.toState?.y === y ? [1, 1.03, 1] : 1 }}
              transition={{ duration: 0.28 }}
              onClick={() => isEditable && onCellClick?.(position)}
            >
              <div className="m3-rl-cell-top">
                <span className="m3-rl-cell-badge">{cellBadge(type)}</span>
                {showNumbers && (
                  <motion.span
                    className="m3-rl-cell-value"
                    key={`${stateKey}-${value.toFixed(2)}`}
                    initial={{ opacity: 0.45, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    {value.toFixed(2)}
                  </motion.span>
                )}
              </div>
              <div className="m3-rl-cell-middle">
                {visual ? (
                  visual
                ) : showNumbers ? (
                  <motion.span
                    className="m3-rl-policy-arrow"
                    key={`${stateKey}-${greedyAction}`}
                    initial={{ opacity: 0.35, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22 }}
                  >
                    {ARROWS[greedyAction]}
                  </motion.span>
                ) : (
                  <span className="m3-rl-cell-ghost">.</span>
                )}
              </div>
              <div className="m3-rl-cell-bottom">
                <span>{x},{y}</span>
                <span>{isEditable ? 'Click to edit' : 'Agent start'}</span>
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.div
        className={`m3-rl-agent-token${pendingEpisodeReset ? ' is-resolving' : ''}`}
        animate={{ left: agentMotion.left, top: agentMotion.top }}
        transition={{ duration: agentMotion.duration, ease: 'easeInOut' }}
      >
        <span>🤖</span>
      </motion.div>

      <AnimatePresence>
        {rewardToast && (
          <motion.div
            key={rewardToast.id}
            className={`m3-rl-reward-toast${rewardToast.reward > 0 ? ' is-good' : ' is-bad'}`}
            style={{
              left: pct(rewardToast.position.x, environment.width),
              top: pct(rewardToast.position.y, environment.height),
            }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: -24, scale: 1 }}
            exit={{ opacity: 0, y: -36 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {rewardToast.reward > 0 ? '+' : ''}{rewardToast.reward.toFixed(2)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReinforcementGrid
