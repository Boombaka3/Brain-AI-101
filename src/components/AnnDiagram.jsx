import { useState, useEffect, useRef } from 'react'
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
  const [ringActiveA, setRingActiveA] = useState(false)
  const [pulseActive, setPulseActive] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)
  const [focusedInputIndex, setFocusedInputIndex] = useState(null)
  const [focusTick, setFocusTick] = useState(0)
  const previousInputsRef = useRef(inputs)
  const sequenceTimeoutsRef = useRef([])

  const svgWidth = isMobile && typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 760) : 760
  const svgHeight = 260

  const stageWidth = svgWidth * 0.7
  const stageHeight = svgHeight * 0.7
  const stageOffsetX = (svgWidth - stageWidth) / 2
  const stageOffsetY = (svgHeight - stageHeight) / 2
  
  // Positioning (matching biology exactly)
  const inputStartX = 40
  const neuronACenterX = stageWidth * 0.34
  const neuronBCenterX = stageWidth * 0.66
  const centerY = stageHeight / 2
  
  // Dimensions (matching biology exactly)
  const neuronRadius = 50
  const neuronThresholdRadius = neuronRadius * 0.75

  const axonStartX = neuronACenterX + neuronRadius
  const axonEndX = neuronBCenterX - neuronRadius
  const axonLength = axonEndX - axonStartX
  
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

  const thresholdRingInactive = '#D9792E'
  const thresholdRingActive = '#FF8A1E'
  const thresholdRingDash = '5 4'
  const thresholdRingWidth = 2.5
  const thresholdRingOpacityA = neuronAFires ? 1 : 0.5
  const thresholdRingOpacityB = neuronBFires ? 1 : 0.5

  const easeOutCubic = [0.215, 0.61, 0.355, 1]
  const fillOpacityA = fillRatioA >= 0.85 ? 1 : 0.85
  const fillOpacityB = fillRatioB >= 0.85 ? 1 : 0.85

  const inputMax = Math.max(...inputs, 1)
  const inputStroke = '#57A5FF'
  const inputStrokeWidth = 3
  const inputMarkerRadius = 4
  const inputMarkerOffset = 10

  const showDetailed = !isSimpleMode
  const labelColor = '#51606A'
  const labelSize = isSimpleMode ? 12 : 11
  const labelWeight = 500
  const labelTracking = '0.04em'
  const hintColor = '#6B7280'
  const hintSize = 10

  const inputPulseDurationBase = 1.4
  const inputPulseDurationRange = 0.6

  const fillDurationMs = 450
  const ringDelayMs = fillDurationMs
  const pulseDelayMs = fillDurationMs + 120
  const pulseDurationMs = 600

  // Animate connection pulse from A to B when firing
  useEffect(() => {
    sequenceTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
    sequenceTimeoutsRef.current = []
    setRingActiveA(false)
    setPulseActive(false)

    if (!neuronAFires) {
      return
    }

    const ringTimer = setTimeout(() => setRingActiveA(true), ringDelayMs)
    const pulseTimer = setTimeout(() => {
      setPulseActive(true)
      setPulseKey((key) => key + 1)
    }, pulseDelayMs)
    const pulseEndTimer = setTimeout(() => setPulseActive(false), pulseDelayMs + pulseDurationMs)

    sequenceTimeoutsRef.current = [ringTimer, pulseTimer, pulseEndTimer]
    return () => {
      sequenceTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [neuronAFires])

  useEffect(() => {
    const previousInputs = previousInputsRef.current
    const changedIndex = inputs.findIndex((value, index) => value !== previousInputs[index])
    if (changedIndex !== -1) {
      setFocusedInputIndex(changedIndex)
      setFocusTick((tick) => tick + 1)
    }
    previousInputsRef.current = inputs
  }, [inputs])


  return (
    <div style={{
      background: 'linear-gradient(180deg, #F8FBFD 0%, #F1F6FB 100%)',
      border: '1px solid #DDE6F2',
      borderRadius: '16px',
      padding: '12px',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
    }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block' }}
      >
        <g transform={`translate(${stageOffsetX}, ${stageOffsetY})`}>
          <defs>
            <clipPath id="somaClipA">
              <circle cx={neuronACenterX} cy={centerY} r={neuronRadius} />
            </clipPath>
            <clipPath id="somaClipB">
              <circle cx={neuronBCenterX} cy={centerY} r={neuronRadius} />
            </clipPath>
            <pattern id="somaGrid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#0F3B2B" strokeWidth="0.6" opacity="0.12" />
            </pattern>
            <linearGradient id="inputGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2F86FF" />
              <stop offset="100%" stopColor="#8CC3FF" />
            </linearGradient>
          </defs>
          {/* ===== INPUTS (straight converging lines) ===== */}
          {inputs.map((input, index) => {
            const inputY = inputYPositions[index]
            const endX = neuronACenterX - neuronRadius
            const endY = centerY - 16 + index * 8
            const inputNormalized = input / inputMax
            const inputOpacity = Math.min(1, Math.max(0.25, inputNormalized))
            const pulseDuration = inputPulseDurationBase - inputPulseDurationRange * inputNormalized

            return (
              <g key={index}>
                {/* Straight input line */}
                <line
                  x1={inputStartX}
                  y1={inputY}
                  x2={endX}
                  y2={endY}
                  stroke="url(#inputGradient)"
                  strokeWidth={inputStrokeWidth}
                  strokeLinecap="round"
                />
                <motion.circle
                  cx={endX - inputMarkerOffset}
                  cy={endY}
                  r={inputMarkerRadius + 2}
                  fill="#57A5FF"
                  opacity={inputOpacity * 0.35}
                  animate={{
                    opacity: [inputOpacity * 0.2, inputOpacity * 0.45, inputOpacity * 0.2],
                    scale: [1, 1.08, 1]
                  }}
                  transition={{ duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.circle
                  key={`focus-${focusTick}-${index}`}
                  cx={endX - inputMarkerOffset}
                  cy={endY}
                  r={inputMarkerRadius}
                  fill="#2F86FF"
                  opacity={inputOpacity}
                  animate={
                    focusedInputIndex === index
                      ? { opacity: [inputOpacity, 1, inputOpacity], scale: [1, 1.2, 1] }
                      : { opacity: inputOpacity }
                  }
                  transition={
                    focusedInputIndex === index
                      ? { duration: 0.2, ease: 'easeOut' }
                      : { duration: 0.2, ease: 'easeOut' }
                  }
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
            <rect
              x={neuronACenterX - neuronRadius}
              y={centerY - neuronRadius}
              width={somaDiameter}
              height={somaDiameter}
              fill="url(#somaGrid)"
              clipPath="url(#somaClipA)"
              opacity="0.22"
            />

            {/* Summation fill gauge */}
            {fillRatioA > 0 && (
              <>
                <motion.rect
                  x={neuronACenterX - neuronRadius}
                  width={somaDiameter}
                  fill="#26C97F"
                  clipPath="url(#somaClipA)"
                  initial={false}
                  animate={{ y: fillTopYA, height: fillHeightA, opacity: fillOpacityA }}
                  transition={{ duration: 0.45, ease: easeOutCubic }}
                />
                <motion.line
                  x1={neuronACenterX - neuronRadius}
                  x2={neuronACenterX + neuronRadius}
                  stroke="#1A7F52"
                  strokeWidth="2"
                  clipPath="url(#somaClipA)"
                  initial={false}
                  animate={{ y1: fillTopYA, y2: fillTopYA, opacity: fillOpacityA }}
                  transition={{ duration: 0.45, ease: easeOutCubic }}
                />
              </>
            )}

            {/* Threshold ring */}
            <circle
              cx={neuronACenterX}
              cy={centerY}
              r={neuronThresholdRadius}
              fill="none"
              stroke={ringActiveA ? thresholdRingActive : thresholdRingInactive}
              strokeWidth={thresholdRingWidth}
              strokeDasharray={thresholdRingDash}
              strokeLinecap="round"
              opacity={ringActiveA ? 1 : thresholdRingOpacityA}
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

          </g>

          {/* ===== CONNECTION A → B ===== */}
          <g>
            {/* Connection line */}
            <line
              x1={axonStartX}
              y1={centerY}
              x2={axonEndX}
              y2={centerY}
              stroke="#57A5FF"
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity={pulseActive ? 1 : neuronAFires ? 0.7 : 0.35}
            />

            {/* Pulse dot - animated with Framer Motion */}
            {pulseActive && (
              <motion.circle
                key={`pulse-${pulseKey}`}
                cx={axonStartX}
                cy={centerY}
                r="6"
                fill="#26C97F"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, cx: axonStartX + axonLength }}
                transition={{ duration: pulseDurationMs / 1000, ease: easeOutCubic }}
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
            <rect
              x={neuronBCenterX - neuronRadius}
              y={centerY - neuronRadius}
              width={somaDiameter}
              height={somaDiameter}
              fill="url(#somaGrid)"
              clipPath="url(#somaClipB)"
              opacity="0.22"
            />

            {/* Summation fill gauge */}
            {fillRatioB > 0 && (
              <>
                <motion.rect
                  x={neuronBCenterX - neuronRadius}
                  width={somaDiameter}
                  fill="#26C97F"
                  clipPath="url(#somaClipB)"
                  initial={false}
                  animate={{ y: fillTopYB, height: fillHeightB, opacity: fillOpacityB }}
                  transition={{ duration: 0.45, ease: easeOutCubic }}
                />
                <motion.line
                  x1={neuronBCenterX - neuronRadius}
                  x2={neuronBCenterX + neuronRadius}
                  stroke="#1A7F52"
                  strokeWidth="2"
                  clipPath="url(#somaClipB)"
                  initial={false}
                  animate={{ y1: fillTopYB, y2: fillTopYB, opacity: fillOpacityB }}
                  transition={{ duration: 0.45, ease: easeOutCubic }}
                />
              </>
            )}

            {/* Threshold ring */}
            <circle
              cx={neuronBCenterX}
              cy={centerY}
              r={neuronThresholdRadius}
              fill="none"
              stroke={neuronBFires ? thresholdRingActive : thresholdRingInactive}
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
                letterSpacing={labelTracking}
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                INPUTS
              </text>
            )}
            {showDetailed && (
              <text
                x={neuronACenterX}
                y={centerY + neuronRadius + 16}
                fontSize={labelSize}
                fontWeight={labelWeight}
                fill={labelColor}
                textAnchor="middle"
                letterSpacing={labelTracking}
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                Σ
              </text>
            )}
            <text
              x={(axonStartX + axonEndX) / 2}
              y={centerY - 12}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              textAnchor="middle"
              letterSpacing={labelTracking}
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
            >
              OUTPUT
            </text>
            {showDetailed && (
              <text
                x={neuronACenterX + neuronThresholdRadius + 12}
                y={centerY - neuronThresholdRadius + 4}
                fontSize={labelSize}
                fontWeight={labelWeight}
                fill={labelColor}
                textAnchor="start"
                letterSpacing={labelTracking}
                fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              >
                THRESHOLD
              </text>
            )}
            {showDetailed && (
              <>
                <text
                  x={neuronACenterX + neuronRadius + 10}
                  y={centerY + 6}
                  fontSize={hintSize}
                  fill={hintColor}
                  textAnchor="start"
                  fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
                >
                  {neuronATotalInput}/{neuronAThreshold}
                </text>
                <text
                  x={neuronBCenterX + neuronRadius + 10}
                  y={centerY + 6}
                  fontSize={hintSize}
                  fill={hintColor}
                  textAnchor="start"
                  fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
                >
                  {neuronBInput}/{neuronBThreshold}
                </text>
              </>
            )}
          </g>

        </g>
      </svg>
    </div>
  )
}

export default AnnDiagram
