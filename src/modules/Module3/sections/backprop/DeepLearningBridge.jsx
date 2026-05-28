import { useMemo } from 'react'
import '../../module3.css'

const SVG_W = 560
const SVG_H = 204
const NODE_R = 14
const SPACING = 38
const COLORS = ['#2D7EFF', '#7C3AED', '#22D3EE', '#10B981']
const LAYER_DEFS = [
  { label: 'Input Features', nodes: 3, x: 82 },
  { label: 'Feature Layer', nodes: 4, x: 228 },
  { label: 'Pattern Layer', nodes: 4, x: 356 },
  { label: 'Prediction', nodes: 2, x: 484 },
]

function nodeY(count, index) {
  return SVG_H / 2 + (index - (count - 1) / 2) * SPACING
}

function DeepLearningBridge() {
  const paths = useMemo(() => (
    LAYER_DEFS.slice(0, -1).flatMap((layerA, layerIndex) => (
      Array.from({ length: layerA.nodes }, (_, sourceIndex) => (
        Array.from({ length: LAYER_DEFS[layerIndex + 1].nodes }, (_, targetIndex) => {
          const x1 = layerA.x
          const y1 = nodeY(layerA.nodes, sourceIndex)
          const x2 = LAYER_DEFS[layerIndex + 1].x
          const y2 = nodeY(LAYER_DEFS[layerIndex + 1].nodes, targetIndex)
          const midX = (x1 + x2) / 2

          return {
            id: `dlb-${layerIndex}-${sourceIndex}-${targetIndex}`,
            color: COLORS[layerIndex],
            d: `M ${x1} ${y1} C ${midX - 18} ${y1}, ${midX + 18} ${y2}, ${x2} ${y2}`,
          }
        })
      )).flat()
    ))
  ), [])

  return (
    <div className="module3-bridge-wrap">
      <div className="module3-bridge-head">
        <p className="shared-eyebrow">Bridge</p>
        <h3>How layers build understanding</h3>
        <p className="module3-bridge-copy">
          Early layers detect simple features. Later layers combine them into patterns, and the final layer produces a prediction.
        </p>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="module3-bridge-svg"
      >
        <defs>
          <filter id="m3BridgeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="module3-bridge-links">
          {paths.map((path) => (
            <g key={path.id}>
              <path className="module3-bridge-edge" d={path.d} stroke={path.color} />
              <path className="module3-bridge-edge module3-bridge-edge--flow" d={path.d} stroke={path.color} />
            </g>
          ))}
        </g>

        <g filter="url(#m3BridgeGlow)">
          {paths.filter((_, index) => index % 6 === 0).map((path, index) => (
            <g key={path.id}>
              <path id={`bridge-path-${path.id}`} d={path.d} fill="none" stroke="none" />
              <circle className="module3-bridge-signal" r="5" fill={path.color}>
                <animateMotion dur={`${1.6 + (index % 2) * 0.2}s`} begin={`${index * 0.18}s`} repeatCount="indefinite">
                  <mpath href={`#bridge-path-${path.id}`} />
                </animateMotion>
              </circle>
            </g>
          ))}
        </g>

        {LAYER_DEFS.map((layer, layerIndex) => (
          Array.from({ length: layer.nodes }, (_, nodeIndex) => {
            const cx = layer.x
            const cy = nodeY(layer.nodes, nodeIndex)

            return (
              <g key={`n-${layerIndex}-${nodeIndex}`} className="module3-bridge-node">
                <circle cx={cx} cy={cy} r={NODE_R} fill={COLORS[layerIndex]} opacity={0.14} />
                <circle cx={cx} cy={cy} r={NODE_R - 3} fill={COLORS[layerIndex]} opacity={0.92} />
              </g>
            )
          })
        ))}

        {LAYER_DEFS.map((layer) => (
          <text
            key={layer.label}
            x={layer.x}
            y={SVG_H - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#64748b"
            fontWeight="700"
          >
            {layer.label}
          </text>
        ))}
      </svg>

      <div className="module3-bridge-note">
        A neural network is built from layers of connected units. Information moves forward to make a prediction, and feedback moves backward to improve the connections.
      </div>
    </div>
  )
}

export default DeepLearningBridge
