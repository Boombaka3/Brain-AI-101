export const SCENARIOS = [
  {
    id: 'hot-surface',
    label: 'Hot Surface',
    emoji: '🔥',
    neuronType: 'Aδ nociceptor',
    reactionTime: '20–50 ms',
    description: 'Pain receptors in your skin detect extreme heat instantly.',
    dendriteLabelS: ['Temp receptor', 'Pain signal', 'Skin pressure', 'Touch signal'],
    signalLevels: [5, 4, 1, 0],
    synapseStrengths: [2.0, 1.5, 0.5, 0.5],
    threshold: 8,
    downstreamAction: 'Your hand pulled away in ~35ms — before you felt pain consciously.',
  },
  {
    id: 'camera-flash',
    label: 'Camera Flash',
    emoji: '📸',
    neuronType: 'Retinal ganglion cell',
    reactionTime: '150–300 ms',
    description: 'Photoreceptors spike hard when sudden bright light hits the retina.',
    dendriteLabelS: ['Light intensity', 'Contrast change', 'Motion detect', 'Pupil reflex'],
    signalLevels: [5, 3, 2, 1],
    synapseStrengths: [1.5, 1.0, 0.5, 0.5],
    threshold: 7,
    downstreamAction: 'Your pupil constricted and you blinked within ~200ms.',
  },
  {
    id: 'hearing-name',
    label: 'Hearing Your Name',
    emoji: '👂',
    neuronType: 'Auditory cortex neuron',
    reactionTime: '100–200 ms',
    description: 'Your brain filters ambient noise to snap attention to familiar patterns.',
    dendriteLabelS: ['Sound freq match', 'Pattern memory', 'Attention gate', 'Volume level'],
    signalLevels: [4, 3, 3, 2],
    synapseStrengths: [1.5, 1.0, 1.0, 0.5],
    threshold: 9,
    downstreamAction: 'Head turned involuntarily within ~150ms.',
  },
  {
    id: 'tasting-sour',
    label: 'Tasting Sour',
    emoji: '🍋',
    neuronType: 'Type III taste cell',
    reactionTime: '100–250 ms',
    description: 'Acid triggers ion channels that rapidly depolarize gustatory neurons.',
    dendriteLabelS: ['Acid H+ ions', 'Sour receptor', 'Saliva mix', 'Context signal'],
    signalLevels: [5, 3, 1, 1],
    synapseStrengths: [2.0, 1.0, 0.5, 0.5],
    threshold: 8,
    downstreamAction: 'Face muscles contracted and saliva increased within ~200ms.',
  },
  {
    id: 'knee-jerk',
    label: 'Knee-Jerk Reflex',
    emoji: '🦵',
    neuronType: 'Ia afferent / α-motor neuron',
    reactionTime: '18–30 ms',
    description: 'The fastest reflex — a monosynaptic loop that bypasses the brain entirely.',
    dendriteLabelS: ['Stretch receptor', 'Muscle spindle', 'Spinal gate', 'Inhibit signal'],
    signalLevels: [5, 4, 2, 0],
    synapseStrengths: [2.0, 1.5, 1.0, 0.0],
    threshold: 7,
    downstreamAction: 'Leg kicked forward in ~25ms — entirely in the spinal cord, no brain involved.',
  },
  {
    id: 'catching-ball',
    label: 'Catching a Ball',
    emoji: '⚾',
    neuronType: 'Cerebellar Purkinje cell',
    reactionTime: '200–400 ms',
    description: 'Visual prediction circuits fire rapidly to guide arm movement.',
    dendriteLabelS: ['Ball trajectory', 'Speed estimate', 'Arm position', 'Hand grip prep'],
    signalLevels: [4, 3, 2, 2],
    synapseStrengths: [1.5, 1.0, 0.5, 0.5],
    threshold: 8,
    downstreamAction: 'Arm extended and fingers curled at ~300ms — just in time.',
  },
]

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
