import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { PROCESS_PHASES } from '../module1Config'
import './leakyBucket.css'

const BUCKET_TOP = 40
const BUCKET_BOTTOM = 190
const MAX_FILL_HEIGHT = BUCKET_BOTTOM - BUCKET_TOP - 4
const BUCKET_LEFT = 50
const BUCKET_RIGHT = 150
const BUCKET_BOTTOM_LEFT = 60
const BUCKET_BOTTOM_RIGHT = 140

// Trapezoid bucket path: wider at top, narrower at bottom
const BUCKET_PATH = `M ${BUCKET_LEFT} ${BUCKET_TOP} L ${BUCKET_RIGHT} ${BUCKET_TOP} L ${BUCKET_BOTTOM_RIGHT} ${BUCKET_BOTTOM} L ${BUCKET_BOTTOM_LEFT} ${BUCKET_BOTTOM} Z`

// Threshold y position (70% up the bucket = fires at threshold)
const THRESHOLD_Y = BUCKET_BOTTOM - MAX_FILL_HEIGHT * 0.85

const DRIP_Y_START = 20
const DRIP_Y_END = BUCKET_TOP + 6
const DRIP_XS = [80, 100, 120]

export default function LeakyBucket({ totalInput, threshold, didFire, currentPhase }) {
  const fillRef = useRef(null)
  const overflowRef = useRef(null)
  const dripsRef = useRef([])
  const dripTlRef = useRef(null)

  // Animate fill level when totalInput or threshold changes
  useEffect(() => {
    if (!fillRef.current) return
    const ratio = Math.min(totalInput / Math.max(threshold, 1), 1.1)
    const fillHeight = Math.max(0, Math.min(ratio * MAX_FILL_HEIGHT, MAX_FILL_HEIGHT + 8))
    const targetY = BUCKET_BOTTOM - fillHeight
    gsap.to(fillRef.current, {
      attr: { y: targetY, height: fillHeight },
      duration: 0.45,
      ease: 'power2.out',
    })
  }, [totalInput, threshold])

  // Overflow flash when firing
  useEffect(() => {
    if (!overflowRef.current) return
    if (didFire) {
      gsap.fromTo(
        overflowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: 'center bottom' },
      )
    } else {
      gsap.to(overflowRef.current, { opacity: 0, duration: 0.2 })
    }
  }, [didFire])

  // Drip animation on receive phase
  useEffect(() => {
    if (currentPhase !== PROCESS_PHASES.RECEIVE) return
    if (dripTlRef.current) dripTlRef.current.kill()

    const tl = gsap.timeline()
    dripTlRef.current = tl

    dripsRef.current.forEach((el, i) => {
      if (!el) return
      gsap.set(el, { cy: DRIP_Y_START, opacity: 1 })
      tl.to(el, { cy: DRIP_Y_END, opacity: 0, duration: 0.4, ease: 'power1.in' }, i * 0.12)
    })
  }, [currentPhase])

  const ratio = Math.min(totalInput / Math.max(threshold, 1), 1.1)
  const initialFillHeight = Math.max(0, Math.min(ratio * MAX_FILL_HEIGHT, MAX_FILL_HEIGHT + 8))
  const initialY = BUCKET_BOTTOM - initialFillHeight

  return (
    <div className="leaky-bucket">
      <svg
        className="leaky-bucket__svg"
        viewBox="0 0 200 220"
        aria-label={`Leaky bucket: ${Math.round(ratio * 100)}% full${didFire ? ', overflowing' : ''}`}
        role="img"
      >
        <defs>
          <linearGradient id="lbFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <clipPath id="lbBucketClip">
            <path d={BUCKET_PATH} />
          </clipPath>
        </defs>

        {/* Drip circles above bucket */}
        {DRIP_XS.map((x, i) => (
          <circle
            key={i}
            ref={(el) => { dripsRef.current[i] = el }}
            cx={x}
            cy={DRIP_Y_START}
            r={4}
            fill="#67e8f9"
            opacity={0}
          />
        ))}

        {/* Water fill (clipped to bucket shape) */}
        <rect
          ref={fillRef}
          x={BUCKET_LEFT}
          y={initialY}
          width={BUCKET_RIGHT - BUCKET_LEFT}
          height={initialFillHeight}
          fill="url(#lbFillGrad)"
          opacity={0.85}
          clipPath="url(#lbBucketClip)"
        />

        {/* Bucket outline */}
        <path
          d={BUCKET_PATH}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Threshold dashed line */}
        <line
          x1={BUCKET_LEFT - 6}
          y1={THRESHOLD_Y}
          x2={BUCKET_RIGHT + 6}
          y2={THRESHOLD_Y}
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text
          x={BUCKET_RIGHT + 10}
          y={THRESHOLD_Y + 4}
          fontSize={9}
          fill="#f59e0b"
          fontWeight="600"
        >
          threshold
        </text>

        {/* Overflow splash (only when fired) */}
        <g ref={overflowRef} opacity={0}>
          {/* Splash arcs */}
          <path
            d={`M ${BUCKET_LEFT + 10} ${BUCKET_TOP} Q ${(BUCKET_LEFT + BUCKET_RIGHT) / 2 - 20} ${BUCKET_TOP - 22} ${(BUCKET_LEFT + BUCKET_RIGHT) / 2} ${BUCKET_TOP - 28}`}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d={`M ${BUCKET_RIGHT - 10} ${BUCKET_TOP} Q ${(BUCKET_LEFT + BUCKET_RIGHT) / 2 + 20} ${BUCKET_TOP - 22} ${(BUCKET_LEFT + BUCKET_RIGHT) / 2} ${BUCKET_TOP - 28}`}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={(BUCKET_LEFT + BUCKET_RIGHT) / 2 - 14} cy={BUCKET_TOP - 16} r={3} fill="#67e8f9" />
          <circle cx={(BUCKET_LEFT + BUCKET_RIGHT) / 2 + 14} cy={BUCKET_TOP - 16} r={3} fill="#67e8f9" />
          <circle cx={(BUCKET_LEFT + BUCKET_RIGHT) / 2} cy={BUCKET_TOP - 32} r={4} fill="#2563eb" opacity={0.8} />
          <text
            x={(BUCKET_LEFT + BUCKET_RIGHT) / 2}
            y={BUCKET_TOP - 38}
            textAnchor="middle"
            fontSize={10}
            fontWeight="700"
            fill="#16a34a"
          >
            FIRED!
          </text>
        </g>

        {/* Label at bottom */}
        <text
          x={(BUCKET_LEFT + BUCKET_RIGHT) / 2}
          y={BUCKET_BOTTOM + 16}
          textAnchor="middle"
          fontSize={9}
          fill="#94a3b8"
          fontWeight="500"
        >
          soma charge
        </text>
      </svg>
    </div>
  )
}
