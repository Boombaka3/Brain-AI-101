import { useId, useMemo } from 'react'
import { area, curveBasis, curveCatmullRom, curveCatmullRomClosed, line } from 'd3-shape'

const VIEWBOX_WIDTH = 900
const VIEWBOX_HEIGHT = 440

const somaNodes = [
  [398, 220],
  [410, 196],
  [428, 176],
  [448, 160],
  [474, 148],
  [506, 144],
  [540, 148],
  [570, 159],
  [595, 170],
  [620, 167],
  [642, 148],
  [653, 120],
  [652, 93],
  [662, 70],
  [673, 89],
  [672, 122],
  [688, 145],
  [724, 145],
  [760, 122],
  [738, 151],
  [706, 176],
  [748, 180],
  [780, 187],
  [747, 190],
  [707, 186],
  [680, 194],
  [649, 225],
  [647, 252],
  [662, 279],
  [694, 295],
  [724, 318],
  [702, 316],
  [671, 304],
  [647, 297],
  [630, 305],
  [635, 332],
  [624, 357],
  [606, 329],
  [579, 301],
  [548, 292],
  [515, 291],
  [485, 294],
  [457, 291],
  [432, 280],
  [414, 262],
  [403, 243],
]

const axonCoreNodes = [
  [110, 221],
  [152, 220],
  [204, 220],
  [263, 221],
  [320, 220],
  [364, 216],
  [392, 215],
  [410, 217],
  [423, 223],
]

const axonTerminalBranches = [
  [
    [110, 221],
    [89, 197],
    [73, 180],
    [58, 169],
  ],
  [
    [110, 221],
    [82, 207],
    [61, 201],
    [39, 196],
  ],
  [
    [110, 221],
    [82, 220],
    [58, 222],
    [37, 226],
  ],
  [
    [110, 221],
    [86, 239],
    [64, 252],
    [45, 264],
  ],
  [
    [110, 221],
    [95, 246],
    [82, 268],
    [68, 286],
  ],
]

const dendritePrimaryBranches = [
  [
    [596, 170],
    [618, 151],
    [630, 128],
    [632, 102],
  ],
  [
    [600, 171],
    [628, 169],
    [653, 160],
    [691, 146],
  ],
  [
    [704, 176],
    [726, 157],
    [748, 138],
    [770, 122],
  ],
  [
    [705, 184],
    [728, 181],
    [750, 180],
    [780, 183],
  ],
  [
    [676, 304],
    [702, 310],
    [724, 321],
    [744, 336],
  ],
  [
    [629, 305],
    [642, 320],
    [651, 338],
    [659, 358],
  ],
  [
    [606, 333],
    [611, 351],
    [616, 370],
    [622, 390],
  ],
]

const dendriteSecondaryBranches = [
  [
    [632, 102],
    [619, 80],
    [607, 63],
    [599, 46],
  ],
  [
    [632, 102],
    [633, 78],
    [639, 58],
    [649, 34],
  ],
  [
    [691, 146],
    [710, 131],
    [728, 113],
    [744, 98],
  ],
  [
    [691, 146],
    [715, 144],
    [735, 144],
    [754, 149],
  ],
  [
    [744, 336],
    [768, 337],
    [790, 335],
    [812, 328],
  ],
  [
    [744, 336],
    [759, 350],
    [766, 367],
    [769, 384],
  ],
  [
    [659, 358],
    [674, 370],
    [690, 380],
    [707, 390],
  ],
  [
    [622, 390],
    [620, 403],
    [618, 416],
    [614, 428],
  ],
]

const signalGuideSeries = {
  top: [
    [840, 122],
    [815, 122],
    [790, 125],
    [758, 129],
    [720, 134],
    [678, 139],
    [628, 145],
  ],
  mid: [
    [840, 214],
    [815, 221],
    [790, 226],
    [760, 225],
    [724, 215],
    [682, 197],
    [636, 173],
  ],
  low: [
    [840, 306],
    [814, 305],
    [788, 302],
    [758, 294],
    [722, 281],
    [680, 264],
    [635, 236],
  ],
}

const signalLaneConfig = {
  top: { count: 8, leadRadius: 7, tailRadius: 2.25, duration: '2.05s', delay: '0s' },
  mid: { count: 8, leadRadius: 7, tailRadius: 2.25, duration: '2.2s', delay: '0.18s' },
  low: { count: 8, leadRadius: 7, tailRadius: 2.25, duration: '2.35s', delay: '0.36s' },
}

const thresholdNodes = [
  [476, 162],
  [487, 183],
  [492, 206],
  [492, 230],
  [487, 252],
  [479, 270],
]

const somaFillEnvelope = {
  left: [
    [494, 284],
    [489, 266],
    [487, 246],
    [487, 224],
    [488, 203],
    [491, 183],
    [495, 166],
  ],
  right: [
    [560, 284],
    [571, 270],
    [579, 252],
    [584, 230],
    [584, 205],
    [579, 182],
    [568, 162],
  ],
}

const excitatoryMarkers = [
  [700, 147],
  [688, 186],
  [687, 247],
]

