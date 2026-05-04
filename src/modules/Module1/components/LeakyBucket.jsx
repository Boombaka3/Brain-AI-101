import { useEffect, useMemo, useRef } from 'react'
import gsap from 'gsap'
import { PROCESS_PHASES } from '../module1Config'
import {
  BUCKET_BOTTOM,
  BUCKET_LEFT,
  BUCKET_PATH,
  BUCKET_RIGHT,
  BUCKET_TOP,
  DRIP_XS,
  DRIP_Y_END,
  DRIP_Y_START,
  THRESHOLD_Y,
  getBucketFillMetrics,
} from './bucketMetrics'
import './leakyBucket.css'

function renderDrips(dripsRef) {
  return DRIP_XS.map((x, index) => (
    <circle
      key={x}
      ref={(element) => {
        dripsRef.current[index] = element
      }}
      cx={x}
      cy={DRIP_Y_START}
      r={4}
      fill="#67e8f9"
      opacity={0}
    />
  ))
}

export default function LeakyBucket({ totalInput, threshold, didFire, currentPhase }) {
  const fillRef = useRef(null)
  const overflowRef = useRef(null)
  const dripsRef = useRef([])
  const dripTlRef = useRef(null)

  const { ratio, fillHeight, targetY } = useMemo(
    () => getBucketFillMetrics(totalInput, threshold),
    [threshold, totalInput],
  )

  useEffect(() => {
    if (!fillRef.current) {
      return
    }

    gsap.to(fillRef.current, {
      attr: { y: targetY, height: fillHeight },
      duration: 0.45,
      ease: 'power2.out',
    })
  }, [fillHeight, targetY])

  useEffect(() => {
    if (!overflowRef.current) {
      return
    }

    if (didFire) {
      gsap.fromTo(
        overflowRef.current,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)', transformOrigin: 'center bottom' },
      )
      return
    }

    gsap.to(overflowRef.current, { opacity: 0, duration: 0.2 })
  }, [didFire])

  useEffect(() => {
    if (currentPhase !== PROCESS_PHASES.RECEIVE) {
      return
    }

    dripTlRef.current?.kill()

    const timeline = gsap.timeline()
    dripTlRef.current = timeline

    dripsRef.current.forEach((element, index) => {
      if (!element) {
        return
      }

      gsap.set(element, { cy: DRIP_Y_START, opacity: 1 })
      timeline.to(element, { cy: DRIP_Y_END, opacity: 0, duration: 0.4, ease: 'power1.in' }, index * 0.12)
    })

    return () => {
      timeline.kill()
    }
  }, [currentPhase])

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

        {renderDrips(dripsRef)}

        <rect
          ref={fillRef}
          x={BUCKET_LEFT}
          y={targetY}
          width={BUCKET_RIGHT - BUCKET_LEFT}
          height={fillHeight}
          fill="url(#lbFillGrad)"
          opacity={0.85}
          clipPath="url(#lbBucketClip)"
        />

        <path d={BUCKET_PATH} fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinejoin="round" />

        <line
          x1={BUCKET_LEFT - 6}
          y1={THRESHOLD_Y}
          x2={BUCKET_RIGHT + 6}
          y2={THRESHOLD_Y}
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text x={BUCKET_RIGHT + 10} y={THRESHOLD_Y + 4} fontSize={9} fill="#f59e0b" fontWeight="600">
          threshold
        </text>

        <g ref={overflowRef} opacity={0}>
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
