const JOURNEY_THRESHOLD_LEVEL = 0.72
const JOURNEY_LEAK_PER_SECOND = 0.065
const JOURNEY_FLOW_TRAVEL_MS = 1350

function formatJourneyLabel(label) {
  return (label ?? '').trim() || 'signal'
}

export function getJourneySceneVariant(scenarioId) {
  switch (scenarioId) {
    case 'hot-surface':
      return 'touch'
    case 'hearing-name':
      return 'hearing'
    case 'camera-flash':
      return 'vision'
    default:
      return 'generic'
  }
}

export function getJourneyThresholdLevel() {
  return JOURNEY_THRESHOLD_LEVEL
}

export function getJourneyLeakStep() {
  return JOURNEY_LEAK_PER_SECOND * 0.08
}

export function getJourneyTravelMs() {
  return JOURNEY_FLOW_TRAVEL_MS
}

export function buildJourneyPackets(pathLabels, contributions, threshold) {
  const safeThreshold = Math.max(threshold, 1)
  const scaleFactor = JOURNEY_THRESHOLD_LEVEL / safeThreshold

  return pathLabels.map((label, index) => {
    const amount = Math.max(0, contributions[index] ?? 0) * scaleFactor

    return {
      id: `${label}-${index}`,
      label: formatJourneyLabel(label),
      type: amount >= 0.19 ? 'primary' : 'secondary',
      amount,
      lane: index % 3,
      delay: index * 260,
      duration: JOURNEY_FLOW_TRAVEL_MS,
    }
  })
}

export function getJourneyOutcomeCopy(outcome, fires) {
  switch (outcome) {
    case 'running':
      return 'The selected inputs are traveling inward while the soma slowly leaks charge.'
    case 'fired':
      return 'The summed signal crossed threshold, so the neuron released an output pulse.'
    case 'leaked':
      return fires
        ? 'The neuron fired, then the charge drained back down after the pulse.'
        : 'The total never reached threshold, so the signal faded before the neuron could fire.'
    default:
      return 'Press Run to watch the inputs arrive, combine, and test threshold.'
  }
}
