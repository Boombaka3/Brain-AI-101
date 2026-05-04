import {
  VIEWBOX_WIDTH,
  axonCoreNodes,
  axonTerminalBranches,
  dendritePrimaryBranches,
  dendriteSecondaryBranches,
  excitatoryMarkers,
  inhibitoryMarkers,
  signalGuideSeries,
  signalLaneConfig,
  somaFillEnvelope,
  somaNodes,
  terminalCaps,
  thresholdNodes,
} from './neuronShapeData'

export function mirrorPoints(points, width = VIEWBOX_WIDTH) {
  return points.map((point) => {
    const [x, y, ...rest] = point
    return [width - x, y, ...rest]
  })
}

export function samplePolylineDots(points, count, leadRadius, tailRadius) {
  if (points.length < 2 || count < 2) {
    return points.map(([x, y]) => [x, y, leadRadius])
  }

  const segments = []
  let totalLength = 0

  for (let index = 1; index < points.length; index += 1) {
    const [x1, y1] = points[index - 1]
    const [x2, y2] = points[index]
    const length = Math.hypot(x2 - x1, y2 - y1)
    segments.push({ start: points[index - 1], end: points[index], length, offset: totalLength })
    totalLength += length
  }

  const startPad = totalLength * 0.02
  const endPad = totalLength * 0.3
  const usableLength = Math.max(totalLength - startPad - endPad, totalLength * 0.3)

  return Array.from({ length: count }, (_, dotIndex) => {
    const t = dotIndex / (count - 1)
    const distance = startPad + t * usableLength
    const segment =
      segments.find((candidate) => distance <= candidate.offset + candidate.length) ?? segments[segments.length - 1]
    const localDistance = Math.max(0, distance - segment.offset)
    const ratio = segment.length === 0 ? 0 : localDistance / segment.length
    const [x1, y1] = segment.start
    const [x2, y2] = segment.end
    const radius = leadRadius - t * (leadRadius - tailRadius)

    return [x1 + (x2 - x1) * ratio, y1 + (y2 - y1) * ratio, radius]
  })
}

export function buildNeuronGeometry({ lineClosed, lineOpen, lineSoft, mirrored }) {
  const mapPoints = (points) => (mirrored ? mirrorPoints(points) : points)

  return {
    somaPath: lineClosed(mapPoints(somaNodes)) ?? '',
    axonPath: lineOpen(mapPoints(axonCoreNodes)) ?? '',
    thresholdPath: lineSoft(mapPoints(thresholdNodes)) ?? '',
    primaryDendrites: dendritePrimaryBranches.map((branch) => lineOpen(mapPoints(branch)) ?? ''),
    secondaryDendrites: dendriteSecondaryBranches.map((branch) => lineOpen(mapPoints(branch)) ?? ''),
    terminals: axonTerminalBranches.map((branch) => lineOpen(mapPoints(branch)) ?? ''),
    signalGuides: Object.fromEntries(
      Object.entries(signalGuideSeries).map(([key, points]) => [key, lineSoft(mapPoints(points)) ?? '']),
    ),
    signalDots: Object.fromEntries(
      Object.entries(signalGuideSeries).map(([key, points]) => {
        const lane = signalLaneConfig[key]
        return [key, mapPoints(samplePolylineDots(points, lane.count, lane.leadRadius, lane.tailRadius))]
      }),
    ),
    excitatory: mapPoints(excitatoryMarkers),
    inhibitory: mapPoints(inhibitoryMarkers),
    terminalCaps: mapPoints(terminalCaps),
  }
}

export function buildSomaFillPath({ fillArea, fillPercent, mirrored }) {
  const clamped = Math.max(0, Math.min(100, fillPercent))
  const cutoffY = 286 - 1.32 * clamped
  const leftVisible = somaFillEnvelope.left
    .filter(([, y]) => y >= cutoffY)
    .sort((a, b) => a[1] - b[1])
  const rightVisible = somaFillEnvelope.right
    .filter(([, y]) => y >= cutoffY)
    .sort((a, b) => a[1] - b[1])

  if (leftVisible.length < 2 || rightVisible.length < 2) {
    return ''
  }

  const fillSeries = leftVisible.map(([leftX, y], index) => {
    const rightNode = rightVisible[index] ?? rightVisible[rightVisible.length - 1]
    const left = mirrored ? VIEWBOX_WIDTH - rightNode[0] : leftX
    const right = mirrored ? VIEWBOX_WIDTH - leftX : rightNode[0]

    return {
      y,
      x0: Math.min(left, right),
      x1: Math.max(left, right),
    }
  })

  return fillArea(fillSeries) ?? ''
}

export function getNeuronSvgStyles({ signalGlowId, fireGlowId, isFiring }) {
  return `
    .clean-neuron-svg {
      --neuron-stroke: #5c79a2;
      --neuron-stroke-soft: #8da3c3;
      --neuron-body: #eff5ff;
      --neuron-fill: #bfe4bb;
      --neuron-threshold: #f6a22a;
      --neuron-signal: #2789f4;
      --neuron-fire: #5da6ff;
      --neuron-label: #72839c;
    }

    .clean-neuron-svg__outline {
      fill: none;
      stroke: var(--neuron-stroke);
      stroke-linecap: round;
      stroke-linejoin: round;
      vector-effect: non-scaling-stroke;
    }

    .clean-neuron-svg__signal-dot {
      fill: var(--neuron-signal);
      filter: url(#${signalGlowId});
      transform-box: fill-box;
      transform-origin: center;
    }

    .clean-neuron-svg__signal-tail {
      fill: var(--neuron-signal);
    }

    .clean-neuron-svg__soma-fill {
      transition: d 420ms ease;
    }

    .clean-neuron-svg__axon-pulse {
      opacity: ${isFiring ? 1 : 0};
      transition: opacity 220ms ease;
      animation: ${isFiring ? 'cleanNeuronAxonPulse 0.95s ease-out forwards' : 'none'};
    }

    .clean-neuron-svg__soma-flash {
      opacity: ${isFiring ? 1 : 0};
      animation: ${isFiring ? 'cleanNeuronSomaFire 0.72s ease-out forwards' : 'none'};
    }

    .clean-neuron-svg__label {
      fill: var(--neuron-label);
      font-family: Inter, Arial, Helvetica, sans-serif;
      font-size: 13px;
    }

    @keyframes cleanNeuronAxonPulse {
      0% {
        stroke-dashoffset: 260;
        opacity: 0;
      }
      15% {
        opacity: 1;
      }
      86% {
        opacity: 1;
      }
      100% {
        stroke-dashoffset: 0;
        opacity: 0;
      }
    }

    @keyframes cleanNeuronSomaFire {
      0% {
        opacity: 0;
        transform: scale(0.985);
        transform-origin: 500px 220px;
      }
      28% {
        opacity: 0.85;
      }
      100% {
        opacity: 0;
        transform: scale(1.028);
        transform-origin: 500px 220px;
      }
    }
  `
}
