export const DEFAULT_SIGNAL_LEVELS = [3, 2, 2, 1]
export const DEFAULT_SYNAPSE_STRENGTHS = [1.5, 1, 0.5, 0.5]
export const DEFAULT_THRESHOLD = 6
export const DOWNSTREAM_THRESHOLD = 1

export const PROCESS_PHASES = {
  IDLE: 'idle',
  RECEIVE: 'receive',
  INTEGRATE: 'integrate',
  COMPARE: 'compare',
  FIRE: 'fire',
  PASS_ON: 'pass-on',
  COMPLETE: 'complete',
}

export const PROCESS_AUTOPLAY_THRESHOLD = 0.3

export const PROCESS_PHASE_TIMINGS = Object.freeze({
  [PROCESS_PHASES.IDLE]: 120,
  [PROCESS_PHASES.RECEIVE]: 900,
  [PROCESS_PHASES.INTEGRATE]: 1000,
  [PROCESS_PHASES.COMPARE]: 850,
  [PROCESS_PHASES.FIRE]: 700,
  [PROCESS_PHASES.PASS_ON]: 900,
  [PROCESS_PHASES.COMPLETE]: 0,
})

export const PROCESS_PHASE_METADATA = Object.freeze({
  [PROCESS_PHASES.IDLE]: {
    label: 'Idle',
    title: 'Preparing the next run',
    buildBody: () => 'The neuron resets to its resting state before the sequence begins again.',
  },
  [PROCESS_PHASES.RECEIVE]: {
    label: 'Receive',
    stepLabel: '1. Receive',
    detail: 'Signals arrive through the dendrites.',
    title: 'Signals arrive at the dendrites',
    buildBody: ({ weightedInputs }) => {
      const strongestInputIndex = weightedInputs.reduce(
        (best, current, index) => (current > best.value ? { value: current, index } : best),
        { value: -Infinity, index: 0 },
      ).index

      return `Each pathway carries input into the neuron. Right now, dendrite ${strongestInputIndex + 1} contributes the most.`
    },
  },
  [PROCESS_PHASES.INTEGRATE]: {
    label: 'Integrate',
    stepLabel: '2. Integrate',
    detail: 'The soma gathers the incoming signal.',
    title: 'The soma adds the incoming signals',
    buildBody: ({ totalInput }) => `Each weighted input contributes to one running total. In this run, the soma builds up to ${totalInput}.`,
  },
  [PROCESS_PHASES.COMPARE]: {
    label: 'Compare',
    stepLabel: '3. Compare',
    detail: 'The total is checked against threshold.',
    title: 'The soma checks the threshold',
    buildBody: ({ totalInput, threshold }) => `The neuron compares ${totalInput} against the firing threshold of ${threshold}.`,
  },
  [PROCESS_PHASES.FIRE]: {
    label: 'Fire',
    stepLabel: '4. Fire',
    detail: 'Crossing threshold launches an output spike.',
    title: 'Threshold crossed: the neuron fires',
    buildBody: ({ totalInput, threshold }) => `Because ${totalInput} is at or above ${threshold}, the neuron sends an output spike down the axon.`,
  },
  [PROCESS_PHASES.PASS_ON]: {
    label: 'Pass On',
    stepLabel: '5. Pass On',
    detail: 'The signal reaches the next neuron.',
    title: 'The signal reaches the next neuron',
    buildBody: () => 'A firing neuron can now influence what happens next in the circuit.',
  },
  [PROCESS_PHASES.COMPLETE]: {
    label: 'Complete',
    buildResult: ({ neuronFires, totalInput, threshold }) =>
      neuronFires
        ? {
            title: 'Process complete: signal passed on',
            body: 'This run reached threshold, fired, and sent a signal to the next neuron.',
          }
        : {
            title: 'Process complete: this neuron does not fire',
            body: `The total of ${totalInput} stays below the threshold of ${threshold}, so no output signal is sent on.`,
          },
  },
})

export const PROCESS_STEPS = Object.freeze(
  [
    PROCESS_PHASES.RECEIVE,
    PROCESS_PHASES.INTEGRATE,
    PROCESS_PHASES.COMPARE,
    PROCESS_PHASES.FIRE,
    PROCESS_PHASES.PASS_ON,
  ].map((phase) => ({
    id: phase,
    label: PROCESS_PHASE_METADATA[phase].stepLabel,
    detail: PROCESS_PHASE_METADATA[phase].detail,
  })),
)

export const PROCESS_SUCCESS_PHASE_ORDER = Object.freeze([
  PROCESS_PHASES.RECEIVE,
  PROCESS_PHASES.INTEGRATE,
  PROCESS_PHASES.COMPARE,
  PROCESS_PHASES.FIRE,
  PROCESS_PHASES.PASS_ON,
])

export const PROCESS_SILENT_PHASE_ORDER = Object.freeze([
  PROCESS_PHASES.RECEIVE,
  PROCESS_PHASES.INTEGRATE,
  PROCESS_PHASES.COMPARE,
])

export function getProcessPhaseLabel(phase) {
  return PROCESS_PHASE_METADATA[phase]?.label ?? phase
}

export function getProcessReplayLabel(runCount) {
  return runCount === 0 ? 'Play the Example' : 'Replay the Process'
}

export function getProcessPhasePlan(willFire) {
  return willFire ? PROCESS_SUCCESS_PHASE_ORDER : PROCESS_SILENT_PHASE_ORDER
}

export function getProcessPhaseSummary(phase, context) {
  const metadata = PROCESS_PHASE_METADATA[phase]

  if (!metadata) {
    return context.neuronFires
      ? {
          title: 'Ready to replay the process',
          body: 'Press replay to watch the same neuron decision again, or change the controls to explore a different outcome.',
        }
      : {
          title: 'Ready to test a new setup',
          body: 'Adjust the inputs, synaptic strengths, or threshold, then run the process to see whether the neuron stays silent or fires.',
        }
  }

  if (metadata.buildResult) {
    return metadata.buildResult(context)
  }

  return {
    title: metadata.title,
    body: metadata.buildBody(context),
  }
}

export const BRIDGE_MAPPINGS = [
  ['Dendrites', 'Inputs'],
  ['Synaptic strengths', 'Weights'],
  ['Soma', 'Summation'],
  ['Threshold', 'Activation condition'],
  ['Firing', 'Output'],
]
