import { SCENARIOS } from '../module1Config'
import './scenarioPicker.css'

export default function ScenarioPicker({ selectedId, onSelect }) {
  return (
    <div className="scenario-picker">
      <p className="module1-eyebrow module1-eyebrow-tight">Choose a real neuron scenario</p>
      <div className="scenario-picker__row" role="group" aria-label="Scenario selector">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            className={`scenario-picker__card${selectedId === s.id ? ' scenario-picker__card--active' : ''}`}
            onClick={() => onSelect(s)}
            aria-pressed={selectedId === s.id}
          >
            <span className="scenario-picker__emoji" aria-hidden="true">{s.emoji}</span>
            <span className="scenario-picker__label">{s.label}</span>
            <span className="scenario-picker__time">{s.reactionTime}</span>
          </button>
        ))}
      </div>
      {selectedId && (
        <p className="scenario-picker__desc">
          {SCENARIOS.find((s) => s.id === selectedId)?.description}
          <span className="scenario-picker__neuron-type">
            {' '}Neuron: {SCENARIOS.find((s) => s.id === selectedId)?.neuronType}
          </span>
        </p>
      )}
    </div>
  )
}
