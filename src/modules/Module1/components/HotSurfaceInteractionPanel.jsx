import { PHET_NEURON_LIVE_URL } from './PhetNeuronEmbed'
import PhetNeuronPanel from './PhetNeuronPanel'
import { staticPayAttentionSvg } from './module1SceneAssets'
import useSoundNeuronExperiment, {
  getWordSignalStrength,
  STRENGTH_OPTIONS,
  THRESHOLD_LEVEL,
  TIMING_OPTIONS,
  WORD_BANK,
} from '../hooks/useSoundNeuronExperiment'

function SignalStrengthBars({ bars }) {
  return (
    <span className="module1-section-c__strength-bars" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span key={index} className={index < bars ? 'is-on' : ''} />
      ))}
    </span>
  )
}

function getWhyItHappened({ outcome, peakFillLevel, isRunning, isFiring }) {
  if (isFiring || outcome === 'fired') {
    return 'The signals arrived close together, so they added up before fading and crossed threshold.'
  }

  if (isRunning) {
    return 'Signals are still arriving. Watch whether they build fast enough before they fade.'
  }

  if (peakFillLevel >= THRESHOLD_LEVEL - 0.12) {
    return 'The signals almost reached threshold. A stronger sound or closer timing could make the neuron fire.'
  }

  if (outcome === 'leaked') {
    return 'The signals were too weak or too spread out, so they faded before reaching threshold.'
  }

  return 'Run a trial to see whether enough input reaches the soma before it fades.'
}

function getResultLabel({ outcome, peakFillLevel, isRunning, isFiring }) {
  if (isFiring || outcome === 'fired') {
    return 'Spike'
  }

  if (isRunning) {
    return 'Building'
  }

  if (peakFillLevel >= THRESHOLD_LEVEL - 0.12) {
    return 'Near threshold'
  }

  if (outcome === 'leaked') {
    return 'No spike'
  }

  return 'Ready'
}

