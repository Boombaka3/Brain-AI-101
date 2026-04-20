import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import '../module3.css'

// Pre-computed loss curve (20 steps, smooth descent)
const LOSS_POINTS = [
  0.92, 0.81, 0.73, 0.64, 0.58, 0.51, 0.46, 0.42, 0.38, 0.35,
  0.32, 0.30, 0.28, 0.26, 0.25, 0.24, 0.23, 0.22, 0.215, 0.21,
]

const W = 300
const H = 100
const PAD = { l: 36, r: 12, t: 12, b: 28 }
const PW = W - PAD.l - PAD.r
const PH = H - PAD.t - PAD.b

function lossToY(v) {
  return PAD.t + (1 - v) * PH
}

function stepToX(s) {
  return PAD.l + (s / (LOSS_POINTS.length - 1)) * PW
}

export default function LossChart({ trainingStep, mismatch }) {
  const dotRef = useRef()
  const glowRef = useRef()

  const clampedStep = Math.min(trainingStep, LOSS_POINTS.length - 1)
  const targetX = stepToX(clampedStep)
  const targetY = lossToY(LOSS_POINTS[clampedStep])

  useEffect(() => {
    if (!dotRef.current) return
    gsap.to(dotRef.current, {
      attr: { cx: targetX, cy: targetY },
      duration: 0.45,
      ease: 'power2.out',
    })
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        attr: { cx: targetX, cy: targetY },
        duration: 0.45,
        ease: 'power2.out',
      })
    }
  }, [targetX, targetY])

  const pathD = LOSS_POINTS.map((v, i) => {
    const x = stepToX(i)
    const y = lossToY(v)
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')

  const areaD = pathD + ` L ${stepToX(LOSS_POINTS.length - 1).toFixed(1)} ${(PAD.t + PH).toFixed(1)} L ${PAD.l} ${(PAD.t + PH).toFixed(1)} Z`

  const dotColor = mismatch ? '#F59E0B' : clampedStep === 0 ? '#94a3b8' : '#10B981'

  return (
    <div className="module3-loss-chart-wrap">
      <p className="module3-loss-chart-label">Training loss</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="lossAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path d={areaD} fill="url(#lossAreaGrad)" />

        {/* Curve */}
        <path d={pathD} stroke="#2563eb" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Axis labels */}
        <text x={PAD.l} y={H - 6} fontSize="8" fill="#94a3b8" textAnchor="middle">0</text>
        <text x={W - PAD.r} y={H - 6} fontSize="8" fill="#94a3b8" textAnchor="end">Steps</text>
        <text x={PAD.l - 4} y={PAD.t + 4} fontSize="8" fill="#94a3b8" textAnchor="end">High</text>
        <text x={PAD.l - 4} y={PAD.t + PH} fontSize="8" fill="#10b981" textAnchor="end">Low</text>

        {/* Glow halo */}
        <circle
          ref={glowRef}
          cx={targetX}
          cy={targetY}
          r={8}
          fill={dotColor}
          opacity={0.2}
        />

        {/* Dot tracking current step */}
        <circle
          ref={dotRef}
          cx={targetX}
          cy={targetY}
          r={4.5}
          fill={dotColor}
          stroke="#fff"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  )
}
