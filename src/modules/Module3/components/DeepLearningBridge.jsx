import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import '../module3.css'

const STAGES = [
  { label: 'Single Neuron', desc: 'One node: inputs → weighted sum → threshold → output.' },
  { label: 'One Layer', desc: 'Multiple neurons in parallel — each learns a different feature from the same inputs.' },
  { label: 'Deep Network', desc: 'Stack layers: early layers detect edges, later layers combine them into concepts.' },
]

// SVG layout constants
const SVG_W = 560
const SVG_H = 180
const LAYER_DEFS = [
  { nodes: 3, x: 80 },
  { nodes: 4, x: 240 },
  { nodes: 4, x: 360 },
  { nodes: 2, x: 480 },
]
const COLORS = ['#2D7EFF', '#7C3AED', '#22D3EE', '#10B981']
const NODE_R = 14
const SPACING = 38

function nodeY(count, index) {
  return SVG_H / 2 + (index - (count - 1) / 2) * SPACING
}

export default function DeepLearningBridge() {
  const [stage, setStage] = useState(0)
  const pulseRef = useRef(null)
  const tlRef = useRef(null)

  // Which layers are shown at each stage
  const visibleLayerCount = stage === 0 ? 2 : stage === 1 ? 3 : 4

  const runPulse = () => {
    if (tlRef.current) tlRef.current.kill()
    const tl = gsap.timeline()
    tlRef.current = tl

    document.querySelectorAll('.dlb-edge').forEach((el, i) => {
      tl.fromTo(el, { opacity: 0.15 }, { opacity: 0.9, duration: 0.18, yoyo: true, repeat: 1 }, i * 0.04)
    })
    document.querySelectorAll('.dlb-node').forEach((el, i) => {
      tl.fromTo(el, { scale: 1 }, { scale: 1.15, duration: 0.14, yoyo: true, repeat: 1, transformOrigin: 'center' }, i * 0.06)
    })
  }

  useEffect(() => {
    runPulse()
  }, [stage])

  const layers = LAYER_DEFS.slice(0, visibleLayerCount)

  return (
    <div className="module3-bridge-wrap">
      <p className="shared-eyebrow" style={{ marginBottom: 12 }}>How depth emerges</p>

      <div className="module3-bridge-steps">
        {STAGES.map((s, i) => (
          <button
            key={s.label}
            className={`shared-btn shared-btn-sm ${stage === i ? 'shared-btn-primary' : 'shared-btn-ghost'}`}
            onClick={() => setStage(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <svg
        ref={pulseRef}
        width="100%"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ display: 'block', margin: '0 auto', maxWidth: SVG_W }}
      >
        {/* Edges */}
        {layers.slice(0, -1).map((layerA, li) =>
          layerA.nodes > 0
            ? Array.from({ length: layerA.nodes }, (_, ai) =>
                Array.from({ length: layers[li + 1].nodes }, (_, bi) => (
                  <line
                    key={`e-${li}-${ai}-${bi}`}
                    className="dlb-edge"
                    x1={layerA.x}
                    y1={nodeY(layerA.nodes, ai)}
                    x2={layers[li + 1].x}
                    y2={nodeY(layers[li + 1].nodes, bi)}
                    stroke={COLORS[li]}
                    strokeWidth={1.2}
                    opacity={0.25}
                  />
                ))
              ).flat()
            : null
        )}

        {/* Nodes */}
        {layers.map((layer, li) =>
          Array.from({ length: layer.nodes }, (_, ni) => {
            const cx = layer.x
            const cy = nodeY(layer.nodes, ni)
            return (
              <g key={`n-${li}-${ni}`} className="dlb-node" style={{ transformOrigin: `${cx}px ${cy}px` }}>
                <circle cx={cx} cy={cy} r={NODE_R} fill={COLORS[li]} opacity={0.15} />
                <circle cx={cx} cy={cy} r={NODE_R - 3} fill={COLORS[li]} opacity={0.9} />
              </g>
            )
          })
        )}

        {/* Layer labels */}
        {layers.map((layer, li) => (
          <text
            key={`lbl-${li}`}
            x={layer.x}
            y={SVG_H - 6}
            textAnchor="middle"
            fontSize={9}
            fill="#94a3b8"
            fontWeight="600"
          >
            {li === 0 ? 'Input' : li === layers.length - 1 ? 'Output' : `Hidden ${li}`}
          </text>
        ))}
      </svg>

      <p style={{
        textAlign: 'center', fontSize: 14, color: '#475569', margin: '14px 0 0',
        fontWeight: 500, lineHeight: 1.55,
      }}>
        {STAGES[stage].desc}
      </p>

      <div style={{
        marginTop: 14, background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1e40af',
        fontWeight: 500, textAlign: 'center',
      }}>
        This is what a neural network IS — stacked neurons, each trained by the same feedback you saw above.
      </div>
    </div>
  )
}
