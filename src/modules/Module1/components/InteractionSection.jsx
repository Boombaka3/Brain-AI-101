import { useMemo, useState } from 'react'
import BiologyDiagram from '../../../components/diagrams/BiologyDiagram'
import { calculateTotal, neuronFires } from '../../../utils/neuronLogic'
import {
  DEFAULT_SIGNAL_LEVELS,
  DEFAULT_SYNAPSE_STRENGTHS,
  DEFAULT_THRESHOLD,
  PROCESS_PHASES,
  getProcessPhaseSummary,
} from '../module1Config'
import LiveExplanationPanel from './LiveExplanationPanel'
import NeuronExperimentPanel from './NeuronExperimentPanel'

const roundValue = (value) => Number(value.toFixed(1))
const getWeightedInputs = (signals, strengths) =>
  signals.map((signal, index) => roundValue(signal * strengths[index]))

function InteractionSection({ isMobile = false }) {
  const [signalLevels, setSignalLevels] = useState(DEFAULT_SIGNAL_LEVELS)
  const [synapseStrengths, setSynapseStrengths] = useState(DEFAULT_SYNAPSE_STRENGTHS)
  const [draftThreshold, setDraftThreshold] = useState(DEFAULT_THRESHOLD)

  const [activeInputs, setActiveInputs] = useState(
    getWeightedInputs(DEFAULT_SIGNAL_LEVELS, DEFAULT_SYNAPSE_STRENGTHS),
  )
  const [activeThreshold, setActiveThreshold] = useState(DEFAULT_THRESHOLD)
  const [currentPhase, setCurrentPhase] = useState(PROCESS_PHASES.IDLE)
  const [replaySignal, setReplaySignal] = useState(0)
  const [activeNeuronAFires, setActiveNeuronAFires] = useState(false)

  const weightedInputs = useMemo(
    () => getWeightedInputs(signalLevels, synapseStrengths),
    [signalLevels, synapseStrengths],
  )
  const totalInput = useMemo(() => roundValue(calculateTotal(weightedInputs)), [weightedInputs])

  const activeTotalInput = useMemo(() => roundValue(calculateTotal(activeInputs)), [activeInputs])

  const explanation = getProcessPhaseSummary(currentPhase, {
    totalInput: activeTotalInput,
    threshold: activeThreshold,
    neuronFires: activeNeuronAFires,
    weightedInputs: activeInputs,
  })

  const startRun = () => {
    const nextInputs = getWeightedInputs(signalLevels, synapseStrengths)
    const nextTotal = roundValue(calculateTotal(nextInputs))
    const nextFires = neuronFires(nextTotal, draftThreshold)

    setActiveInputs(nextInputs)
    setActiveThreshold(draftThreshold)
    setActiveNeuronAFires(nextFires)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal((token) => token + 1)
  }

  const handleReset = () => {
    const defaultInputs = getWeightedInputs(DEFAULT_SIGNAL_LEVELS, DEFAULT_SYNAPSE_STRENGTHS)

    setSignalLevels(DEFAULT_SIGNAL_LEVELS)
    setSynapseStrengths(DEFAULT_SYNAPSE_STRENGTHS)
    setDraftThreshold(DEFAULT_THRESHOLD)
    setActiveInputs(defaultInputs)
    setActiveThreshold(DEFAULT_THRESHOLD)
    setActiveNeuronAFires(false)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal(0)
  }

  return (
    <section className="module1-section module1-interaction-section">
      <div className="module1-section-heading">
        <p className="module1-eyebrow">C. Interaction</p>
        <h2>Build a signal and watch the neuron respond</h2>
        <p>
          Tune each input pathway, set the firing threshold, and run the neuron to see whether the signal moves forward.
        </p>
      </div>

      <div className="module1-two-column module1-interaction-layout">
        <div className="module1-interaction-visual-column">
          <div className="module1-interaction-hero-copy">
            <p className="module1-eyebrow module1-eyebrow-tight">Live neuron model</p>
            <h3 className="module1-panel-title module1-panel-title-xl">See where the signal builds, pauses, or fires</h3>
            <p className="module1-card-muted module1-text-reset">
              The diagram highlights each active dendrite, fills the soma as inputs combine, and shows whether the axon carries the response onward.
            </p>
          </div>

          <div className="module1-hero-shell module1-process-visual module1-interaction-visual">
            <div className="module1-process-diagram-frame">
              <BiologyDiagram
                isMobile={isMobile}
                mode="interactive"
                weightedInputs={activeInputs}
                totalInput={activeTotalInput}
                threshold={activeThreshold}
                didFire={activeNeuronAFires}
                currentPhase={currentPhase}
                replaySignal={replaySignal}
                onPhaseChange={setCurrentPhase}
              />
            </div>
          </div>

          <LiveExplanationPanel
            currentPhase={currentPhase}
            neuronBFires={activeNeuronAFires}
            neuronFires={activeNeuronAFires}
            summary={explanation}
            threshold={activeThreshold}
            totalInput={activeTotalInput}
          />
        </div>

        <div className="module1-interaction-stack">
          <NeuronExperimentPanel
            contributions={weightedInputs}
            onReplay={startRun}
            onResetLesson={handleReset}
            onRun={startRun}
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
    </section>
  )
}

export default InteractionSection