const inhibitoryMarkers = [
  [720, 176],
  [708, 296],
]

const terminalCaps = [
  [58, 169],
  [39, 196],
  [37, 226],
  [45, 264],
  [68, 286],
]

function mirrorPoints(points, width = VIEWBOX_WIDTH) {
  return points.map((point) => {
    const [x, y, ...rest] = point
    return [width - x, y, ...rest]
  })
}

function samplePolylineDots(points, count, leadRadius, tailRadius) {
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

export default function CleanNeuronSvg({
  level = 2,
  fillPercent = 52,
  thresholdPercent = 54,
  isFiring = false,
  mirrored = false,
  showInputSignals = true,
  showThreshold = true,
  showLabels = true,
  className = '',
}) {
  const uid = useId().replace(/:/g, '-')
  const somaClipId = `clean-neuron-soma-clip-${uid}`
  const bodyGradientId = `clean-neuron-body-gradient-${uid}`
  const fillGradientId = `clean-neuron-fill-gradient-${uid}`
  const signalGlowId = `clean-neuron-signal-glow-${uid}`
  const fireGlowId = `clean-neuron-fire-glow-${uid}`
  const thresholdActive = fillPercent >= thresholdPercent

  const lineOpen = useMemo(
    () =>
      line()
        .curve(curveCatmullRom.alpha(0.6))
        .x(([x]) => x)
        .y(([, y]) => y),
    [],
  )

  const lineClosed = useMemo(
    () =>
      line()
        .curve(curveCatmullRomClosed.alpha(0.55))
        .x(([x]) => x)
        .y(([, y]) => y),
    [],
  )

  const lineSoft = useMemo(
    () =>
      line()
        .curve(curveBasis)
        .x(([x]) => x)
        .y(([, y]) => y),
    [],
  )

  const fillArea = useMemo(
    () =>
      area()
        .curve(curveBasis)
        .x0((d) => d.x0)
        .x1((d) => d.x1)
        .y((d) => d.y),
    [],
  )

  const geometry = useMemo(() => {
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
  }, [lineClosed, lineOpen, lineSoft, mirrored])

  const fillPath = useMemo(() => {
    const clamped = Math.max(0, Math.min(100, fillPercent))
    const cutoffY = 286 - 1.32 * clamped
    const leftVisible = somaFillEnvelope.left
      .filter(([, y]) => y >= cutoffY)
      .sort((a, b) => a[1] - b[1])
    const rightVisible = somaFillEnvelope.right
      .filter(([, y]) => y >= cutoffY)
      .sort((a, b) => a[1] - b[1])

    if (leftVisible.length < 2 || rightVisible.length < 2) return ''

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
  }, [fillArea, fillPercent, mirrored])

  return (
    <svg
      className={['clean-neuron-svg', className].filter(Boolean).join(' ')}
      width="100%"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`clean-neuron-title-${uid} clean-neuron-desc-${uid}`}
    >
      <title id={`clean-neuron-title-${uid}`}>Procedural neuron diagram</title>
      <desc id={`clean-neuron-desc-${uid}`}>
        A clean educational neuron generated from node data with D3 shape utilities.
      </desc>

      <defs>
        <linearGradient id={bodyGradientId} x1="90" y1="210" x2="820" y2="210" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5f9ff" />
          <stop offset="100%" stopColor="#eef4fb" />
        </linearGradient>
        <linearGradient id={fillGradientId} x1="500" y1="142" x2="500" y2="286" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cbe9c6" />
          <stop offset="100%" stopColor="#b6deaf" />
        </linearGradient>
        <clipPath id={somaClipId}>
          <path d={geometry.somaPath} />
        </clipPath>
        <filter id={signalGlowId} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={fireGlowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
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
      `}</style>

      <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} rx="28" fill="#ffffff" />

      <g id="mirror-root">
        <g id="level-basic-core">
          <g id="incoming-signals-core">
            {['top', 'mid', 'low'].map((key, index) => (
              <path
                key={`guide-${key}`}
                id={`signal-path-${key}`}
                d={geometry.signalGuides[key]}
                fill="none"
                stroke="rgba(39, 137, 244, 0.12)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={showInputSignals ? 1 : 0}
              />
            ))}

            {['top', 'mid', 'low'].map((key) => {
              const lane = signalLaneConfig[key]
              const dots = geometry.signalDots[key]
              const source = dots[0]
              const animatedDot = dots[dots.length - 1]

              return (
                <g key={`dots-${key}`} id={`signal-path-${key}-dots`}>
                  {dots.slice(1, -1).map(([x, y, r], dotIndex) => (
                    <circle
                      key={`${key}-${x}-${y}`}
                      className="clean-neuron-svg__signal-tail"
                      cx={x}
                      cy={y}
                      r={r}
                      opacity={showInputSignals ? 0.78 - dotIndex * 0.08 : 0}
                    />
                  ))}

                  <circle cx={animatedDot[0]} cy={animatedDot[1]} r={animatedDot[2]} className="clean-neuron-svg__signal-dot" opacity={showInputSignals ? 1 : 0}>
                    <animateMotion
                      begin={lane.delay}
                      dur={lane.duration}
                      repeatCount="indefinite"
                      path={geometry.signalGuides[key]}
                    />
                    <animate attributeName="opacity" values="0.15;1;1;0" keyTimes="0;0.18;0.84;1" dur={lane.duration} begin={lane.delay} repeatCount="indefinite" />
                  </circle>

                  <circle cx={source[0]} cy={source[1]} r={source[2]} fill="#2789f4" filter={`url(#${signalGlowId})`} opacity={showInputSignals ? 1 : 0} />
                </g>
              )
            })}
          </g>

          <g id="stimulus-source" opacity={showInputSignals ? 1 : 0} />

          <g id="neuron-core">
            <g id="axon-core">
              <path id="axon-shaft" d={geometry.axonPath} className="clean-neuron-svg__outline" strokeWidth="9.5" />
            </g>

            <g id="axon-pulse-group">
              <path
                id="axon-pulse"
                d={geometry.axonPath}
                className="clean-neuron-svg__outline clean-neuron-svg__axon-pulse"
                stroke="var(--neuron-fire)"
                strokeWidth="5.2"
                strokeDasharray="34 230"
                strokeDashoffset="260"
                filter={`url(#${fireGlowId})`}
              />
            </g>

            <g id="axon-terminals">
              {geometry.terminals.map((d, index) => (
                <path
                  key={`terminal-${index}`}
                  d={d}
                  className="clean-neuron-svg__outline"
                  strokeWidth="5.2"
                />
              ))}
              {geometry.terminalCaps.map(([x, y]) => (
                <circle key={`cap-${x}-${y}`} cx={x} cy={y} r="7" fill="#ffffff" stroke="#5c79a2" strokeWidth="3.2" />
              ))}
            </g>

            <g id="dendrites-core">
              {geometry.primaryDendrites.map((d, index) => (
                <path
                  key={`primary-dendrite-${index}`}
                  d={d}
                  className="clean-neuron-svg__outline"
                  strokeWidth="5.2"
                />
              ))}
            </g>

            <g id="soma-core">
              <path
                id="soma-outline"
                d={geometry.somaPath}
                fill={`url(#${bodyGradientId})`}
                stroke="#5c79a2"
                strokeWidth="4.8"
                strokeLinejoin="round"
              />
              <g id="soma-fill-group" clipPath={`url(#${somaClipId})`}>
                {fillPath ? (
                  <path
                    id="soma-fill"
                    className="clean-neuron-svg__soma-fill"
                    d={fillPath}
                    fill={`url(#${fillGradientId})`}
                    opacity="0.95"
                  />
                ) : null}
              </g>
              <path
                id="threshold-curve"
                d={geometry.thresholdPath}
                fill="none"
                stroke="var(--neuron-threshold)"
                strokeWidth="4.2"
                strokeLinecap="round"
                opacity={showThreshold ? (thresholdActive ? 1 : 0.88) : 0}
              />
              <circle id="soma-nucleus" cx={mirrored ? 396 : 504} cy="222" r="5.5" fill="#ffffff" opacity="0.72" />
              <path
                d={geometry.somaPath}
                className="clean-neuron-svg__soma-flash"
                fill="none"
                stroke="rgba(93, 166, 255, 0.9)"
                strokeWidth="6"
                filter={`url(#${fireGlowId})`}
              />
            </g>
          </g>
        </g>

        {level >= 2 && (
          <g id="level-structure" opacity={showLabels ? 1 : 0}>
            <g id="dendrites-secondary">
              {geometry.secondaryDendrites.map((d, index) => (
                <path
                  key={`secondary-dendrite-${index}`}
                  d={d}
                  className="clean-neuron-svg__outline"
                  strokeWidth="4.2"
                />
              ))}
            </g>
            <g id="structure-labels">
              <text className="clean-neuron-svg__label" x={mirrored ? 748 : 92} y="144">
                axon
              </text>
              <text className="clean-neuron-svg__label" x={mirrored ? 342 : 468} y="120">
                soma
              </text>
              <text className="clean-neuron-svg__label" x={mirrored ? 110 : 704} y="92">
                dendrites
              </text>
            </g>
          </g>
        )}

        {level >= 3 && (
          <g id="level-advanced-mechanism" opacity={showLabels ? 1 : 0}>
            <g id="excitatory-inputs-group">
              {geometry.excitatory.map(([x, y]) => (
                <circle key={`ex-${x}-${y}`} cx={x} cy={y} r="4.1" fill="#2789f4" />
              ))}
            </g>
            <g id="inhibitory-inputs-group">
              {geometry.inhibitory.map(([x, y]) => (
                <circle key={`inh-${x}-${y}`} cx={x} cy={y} r="4.1" fill="#9d8cff" />
              ))}
            </g>
            <g id="axon-myelin-group" opacity="0" />
            <g id="nodes-of-ranvier-group" opacity="0" />
            <g id="synapse-hint-group" opacity="0" />
            {showLabels && (
              <g id="advanced-labels">
                <text className="clean-neuron-svg__label" x={mirrored ? 305 : 516} y="146">
                  threshold
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  )
}
