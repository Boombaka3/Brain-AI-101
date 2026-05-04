import ReinforcementControls from './ReinforcementControls'
import ReinforcementGrid from './ReinforcementGrid'
import useReinforcementLearning from '../rl/useReinforcementLearning'
import { getActionValues, getGreedyAction } from '../rl/algorithms'
import { serializeState } from '../rl/environment'

const ACTION_LABELS = {
  up: 'Up',
  right: 'Right',
  down: 'Down',
  left: 'Left',
}

function formatOutcome(outcome) {
  if (outcome === 'goal') return 'reached a gem'
  if (outcome === 'hazard') return 'hit a hazard'
  if (outcome === 'timeout') return 'ran out of time'
  if (outcome === 'blocked') return 'bumped into a wall'
  return 'moved one step'
}

function summaryCopy(config, completedEpisodes, averageReward, greedyAction) {
  if (completedEpisodes < 3) {
    return `The agent is still mostly experimenting. With ε = ${config.epsilon.toFixed(2)}, it will keep trying random moves so it can discover which paths lead to gems instead of hazards.`
  }

  if (config.algorithm === 'sarsa') {
    return `SARSA updates toward the action it actually plans to take next, so it often learns a slightly safer route when hazards are nearby. Right now its greedy move from the current cell is ${ACTION_LABELS[greedyAction].toLowerCase()}.`
  }

  return `Q-Learning updates toward the best-looking next move, even when the agent is still exploring. The recent average reward is ${averageReward.toFixed(2)}, which helps you see whether that optimism is paying off.`
}

function ReinforcementLab({ embedded = false }) {
  const {
    environment,
    config,
    isRunning,
    setIsRunning,
    setAlgorithm,
    setEnvironmentSetting,
    setGridSize,
    setParameter,
    runEpisodeStep,
    resetLearning,
    resetEnvironment,
    cycleEnvironmentCell,
    agentState,
    algorithmState,
    currentEpisode,
    completedEpisodes,
    recentRewards,
    lastTransition,
    lastEpisodeOutcome,
    pendingEpisodeReset,
    exploreCount,
    exploitCount,
    averageReward,
  } = useReinforcementLearning()

  const currentStateKey = serializeState(agentState.position)
  const actionValues = getActionValues(algorithmState, currentStateKey)
  const greedyAction = getGreedyAction(algorithmState, currentStateKey)
  const totalChoices = exploreCount + exploitCount
  const exploreRate = totalChoices ? (exploreCount / totalChoices) * 100 : 0

  return (
    <div className={`m3-rl-block${embedded ? ' m3-rl-block--embedded' : ''}`}>
      <div className="m3-human-framing">
        <p><strong>Part 2. Reinforcement learning:</strong> now the answer key is gone. The agent has to try moves, feel the result, and slowly figure out which path pays off.</p>
        <p>This is the most trial-and-error version of learning in the section.</p>
      </div>

      <div className="m3-rl-layout">
        <div className="m3-rl-stage">
          <div className="m3-rl-stage-header">
            <div>
              <p className="m3-rl-control-label">Part 2 · Reinforcement</p>
              <h3>Learn by rewards, penalties, and retries</h3>
            </div>
            <div className="m3-rl-legend">
              <span className="m3-rl-legend-chip m3-rl-legend-chip--start">🤖 Start</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--goal">💎 Gem {environment.rewards.goal}</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--hazard">Pit {environment.rewards.hazard}</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--wall">Wall</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--step">Step {environment.rewards.step.toFixed(2)}</span>
            </div>
          </div>

          <ReinforcementGrid
            cellDisplay={config.cellDisplay}
            environment={environment}
            algorithmState={algorithmState}
            agentState={agentState}
            lastTransition={lastTransition}
            onCellClick={cycleEnvironmentCell}
            pendingEpisodeReset={pendingEpisodeReset}
          />

          <div className="m3-rl-status-row">
            <div className="m3-rl-stat-card">
              <span>Episode</span>
              <strong>{currentEpisode}</strong>
            </div>
            <div className="m3-rl-stat-card">
              <span>Current reward</span>
              <strong>{agentState.episodeReward.toFixed(2)}</strong>
            </div>
            <div className="m3-rl-stat-card">
              <span>Episodes finished</span>
              <strong>{completedEpisodes}</strong>
            </div>
            <div className="m3-rl-stat-card">
              <span>Recent avg reward</span>
              <strong>{averageReward.toFixed(2)}</strong>
            </div>
          </div>

          <div className="m3-rl-insight">
            <strong>Learning snapshot:</strong> {summaryCopy(config, completedEpisodes, averageReward, greedyAction)}
          </div>

          {lastTransition && (
            <div className="m3-rl-insight m3-rl-insight--soft">
              <strong>Last step:</strong> The agent moved <strong>{ACTION_LABELS[lastTransition.action].toLowerCase()}</strong>, {formatOutcome(lastTransition.outcome)}, and received <strong>{lastTransition.reward.toFixed(2)}</strong>.
              {lastEpisodeOutcome && ` Last finished episode ${formatOutcome(lastEpisodeOutcome)}.`}
            </div>
          )}
        </div>

        <ReinforcementControls
          config={config}
          environment={environment}
          gridSize={environment.size}
          isRunning={isRunning}
          onToggleRunning={() => setIsRunning((value) => !value)}
          onStep={runEpisodeStep}
          onResetEnvironment={resetEnvironment}
          onResetLearning={resetLearning}
          onSetAlgorithm={setAlgorithm}
          onSetEnvironmentSetting={setEnvironmentSetting}
          onSetGridSize={setGridSize}
          onSetParameter={setParameter}
        />
      </div>

      <div className="m3-rl-bottom-grid">
        <div className="m3-rl-q-card">
          <p className="m3-rl-control-label">Action values for the current cell</p>
          <div className="m3-rl-q-grid">
            {Object.entries(actionValues).map(([action, value]) => (
              <div key={action} className={`m3-rl-q-item${greedyAction === action ? ' is-best' : ''}`}>
                <span>{ACTION_LABELS[action]}</span>
                <strong>{value.toFixed(2)}</strong>
              </div>
            ))}
          </div>
          <p className="m3-type-desc">The highest value becomes the greedy arrow on the board.</p>
        </div>

        <div className="m3-rl-q-card">
          <p className="m3-rl-control-label">What changed during learning?</p>
          <div className="m3-rl-copy-list">
            <p><strong>Exploration vs exploitation:</strong> {exploreRate.toFixed(0)}% of executed choices were exploratory so far.</p>
            <p><strong>Environment reset:</strong> sends the robot back to the start but keeps what it already learned.</p>
            <p><strong>Learning reset:</strong> clears the Q-table so you can compare algorithms from scratch.</p>
            <p><strong>Map editing:</strong> clicking cells redraws the reward landscape, so the agent must relearn the updated grid.</p>
          </div>
          <div className="m3-rl-reward-row">
            {recentRewards.length === 0 ? (
              <span className="m3-rl-empty-note">Complete a few episodes to see recent returns.</span>
            ) : (
              recentRewards.map((reward, index) => (
                <span key={`${reward}-${index}`} className={`m3-rl-reward-chip${reward >= 0 ? ' is-good' : ' is-bad'}`}>
                  {reward.toFixed(2)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReinforcementLab
