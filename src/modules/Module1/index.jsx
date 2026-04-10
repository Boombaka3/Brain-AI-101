import { useEffect, useMemo, useRef, useState } from 'react'
import BiologyDiagram from '../../components/diagrams/BiologyDiagram'
import AnnDiagram from '../../components/diagrams/AnnDiagram'
import { calculateTotal, getDownstreamInput, neuronFires } from '../../utils/neuronLogic'
import BridgeToAnn from './components/BridgeToAnn'
import LiveExplanationPanel from './components/LiveExplanationPanel'
import Module1Intro from './components/Module1Intro'
import NeuronExperimentPanel from './components/NeuronExperimentPanel'
import NeuronProcessDemo from './components/NeuronProcessDemo'
import {
  DEFAULT_SIGNAL_LEVELS,
  DEFAULT_SYNAPSE_STRENGTHS,
  DEFAULT_THRESHOLD,
  DOWNSTREAM_THRESHOLD,
  PROCESS_AUTOPLAY_THRESHOLD,
  getProcessPhasePlan,
  getProcessPhaseSummary,
  PROCESS_PHASE_TIMINGS,
  PROCESS_PHASES,
  PROCESS_STEPS,
} from './module1Config'
import './module1.css'

const roundValue = (value) => Number(value.toFixed(1))

function Module1({ onContinue }) {
  const [signalLevels, setSignalLevels] = useState(DEFAULT_SIGNAL_LEVELS)
  const [synapseStrengths, setSynapseStrengths] = useState(DEFAULT_SYNAPSE_STRENGTHS)
  const [draftThreshold, setDraftThreshold] = useState(DEFAULT_THRESHOLD)

  const [activeInputs, setActiveInputs] = useState(
    DEFAULT_SIGNAL_LEVELS.map((signal, index) => roundValue(signal * DEFAULT_SYNAPSE_STRENGTHS[index])),
  )
  const [activeThreshold, setActiveThreshold] = useState(DEFAULT_THRESHOLD)
  const [currentPhase, setCurrentPhase] = useState(PROCESS_PHASES.IDLE)
  const [replaySignal, setReplaySignal] = useState(0)
  const [runCount, setRunCount] = useState(0)
  const [interactionLocked, setInteractionLocked] = useState(false)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 900 : false)

  const processRef = useRef(null)
  const bridgeRef = useRef(null)
  const timersRef = useRef([])
  const runTokenRef = useRef(0)
  const autoPlayStartedRef = useRef(false)

  const weightedInputs = useMemo(
    () => signalLevels.map((signal, index) => roundValue(signal * synapseStrengths[index])),
    [signalLevels, synapseStrengths],
  )
  const totalInput = useMemo(() => roundValue(calculateTotal(weightedInputs)), [weightedInputs])
  const neuronAFires = neuronFires(totalInput, draftThreshold)

  const activeTotalInput = useMemo(() => roundValue(calculateTotal(activeInputs)), [activeInputs])
  const activeNeuronAFires = neuronFires(activeTotalInput, activeThreshold)
  const activeNeuronBInput = getDownstreamInput(activeNeuronAFires, 1)
  const activeNeuronBFires = neuronFires(activeNeuronBInput, DOWNSTREAM_THRESHOLD)

  const explanation = getProcessPhaseSummary(currentPhase, {
    totalInput: activeTotalInput,
    threshold: activeThreshold,
    neuronFires: activeNeuronAFires,
    weightedInputs: activeInputs,
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => () => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
  }, [])

  const schedulePhase = (phase, delay, runToken) => {
    const timer = setTimeout(() => {
      if (runTokenRef.current !== runToken) return
      setCurrentPhase(phase)
    }, delay)
    timersRef.current.push(timer)
  }

  const clearSequenceTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current = []
  }

  const runSequence = (runToken, willFire) => {
    clearSequenceTimers()

    const phasePlan = getProcessPhasePlan(willFire)

    let elapsed = PROCESS_PHASE_TIMINGS[PROCESS_PHASES.IDLE]
    setCurrentPhase(PROCESS_PHASES.IDLE)

    phasePlan.forEach((phase) => {
      schedulePhase(phase, elapsed, runToken)
      elapsed += PROCESS_PHASE_TIMINGS[phase]
    })

    schedulePhase(PROCESS_PHASES.COMPLETE, elapsed, runToken)
  }

  const startProcessRun = () => {
    const nextRunToken = runTokenRef.current + 1
    runTokenRef.current = nextRunToken

    clearSequenceTimers()
    setActiveInputs(weightedInputs)
    setActiveThreshold(draftThreshold)
    setReplaySignal(nextRunToken)
    setRunCount((count) => count + 1)
    setCurrentPhase(PROCESS_PHASES.IDLE)

    const willFire = neuronFires(totalInput, draftThreshold)
    runSequence(nextRunToken, willFire)
  }

  const handleResetLesson = () => {
    clearSequenceTimers()
    runTokenRef.current += 1
    setSignalLevels(DEFAULT_SIGNAL_LEVELS)
    setSynapseStrengths(DEFAULT_SYNAPSE_STRENGTHS)
    setDraftThreshold(DEFAULT_THRESHOLD)
    setActiveInputs(DEFAULT_SIGNAL_LEVELS.map((signal, index) => roundValue(signal * DEFAULT_SYNAPSE_STRENGTHS[index])))
    setActiveThreshold(DEFAULT_THRESHOLD)
    setCurrentPhase(PROCESS_PHASES.IDLE)
    setReplaySignal(runTokenRef.current)
  }

  const scrollToRef = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleStartLesson = () => {
    scrollToRef(processRef)
  }

  const handleReplay = () => {
    scrollToRef(processRef)
    startProcessRun()
  }

  const handleRun = () => {
    startProcessRun()
  }

  useEffect(() => {
    const processNode = processRef.current
    if (!processNode || autoPlayStartedRef.current) return undefined
    if (typeof window === 'undefined') {
      return undefined
    }

    if (typeof window.IntersectionObserver !== 'function') {
      autoPlayStartedRef.current = true
      const timer = window.setTimeout(() => startProcessRun(), 0)
      return () => window.clearTimeout(timer)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || autoPlayStartedRef.current) return
        autoPlayStartedRef.current = true
        startProcessRun()
      },
      { threshold: PROCESS_AUTOPLAY_THRESHOLD },
    )

    observer.observe(processNode)
    return () => observer.disconnect()
  }, [weightedInputs, draftThreshold, totalInput])

  const heroDiagram = (
    <BiologyDiagram
      inputs={activeInputs}
      neuronATotalInput={activeTotalInput}
      neuronAThreshold={activeThreshold}
      neuronAFires={activeNeuronAFires}
      neuronBInput={activeNeuronBInput}
      neuronBThreshold={DOWNSTREAM_THRESHOLD}
      neuronBFires={activeNeuronBFires}
      showExtendedCircuit={false}
      isMobile={isMobile}
      isSimpleMode={false}
      currentPhase={currentPhase}
      didFire={activeNeuronAFires}
      replaySignal={replaySignal}
      onInteractionLockChange={setInteractionLocked}
    />
  )

  return (
    <div className="module1-page">
      <header className="module1-header">
        <div>
          <p className="module1-kicker">Brain-AI-101</p>
          <h1 className="module1-title">Module 1: Biological Neuron Experience</h1>
        </div>
        <button className="module1-primary-button" onClick={() => scrollToRef(bridgeRef)}>
          Skip to Bridge
        </button>
      </header>

      <main className="module1-main">
        <Module1Intro onStart={handleStartLesson} />

        <section ref={processRef} className="module1-anchor-section">
          <NeuronProcessDemo
            currentPhase={currentPhase}
            diagram={heroDiagram}
            onReplay={handleReplay}
            processSteps={PROCESS_STEPS}
            runCount={runCount}
            summary={explanation}
          />
        </section>

        <section className="module1-section">
          <div className="module1-section-heading">
            <p className="module1-eyebrow">C. Interaction</p>
            <h2>Adjust the neuron, then replay the process</h2>
            <p>
              Change the signal level on each dendrite, change the synaptic strength, then decide whether the neuron
              will stay quiet or fire.
            </p>
          </div>

          <div className="module1-two-column">
            <NeuronExperimentPanel
              contributions={weightedInputs}
              interactionLocked={interactionLocked}
              onReplay={handleReplay}
              onResetLesson={handleResetLesson}
              onRun={handleRun}
              setSignalLevels={setSignalLevels}
              setSynapseStrengths={setSynapseStrengths}
              setThreshold={setDraftThreshold}
              signalLevels={signalLevels}
              synapseStrengths={synapseStrengths}
              threshold={draftThreshold}
              totalInput={totalInput}
            />

            <LiveExplanationPanel
              currentPhase={currentPhase}
              neuronBFires={activeNeuronBFires}
              neuronFires={activeNeuronAFires}
              summary={explanation}
              threshold={activeThreshold}
              totalInput={activeTotalInput}
            />
          </div>
        </section>

        <section ref={bridgeRef} className="module1-anchor-section">
          <BridgeToAnn
            activeNeuronAFires={activeNeuronAFires}
            activeTotalInput={activeTotalInput}
            activeThreshold={activeThreshold}
            biologyDiagram={
              <BiologyDiagram
                inputs={activeInputs}
                neuronATotalInput={activeTotalInput}
                neuronAThreshold={activeThreshold}
                neuronAFires={activeNeuronAFires}
                neuronBInput={activeNeuronBInput}
                neuronBThreshold={DOWNSTREAM_THRESHOLD}
                neuronBFires={activeNeuronBFires}
                showExtendedCircuit={false}
                isMobile={isMobile}
                isSimpleMode={false}
                replaySignal={replaySignal}
              />
            }
            annDiagram={
              <AnnDiagram
                inputs={activeInputs}
                neuronATotalInput={activeTotalInput}
                neuronAThreshold={activeThreshold}
                neuronAFires={activeNeuronAFires}
                neuronBInput={activeNeuronBInput}
                neuronBThreshold={DOWNSTREAM_THRESHOLD}
                neuronBFires={activeNeuronBFires}
                showExtendedCircuit={false}
                isMobile={isMobile}
                isSimpleMode={false}
                replaySignal={replaySignal}
              />
            }
            onContinue={onContinue}
          />
        </section>
      </main>
    </div>
  )
}

export default Module1
