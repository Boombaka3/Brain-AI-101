import { useId, useMemo } from 'react'
import { area, curveBasis, curveCatmullRom, curveCatmullRomClosed, line } from 'd3-shape'

const VIEWBOX_WIDTH = 900
const VIEWBOX_HEIGHT = 440

const somaNodes = [
  [447, 132],
  [507, 136],
  [567, 154],
  [620, 160],
  [652, 139],
  [670, 98],
  [663, 58],
  [678, 36],
  [688, 75],
  [687, 123],
  [717, 145],
  [770, 133],
  [818, 91],
  [781, 145],
  [744, 177],
  [806, 173],
  [779, 187],
  [737, 180],
  [786, 205],
  [786, 250],
  [766, 286],
  [806, 291],
  [790, 308],
  [752, 292],
  [706, 268],
  [733, 320],
  [713, 372],
  [675, 329],
  [632, 304],
  [605, 316],
  [621, 378],
  [589, 333],
  [540, 319],
  [489, 313],
  [442, 321],
  [389, 308],
  [340, 273],
  [302, 239],
  [250, 223],
  [183, 225],
  [126, 224],
  [84, 222],
  [71, 198],
  [46, 169],
  [25, 150],
  [75, 162],
  [97, 151],
  [84, 117],
  [52, 91],
  [87, 110],
  [100, 103],
  [95, 72],
  [116, 36],
  [114, 96],
  [132, 151],
  [168, 165],
  [232, 168],
  [302, 168],
  [362, 161],
  [407, 136],
]

const axonCoreNodes = [
  [83, 221],
  [146, 224],
  [215, 225],
  [292, 224],
  [366, 223],
  [425, 223],
  [455, 223],
]

const axonTerminalBranches = [
  [
    [83, 221],
    [72, 198],
    [56, 180],
    [40, 170],
  ],
  [
    [83, 221],
    [62, 210],
    [41, 204],
    [20, 201],
  ],
  [
    [83, 221],
    [59, 221],
    [39, 224],
    [21, 230],
  ],
  [
    [83, 221],
    [59, 237],
    [42, 250],
    [25, 263],
  ],
  [
    [83, 221],
    [70, 246],
    [57, 270],
    [45, 293],
  ],
]

const dendritePrimaryBranches = [
  [
    [620, 160],
    [642, 136],
    [654, 110],
    [655, 82],
  ],
  [
    [620, 160],
    [646, 163],
    [674, 156],
    [717, 145],
  ],
  [
    [744, 177],
    [763, 151],
    [791, 121],
    [818, 91],
  ],
  [
    [737, 180],
    [767, 177],
    [788, 177],
    [806, 173],
  ],
  [
    [706, 268],
    [732, 278],
    [762, 287],
    [790, 308],
  ],
  [
    [632, 304],
    [651, 324],
    [664, 349],
    [675, 329],
  ],
  [
    [605, 316],
    [612, 338],
    [618, 360],
    [621, 378],
  ],
]

const dendriteSecondaryBranches = [
  [
    [655, 82],
    [637, 61],
    [618, 49],
    [617, 35],
  ],
  [
    [655, 82],
    [656, 59],
    [660, 41],
    [670, 20],
  ],
  [
    [717, 145],
    [734, 125],
    [751, 109],
    [770, 92],
  ],
  [
    [717, 145],
    [740, 141],
    [759, 140],
    [781, 145],
  ],
  [
    [790, 308],
    [810, 311],
    [828, 309],
    [848, 304],
  ],
  [
    [790, 308],
    [805, 326],
    [808, 344],
    [806, 359],
  ],
  [
    [675, 329],
    [687, 345],
    [698, 358],
    [713, 372],
  ],
  [
    [621, 378],
    [617, 392],
    [613, 406],
    [611, 420],
  ],
]

const signalGuideSeries = {
  top: [
    [848, 125],
    [820, 120],
    [792, 121],
    [764, 126],
    [736, 130],
    [707, 130],
    [679, 128],
  ],
  mid: [
    [848, 214],
    [821, 221],
    [793, 225],
    [765, 224],
    [736, 219],
    [706, 211],
    [678, 203],
  ],
  low: [
    [848, 304],
    [818, 309],
    [789, 305],
    [760, 292],
    [733, 278],
    [707, 270],
    [682, 266],
  ],
}

