import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BiologyDiagram from '../../../components/diagrams/BiologyDiagram'
import PredictionPrompt from '../../../components/ui/PredictionPrompt'
import { calculateTotal, neuronFires } from '../../../utils/neuronLogic'
import {
  DEFAULT_SIGNAL_LEVELS,
  DEFAULT_SYNAPSE_STRENGTHS,
  DEFAULT_THRESHOLD,
  PROCESS_PHASES,
  SCENARIOS,
  getProcessPhaseSummary,
} from '../module1Config'
import LiveExplanationPanel from './LiveExplanationPanel'
import NeuronExperimentPanel from './NeuronExperimentPanel'
import ScenarioPicker from './ScenarioPicker'
import DownstreamCallout from './DownstreamCallout'
import LeakyBucket from './LeakyBucket'

const roundValue = (value) => Number(value.toFixed(1))
const getWeightedInputs = (signals, strengths) =>
  signals.map((signal, index) => roundValue(signal * strengths[index]))

const HOT_SURFACE = SCENARIOS[0]

function InteractionSection({ isMobile = false }) {
  // Phase: 'scaffolded' → 'threshold' → 'free'
  const [phase, setPhase] = useState('scaffolded')

  // Scaffolded phase state
  const [scaffoldPrediction, setScaffoldPrediction] = useState(null)
  const [scaffoldRan, setScaffoldRan] = useState(false)
  const [thresholdExplored, setThresholdExplored] = useState(false)

  // Free exploration state
  const [selectedScenario, setSelectedScenario] = useState(HOT_SURFACE)
  const [signalLevels, setSignalLevels] = useState(HOT_SURFACE.signalLevels)
  const [synapseStrengths, setSynapseStrengths] = useState(HOT_SURFACE.synapseStrengths)
  const [draftThreshold, setDraftThreshold] = useState(HOT_SURFACE.threshold)

  // Shared animation state
  const [activeInputs, setActiveInputs] = useState(
    getWeightedInputs(DEFAULT_SIGNAL_LEVELS, DEFAULT_SYNAPSE_STRENGTHS),
  )
  const [activeThreshold, setActiveThreshold] = useState(DEFAULT_THRESHOLD)
  const [currentPhase, setCurrentPhase] = useState(PROCESS_PHASES.IDLE)
  const [replaySignal, setReplaySignal] = useState(0)
  const [activeNeuronFires, setActiveNeuronFires] = useState(false)

  // Prediction tracking (free phase)
  const [freePrediction, setFreePrediction] = useState(null)
  const [freeResult, setFreeResult] = useState(null)
  const [predictions, setPredictions] = useState({ correct: 0, total: 0 })
  const [scenariosRun, setScenariosRun] = useState(new Set())
  const [showDiscovery, setShowDiscovery] = useState(false)

  // ── Computed values ─────────────────────────────────────────────
  const weightedInputs = useMemo(
    () => getWeightedInputs(signalLevels, synapseStrengths),
    [signalLevels, synapseStrengths],
  )
  const totalInput = useMemo(() => roundValue(calculateTotal(weightedInputs)), [weightedInputs])
  const activeTotalInput = useMemo(() => roundValue(calculateTotal(activeInputs)), [activeInputs])

  const explanation = getProcessPhaseSummary(currentPhase, {
    totalInput: activeTotalInput,
    threshold: activeThreshold,
    neuronFires: activeNeuronFires,
    weightedInputs: activeInputs,
  })

  // ── Scaffolded phase: Hot Surface ──────────────────────────────
  const scaffoldInputs = getWeightedInputs(HOT_SURFACE.signalLevels, HOT_SURFACE.synapseStrengths)
  const scaffoldTotal = roundValue(calculateTotal(scaffoldInputs))
  const scaffoldFires = neuronFires(scaffoldTotal, draftThreshold)

  const handleScaffoldPredict = (value) => {
    setScaffoldPrediction(value)
  }

  const handleScaffoldRun = () => {
    setActiveInputs(scaffoldInputs)
    setActiveThreshold(draftThreshold)
    setActiveNeuronFires(scaffoldFires)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal((t) => t + 1)
    setScaffoldRan(true)
  }

  const handleThresholdChange = (value) => {
    setDraftThreshold(value)
    if (!thresholdExplored) setThresholdExplored(true)
  }

  const handleAdvanceToFree = () => {
    setPhase('free')
    setSelectedScenario(SCENARIOS[0])
    setSignalLevels(SCENARIOS[0].signalLevels)
    setSynapseStrengths(SCENARIOS[0].synapseStrengths)
    setDraftThreshold(SCENARIOS[0].threshold)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal(0)
    setActiveNeuronFires(false)
    setFreePrediction(null)
    setFreeResult(null)
  }

  // ── Free exploration phase ─────────────────────────────────────
  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario)
    setSignalLevels(scenario.signalLevels)
    setSynapseStrengths(scenario.synapseStrengths)
    setDraftThreshold(scenario.threshold)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal(0)
    setFreePrediction(null)
    setFreeResult(null)
  }

  const handleFreePredict = (value) => {
    setFreePrediction(value)
  }

  const handleFreeRun = () => {
    const nextInputs = getWeightedInputs(signalLevels, synapseStrengths)
    const nextTotal = roundValue(calculateTotal(nextInputs))
    const fires = neuronFires(nextTotal, draftThreshold)

    setActiveInputs(nextInputs)
    setActiveThreshold(draftThreshold)
    setActiveNeuronFires(fires)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal((t) => t + 1)

    setFreeResult(fires)

    const isCorrect = freePrediction === fires
    setPredictions((p) => ({
      correct: p.correct + (isCorrect ? 1 : 0),
      total: p.total + 1,
    }))

    const newRun = new Set(scenariosRun)
    newRun.add(selectedScenario.id)
    setScenariosRun(newRun)
    if (newRun.size >= 3 && !showDiscovery) {
      setTimeout(() => setShowDiscovery(true), 1500)
    }
  }

  const handleReplay = () => {
    setReplaySignal((t) => t + 1)
  }

  const handleReset = () => {
    const scenario = selectedScenario ?? SCENARIOS[0]
    setSignalLevels(scenario.signalLevels)
    setSynapseStrengths(scenario.synapseStrengths)
    setDraftThreshold(scenario.threshold)
    setActiveInputs(getWeightedInputs(scenario.signalLevels, scenario.synapseStrengths))
    setActiveThreshold(scenario.threshold)
    setActiveNeuronFires(false)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal(0)
    setFreePrediction(null)
    setFreeResult(null)
  }

  // ── Scaffolded view ────────────────────────────────────────────
  if (phase === 'scaffolded' || phase === 'threshold') {
    const showThresholdSlider = scaffoldRan
    const canRun = scaffoldPrediction !== null

    return (
      <section className="module1-section module1-interaction-section">
        <div className="module1-section-heading">
          <p className="module1-eyebrow">B. First Experiment</p>
          <h2>A hot pan touches your finger</h2>
          <p>
            Four signals reach this neuron. The temperature receptor fires hard.
            The pain signal is strong. Skin pressure is faint, and touch is silent.
          </p>
        </div>

        {/* Input display (read-only) */}
        <div className="module1-scaffold-inputs">
          {HOT_SURFACE.dendriteLabelS.map((label, i) => (
            <div key={label} className="module1-scaffold-input-card">
              <span className="module1-scaffold-input-label">{label}</span>
              <div className="module1-scaffold-input-values">
                <span className="module1-scaffold-input-signal">
                  Signal: {HOT_SURFACE.signalLevels[i]}
                </span>
                <span className="module1-scaffold-input-strength">
                  Strength: {HOT_SURFACE.synapseStrengths[i]}
                </span>
                <span className="module1-scaffold-input-contrib">
                  = {scaffoldInputs[i]}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Prediction gate */}
        {!scaffoldRan && (
          <PredictionPrompt
            question="Will this neuron fire?"
            options={[
              { label: 'Yes, it will fire', value: true },
              { label: 'No, it stays quiet', value: false },
            ]}
            onPredict={handleScaffoldPredict}
            result={scaffoldRan ? scaffoldFires : undefined}
            resultLabel={scaffoldFires ? 'It fires!' : 'It stays quiet'}
            explanation={`The total was ${scaffoldTotal}, ${scaffoldFires ? 'above' : 'below'} the threshold of ${HOT_SURFACE.threshold}.`}
          />
        )}

        {/* Run button — only active after prediction */}
        {!scaffoldRan && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              className={`shared-btn ${canRun ? 'shared-btn-primary' : 'shared-btn-ghost'}`}
              onClick={handleScaffoldRun}
              disabled={!canRun}
            >
              {canRun ? 'Run the neuron' : 'Make your prediction first'}
            </button>
          </div>
        )}

        {/* Diagram + result */}
        <div className="module1-two-column module1-interaction-layout" style={{ marginTop: 20 }}>
          <div className="module1-interaction-visual-column">
            <div className="module1-hero-shell module1-process-visual module1-interaction-visual">
              <div className="module1-process-diagram-frame">
                <BiologyDiagram
                  isMobile={isMobile}
                  mode="interactive"
                  weightedInputs={activeInputs}
                  totalInput={activeTotalInput}
                  threshold={activeThreshold}
                  didFire={activeNeuronFires}
                  currentPhase={currentPhase}
                  replaySignal={replaySignal}
                  onPhaseChange={setCurrentPhase}
                />
              </div>
            </div>

            {scaffoldRan && (
              <LiveExplanationPanel
                currentPhase={currentPhase}
                neuronBFires={activeNeuronFires}
                neuronFires={activeNeuronFires}
                summary={explanation}
                threshold={activeThreshold}
                totalInput={activeTotalInput}
              />
            )}
          </div>

          {scaffoldRan && (
            <div className="module1-interaction-stack">
              <div className="module1-panel module1-interaction-panel">
                {/* Result summary */}
                <motion.div
                  className="module1-scaffold-result"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="module1-eyebrow module1-eyebrow-tight">Result</p>
                  <p className="module1-scaffold-result-text">
                    Total: <strong>{scaffoldTotal}</strong> | Threshold: <strong>{draftThreshold}</strong> |{' '}
                    <strong className={scaffoldFires ? 'module1-status-success' : 'module1-status-warn'}>
                      {scaffoldFires ? 'Fires!' : 'Quiet'}
                    </strong>
                  </p>

                  <div className="module1-scaffold-insight">
                    <strong>Key insight:</strong> The neuron adds signal x strength for each path,
                    then compares the total to a threshold.
                  </div>
                </motion.div>

                {/* Threshold slider */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="module1-scaffold-threshold"
                >
                  <p className="module1-eyebrow module1-eyebrow-tight">Try it</p>
                  <h3 className="module1-panel-title">What if the threshold was different?</h3>
                  <p className="module1-card-muted">
                    Raise it to make firing harder. Lower it to make the neuron more sensitive.
                  </p>

                  <div className="module1-threshold-block module1-threshold-card">
                    <label className="module1-form-label">
                      <span className="module1-threshold-label">Threshold: {draftThreshold}</span>
                      <input
                        className="module1-slider"
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={draftThreshold}
                        onChange={(e) => handleThresholdChange(Number(e.target.value))}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="shared-btn shared-btn-secondary shared-btn-sm" onClick={handleScaffoldRun}>
                      Run again
                    </button>
                  </div>

                  <LeakyBucket
                    totalInput={scaffoldTotal}
                    threshold={draftThreshold}
                    didFire={scaffoldFires}
                    currentPhase={currentPhase}
                  />

                  <DownstreamCallout
                    scenario={HOT_SURFACE}
                    isVisible={scaffoldFires}
                  />
                </motion.div>

                {/* Advance to free exploration */}
                {thresholdExplored && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ textAlign: 'center', marginTop: 16 }}
                  >
                    <button className="shared-btn shared-btn-primary" onClick={handleAdvanceToFree}>
                      Try more scenarios
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    )
  }

  // ── Free exploration view ──────────────────────────────────────
  const freeCanRun = freePrediction !== null && freeResult === null

  return (
    <section className="module1-section module1-interaction-section">
      <div className="module1-section-heading">
        <p className="module1-eyebrow">C. Explore</p>
        <h2>Pick a scenario and predict the outcome</h2>
        <p>
          Choose a real biological event. Before you run it, predict: will the
          neuron fire? Then see if you're right.
        </p>
        {predictions.total > 0 && (
          <p className="module1-prediction-score">
            Predictions: {predictions.correct}/{predictions.total} correct
          </p>
        )}
      </div>

      <ScenarioPicker
        selectedId={selectedScenario?.id}
        onSelect={(s) => {
          handleScenarioSelect(s)
        }}
      />

      {/* Prediction gate for each scenario */}
      {freeResult === null && (
        <PredictionPrompt
          key={selectedScenario?.id}
          question={`${selectedScenario?.label}: will this neuron fire?`}
          options={[
            { label: 'Yes, it fires', value: true },
            { label: 'No, stays quiet', value: false },
          ]}
          onPredict={handleFreePredict}
          result={freeResult}
        />
      )}

      {freeResult !== null && (
        <motion.div
          className={`module1-free-result ${freePrediction === freeResult ? 'module1-free-result--correct' : 'module1-free-result--wrong'}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <strong>{freePrediction === freeResult ? 'Correct!' : 'Not quite.'}</strong>{' '}
          The neuron {freeResult ? 'fired' : 'stayed quiet'}.
          Total: {activeTotalInput} | Threshold: {activeThreshold}
        </motion.div>
      )}

      {/* Run / New scenario controls */}
      <div style={{ textAlign: 'center', margin: '12px 0' }}>
        {freeResult === null ? (
          <button
            className={`shared-btn ${freeCanRun ? 'shared-btn-primary' : 'shared-btn-ghost'}`}
            onClick={handleFreeRun}
            disabled={!freeCanRun}
          >
            {freeCanRun ? 'Run the neuron' : 'Make your prediction first'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="shared-btn shared-btn-secondary shared-btn-sm" onClick={handleReplay}>
              Replay animation
            </button>
            <button
              className="shared-btn shared-btn-ghost shared-btn-sm"
              onClick={() => {
                setFreePrediction(null)
                setFreeResult(null)
              }}
            >
              Try new settings
            </button>
          </div>
        )}
      </div>

      <div className="module1-two-column module1-interaction-layout">
        <div className="module1-interaction-visual-column">
          <div className="module1-hero-shell module1-process-visual module1-interaction-visual">
            <div className="module1-process-diagram-frame">
              <BiologyDiagram
                isMobile={isMobile}
                mode="interactive"
                weightedInputs={activeInputs}
                totalInput={activeTotalInput}
                threshold={activeThreshold}
                didFire={activeNeuronFires}
                currentPhase={currentPhase}
                replaySignal={replaySignal}
                onPhaseChange={setCurrentPhase}
              />
            </div>
          </div>

          <LiveExplanationPanel
            currentPhase={currentPhase}
            neuronBFires={activeNeuronFires}
            neuronFires={activeNeuronFires}
            summary={explanation}
            threshold={activeThreshold}
            totalInput={activeTotalInput}
          />
        </div>

        <div className="module1-interaction-stack">
          <NeuronExperimentPanel
            contributions={weightedInputs}
            currentPhase={currentPhase}
            didFire={activeNeuronFires}
            onReplay={handleReplay}
            onResetLesson={handleReset}
            onRun={() => {
              if (freeResult !== null) {
                setFreePrediction(null)
                setFreeResult(null)
              }
              handleFreeRun()
            }}
            pathLabels={selectedScenario?.dendriteLabelS ?? ['Path 1', 'Path 2', 'Path 3', 'Path 4']}
            selectedScenario={selectedScenario}
            setSignalLevels={setSignalLevels}
            setSynapseStrengths={setSynapseStrengths}
            setThreshold={setDraftThreshold}
            signalLevels={signalLevels}
            synapseStrengths={synapseStrengths}
            threshold={draftThreshold}
            totalInput={totalInput}
          />
        </div>
      </div>

      {/* Discovery callout */}
      <AnimatePresence>
        {showDiscovery && (
          <motion.div
            className="module1-discovery-callout"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="module1-discovery-title">Did you notice?</p>
            <p className="module1-discovery-text">
              The neuron doesn't care <em>where</em> the signal comes from — only the <em>total</em> matters.
              A temperature signal of 5 and a sound signal of 5 look identical to the soma.
            </p>
            <p className="module1-discovery-tease">
              That's a problem. Module 2 shows how the brain solves it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default InteractionSection
