import { useId, useMemo } from 'react'
import { area, curveBasis, curveCatmullRom, curveCatmullRomClosed, line } from 'd3-shape'
import { VIEWBOX_HEIGHT, VIEWBOX_WIDTH, signalLaneConfig, signalLaneKeys } from './neuronShapeData'
import { buildNeuronGeometry, buildSomaFillPath, getNeuronSvgStyles } from './neuronSvgHelpers'

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

  const geometry = useMemo(
    () => buildNeuronGeometry({ lineClosed, lineOpen, lineSoft, mirrored }),
    [lineClosed, lineOpen, lineSoft, mirrored],
  )

  const fillPath = useMemo(
    () => buildSomaFillPath({ fillArea, fillPercent, mirrored }),
    [fillArea, fillPercent, mirrored],
  )

  const svgStyles = useMemo(
    () => getNeuronSvgStyles({ signalGlowId, fireGlowId, isFiring }),
    [fireGlowId, isFiring, signalGlowId],
  )

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

      <style>{svgStyles}</style>

      <rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} rx="28" fill="#ffffff" />

      <g id="mirror-root">
        <g id="level-basic-core">
          <g id="incoming-signals-core">
            {signalLaneKeys.map((key) => (
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

            {signalLaneKeys.map((key) => {
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

                  <circle
                    cx={animatedDot[0]}
                    cy={animatedDot[1]}
                    r={animatedDot[2]}
                    className="clean-neuron-svg__signal-dot"
                    opacity={showInputSignals ? 1 : 0}
                  >
                    <animateMotion
                      begin={lane.delay}
                      dur={lane.duration}
                      repeatCount="indefinite"
                      path={geometry.signalGuides[key]}
                    />
                    <animate
                      attributeName="opacity"
                      values="0.15;1;1;0"
                      keyTimes="0;0.18;0.84;1"
                      dur={lane.duration}
                      begin={lane.delay}
                      repeatCount="indefinite"
                    />
                  </circle>

                  <circle
                    cx={source[0]}
                    cy={source[1]}
                    r={source[2]}
                    fill="#2789f4"
                    filter={`url(#${signalGlowId})`}
                    opacity={showInputSignals ? 1 : 0}
                  />
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
                <path key={`terminal-${index}`} d={d} className="clean-neuron-svg__outline" strokeWidth="5.2" />
              ))}
              {geometry.terminalCaps.map(([x, y]) => (
                <circle key={`cap-${x}-${y}`} cx={x} cy={y} r="7" fill="#ffffff" stroke="#5c79a2" strokeWidth="3.2" />
              ))}
            </g>

            <g id="dendrites-core">
              {geometry.primaryDendrites.map((d, index) => (
                <path key={`primary-dendrite-${index}`} d={d} className="clean-neuron-svg__outline" strokeWidth="5.2" />
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
                <path key={`secondary-dendrite-${index}`} d={d} className="clean-neuron-svg__outline" strokeWidth="4.2" />
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
