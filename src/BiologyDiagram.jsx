import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/**
 * BiologyDiagram - Unified biological neuron visualization with Framer Motion
 */
function BiologyDiagram({
  inputs = [],
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
  const [pulseArrived, setPulseArrived] = useState(false)
  const [highlightB, setHighlightB] = useState(false)
  const [ringActiveB, setRingActiveB] = useState(false)
  const [focusedInputIndex, setFocusedInputIndex] = useState(null)
  const [focusTick, setFocusTick] = useState(0)
  const previousInputsRef = useRef([])
  const sequenceTimeoutsRef = useRef([])

  const svgWidth = isMobile && typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 760) : 760
  const svgHeight = 260

  const stageWidth = svgWidth * 0.7
  const stageHeight = svgHeight * 0.7
  const stageOffsetX = (svgWidth - stageWidth) / 2
  const stageOffsetY = (svgHeight - stageHeight) / 2

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
  const numInputs = inputs.length > 0 ? inputs.length : 4
  const inputValues = inputs.length > 0 ? inputs : Array.from({ length: numInputs }, () => 0)
  const inputMax = Math.max(...inputValues, 1)
  const inputYPositions = []
  const spacing = 30
  const inputStroke = '#57A5FF'
  const inputStrokeWidth = 3
  const inputMarkerRadius = 4
  const inputMarkerOffset = 10
  const totalHeight = (numInputs - 1) * spacing
  const startY = neuronACenterY - totalHeight / 2
  for (let i = 0; i < numInputs; i++) {
    inputYPositions.push(startY + i * spacing)
  }

  // Calculate fill opacity
  const fillRatioA = Math.min(1, Math.max(0, neuronATotalInput / Math.max(neuronAThreshold, 1)))
  const fillRatioB = Math.min(1, Math.max(0, neuronBInput / Math.max(neuronBThreshold, 1)))
  const fillRatioBDisplay = pulseArrived ? fillRatioB : 0

  const somaDiameterA = neuronASomaRadius * 2
  const somaDiameterB = neuronBSomaRadius * 2
  const fillHeightA = somaDiameterA * fillRatioA
  const fillHeightB = somaDiameterB * fillRatioBDisplay
  const fillTopYA = neuronACenterY + neuronASomaRadius - fillHeightA
  const fillTopYB = neuronBCenterY + neuronBSomaRadius - fillHeightB

  const thresholdRingStroke = '#D9792E'
  const thresholdRingDash = '5 4'
  const thresholdRingWidth = 2.5
  const thresholdRingInactive = '#D9792E'
  const thresholdRingActive = '#FF8A1E'
  const thresholdRingOpacityA = neuronAFires ? 1 : 0.5
  const thresholdRingOpacityB = neuronBFires ? 1 : 0.5

  const easeOutCubic = [0.215, 0.61, 0.355, 1]
  const fillOpacityA = fillRatioA >= 0.85 ? 1 : 0.85
  const fillOpacityB = fillRatioBDisplay >= 0.85 ? 1 : 0.85

  const showDetailed = !isSimpleMode
  const labelColor = '#51606A'
  const labelSize = isSimpleMode ? 12 : 11
  const labelWeight = 500
  const labelTracking = '0.04em'
  const hintColor = '#6B7280'
  const hintSize = 10
  const detailOpacity = showDetailed ? 1 : 0
  const detailTransition = { duration: 0.2, ease: 'easeOut' }

  const inputPulseDurationBase = 1.4
  const inputPulseDurationRange = 0.6

  const fillDurationMs = 450
  const ringDelayMs = fillDurationMs
  const pulseDelayMs = fillDurationMs + 120
  const pulseDurationMs = 600

  useEffect(() => {
    sequenceTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
    sequenceTimeoutsRef.current = []
    setRingActiveA(false)
    setPulseActive(false)
    setPulseArrived(false)
    setHighlightB(false)
    setRingActiveB(false)

    if (!neuronAFires) {
      return
    }

    const ringTimer = setTimeout(() => setRingActiveA(true), ringDelayMs)
    const pulseTimer = setTimeout(() => {
      setPulseActive(true)
      setPulseKey((key) => key + 1)
    }, pulseDelayMs)
    const pulseEndTimer = setTimeout(() => setPulseActive(false), pulseDelayMs + pulseDurationMs)
    const arrivalTimer = setTimeout(() => {
      setPulseArrived(true)
      setHighlightB(true)
      setTimeout(() => setHighlightB(false), 200)
    }, pulseDelayMs + pulseDurationMs)

    sequenceTimeoutsRef.current = [ringTimer, pulseTimer, pulseEndTimer, arrivalTimer]
    return () => {
      sequenceTimeoutsRef.current.forEach((timeoutId) => clearTimeout(timeoutId))
    }
  }, [neuronAFires])

  useEffect(() => {
    setRingActiveB(pulseArrived && neuronBFires)
  }, [pulseArrived, neuronBFires])

  useEffect(() => {
    const previousInputs = previousInputsRef.current
    const changedIndex = inputValues.findIndex((value, index) => value !== previousInputs[index])
    if (changedIndex !== -1) {
      setFocusedInputIndex(changedIndex)
      setFocusTick((tick) => tick + 1)
    }
    previousInputsRef.current = inputValues
  }, [inputValues])

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
              <circle cx={neuronACenterX} cy={neuronACenterY} r={neuronASomaRadius} />
            </clipPath>
            <clipPath id="somaClipB">
              <circle cx={neuronBCenterX} cy={neuronBCenterY} r={neuronBSomaRadius} />
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
          {inputYPositions.map((inputY, index) => {
            const endX = neuronACenterX - neuronASomaRadius
            const endY = neuronACenterY - 16 + index * 8
            const inputValue = inputValues[index] ?? 0
            const inputNormalized = inputValue / inputMax
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
            <rect
              x={neuronACenterX - neuronASomaRadius}
              y={neuronACenterY - neuronASomaRadius}
              width={somaDiameterA}
              height={somaDiameterA}
              fill="url(#somaGrid)"
              clipPath="url(#somaClipA)"
              opacity="0.22"
            />

            {/* Summation fill gauge */}
            {fillRatioA > 0 && (
              <>
                <motion.rect
                  x={neuronACenterX - neuronASomaRadius}
                  width={somaDiameterA}
                  fill="#26C97F"
                  clipPath="url(#somaClipA)"
                  initial={false}
                  animate={{ y: fillTopYA, height: fillHeightA, opacity: fillOpacityA }}
                  transition={{ duration: 0.45, ease: easeOutCubic }}
                />
                <motion.line
                  x1={neuronACenterX - neuronASomaRadius}
                  x2={neuronACenterX + neuronASomaRadius}
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
              cy={neuronACenterY}
              r={neuronAThresholdRadius}
              fill="none"
              stroke={ringActiveA ? thresholdRingActive : thresholdRingInactive}
              strokeWidth={thresholdRingWidth}
              strokeDasharray={thresholdRingDash}
              strokeLinecap="round"
              opacity={ringActiveA ? 1 : thresholdRingOpacityA}
            />

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
              strokeWidth="3.5"
              strokeLinecap="round"
              opacity={pulseActive ? 1 : neuronAFires ? 0.7 : 0.35}
            />

            {/* Pulse dot - animated with Framer Motion */}
            {pulseActive && (
              <motion.circle
                key={`pulse-${pulseKey}`}
                cx={axonStartX}
                cy={axonY}
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
            {/* Soma - FILLED circle */}
            <circle
              cx={neuronBCenterX}
              cy={neuronBCenterY}
              r={neuronBSomaRadius}
              fill="#57FFB0"
              stroke="#0F3B2B"
              strokeWidth="3"
            />
            <rect
              x={neuronBCenterX - neuronBSomaRadius}
              y={neuronBCenterY - neuronBSomaRadius}
              width={somaDiameterB}
              height={somaDiameterB}
              fill="url(#somaGrid)"
              clipPath="url(#somaClipB)"
              opacity="0.22"
            />

            {/* Summation fill gauge */}
            {fillRatioB > 0 && (
              <>
                <motion.rect
                  x={neuronBCenterX - neuronBSomaRadius}
                  width={somaDiameterB}
                  fill="#26C97F"
                  clipPath="url(#somaClipB)"
                  initial={false}
                  animate={{ y: fillTopYB, height: fillHeightB, opacity: fillOpacityB }}
                  transition={{ duration: 0.45, ease: easeOutCubic }}
                />
                <motion.line
                  x1={neuronBCenterX - neuronBSomaRadius}
                  x2={neuronBCenterX + neuronBSomaRadius}
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
              cy={neuronBCenterY}
              r={neuronBThresholdRadius}
              fill="none"
              stroke={ringActiveB ? thresholdRingActive : thresholdRingInactive}
              strokeWidth={thresholdRingWidth}
              strokeDasharray={thresholdRingDash}
              strokeLinecap="round"
              opacity={ringActiveB ? 1 : thresholdRingOpacityB}
            />

            <motion.circle
              cx={neuronBCenterX}
              cy={neuronBCenterY}
              r={neuronBSomaRadius + 2}
              fill="none"
              stroke="#22C55E"
              strokeWidth="2"
              initial={false}
              animate={{ opacity: highlightB ? 0.8 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />

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
                  DENDRITES
              </text>
            )}
            <motion.text
              x={neuronACenterX}
              y={neuronACenterY + neuronASomaRadius + 16}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              textAnchor="middle"
              letterSpacing={labelTracking}
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              initial={false}
              animate={{ opacity: detailOpacity }}
              transition={detailTransition}
            >
              SOMA
            </motion.text>
            <text
              x={(axonStartX + axonEndX) / 2}
              y={axonY - 12}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              textAnchor="middle"
              letterSpacing={labelTracking}
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
            >
              AXON
            </text>
            <motion.text
              x={neuronACenterX + neuronAThresholdRadius + 12}
              y={neuronACenterY - neuronAThresholdRadius + 4}
              fontSize={labelSize}
              fontWeight={labelWeight}
              fill={labelColor}
              textAnchor="start"
              letterSpacing={labelTracking}
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              initial={false}
              animate={{ opacity: detailOpacity }}
              transition={detailTransition}
            >
              THRESHOLD
            </motion.text>
            <motion.text
              x={neuronACenterX + neuronASomaRadius + 10}
              y={neuronACenterY + 6}
              fontSize={hintSize}
              fill={hintColor}
              textAnchor="start"
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              initial={false}
              animate={{ opacity: detailOpacity }}
              transition={detailTransition}
            >
              {neuronATotalInput}/{neuronAThreshold}
            </motion.text>
            <motion.text
              x={neuronBCenterX + neuronBSomaRadius + 10}
              y={neuronBCenterY + 6}
              fontSize={hintSize}
              fill={hintColor}
              textAnchor="start"
              fontFamily="system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"
              initial={false}
              animate={{ opacity: detailOpacity }}
              transition={detailTransition}
            >
              {neuronBInput}/{neuronBThreshold}
            </motion.text>
          </g>
        </g>
      </svg>
    </div>
  )
}

export default BiologyDiagram
