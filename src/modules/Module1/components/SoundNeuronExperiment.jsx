import CleanNeuronSvg from './CleanNeuronSvg'
import FloatingSignal from './FloatingSignal'
import NeuronResponsePanel from './NeuronResponsePanel'
import SomaInputMeter from './SomaInputMeter'
import { staticPayAttentionSvg } from './module1SceneAssets'
import useSoundNeuronExperiment, { EXAMPLE_SIGNALS, MAX_INPUT, THRESHOLD } from '../hooks/useSoundNeuronExperiment'
import '../styles/soundNeuronExperiment.css'

function SoundNeuronExperiment() {
  const {
    currentPhrase,
    somaInput,
    recentSignals,
    isAnimating,
    isFiring,
    lastResult,
    setCurrentPhrase,
    submitCurrentPhrase,
    submitExamplePhrase,
  } = useSoundNeuronExperiment()

  const fillPercent = Math.round((somaInput / MAX_INPUT) * 100)

  return (
    <div className="module1-sound-neuron">
      <div className="module1-sound-neuron__shell">
        <div className="module1-sound-neuron__intro">
          <h2 className="module1-sound-neuron__title">TEST THE NEURON</h2>
          <label className="module1-sound-neuron__prompt" htmlFor="module1-sound-neuron-input">
            What did the neuron hear?
          </label>
          <p className="module1-sound-neuron__guide">Send signals close together before they fade.</p>
        </div>

        <form className="module1-sound-neuron__composer" onSubmit={submitCurrentPhrase}>
          <div className="module1-sound-neuron__input-row">
            <input
              id="module1-sound-neuron-input"
              type="text"
              value={currentPhrase}
              onChange={(event) => setCurrentPhrase(event.target.value)}
              placeholder="Type what the neuron hears"
              autoComplete="off"
            />
            <button type="submit" className="module1-primary-button module1-sound-neuron__send-button">
              Send signal
            </button>
          </div>

          <div className="module1-sound-neuron__examples" aria-label="Example phrases">
            {EXAMPLE_SIGNALS.map((example) => (
              <button
                key={example.value}
                type="button"
                className="module1-sound-neuron__example-chip"
                onClick={() => submitExamplePhrase(example.value)}
              >
                {example.label}
              </button>
            ))}
          </div>
        </form>

        <div className={`module1-sound-neuron__workspace ${isAnimating ? 'is-animating' : ''}`}>
          <div className="module1-sound-neuron__signal-overlay" aria-hidden="true">
            {recentSignals.map((signal) => (
              <FloatingSignal
                key={signal.id}
                phrase={signal.phrase}
                impact={signal.impact}
                strength={signal.strength}
                isAlexCue={signal.isAlexCue}
                duration={signal.duration}
                scale={signal.scale}
                laneOffset={signal.laneOffset}
              />
            ))}
          </div>

          <div className="module1-sound-neuron__scene-panel">
            <div
              className="module1-sound-neuron__scene-art"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: staticPayAttentionSvg }}
            />
            <div className="module1-sound-neuron__scene-hint">Signals move toward the soma.</div>
          </div>

          <div className="module1-sound-neuron__neuron-panel">
            <NeuronResponsePanel lastResult={lastResult} somaInput={somaInput} maxInput={MAX_INPUT} />
            <SomaInputMeter value={somaInput} maxInput={MAX_INPUT} threshold={THRESHOLD} isFiring={isFiring} />

            <div className={`module1-sound-neuron__neuron-stage ${isFiring ? 'is-firing' : ''}`}>
              <div className="module1-sound-neuron__neuron-level">Input level {fillPercent}%</div>
              <CleanNeuronSvg
                className="module1-sound-neuron__neuron-svg"
                level={1}
                fillPercent={fillPercent}
                thresholdPercent={THRESHOLD}
                isFiring={isFiring}
                mirrored={false}
                showInputSignals={false}
                showThreshold={true}
                showLabels={false}
              />
              <div className="module1-sound-neuron__soma-pulse" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoundNeuronExperiment
