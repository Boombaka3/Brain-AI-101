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
  TERMINAL: 'terminal',
  BOUTONS: 'boutons',
  COMPLETE: 'complete',
}

export const PROCESS_PHASE_LABELS = Object.freeze({
  [PROCESS_PHASES.IDLE]: 'Ready',
  [PROCESS_PHASES.RECEIVE]: 'Signals arrive',
  [PROCESS_PHASES.INTEGRATE]: 'Soma builds',
  [PROCESS_PHASES.COMPARE]: 'Threshold check',
  [PROCESS_PHASES.FIRE]: 'Axon fires',
  [PROCESS_PHASES.TERMINAL]: 'Terminal branches',
  [PROCESS_PHASES.BOUTONS]: 'Signal passed on',
  [PROCESS_PHASES.COMPLETE]: 'Complete',
})

export const PROCESS_AUTOPLAY_THRESHOLD = 0.3

export const PROCESS_PHASE_TIMINGS = Object.freeze({
  [PROCESS_PHASES.RECEIVE]: 520,
  [PROCESS_PHASES.INTEGRATE]: 460,
  [PROCESS_PHASES.COMPARE]: 320,
  [PROCESS_PHASES.FIRE]: 520,
  [PROCESS_PHASES.TERMINAL]: 260,
  [PROCESS_PHASES.BOUTONS]: 260,
})

export function getProcessPhasePlan(willFire) {
  return willFire
    ? [
        PROCESS_PHASES.RECEIVE,
        PROCESS_PHASES.INTEGRATE,
        PROCESS_PHASES.COMPARE,
        PROCESS_PHASES.FIRE,
        PROCESS_PHASES.TERMINAL,
        PROCESS_PHASES.BOUTONS,
      ]
    : [PROCESS_PHASES.RECEIVE, PROCESS_PHASES.INTEGRATE, PROCESS_PHASES.COMPARE]
}

export function getProcessPhaseLabel(phase) {
  return PROCESS_PHASE_LABELS[phase] ?? 'Ready'
}

export function getProcessPhaseSummary(phase, context) {
  const { totalInput, threshold, neuronFires, weightedInputs } = context

  switch (phase) {
    case PROCESS_PHASES.RECEIVE: {
      const strongestInputIndex = weightedInputs.reduce(
        (best, current, index) => (current > best.value ? { value: current, index } : best),
        { value: -Infinity, index: 0 },
      ).index
      return {
        title: 'Signals move in through the dendrites',
        body: `Each active input travels inward toward the soma. In this run, input ${strongestInputIndex + 1} contributes the most.`,
      }
    }
    case PROCESS_PHASES.INTEGRATE:
      return {
        title: 'The soma builds the combined signal',
        body: `The neuron adds the incoming signals together. Here, the soma builds to a total of ${totalInput}.`,
      }
    case PROCESS_PHASES.COMPARE:
      return {
        title: 'The neuron checks threshold',
        body: `The soma compares ${totalInput} with the threshold of ${threshold}.`,
      }
    case PROCESS_PHASES.FIRE:
      return {
        title: 'The axon carries the response forward',
        body: `Because ${totalInput} reaches threshold, the neuron sends a signal down the axon.`,
      }
    case PROCESS_PHASES.TERMINAL:
      return {
        title: 'The terminal branches activate',
        body: 'The signal reaches the end of the neuron and spreads through the terminal branches.',
      }
    case PROCESS_PHASES.BOUTONS:
      return {
        title: 'The signal is passed on',
        body: 'The boutons briefly activate to show how the signal can be passed to the next connection.',
      }
    case PROCESS_PHASES.COMPLETE:
      return neuronFires
        ? {
            title: 'This run ends with a signal being passed on',
            body: 'The neuron reached threshold, fired, and carried the response to its terminal end.',
          }
        : {
            title: 'This run stops before firing',
            body: `The total stayed below threshold, so the signal built in the soma but did not continue down the axon.`,
          }
    case PROCESS_PHASES.IDLE:
    default:
      return {
        title: 'Set up a run',
        body: 'Adjust the inputs, then press Run to watch how the biological neuron responds.',
      }
  }
}
