import { useEffect, useRef, useState } from 'react'
import { useNeuronAnimation } from '../../hooks/useNeuronAnimation'

/**
 * AnnDiagram - Artificial Neural Network visualization
 * 
 * EXTENDED CIRCUIT SUPPORT:
 * - Same geometry and animation as BiologyDiagram
 * - Demonstrates divergent connections in ANN terms
 * - Cleaner, more abstract styling
 * 
 * "A symbolic reinterpretation of the biology system"
 */
function AnnDiagram({
  inputs,
  neuronATotalInput,
  neuronAThreshold,
  neuronAFires,
  neuronBInput,
  neuronBThreshold,
  neuronBFires,
  neuronCInput = 0,
  neuronCThreshold = 1,
  neuronCFires = false,
  showExtendedCircuit = false,
  isMobile = false,
  isSimpleMode = true,
  replaySignal = 0,
  onInteractionLockChange
}) {
  const [bVisualInput, setBVisualInput] = useState(0)
  const [cVisualInput, setCVisualInput] = useState(0)

  // Refs for Neuron A
  const somaFillARef = useRef(null)
  const somaFillLineARef = useRef(null)
  const thresholdRingARef = useRef(null)
  const pulseRef = useRef(null)
  const synapseRefs = useRef([])
  
  // Refs for Neuron B
  const somaFillBRef = useRef(null)
  const somaFillLineBRef = useRef(null)
  const thresholdRingBRef = useRef(null)
  const axonSynapseBRef = useRef(null)
  
  // Refs for Neuron C
  const somaFillCRef = useRef(null)
  const somaFillLineCRef = useRef(null)
  const thresholdRingCRef = useRef(null)
  const axonSynapseCRef = useRef(null)
  const pulseBranchRef = useRef(null)

  // === DIMENSIONS ===
  const svgWidth = isMobile && typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 800
  const svgHeight = showExtendedCircuit ? 380 : 300

  const stagePaddingX = 20
  const stagePaddingY = 20
  const stageWidth = svgWidth - stagePaddingX * 2
  const stageHeight = svgHeight - stagePaddingY * 2
  
  // === NODE POSITIONING ===
  const neuronACenterX = stageWidth * 0.32
  const centerY = stageHeight / 2
  const neuronRadius = 52
  const neuronThresholdRadius = neuronRadius * 0.72

  // Node B position
  const neuronBCenterX = stageWidth * 0.72
  const neuronBCenterY = showExtendedCircuit ? stageHeight * 0.35 : stageHeight / 2

  // Node C position (only when extended)
  const neuronCCenterX = stageWidth * 0.72
  const neuronCCenterY = stageHeight * 0.65

  // === CONNECTION PATHS ===
  const axonStartX = neuronACenterX + neuronRadius
  const synapticGap = 20
  
  const branchPointX = showExtendedCircuit ? stageWidth * 0.52 : neuronBCenterX - neuronRadius - synapticGap
  const branchPointY = centerY
  
  const axonEndBX = neuronBCenterX - neuronRadius - synapticGap
  const axonEndBY = neuronBCenterY
  const axonEndCX = neuronCCenterX - neuronRadius - synapticGap
  const axonEndCY = neuronCCenterY
  
  // === INPUT CONFIGURATION ===
  const inputStartX = 30
  const inputValues = inputs.length > 0 ? inputs : Array.from({ length: 4 }, () => 0)
  const numInputs = inputValues.length
  
  const inputSpacing = 32
  const totalInputHeight = (numInputs - 1) * inputSpacing
  const inputStartY = centerY - totalInputHeight / 2
  const inputYPositions = inputValues.map((_, i) => inputStartY + i * inputSpacing)

  const somaDiameter = neuronRadius * 2

  // === FILL CALCULATIONS ===
  const calculateFillHeight = (totalInput, threshold, somaRad, thresholdRad) => {
    const somaDiam = somaRad * 2
    const thresholdHeight = thresholdRad * 2
    if (totalInput <= 0) return 0
    const ratio = totalInput / Math.max(threshold, 1)
    if (ratio <= 1) {
      return thresholdHeight * ratio
    } else {
      const excessRatio = ratio - 1
      const maxExcess = (somaDiam - thresholdHeight) * 0.85
      const dampedExcess = maxExcess * (1 - Math.exp(-excessRatio * 0.8))
      return thresholdHeight + dampedExcess
    }
  }
  
  const fillHeightA = calculateFillHeight(neuronATotalInput, neuronAThreshold, neuronRadius, neuronThresholdRadius)
  const fillHeightB = calculateFillHeight(bVisualInput, neuronBThreshold, neuronRadius, neuronThresholdRadius)
  const fillHeightC = calculateFillHeight(cVisualInput, neuronCThreshold, neuronRadius, neuronThresholdRadius)
  
  const fillTopYA = centerY + neuronRadius - fillHeightA
  const fillTopYB = neuronBCenterY + neuronRadius - fillHeightB
  const fillTopYC = neuronCCenterY + neuronRadius - fillHeightC

  // Ratios for visual state
  const ratioA = neuronATotalInput / Math.max(neuronAThreshold, 1)
  const ratioB = bVisualInput / Math.max(neuronBThreshold, 1)
  const ratioC = cVisualInput / Math.max(neuronCThreshold, 1)
  const nearThresholdA = ratioA >= 0.85 && ratioA < 1
  const nearThresholdB = ratioB >= 0.85 && ratioB < 1
  const nearThresholdC = ratioC >= 0.85 && ratioC < 1
  const visualBFires = bVisualInput > 0 ? neuronBFires : false
  const visualCFires = cVisualInput > 0 ? neuronCFires : false

  // === VISUAL STATES ===
  const thresholdRingStroke = '#F59E0B'
  const thresholdRingDash = '6 4'
  const thresholdRingWidth = 2
  const thresholdRingOpacityA = neuronAFires ? 0.35 : nearThresholdA ? 0.8 : 0.45
  const thresholdRingOpacityB = visualBFires ? 0.35 : nearThresholdB ? 0.8 : 0.45
  const thresholdRingOpacityC = visualCFires ? 0.35 : nearThresholdC ? 0.8 : 0.45
  const fillOpacityA = neuronAFires ? 0.85 : nearThresholdA ? 0.78 : 0.68
  const fillOpacityB = visualBFires ? 0.85 : nearThresholdB ? 0.78 : 0.68
  const fillOpacityC = visualCFires ? 0.85 : nearThresholdC ? 0.78 : 0.68

  const inputMax = Math.max(...inputValues, 1)
  const showDetailed = !isSimpleMode

  // === COLORS ===
  const nodeStroke = '#1E293B'
  const inputColor = '#64748B'
  const inputActiveColor = '#3B82F6'
  const fillColor = '#34D399'
  const fillColorFiring = '#10B981'
  const connectionColor = '#94A3B8'
  const weightColor = '#6366F1'
  const signalColor = '#3B82F6'
  const labelColor = '#64748B'

  useNeuronAnimation({
    neuronAFires,
    neuronBInput,
    neuronCInput,
    inputValues,
    neuronAThreshold,
    axonStartX,
    axonEndBX,
    axonEndBY,
    axonEndCX,
    axonEndCY,
    branchPointX,
    branchPointY,
    axonY: centerY,
    fillTopYA,
    fillHeightA,
    fillTopYB,
    fillHeightB,
    fillTopYC,
    fillHeightC,
    fillOpacityA,
    fillOpacityB,
    fillOpacityC,
    thresholdRingOpacityA,
    thresholdRingOpacityB,
    thresholdRingOpacityC,
    somaFillARef,
    somaFillLineARef,
    somaFillBRef,
    somaFillLineBRef,
    somaFillCRef,
    somaFillLineCRef,
    thresholdRingARef,
    thresholdRingBRef,
    thresholdRingCRef,
    pulseRef,
    pulseBranchRef,
    axonSynapseBRef,
    axonSynapseCRef,
    synapseRefs,
    setBVisualInput,
    setCVisualInput,
    showExtendedCircuit,
    replaySignal,
    onInteractionLockChange,
  })

  useEffect(() => {
    if (!neuronAFires || neuronBInput <= 0) {
      const frame = requestAnimationFrame(() => setBVisualInput(0))
      return () => cancelAnimationFrame(frame)
    }
  }, [neuronAFires, neuronBInput])

  useEffect(() => {
    if (!neuronAFires || neuronCInput <= 0) {
      const frame = requestAnimationFrame(() => setCVisualInput(0))
      return () => cancelAnimationFrame(frame)
    }
  }, [neuronAFires, neuronCInput])

  const generateInputPath = (startX, startY, endX, endY, index) => {
    const midX = (startX + endX) / 2
    const offsetY = (index - (numInputs - 1) / 2) * 4
    return `M ${startX} ${startY} Q ${midX} ${startY + offsetY}, ${endX} ${endY}`
  }

  // Render a node (reusable for all neurons)
  const renderNode = (id, cx, cy, fillHeight, fillTopY, fillOpacity, thresholdOpacity, fires, gradientId, clipId, somaFillRef, somaFillLineRef, thresholdRingRef) => (
    <g id={id}>
      <circle
        cx={cx}
        cy={cy}
        r={neuronRadius}
        fill={`url(#${gradientId})`}
        stroke={fires ? '#059669' : nodeStroke}
        strokeWidth={fires ? 3 : 2}
      />
      {fillHeight > 0 && (
        <>
          <rect
            x={cx - neuronRadius}
            y={fillTopY}
            width={somaDiameter}
            height={fillHeight}
            fill={fires ? fillColorFiring : fillColor}
            clipPath={`url(#${clipId})`}
            opacity={fillOpacity}
            ref={somaFillRef}
          />
          <line
            x1={cx - neuronRadius + 10}
            x2={cx + neuronRadius - 10}
            y1={fillTopY}
            y2={fillTopY}
            stroke="#059669"
            strokeWidth={1}
            clipPath={`url(#${clipId})`}
            opacity={fillOpacity * 0.7}
            ref={somaFillLineRef}
          />
        </>
      )}
      <circle
        cx={cx}
        cy={cy}
        r={neuronThresholdRadius}
        fill="none"
        stroke={thresholdRingStroke}
        strokeWidth={thresholdRingWidth}
        strokeDasharray={thresholdRingDash}
        strokeLinecap="round"
        opacity={thresholdOpacity}
        ref={thresholdRingRef}
      />
    </g>
  )

  return (
    <div style={{
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '12px',
    }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="nodeGradientA" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="nodeGradientB" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="nodeGradientC" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          
          <clipPath id="somaClipA">
            <circle cx={neuronACenterX} cy={centerY} r={neuronRadius - 2} />
          </clipPath>
          <clipPath id="somaClipB">
            <circle cx={neuronBCenterX} cy={neuronBCenterY} r={neuronRadius - 2} />
          </clipPath>
          <clipPath id="somaClipC">
            <circle cx={neuronCCenterX} cy={neuronCCenterY} r={neuronRadius - 2} />
          </clipPath>
        </defs>

        <g transform={`translate(${stagePaddingX}, ${stagePaddingY})`}>
          
          {/* ===== INPUT CONNECTIONS ===== */}
          {inputValues.map((input, index) => {
            const inputY = inputYPositions[index]
            const endX = neuronACenterX - neuronRadius + 2
            const endY = centerY - 20 + index * 10
            const inputOpacity = Math.min(1, Math.max(0.25, input / inputMax))
            const weightNorm = Math.min(1, Math.max(0, input / inputMax))
            const inputPath = generateInputPath(inputStartX, inputY, endX, endY, index)
            const weightRadius = 4 + weightNorm * 2
            const weightOpacity = 0.35 + weightNorm * 0.55

            return (
              <g key={index}>
                <path
                  d={inputPath}
                  stroke={input > 0 ? inputActiveColor : inputColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.3 + inputOpacity * 0.5}
                />
                <circle
                  cx={inputStartX}
                  cy={inputY}
                  r={4}
                  fill={input > 0 ? inputActiveColor : inputColor}
                  opacity={inputOpacity}
                />
                <circle
                  cx={endX}
                  cy={endY}
                  r={weightRadius}
                  fill={weightColor}
                  opacity={weightOpacity}
                  ref={(node) => { synapseRefs.current[index] = node }}
                />
                {showDetailed && (
                  <text x={endX + 10} y={endY + 3} fontSize="9" fill={labelColor} opacity={0.7}>
                    w{index + 1}
                  </text>
                )}
              </g>
            )
          })}

          {/* ===== NODE A ===== */}
          {renderNode('nodeA', neuronACenterX, centerY, fillHeightA, fillTopYA, fillOpacityA, thresholdRingOpacityA, neuronAFires, 'nodeGradientA', 'somaClipA', somaFillARef, somaFillLineARef, thresholdRingARef)}
          
          {showDetailed && (
            <text x={neuronACenterX} y={centerY + 5} fontSize="16" fontWeight="500" fill="#475569" textAnchor="middle" style={{ fontFamily: 'system-ui, sans-serif' }}>
              Σ
            </text>
          )}

          {/* ===== OUTPUT CONNECTIONS ===== */}
          <g id="connections">
            {showExtendedCircuit ? (
              <>
                {/* Main connection to branch */}
                <line
                  x1={axonStartX}
                  y1={centerY}
                  x2={branchPointX}
                  y2={branchPointY}
                  stroke={connectionColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={neuronAFires ? 0.85 : 0.45}
                />
                {/* Branch to B */}
                <path
                  d={`M ${branchPointX} ${branchPointY} Q ${branchPointX + 25} ${(branchPointY + axonEndBY) / 2} ${axonEndBX} ${axonEndBY}`}
                  stroke={connectionColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                  opacity={neuronAFires ? 0.85 : 0.45}
                />
                {/* Branch to C */}
                <path
                  d={`M ${branchPointX} ${branchPointY} Q ${branchPointX + 25} ${(branchPointY + axonEndCY) / 2} ${axonEndCX} ${axonEndCY}`}
                  stroke={connectionColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  fill="none"
                  opacity={neuronAFires ? 0.85 : 0.45}
                />
                {/* Branch point marker */}
                <circle cx={branchPointX} cy={branchPointY} r={3} fill={connectionColor} opacity={0.7} />
              </>
            ) : (
              <line
                x1={axonStartX}
                y1={centerY}
                x2={axonEndBX}
                y2={axonEndBY}
                stroke={connectionColor}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={neuronAFires ? 0.85 : 0.45}
              />
            )}
            
            {/* Weight node to B */}
            <circle cx={axonEndBX} cy={axonEndBY} r={5} fill={weightColor} opacity={0.4} ref={axonSynapseBRef} />
            
            {/* Weight node to C (when extended) */}
            {showExtendedCircuit && (
              <circle cx={axonEndCX} cy={axonEndCY} r={5} fill={weightColor} opacity={0.4} ref={axonSynapseCRef} />
            )}
            
            {/* Signal bead */}
            <ellipse
              cx={axonStartX}
              cy={centerY}
              rx={7}
              ry={4}
              fill={signalColor}
              stroke="#1D4ED8"
              strokeWidth={1}
              opacity={0}
              ref={pulseRef}
            />
            
            {/* Branch signal bead */}
            {showExtendedCircuit && (
              <ellipse
                cx={branchPointX}
                cy={branchPointY}
                rx={7}
                ry={4}
                fill={signalColor}
                stroke="#1D4ED8"
                strokeWidth={1}
                opacity={0}
                ref={pulseBranchRef}
              />
            )}
          </g>

          {/* ===== NODE B ===== */}
          <g id="nodeB">
            <circle cx={neuronBCenterX - neuronRadius} cy={neuronBCenterY} r={4} fill={weightColor} opacity={0.4} />
            {renderNode('nodeBSoma', neuronBCenterX, neuronBCenterY, fillHeightB, fillTopYB, fillOpacityB, thresholdRingOpacityB, visualBFires, 'nodeGradientB', 'somaClipB', somaFillBRef, somaFillLineBRef, thresholdRingBRef)}
            {showDetailed && (
              <text x={neuronBCenterX} y={neuronBCenterY + 5} fontSize="16" fontWeight="500" fill="#475569" textAnchor="middle" style={{ fontFamily: 'system-ui, sans-serif' }}>
                Σ
              </text>
            )}
          </g>

          {/* ===== NODE C (when extended) ===== */}
          {showExtendedCircuit && (
            <g id="nodeC">
              <circle cx={neuronCCenterX - neuronRadius} cy={neuronCCenterY} r={4} fill={weightColor} opacity={0.4} />
              {renderNode('nodeCSoma', neuronCCenterX, neuronCCenterY, fillHeightC, fillTopYC, fillOpacityC, thresholdRingOpacityC, visualCFires, 'nodeGradientC', 'somaClipC', somaFillCRef, somaFillLineCRef, thresholdRingCRef)}
              {showDetailed && (
                <text x={neuronCCenterX} y={neuronCCenterY + 5} fontSize="16" fontWeight="500" fill="#475569" textAnchor="middle" style={{ fontFamily: 'system-ui, sans-serif' }}>
                  Σ
                </text>
              )}
            </g>
          )}

          {/* ===== LABELS ===== */}
          {showDetailed && (
            <g id="labels" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <text x={inputStartX} y={inputYPositions[0] - 18} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="start">
                inputs
              </text>
              <text x={neuronACenterX} y={centerY + neuronRadius + 20} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                node A
              </text>
              {showExtendedCircuit ? (
                <>
                  <text x={neuronBCenterX} y={neuronBCenterY - neuronRadius - 8} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                    node B
                  </text>
                  <text x={neuronCCenterX} y={neuronCCenterY + neuronRadius + 16} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                    node C
                  </text>
                </>
              ) : (
                <text x={neuronBCenterX} y={neuronBCenterY + neuronRadius + 20} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                  node B
                </text>
              )}
            </g>
          )}

        </g>
      </svg>
    </div>
  )
}

export default AnnDiagram
