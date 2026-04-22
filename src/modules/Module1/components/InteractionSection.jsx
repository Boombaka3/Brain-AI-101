import { useMemo, useState } from 'react'
import BiologyDiagram from '../../../components/diagrams/BiologyDiagram'
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

const roundValue = (value) => Number(value.toFixed(1))
const getWeightedInputs = (signals, strengths) =>
  signals.map((signal, index) => roundValue(signal * strengths[index]))

function InteractionSection({ isMobile = false }) {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0])
  const [signalLevels, setSignalLevels] = useState(SCENARIOS[0].signalLevels)
  const [synapseStrengths, setSynapseStrengths] = useState(SCENARIOS[0].synapseStrengths)
  const [draftThreshold, setDraftThreshold] = useState(SCENARIOS[0].threshold)

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

  const handleScenarioSelect = (scenario) => {
    setSelectedScenario(scenario)
    setSignalLevels(scenario.signalLevels)
    setSynapseStrengths(scenario.synapseStrengths)
    setDraftThreshold(scenario.threshold)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal(0)
  }

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
    const resetScenario = selectedScenario ?? SCENARIOS[0]
    const defaultInputs = getWeightedInputs(resetScenario.signalLevels, resetScenario.synapseStrengths)

    setSignalLevels(resetScenario.signalLevels)
    setSynapseStrengths(resetScenario.synapseStrengths)
    setDraftThreshold(resetScenario.threshold)
    setActiveInputs(defaultInputs)
    setActiveThreshold(resetScenario.threshold)
    setActiveNeuronAFires(false)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal(0)
  }

  return (
    <section className="module1-section module1-interaction-section">
      <div className="module1-section-heading">
        <p className="module1-eyebrow">C. Interaction</p>
        <h2>Pick a scenario and watch the neuron respond</h2>
        <p>
          Choose a real biological event — each one pre-loads the correct neuron inputs. Then run the simulation to see how the signal travels and what action results.
        </p>
      </div>

      <ScenarioPicker selectedId={selectedScenario?.id} onSelect={handleScenarioSelect} />

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
            currentPhase={currentPhase}
            didFire={activeNeuronAFires}
            onReplay={startRun}
            onResetLesson={handleReset}
            onRun={startRun}
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
    </section>
  )
}

export default InteractionSection
