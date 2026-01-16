import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * BiologyDiagram - Unified biological neuron visualization with Framer Motion
 */
function BiologyDiagram({
  neuronATotalInput,
  neuronAThreshold,
  neuronAFires,
  neuronBInput,
  neuronBThreshold,
  neuronBFires,
  isMobile = false,
  isSimpleMode = true
}) {
  const [axonPulse, setAxonPulse] = useState(0)

  const svgWidth = isMobile && typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 760) : 760
  const svgHeight = 260

  const stagePaddingX = 24
  const stagePaddingY = 16
  const stageWidth = svgWidth - stagePaddingX * 2
  const stageHeight = svgHeight - stagePaddingY * 2

  // Neuron A positioning (matching ANN)
  const neuronACenterX = stageWidth * 0.34
  const neuronACenterY = stageHeight / 2
  const neuronASomaRadius = 50
  const neuronAThresholdRadius = neuronASomaRadius * 0.75

  // Neuron B positioning (matching ANN)
  const neuronBCenterX = stageWidth * 0.66
  const neuronBCenterY = stageHeight / 2
  const neuronBSomaRadius = 50
  const neuronBThresholdRadius = neuronBSomaRadius * 0.75

  // Axon path (matching ANN connection)
  const axonStartX = neuronACenterX + neuronASomaRadius
  const axonEndX = neuronBCenterX - neuronBSomaRadius
  const axonY = stageHeight / 2
  const axonLength = axonEndX - axonStartX

  // Input positions (straight lines, matching ANN)
  const inputStartX = 40
  const numInputs = 4
  const inputYPositions = []
  const spacing = 30
  const totalHeight = (numInputs - 1) * spacing
  const startY = neuronACenterY - totalHeight / 2
  for (let i = 0; i < numInputs; i++) {
    inputYPositions.push(startY + i * spacing)
  }

  // Calculate fill opacity
  const fillRatioA = Math.min(1, Math.max(0, neuronATotalInput / Math.max(neuronAThreshold, 1)))
  const fillRatioB = Math.min(1, Math.max(0, neuronBInput / Math.max(neuronBThreshold, 1)))

  const somaDiameterA = neuronASomaRadius * 2
  const somaDiameterB = neuronBSomaRadius * 2
  const fillHeightA = somaDiameterA * fillRatioA
  const fillHeightB = somaDiameterB * fillRatioB
  const fillTopYA = neuronACenterY + neuronASomaRadius - fillHeightA
  const fillTopYB = neuronBCenterY + neuronBSomaRadius - fillHeightB

  const thresholdRingStroke = '#D9792E'
  const thresholdRingDash = '5 4'
  const thresholdRingWidth = 2.5
  const thresholdRingOpacityA = neuronAFires ? 1 : 0.6
  const thresholdRingOpacityB = neuronBFires ? 1 : 0.6

  // Animate axon pulse when firing
  useEffect(() => {
    if (!neuronAFires) {
      setAxonPulse(0)
      return
    }

    setAxonPulse(0)
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setAxonPulse(progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => setAxonPulse(0), 200)
      }
    }

    requestAnimationFrame(animate)
  }, [neuronAFires])

  return (
    <div style={{
      backgroundColor: '#F8FBFD',
      border: '1px solid #D6E4F0',
      borderRadius: '12px',
      padding: '16px',
      fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif'
    }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block' }}
      >
        <g transform={`translate(${stagePaddingX}, ${stagePaddingY})`}>
          <defs>
            <clipPath id="somaClipA">
              <circle cx={neuronACenterX} cy={neuronACenterY} r={neuronASomaRadius} />
            </clipPath>
            <clipPath id="somaClipB">
              <circle cx={neuronBCenterX} cy={neuronBCenterY} r={neuronBSomaRadius} />
            </clipPath>
          </defs>
          {/* ===== INPUTS (straight converging lines) ===== */}
          {inputYPositions.map((inputY, index) => {
            const endX = neuronACenterX - neuronASomaRadius
            const endY = neuronACenterY - 16 + index * 8

            return (
              <g key={index}>
                {/* Straight input line */}
                <line
                  x1={inputStartX}
                  y1={inputY}
                  x2={endX}
                  y2={endY}
                  stroke="#57A5FF"
                  strokeWidth="3"
                  opacity={neuronATotalInput > 0 ? 1 : 0.3}
                />
              </g>
            )
          })}

          {/* ===== NEURON A ===== */}
          <g id="neuronA">
            {/* Soma - FILLED circle */}
            <circle
              cx={neuronACenterX}
              cy={neuronACenterY}
              r={neuronASomaRadius}
              fill="#57FFB0"
              stroke="#0F3B2B"
              strokeWidth="3"
            />

            {/* Summation fill gauge */}
            {fillRatioA > 0 && (
              <>
                <motion.rect
                  x={neuronACenterX - neuronASomaRadius}
                  y={fillTopYA}
                  width={somaDiameterA}
                  height={fillHeightA}
                  fill="#26C97F"
                  clipPath="url(#somaClipA)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.line
                  x1={neuronACenterX - neuronASomaRadius}
                  x2={neuronACenterX + neuronASomaRadius}
                  y1={fillTopYA}
                  y2={fillTopYA}
                  stroke="#1A7F52"
                  strokeWidth="2"
                  clipPath="url(#somaClipA)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}

            {/* Threshold ring */}
            <circle
              cx={neuronACenterX}
              cy={neuronACenterY}
              r={neuronAThresholdRadius}
              fill="none"
              stroke={thresholdRingStroke}
              strokeWidth={thresholdRingWidth}
              strokeDasharray={thresholdRingDash}
              strokeLinecap="round"
              opacity={thresholdRingOpacityA}
            />

            {/* Neuron A label */}
            {!isSimpleMode && (
              <text
                x={neuronACenterX}
                y={neuronACenterY - neuronASomaRadius - 12}
                fontSize="12px"
                fill="#1A2D34"
                textAnchor="middle"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                Neuron A
              </text>
            )}
          </g>

          {/* ===== AXON ===== */}
          <g>
            {/* Axon line */}
            <line
              x1={axonStartX}
              y1={axonY}
              x2={axonEndX}
              y2={axonY}
              stroke="#57A5FF"
              strokeWidth="3"
              opacity={neuronAFires ? 1 : 0.3}
            />

            {/* Pulse dot - animated with Framer Motion */}
            {neuronAFires && axonPulse > 0 && (
              <motion.circle
                cx={axonStartX + axonPulse * axonLength}
                cy={axonY}
                r="6"
                fill="#26C97F"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </g>

          {/* ===== NEURON B ===== */}
          <g id="neuronB">
            {/* Soma - FILLED circle */}
            <circle
              cx={neuronBCenterX}
              cy={neuronBCenterY}
              r={neuronBSomaRadius}
              fill="#57FFB0"
              stroke="#0F3B2B"
              strokeWidth="3"
              opacity={neuronBFires ? 1 : 0.6}
            />

            {/* Summation fill gauge */}
            {fillRatioB > 0 && (
              <>
                <motion.rect
                  x={neuronBCenterX - neuronBSomaRadius}
                  y={fillTopYB}
                  width={somaDiameterB}
                  height={fillHeightB}
                  fill="#26C97F"
                  clipPath="url(#somaClipB)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.line
                  x1={neuronBCenterX - neuronBSomaRadius}
                  x2={neuronBCenterX + neuronBSomaRadius}
                  y1={fillTopYB}
                  y2={fillTopYB}
                  stroke="#1A7F52"
                  strokeWidth="2"
                  clipPath="url(#somaClipB)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}

            {/* Threshold ring */}
            <circle
              cx={neuronBCenterX}
              cy={neuronBCenterY}
              r={neuronBThresholdRadius}
              fill="none"
              stroke={thresholdRingStroke}
              strokeWidth={thresholdRingWidth}
              strokeDasharray={thresholdRingDash}
              strokeLinecap="round"
              opacity={thresholdRingOpacityB}
            />

            {/* Neuron B label */}
            {!isSimpleMode && (
              <text
                x={neuronBCenterX}
                y={neuronBCenterY - neuronBSomaRadius - 12}
                fontSize="12px"
                fill="#1A2D34"
                textAnchor="middle"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                Neuron B
              </text>
            )}
          </g>
        </g>
      </svg>
    </div>
  )
}

export default BiologyDiagram
