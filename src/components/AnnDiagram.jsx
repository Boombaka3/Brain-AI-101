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
  const [outputPulse, setOutputPulse] = useState(0)

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
  const maxDisplayA = Math.max(neuronAThreshold, neuronATotalInput, 1)
  const fillOpacityA = Math.min(1, Math.max(0, (neuronATotalInput / maxDisplayA) * 0.8))

  const maxDisplayB = Math.max(neuronBThreshold, neuronBInput, 1)
  const fillOpacityB = Math.min(1, Math.max(0, (neuronBInput / maxDisplayB) * 0.8))

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

  // Animate output pulse when Neuron B fires
  useEffect(() => {
    if (!neuronBFires) {
      setOutputPulse(0)
      return
    }

    setOutputPulse(0)
    const duration = 600
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setOutputPulse(progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setTimeout(() => setOutputPulse(0), 200)
      }
    }

    requestAnimationFrame(animate)
  }, [neuronBFires])

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
          {/* ===== INPUTS (straight converging lines) ===== */}
          {inputs.map((input, index) => {
            const inputY = inputYPositions[index]
            const inputActive = input > 0
            const endX = neuronACenterX - neuronRadius
            const endY = centerY - 16 + index * 8

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
                  opacity={inputActive ? 1 : 0.3}
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

            {/* Summation fill overlay - animated with Framer Motion */}
            {fillOpacityA > 0 && (
              <motion.circle
                cx={neuronACenterX}
                cy={centerY}
                r={neuronThresholdRadius * (fillOpacityA / 0.8)}
                fill="#26C97F"
                initial={{ opacity: 0 }}
                animate={{ opacity: fillOpacityA }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Threshold ring */}
            <circle
              cx={neuronACenterX}
              cy={centerY}
              r={neuronThresholdRadius}
              fill="none"
              stroke="#FF9E45"
              strokeWidth="2"
              strokeDasharray="4 4"
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
              opacity={neuronBFires ? 1 : 0.6}
            />

            {/* Summation fill overlay */}
            {neuronAFires && fillOpacityB > 0 && (
              <motion.circle
                cx={neuronBCenterX}
                cy={centerY}
                r={neuronThresholdRadius * (fillOpacityB / 0.8)}
                fill="#26C97F"
                initial={{ opacity: 0 }}
                animate={{ opacity: fillOpacityB }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Threshold ring */}
            <circle
              cx={neuronBCenterX}
              cy={centerY}
              r={neuronThresholdRadius}
              fill="none"
              stroke="#FF9E45"
              strokeWidth="2"
              strokeDasharray="4 4"
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

          {/* ===== OUTPUT ===== */}
          <g>
            {/* Output line */}
            <line
              x1={neuronBCenterX + neuronRadius}
              y1={centerY}
              x2={outputX}
              y2={centerY}
              stroke="#57A5FF"
              strokeWidth="3"
              opacity={neuronBFires ? 1 : 0.3}
            />

            {/* Pulse dot - animated with Framer Motion */}
            {neuronBFires && outputPulse > 0 && (
              <motion.circle
                cx={neuronBCenterX + neuronRadius + outputPulse * (outputX - neuronBCenterX - neuronRadius)}
                cy={centerY}
                r="6"
                fill="#26C97F"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Output indicator: "1" if firing */}
            {neuronBFires && outputPulse > 0.8 && !isSimpleMode && (
              <text
                x={outputX + 15}
                y={centerY + 4}
                fontSize="12px"
                fill="#1A2D34"
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                1
              </text>
            )}
          </g>
        </g>
      </svg>
    </div>
  )
}

export default AnnDiagram