function HotSurfaceInteractionPanel() {
  const {
    strength,
    setStrength,
    timing,
    setTiming,
    selectedWords,
    customWord,
    setCustomWord,
    fillLevel,
    peakFillLevel,
    signals,
    runToken,
    isRunning,
    isFiring,
    outcome,
    isPrimed,
    addWord,
    removeWord,
    handleCustomWordSubmit,
    handleRun,
    handleReset,
  } = useSoundNeuronExperiment()

  const displayedFillLevel = Math.max(fillLevel, peakFillLevel)
  const inputScore = Math.round(displayedFillLevel * 100)
  const thresholdScore = Math.round(THRESHOLD_LEVEL * 100)
  const resultLabel = getResultLabel({ outcome, peakFillLevel, isRunning, isFiring })
  const whyItHappened = getWhyItHappened({ outcome, peakFillLevel, isRunning, isFiring })

  return (
    <div className="module1-section-c-flow">
      <div className="module1-section-c__controls-panel">
        <div className="module1-section-c__controls-heading">
          <h3 className="module1-section-c__controls-title">Test the neuron</h3>
          <p className="module1-card-muted module1-text-reset">
            Choose sounds, set their strength and timing, and see whether enough input reaches the soma before it fades.
          </p>
        </div>

        <div className="module1-section-c__controls-layout">
          <div className="module1-section-c__control-block">
            <span className="module1-section-c__field-label">Choose sound signals</span>
            <div className="module1-section-c__word-bank">
              {WORD_BANK.map((word) => (
                <button
                  key={word}
                  type="button"
                  className="module1-section-c__word-option"
                  onClick={() => addWord(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          <div className="module1-section-c__control-block">
            <span className="module1-section-c__field-label">Add your own sound</span>
            <div className="module1-section-c__custom-word">
              <input
                type="text"
                value={customWord}
                onChange={(event) => setCustomWord(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleCustomWordSubmit()
                  }
                }}
                placeholder="Type a sound"
              />
              <button type="button" onClick={handleCustomWordSubmit}>
                Add
              </button>
            </div>
          </div>

          <div className="module1-section-c__control-block module1-section-c__control-block--selected">
            <span className="module1-section-c__field-label">Selected sounds</span>
            <div className="module1-section-c__selected-words-row">
              {selectedWords.map((word, index) => {
                const signalStrength = getWordSignalStrength(word, strength)

                return (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    className="module1-section-c__selected-word"
                    onClick={() => removeWord(index)}
                    title="Remove this sound"
                  >
                    <span className="module1-section-c__selected-word-text">{word}</span>
                    <span className="module1-section-c__selected-word-meta">
                      <SignalStrengthBars bars={signalStrength.bars} />
                      <small>{signalStrength.label}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="module1-section-c__control-block module1-section-c__control-block--settings">
            <div className="module1-section-c__setting">
              <span className="module1-section-c__control-label">Signal strength</span>
              <div className="module1-section-c__toggle-row">
                {STRENGTH_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={strength === option.id ? 'is-selected' : ''}
                    onClick={() => setStrength(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="module1-section-c__setting">
              <span className="module1-section-c__control-label">Signal timing</span>
              <div className="module1-section-c__toggle-row">
                {TIMING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={timing === option.id ? 'is-selected' : ''}
                    onClick={() => setTiming(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="module1-section-c__actions">
              <button
                type="button"
                className="module1-primary-button module1-section-c__run-button"
                onClick={handleRun}
                disabled={selectedWords.length === 0}
              >
                Run trial
              </button>
              <button
                type="button"
                className="module1-secondary-button module1-section-c__reset-button"
                onClick={handleReset}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="module1-section-c__interaction-grid">
        <div className="module1-section-c__panel module1-section-c__panel--flow">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">Send signals</p>
            <h4 className="module1-panel-title">Watch sound signals reach the neuron</h4>
          </div>

          <div className="module1-section-c__flow-stage module1-section-c__flow-stage--scene" aria-hidden="true">
            <div
              className="module1-section-c__flow-scene-art"
              dangerouslySetInnerHTML={{ __html: staticPayAttentionSvg }}
            />
            <div className="module1-section-c__flow-current" />
            <div className="module1-section-c__flow-direction-copy">
              Sound signals reach the ear, become neural input, and move toward the soma.
            </div>

            {signals.map((signal) => (
              <div
                key={`${runToken}-${signal.id}`}
                className={`module1-section-c__signal module1-section-c__signal--${signal.type}`}
                style={{
                  '--section-c-signal-top': `${24 + signal.lane * 16}%`,
                  animationDelay: `${signal.delay}ms`,
                  animationDuration: `${signal.duration}ms`,
                }}
              >
                {signal.label}
                <span className="module1-section-c__signal-bubble module1-section-c__signal-bubble--one" />
                <span className="module1-section-c__signal-bubble module1-section-c__signal-bubble--two" />
                <span className="module1-section-c__signal-bubble module1-section-c__signal-bubble--three" />
              </div>
            ))}
          </div>
        </div>

        <div className="module1-section-c__panel module1-section-c__panel--neuron">
          <div className="module1-section-c__panel-header">
            <p className="module1-eyebrow module1-eyebrow-tight">Watch the neuron</p>
            <h4 className="module1-panel-title">See whether enough input reaches threshold</h4>
          </div>

          <div className="module1-section-c__response-strip">
            <div className="module1-section-c__response-copy">
              <span className="module1-section-c__field-label">Result</span>
              <strong className="module1-section-c__response-value">{resultLabel}</strong>
            </div>
            <div className="module1-section-c__response-copy">
              <span className="module1-section-c__field-label">Why it happened</span>
              <p>{whyItHappened}</p>
            </div>
          </div>

          <div className="module1-section-c__meter-strip">
            <div className="module1-section-c__meter-text">
              <span className="module1-section-c__field-label">Soma input level</span>
              <strong>{inputScore} / 100</strong>
            </div>
            <div className="module1-section-c__meter-track">
              <div
                className="module1-section-c__meter-fill"
                style={{ width: `${Math.min(100, Math.max(0, inputScore))}%` }}
              />
              <div className="module1-section-c__meter-threshold" style={{ left: `${thresholdScore}%` }}>
                <span>Threshold</span>
              </div>
            </div>
          </div>

          <PhetNeuronPanel
            runToken={runToken}
            isRunning={isRunning}
            isPrimed={isPrimed}
            isFiring={isFiring}
            outcome={outcome}
          />
        </div>
      </div>

      <div className="module1-section-c__footer-row">
        <span>Class question: Why did the neuron fire in one trial but not another?</span>
        <a href={PHET_NEURON_LIVE_URL} target="_blank" rel="noopener noreferrer">
          Open full PhET simulator
        </a>
      </div>
    </div>
  )
}

export default HotSurfaceInteractionPanel
