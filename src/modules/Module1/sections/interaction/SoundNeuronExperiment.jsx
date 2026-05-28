import FloatingSignal from './FloatingSignal'
import NeuronResponsePanel from './NeuronResponsePanel'
import PhetNeuronPanel from './PhetNeuronPanel'
import { staticPayAttentionSvg } from '../intro/module1SceneAssets'
import useSoundNeuronExperiment, { EXAMPLE_SIGNALS, MAX_INPUT, THRESHOLD } from '../../hooks/useSoundNeuronExperiment'
import './soundNeuronExperiment.css'

function SoundNeuronExperiment() {
  const {
    currentPhrase,
    somaInput,
    recentSignals,
    isAnimating,
    isFiring,
    lastResult,
    autoStimulateToken,
    setCurrentPhrase,
    submitCurrentPhrase,
    submitExamplePhrase,
  } = useSoundNeuronExperiment()

  const somaFillPercent = Math.max(0, Math.min(100, (somaInput / MAX_INPUT) * 100))
  const thresholdPercent = (THRESHOLD / MAX_INPUT) * 100

  return (
    <div className="module1-sound-neuron">
      <div className="module1-sound-neuron__shell">
        <div className="module1-sound-neuron__intro">
          <p className="module1-eyebrow module1-eyebrow-tight">C. Sound Experiment</p>
          <h2 className="module1-sound-neuron__title">When Does a Neuron Fire?</h2>
          <p className="module1-card-muted module1-text-reset">
            Sound signals travel to the ear, become neural input, and trigger a spike when the neuron is stimulated strongly enough.
          </p>
        </div>

        <form className="module1-sound-neuron__composer" onSubmit={submitCurrentPhrase}>
          <div className="module1-sound-neuron__input-row">
            <input
              id="module1-sound-neuron-input"
              type="text"
              value={currentPhrase}
              onChange={(event) => setCurrentPhrase(event.target.value)}
              placeholder="Type what Alex hears"
              autoComplete="off"
            />
            <button type="submit" className="module1-primary-button module1-sound-neuron__send-button">
              Send sound
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
          <div className="module1-sound-neuron__scene-panel">
            <div className="module1-sound-neuron__scene-art" aria-hidden="true">
              <div
                className="module1-sound-neuron__scene-art-body"
                dangerouslySetInnerHTML={{ __html: staticPayAttentionSvg }}
              />
              <div className="module1-sound-neuron__signal-overlay">
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
            </div>
            <div className="module1-sound-neuron__scene-hint">Signals move toward the soma.</div>
          </div>

          <div className="module1-sound-neuron__neuron-panel">
            <div className="module1-sound-neuron__panel-header">
              <div>
                <h3 className="module1-sound-neuron__panel-title">Watch the neuron</h3>
                <p className="module1-sound-neuron__panel-copy">Each sound adds input at the soma. When the total reaches threshold, the neuron fires automatically.</p>
              </div>
            </div>

            <div className="module1-sound-neuron__meter">
              <div className="module1-sound-neuron__meter-header">
                <span className="module1-sound-neuron__meter-label">Soma input</span>
                <strong>{somaInput} / {MAX_INPUT}</strong>
              </div>
              <div
                className={`module1-sound-neuron__meter-track ${isFiring ? 'is-firing' : ''}`}
                aria-label="Soma input meter"
                aria-valuemin={0}
                aria-valuemax={MAX_INPUT}
                aria-valuenow={somaInput}
                role="meter"
              >
                <div className="module1-sound-neuron__meter-fill" style={{ width: `${somaFillPercent}%` }} />
                <div className="module1-sound-neuron__meter-threshold" style={{ left: `${thresholdPercent}%` }}>
                  <span>Threshold {THRESHOLD}</span>
                </div>
              </div>
            </div>

            <NeuronResponsePanel lastResult={lastResult} />
            <PhetNeuronPanel
              title="Watch the neuron"
              helperText="Send a sound to build input, or use the manual controls to test the neuron directly."
              showStatus={false}
              showPlayback={false}
              showAttribution={false}
              autoStimulateToken={autoStimulateToken}
              compact
              showIntro={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SoundNeuronExperiment
