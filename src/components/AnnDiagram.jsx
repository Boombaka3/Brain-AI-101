import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * AnnDiagram - Unified ANN visualization matching BiologyDiagram exactly
 * 
 * Same visual structure, same container, same colors, same alignment
 */
function AnnDiagram({
  inputs,
  neuronATotalInput,
  neuronAThreshold,
  neuronAFires,
  neuronBInput,
  neuronBThreshold,
  neuronBFires,
  isMobile = false,
  isSimpleMode = true
}) {
  const [connectionPulse, setConnectionPulse] = useState(0)

  const svgWidth = isMobile && typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 760) : 760
  const svgHeight = 260

  const stagePaddingX = 24
  const stagePaddingY = 16
  const stageWidth = svgWidth - stagePaddingX * 2
  const stageHeight = svgHeight - stagePaddingY * 2
  
  // Positioning (matching biology exactly)
  const inputStartX = 40
  const neuronACenterX = stageWidth * 0.34
  const neuronBCenterX = stageWidth * 0.66
  const outputX = stageWidth - 40
  const centerY = stageHeight / 2
  
  // Dimensions (matching biology exactly)
  const neuronRadius = 50
  const neuronThresholdRadius = neuronRadius * 0.75
  
  // Input positions (straight lines, matching biology)
  const inputYPositions = inputs.map((_, i) => {
    const spacing = 30
    const totalHeight = (inputs.length - 1) * spacing
    const startY = centerY - totalHeight / 2
    return startY + i * spacing
  })

  // Calculate fill opacity (matching biology)
  const fillRatioA = Math.min(1, Math.max(0, neuronATotalInput / Math.max(neuronAThreshold, 1)))
  const fillRatioB = Math.min(1, Math.max(0, neuronBInput / Math.max(neuronBThreshold, 1)))

  const somaDiameter = neuronRadius * 2
  const fillHeightA = somaDiameter * fillRatioA
  const fillHeightB = somaDiameter * fillRatioB
  const fillTopYA = centerY + neuronRadius - fillHeightA
  const fillTopYB = centerY + neuronRadius - fillHeightB

  const thresholdRingStroke = '#D9792E'
  const thresholdRingDash = '5 4'
  const thresholdRingWidth = 2.5
  const thresholdRingOpacityA = neuronAFires ? 1 : 0.6
  const thresholdRingOpacityB = neuronBFires ? 1 : 0.6

  const inputMax = Math.max(...inputs, 1)
  const inputStroke = '#57A5FF'
  const inputStrokeWidth = 3
  const inputMarkerRadius = 4
  const inputMarkerOffset = 10

  const labelColor = '#51606A'
  const labelSize = isSimpleMode ? 12 : 10
  const labelWeight = 500

  // Animate connection pulse from A to B when firing
  useEffect(() => {
    if (!neuronAFires) {
      setConnectionPulse(0)
      return
    }

    setConnectionPulse(0)
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setConnectionPulse(progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => setConnectionPulse(0), 200)
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
              <circle cx={neuronACenterX} cy={centerY} r={neuronRadius} />
            </clipPath>
            <clipPath id="somaClipB">
              <circle cx={neuronBCenterX} cy={centerY} r={neuronRadius} />
            </clipPath>
          </defs>
          {/* ===== INPUTS (straight converging lines) ===== */}
          {inputs.map((input, index) => {
            const inputY = inputYPositions[index]
            const endX = neuronACenterX - neuronRadius
            const endY = centerY - 16 + index * 8
            const inputOpacity = Math.min(1, Math.max(0.15, input / inputMax))

            return (
              <g key={index}>
                {/* Straight input line */}
                <line
                  x1={inputStartX}
                  y1={inputY}
                  x2={endX}
                  y2={endY}
                  stroke={inputStroke}
                  strokeWidth={inputStrokeWidth}
                />
                <circle
                  cx={endX - inputMarkerOffset}
                  cy={endY}
                  r={inputMarkerRadius}
                  fill={inputStroke}
                  opacity={inputOpacity}
                />

                {/* Input label */}
                {!isSimpleMode && (
                  <text
                    x={inputStartX}
                    y={inputY - 8}
                    fontSize="12px"
                    fill="#1A2D34"
                    textAnchor="middle"
                    fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
                  >
                    x{index + 1}
                  </text>
                )}
              </g>
            )
          })}

          {/* ===== NEURON A ===== */}
          <g id="neuronA">
            {/* Neuron body - FILLED circle */}
            <circle
              cx={neuronACenterX}
              cy={centerY}
              r={neuronRadius}
              fill="#57FFB0"
              stroke="#0F3B2B"
              strokeWidth="3"
            />

            {/* Summation fill gauge */}
            {fillRatioA > 0 && (
              <>
                <motion.rect
                  x={neuronACenterX - neuronRadius}
                  y={fillTopYA}
                  width={somaDiameter}
                  height={fillHeightA}
                  fill="#26C97F"
                  clipPath="url(#somaClipA)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.line
                  x1={neuronACenterX - neuronRadius}
                  x2={neuronACenterX + neuronRadius}
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
              cy={centerY}
              r={neuronThresholdRadius}
              fill="none"
              stroke={thresholdRingStroke}
              strokeWidth={thresholdRingWidth}
              strokeDasharray={thresholdRingDash}
              strokeLinecap="round"
              opacity={thresholdRingOpacityA}
            />

            {/* Σ symbol (summation) */}
            {!isSimpleMode && (
              <text
                x={neuronACenterX}
                y={centerY + 5}
                fontSize="18px"
                fontWeight="600"
                fill="#1A2D34"
                textAnchor="middle"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                Σ
              </text>
            )}

            {/* Neuron A label */}
            {!isSimpleMode && (
              <text
                x={neuronACenterX}
                y={centerY - neuronRadius - 12}
                fontSize="12px"
                fill="#1A2D34"
                textAnchor="middle"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                Neuron A
              </text>
            )}
          </g>

          {/* ===== CONNECTION A → B ===== */}
          <g>
            {/* Connection line */}
            <line
              x1={neuronACenterX + neuronRadius}
              y1={centerY}
              x2={neuronBCenterX - neuronRadius}
              y2={centerY}
              stroke="#57A5FF"
              strokeWidth="3"
              opacity={neuronAFires ? 1 : 0.3}
            />

            {/* Pulse dot - animated with Framer Motion */}
            {neuronAFires && connectionPulse > 0 && (
              <motion.circle
                cx={neuronACenterX + neuronRadius + connectionPulse * (neuronBCenterX - neuronACenterX - neuronRadius * 2)}
                cy={centerY}
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
            {/* Neuron body - FILLED circle */}
            <circle
              cx={neuronBCenterX}
              cy={centerY}
              r={neuronRadius}
              fill="#57FFB0"
              stroke="#0F3B2B"
              strokeWidth="3"
            />

            {/* Summation fill gauge */}
            {fillRatioB > 0 && (
              <>
                <motion.rect
                  x={neuronBCenterX - neuronRadius}
                  y={fillTopYB}
                  width={somaDiameter}
                  height={fillHeightB}
                  fill="#26C97F"
                  clipPath="url(#somaClipB)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.line
                  x1={neuronBCenterX - neuronRadius}
                  x2={neuronBCenterX + neuronRadius}
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
              cy={centerY}
              r={neuronThresholdRadius}
              fill="none"
              stroke={thresholdRingStroke}
              strokeWidth={thresholdRingWidth}
              strokeDasharray={thresholdRingDash}
              strokeLinecap="round"
              opacity={thresholdRingOpacityB}
            />

            {/* Σ symbol */}
            {!isSimpleMode && (
              <text
                x={neuronBCenterX}
                y={centerY + 5}
                fontSize="18px"
                fontWeight="600"
                fill="#1A2D34"
                textAnchor="middle"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                Σ
              </text>
            )}

            {/* Neuron B label */}
            {!isSimpleMode && (
              <text
                x={neuronBCenterX}
                y={centerY - neuronRadius - 12}
                fontSize="12px"
                fill="#1A2D34"
                textAnchor="middle"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                Neuron B
              </text>
            )}
          </g>

          {/* ===== LABELS ===== */}
          <g id="labels">
            {inputYPositions.length > 0 && (
              <text
                x={inputStartX + 8}
                y={inputYPositions[0] - 10}
                fontSize={labelSize}
                fontWeight={labelWeight}
                fill={labelColor}
                textAnchor="start"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                inputs
              </text>
            )}
            <text
              x={neuronACenterX}
              y={centerY + neuronRadius + 16}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              textAnchor="middle"
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
            >
              Σ
            </text>
            <text
              x={outputX}
              y={centerY - 12}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              textAnchor="start"
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
            >
              output
            </text>
            <text
              x={neuronACenterX + neuronThresholdRadius + 12}
              y={centerY - neuronThresholdRadius + 4}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              textAnchor="start"
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
            >
              threshold
            </text>
          </g>

        </g>
      </svg>
    </div>
  )
}

export default AnnDiagram
