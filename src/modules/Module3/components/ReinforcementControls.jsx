import { GRID_MAX_SIZE, GRID_MIN_SIZE } from '../rl/environment'

function Slider({ label, value, min, max, step, onChange, formatValue = (current) => current.toFixed(2) }) {
  return (
    <label className="m3-rl-slider">
      <div className="m3-rl-slider-head">
        <span>{label}</span>
        <strong>{formatValue(value)}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function DisplayModeButton({ active, label, onClick }) {
  return (
    <button
      type="button"
      className={`m3-btn${active ? ' m3-btn--active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function ReinforcementControls({
  config,
  environment,
  gridSize,
  isRunning,
  onToggleRunning,
  onStep,
  onResetEnvironment,
  onResetLearning,
  onSetAlgorithm,
  onSetEnvironmentSetting,
  onSetGridSize,
  onSetParameter,
}) {
  return (
    <div className="m3-rl-controls">
      <div className="m3-rl-control-card">
        <p className="m3-rl-control-label">Simulation controls</p>
        <div className="m3-controls m3-controls--rl">
          <button className="m3-btn m3-btn--primary" onClick={onToggleRunning}>
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button className="m3-btn" onClick={onStep}>Step Episode</button>
          <button className="m3-btn" onClick={onResetEnvironment}>Reset Environment</button>
          <button className="m3-btn" onClick={onResetLearning}>Reset Learning</button>
        </div>
      </div>

      <div className="m3-rl-control-card">
        <p className="m3-rl-control-label">Algorithm</p>
        <div className="m3-rl-pill-row">
          <button
            className={`m3-btn${config.algorithm === 'q-learning' ? ' m3-btn--active' : ''}`}
            onClick={() => onSetAlgorithm('q-learning')}
          >
            Q-Learning
          </button>
          <button
            className={`m3-btn${config.algorithm === 'sarsa' ? ' m3-btn--active' : ''}`}
            onClick={() => onSetAlgorithm('sarsa')}
          >
            SARSA
          </button>
        </div>
      </div>

      <div className="m3-rl-control-card">
        <p className="m3-rl-control-label">Learning settings</p>
        <div className="m3-rl-slider-stack">
          <Slider
            label="Grid size"
            value={gridSize}
            min={GRID_MIN_SIZE}
            max={GRID_MAX_SIZE}
            step={1}
            onChange={onSetGridSize}
            formatValue={(value) => `${value}`}
          />
          <label className="m3-rl-select-field">
            <span className="m3-rl-select-label">Cell Display</span>
            <div className="m3-rl-pill-row">
              <DisplayModeButton
                active={config.cellDisplay === 'color'}
                label="Values (Color Only)"
                onClick={() => onSetParameter('cellDisplay', 'color')}
              />
              <DisplayModeButton
                active={config.cellDisplay === 'numbers'}
                label="Show Numbers"
                onClick={() => onSetParameter('cellDisplay', 'numbers')}
              />
            </div>
          </label>
          <Slider
            label="Step Penalty"
            value={environment.rewards.step}
            min={-1}
            max={-0.01}
            step={0.01}
            onChange={(value) => onSetEnvironmentSetting('step', value)}
          />
          <Slider
            label="Gem Reward"
            value={environment.rewards.goal}
            min={1}
            max={20}
            step={1}
            onChange={(value) => onSetEnvironmentSetting('goal', value)}
            formatValue={(value) => `${Math.round(value)}`}
          />
          <Slider
            label="Pit Penalty"
            value={environment.rewards.hazard}
            min={-20}
            max={-1}
            step={1}
            onChange={(value) => onSetEnvironmentSetting('hazard', value)}
            formatValue={(value) => `${Math.round(value)}`}
          />
          <Slider
            label="Max Steps / Episode"
            value={environment.maxStepsPerEpisode}
            min={20}
            max={160}
            step={5}
            onChange={(value) => onSetEnvironmentSetting('maxStepsPerEpisode', value)}
            formatValue={(value) => `${Math.round(value)}`}
          />
          <Slider label="Speed (ms)" value={config.speed} min={120} max={900} step={30} onChange={(value) => onSetParameter('speed', value)} formatValue={(value) => `${Math.round(value)}`} />
          <Slider label="Exploration ε" value={config.epsilon} min={0.05} max={0.5} step={0.01} onChange={(value) => onSetParameter('epsilon', value)} />
          <Slider label="Learning rate α" value={config.alpha} min={0.1} max={0.8} step={0.05} onChange={(value) => onSetParameter('alpha', value)} />
          <Slider label="Discount γ" value={config.gamma} min={0.5} max={0.99} step={0.01} onChange={(value) => onSetParameter('gamma', value)} />
        </div>
        <p className="m3-type-desc">Changing grid size, rewards, or episode length resets learning so the Q-values match the new setup.</p>
      </div>

      <div className="m3-rl-control-card">
        <p className="m3-rl-control-label">Board editor</p>
        <div className="m3-rl-copy-list">
          <p><strong>Click any non-start cell:</strong> it cycles through 💎 gem, ☠️ hazard, 🚧 wall, and empty.</p>
          <p><strong>Editing the board:</strong> pauses the simulation and restarts learning so the Q-table matches the new map.</p>
        </div>
      </div>
    </div>
  )
}

export default ReinforcementControls
