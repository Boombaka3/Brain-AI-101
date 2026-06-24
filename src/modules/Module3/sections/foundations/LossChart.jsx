import React from 'react'

const CHART_W = 480
const CHART_H = 300
const PAD = { top: 24, right: 20, bottom: 44, left: 48 }

function LossChart({ trainingHistory, roundIndex }) {
  const visibleSteps = trainingHistory.filter((s) => s.round <= roundIndex)

  const maxError = Math.max(...trainingHistory.map((s) => s.error), 0.01)
  const minError = Math.min(...trainingHistory.map((s) => s.error), 0)

  const xScale = (i) =>
    PAD.left + (i / (trainingHistory.length - 1)) * (CHART_W - PAD.left - PAD.right)

  const yScale = (val) =>
    PAD.top +
    ((maxError - val) / (maxError - minError || 1)) *
      (CHART_H - PAD.top - PAD.bottom)

  const points = visibleSteps
    .map((s, i) => `${xScale(i)},${yScale(s.error)}`)
    .join(' ')

  const allPoints = trainingHistory
    .map((s, i) => `${xScale(i)},${yScale(s.error)}`)
    .join(' ')

  return (
    <div className="m3-loss-chart-svg-wrap">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="m3-loss-chart-svg"
        aria-label="Loss curve chart"
      >
        {/* Y axis */}
        <line
          x1={PAD.left} y1={PAD.top}
          x2={PAD.left} y2={CHART_H - PAD.bottom}
          stroke="#e2e8f0" strokeWidth="1"
        />
        {/* X axis */}
        <line
          x1={PAD.left} y1={CHART_H - PAD.bottom}
          x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom}
          stroke="#e2e8f0" strokeWidth="1"
        />
        {/* Ghost line — full path, very faint */}
        {trainingHistory.length > 1 && (
          <polyline
            points={allPoints}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {/* Live line — grows with each round */}
        {visibleSteps.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {/* Dots for each visible step */}
        {visibleSteps.map((s, i) => (
          <circle
            key={s.round}
            cx={xScale(i)}
            cy={yScale(s.error)}
            r={i === visibleSteps.length - 1 ? 5 : 3.5}
            fill={i === visibleSteps.length - 1 ? '#059669' : '#6ee7b7'}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        ))}
        {/* X axis labels */}
        {trainingHistory.map((s, i) => (
          <text
            key={s.round}
            x={xScale(i)}
            y={CHART_H - PAD.bottom + 14}
            textAnchor="middle"
            fontSize="9"
            fill={s.round <= roundIndex ? '#64748b' : '#cbd5e1'}
          >
            R{s.round}
          </text>
        ))}
        {/* Y axis labels */}
        <text
          x={PAD.left - 6}
          y={PAD.top}
          textAnchor="end"
          fontSize="9"
          fill="#94a3b8"
        >
          {maxError.toFixed(1)}
        </text>
        <text
          x={PAD.left - 6}
          y={CHART_H - PAD.bottom}
          textAnchor="end"
          fontSize="9"
          fill="#94a3b8"
        >
          {minError.toFixed(1)}
        </text>
      </svg>
    </div>
  )
}

export default LossChart