const signalTrailDots = {
  top: [
    [848, 125, 6.5],
    [827, 132, 3.2],
    [812, 136, 2.8],
    [798, 138, 2.4],
    [784, 139, 2.2],
    [770, 139, 2.15],
    [756, 138, 2.35],
    [742, 136, 5.8],
  ],
  mid: [
    [848, 214, 6.5],
    [832, 219, 3.2],
    [817, 222, 2.8],
    [802, 223, 2.4],
    [788, 221, 2.2],
    [774, 217, 2.15],
    [760, 211, 2.35],
    [744, 204, 5.8],
  ],
  low: [
    [848, 304, 6.5],
    [832, 304, 3.2],
    [817, 304, 2.8],
    [802, 301, 2.4],
    [788, 297, 2.2],
    [774, 292, 2.15],
    [760, 286, 2.35],
    [744, 281, 5.8],
  ],
}

const thresholdNodes = [
  [474, 150],
  [488, 174],
  [498, 198],
  [500, 224],
  [496, 251],
  [486, 274],
  [476, 290],
]

const somaFillEnvelope = {
  left: [
    [470, 284],
    [465, 266],
    [466, 245],
    [468, 223],
    [468, 202],
    [467, 180],
    [466, 158],
    [470, 140],
  ],
  right: [
    [532, 286],
    [547, 271],
    [561, 248],
    [573, 220],
    [580, 191],
    [579, 165],
    [568, 146],
    [546, 138],
  ],
}

const excitatoryMarkers = [
  [709, 136],
  [707, 203],
  [710, 266],
]

const inhibitoryMarkers = [
  [686, 162],
  [686, 289],
]

const terminalCaps = [
  [40, 170],
  [20, 201],
  [21, 230],
  [25, 263],
  [45, 293],
]

function mirrorPoints(points, width = VIEWBOX_WIDTH) {
  return points.map((point) => {
    const [x, y, ...rest] = point
    return [width - x, y, ...rest]
  })
}

function buildSignalAnimation(index) {
  const animations = [
    { name: 'signalMoveTop', duration: '2.05s', delay: '0s' },
    { name: 'signalMoveMid', duration: '2.22s', delay: '0.18s' },
    { name: 'signalMoveLow', duration: '2.4s', delay: '0.36s' },
  ]

  return animations[index]
}

export default function CleanNeuronSvg({
  level = 2,
  fillPercent = 52,
  isFiring = false,
  mirrored = false,
  showLabels = true,
  className = '',
}) {
  const uid = useId().replace(/:/g, '-')
  const somaClipId = `clean-neuron-soma-clip-${uid}`
  const bodyGradientId = `clean-neuron-body-gradient-${uid}`
  const fillGradientId = `clean-neuron-fill-gradient-${uid}`
  const signalGlowId = `clean-neuron-signal-glow-${uid}`
  const fireGlowId = `clean-neuron-fire-glow-${uid}`

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
        Object.entries(signalTrailDots).map(([key, dots]) => [key, mapPoints(dots)]),
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

        @keyframes signalMoveTop {
          0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.2; }
          18% { opacity: 1; }
          100% { transform: translate(-145px, 8px) scale(0.92); opacity: 0; }
        }

        @keyframes signalMoveMid {
          0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.2; }
          18% { opacity: 1; }
          100% { transform: translate(-150px, -8px) scale(0.92); opacity: 0; }
        }

        @keyframes signalMoveLow {
          0% { transform: translate(0px, 0px) scale(0.8); opacity: 0.2; }
          18% { opacity: 1; }
          100% { transform: translate(-152px, -22px) scale(0.92); opacity: 0; }
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
              />
            ))}

            {['top', 'mid', 'low'].map((key, index) => {
              const motion = buildSignalAnimation(index)
              return (
                <g key={`dots-${key}`} id={`signal-path-${key}-dots`}>
                  {geometry.signalDots[key].map(([x, y, r], dotIndex) => (
                    <circle
                      key={`${key}-${x}-${y}`}
                      id={dotIndex === geometry.signalDots[key].length - 1 ? `signal-dot-${key}` : undefined}
                      className={dotIndex === geometry.signalDots[key].length - 1 ? 'clean-neuron-svg__signal-dot' : ''}
                      cx={x}
                      cy={y}
                      r={r}
                      fill="#2789f4"
                      opacity={dotIndex === geometry.signalDots[key].length - 1 ? 1 : 0.85 - dotIndex * 0.08}
                      style={
                        dotIndex === geometry.signalDots[key].length - 1
                          ? {
                              animation: `${motion.name} ${motion.duration} ease-in-out ${motion.delay} infinite`,
                            }
                          : undefined
                      }
                    />
                  ))}
                </g>
              )
            })}
          </g>

          <g id="stimulus-source">
            {['top', 'mid', 'low'].map((key) => {
              const lead = geometry.signalDots[key][0]
              return (
                <circle
                  key={`source-${key}`}
                  cx={lead[0]}
                  cy={lead[1]}
                  r={lead[2]}
                  fill="#2789f4"
                  filter={`url(#${signalGlowId})`}
                />
              )
            })}
          </g>

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
