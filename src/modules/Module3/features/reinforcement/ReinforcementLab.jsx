import ReinforcementControls from './ReinforcementControls'
import ReinforcementGrid from './ReinforcementGrid'
import useReinforcementLearning from './useReinforcementLearning'
import { getActionValues, getGreedyAction } from './algorithms'
import { serializeState } from './environment'

const ACTION_LABELS = {
  up: 'Up',
  right: 'Right',
  down: 'Down',
  left: 'Left',
}

function formatOutcome(outcome) {
  if (outcome === 'goal') return 'reached the goal'
  if (outcome === 'hazard') return 'hit penalty'
  if (outcome === 'timeout') return 'ran out of time'
  if (outcome === 'blocked') return 'hit wall'
  return 'moved one step'
}

function summaryCopy(config, completedEpisodes, averageReward, greedyAction) {
  if (completedEpisodes < 3) {
    return `Signal: reward from action.`
  }

  if (config.algorithm === 'sarsa') {
    return `SARSA updates toward the action it actually plans to take next, so it often learns a slightly safer route when the penalty is nearby. Right now its best action from the current cell is ${ACTION_LABELS[greedyAction].toLowerCase()}.`
  }

  return `Q-Learning updates toward the best-looking next action, even when the agent is still exploring. The recent average reward is ${averageReward.toFixed(2)}, which helps you see whether that optimism is paying off.`
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

  return (
    <div className={`m3-rl-block${embedded ? ' m3-rl-block--embedded' : ''}`}>
      <div className="m3-rl-layout">
        <div className="m3-rl-stage">
          <div className="m3-rl-stage-header">
            <div>
              <p className="m3-rl-control-label">Reinforcement Learning: Learn From Rewards</p>
            </div>
            <div className="m3-rl-legend">
              <span className="m3-rl-legend-chip m3-rl-legend-chip--start">Start</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--goal">Goal +10</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--hazard">Penalty -10</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--wall">Wall</span>
              <span className="m3-rl-legend-chip m3-rl-legend-chip--step">Step cost -0.1</span>
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
            <strong>Signal:</strong> {summaryCopy(config, completedEpisodes, averageReward, greedyAction)}
          </div>

          {lastTransition && (
            <div className="m3-rl-insight m3-rl-insight--soft">
              <strong>Last step:</strong> Move <strong>{ACTION_LABELS[lastTransition.action].toLowerCase()}</strong>, {formatOutcome(lastTransition.outcome)}, reward <strong>{lastTransition.reward.toFixed(2)}</strong>.
              {lastEpisodeOutcome && ` Last finished episode ${formatOutcome(lastEpisodeOutcome)}.`}
            </div>
          )}

          <div className="m3-rl-q-card m3-rl-q-card--inline">
            <p className="m3-rl-control-label">Action values for the current cell</p>
            <div className="m3-rl-q-grid">
              {Object.entries(actionValues).map(([action, value]) => (
                <div key={action} className={`m3-rl-q-item${greedyAction === action ? ' is-best' : ''}`}>
                  <span>{ACTION_LABELS[action]}</span>
                  <strong>{value.toFixed(2)}</strong>
                </div>
              ))}
            </div>
            <p className="m3-type-desc">The highest value is the move the agent currently prefers.</p>
          </div>
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

      <div className="m3-rl-q-card m3-rl-q-card--bottom">
        <p className="m3-rl-control-label">Quick help</p>
        <div className="m3-rl-copy-list">
          <p><strong>Start:</strong> let the agent keep running through episodes on its own.</p>
          <p><strong>Step Episode:</strong> run one full episode, then pause so you can inspect the result.</p>
          <p><strong>Reset Environment:</strong> restart the agent on the same map, but keep what it learned.</p>
          <p><strong>Reset Learning:</strong> erase the learned action values and start fresh.</p>
          <p><strong>Edit the board:</strong> click cells to change gems, pits, walls, or empty spaces, then let the agent learn again.</p>
        </div>
        <div className="m3-rl-reward-row">
          {recentRewards.length === 0 ? (
            <span className="m3-rl-empty-note">Finish a few episodes to see recent reward results here.</span>
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
  )
}

export default ReinforcementLab
