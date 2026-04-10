/**
 * NeuronBioAnnMapping - Static explanatory figure showing biological neuron vs ANN
 * 
 * Side-by-side comparison with clear visual mapping between biological and artificial neuron parts.
 * Designed for high school students (grades 8-12).
 */
function NeuronBioAnnMapping() {
  const svgWidth = 900
  const svgHeight = 320
  const cardPadding = 24

  // Left side (Biological neuron) positioning
  const bioCenterX = svgWidth * 0.25
  const bioCenterY = svgHeight / 2
  const bioSomaRadius = 50
  const bioThresholdRadius = 35 // Inside the soma

  // Right side (ANN neuron) positioning
  const annCenterX = svgWidth * 0.75
  const annCenterY = svgHeight / 2
  const annNeuronRadius = 50
  const annThresholdRadius = 35 // Inside the neuron

  // Downstream neuron (Neuron B) positioning
  const neuronBCenterX = bioCenterX + 180
  const neuronBCenterY = bioCenterY
  const neuronBSomaRadius = 35
  const neuronBThresholdRadius = 25

  // Input positions for ANN
  const inputStartX = annCenterX - 120
  const inputYPositions = [
    annCenterY - 45,
    annCenterY - 15,
    annCenterY + 15,
    annCenterY + 45
  ]

  // Dendrite positions for biological neuron
  const dendriteYPositions = [
    bioCenterY - 40,
    bioCenterY - 15,
    bioCenterY + 10,
    bioCenterY + 35
  ]
  const dendriteStartX = bioCenterX - 100

  return (
    <div style={{
      backgroundColor: '#F7F7F7',
      borderRadius: '12px',
      padding: `${cardPadding}px`,
      marginBottom: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <svg
        width="100%"
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block' }}
      >
        {/* ===== LEFT: BIOLOGICAL NEURON ===== */}
        <g id="biological-neuron">
          {/* Dendrites (3-4 branching curves) */}
          {dendriteYPositions.map((dendriteY, index) => {
            const endX = bioCenterX - bioSomaRadius
            const endY = bioCenterY - 30 + index * 15
            const controlX = dendriteStartX + (endX - dendriteStartX) * 0.4
            const controlY = dendriteY + (endY - dendriteY) * 0.3

            return (
              <g key={index}>
                {/* Dendrite path */}
                <path
                  d={`M ${dendriteStartX} ${dendriteY} Q ${controlX} ${controlY} ${endX} ${endY}`}
                  stroke="#57A5FF"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.6"
                />
                
                {/* Signal pulses along dendrite (2-3 small circles) */}
                {[0.3, 0.6, 0.9].map((t, pulseIndex) => {
                  const pulseX = dendriteStartX + (endX - dendriteStartX) * t
                  const pulseY = dendriteY + (endY - dendriteY) * t * 0.5
                  return (
                    <circle
                      key={pulseIndex}
                      cx={pulseX}
                      cy={pulseY}
                      r="4"
                      fill="#57A5FF"
                      opacity="0.9"
                    />
                  )
                })}
              </g>
            )
          })}

          {/* Dendrites label */}
          <text
            x={dendriteStartX - 10}
            y={bioCenterY - 50}
            fontSize="11"
            fontWeight="600"
            fill="#333"
            textAnchor="end"
          >
            dendrites
          </text>

          {/* Soma (cell body) */}
          <g>
            {/* Soma outline */}
            <circle
              cx={bioCenterX}
              cy={bioCenterY}
              r={bioSomaRadius}
              fill="#57FFB0"
              stroke="#32D97B"
              strokeWidth="2"
              opacity="0.9"
            />
            
            {/* Membrane potential / charge building up (lighter inner disc) */}
            <circle
              cx={bioCenterX}
              cy={bioCenterY}
              r={bioThresholdRadius * 0.85}
              fill="#A8F5D0"
              opacity="0.6"
            />
            
            {/* Threshold ring (dashed, INSIDE the soma) */}
            <circle
              cx={bioCenterX}
              cy={bioCenterY}
              r={bioThresholdRadius}
              fill="none"
              stroke="#FF9E45"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.9"
            />
            
            {/* Threshold label */}
            <text
              x={bioCenterX + bioThresholdRadius + 8}
              y={bioCenterY + 4}
              fontSize="10"
              fill="#FF9E45"
              fontWeight="500"
            >
              threshold
            </text>
          </g>

          {/* Soma label */}
          <text
            x={bioCenterX}
            y={bioCenterY - bioSomaRadius - 15}
            fontSize="12"
            fontWeight="600"
            fill="#333"
            textAnchor="middle"
          >
            Biological neuron
          </text>

          {/* Soma part label */}
          <text
            x={bioCenterX}
            y={bioCenterY + bioSomaRadius + 15}
            fontSize="10"
            fill="#666"
            textAnchor="middle"
          >
            soma
          </text>

          {/* Axon */}
          <g>
            {/* Axon cable */}
            <line
              x1={bioCenterX + bioSomaRadius}
              y1={bioCenterY}
              x2={neuronBCenterX - neuronBSomaRadius}
              y2={neuronBCenterY}
              stroke="#94A3B8"
              strokeWidth="3"
              opacity="0.5"
            />
            
            {/* Action potential spike (bright segment near soma) */}
            <line
              x1={bioCenterX + bioSomaRadius}
              y1={bioCenterY - 8}
              x2={bioCenterX + bioSomaRadius + 25}
              y2={bioCenterY}
              stroke="#32D97B"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1={bioCenterX + bioSomaRadius + 25}
              y1={bioCenterY}
              x2={bioCenterX + bioSomaRadius + 35}
              y2={bioCenterY + 8}
              stroke="#32D97B"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Axon label */}
            <text
              x={bioCenterX + bioSomaRadius + 20}
              y={bioCenterY - 15}
              fontSize="10"
              fill="#666"
            >
              axon
            </text>
          </g>

          {/* Downstream neuron (Neuron B) */}
          <g>
            {/* Neuron B soma */}
            <circle
              cx={neuronBCenterX}
              cy={neuronBCenterY}
              r={neuronBSomaRadius}
              fill="#57FFB0"
              stroke="#94A3B8"
              strokeWidth="2"
              opacity="0.7"
            />
            
            {/* Neuron B threshold ring */}
            <circle
              cx={neuronBCenterX}
              cy={neuronBCenterY}
              r={neuronBThresholdRadius}
              fill="none"
              stroke="#FF9E45"
              strokeWidth="2"
              strokeDasharray="3 3"
              opacity="0.7"
            />
          </g>
        </g>

        {/* ===== RIGHT: ARTIFICIAL NEURON (ANN) ===== */}
        <g id="artificial-neuron">
          {/* Inputs (x1-x4) */}
          {inputYPositions.map((inputY, index) => {
            const convergeY = annCenterY - 20 + index * 10
            
            return (
              <g key={index}>
                {/* Connection line from input to neuron */}
                <path
                  d={`M ${inputStartX} ${inputY} Q ${annCenterX - annNeuronRadius - 15} ${inputY} ${annCenterX - annNeuronRadius} ${convergeY}`}
                  stroke="#57A5FF"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.5"
                />
                
                {/* Input circle (pill shape) */}
                <ellipse
                  cx={inputStartX}
                  cy={inputY}
                  rx="10"
                  ry="8"
                  fill="#57A5FF"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                />
                
                {/* Input label */}
                <text
                  x={inputStartX}
                  y={inputY - 12}
                  fontSize="10"
                  fontWeight="600"
                  fill="#333"
                  textAnchor="middle"
                >
                  x{index + 1}
                </text>
              </g>
            )
          })}

          {/* Inputs label */}
          <text
            x={inputStartX - 10}
            y={annCenterY - 60}
            fontSize="11"
            fontWeight="600"
            fill="#333"
            textAnchor="end"
          >
            inputs
          </text>

          {/* ANN neuron body */}
          <g>
            {/* Neuron outline */}
            <circle
              cx={annCenterX}
              cy={annCenterY}
              r={annNeuronRadius}
              fill="#57FFB0"
              stroke="#32D97B"
              strokeWidth="2"
              opacity="0.9"
            />
            
            {/* Summation hint (faint vertical bars suggesting buildup) */}
            <g opacity="0.4">
              {[-20, -10, 0, 10, 20].map((offset, i) => (
                <line
                  key={i}
                  x1={annCenterX + offset}
                  y1={annCenterY + annThresholdRadius * 0.7}
                  x2={annCenterX + offset}
                  y2={annCenterY + annNeuronRadius * 0.8}
                  stroke="#57A5FF"
                  strokeWidth="2"
                />
              ))}
            </g>
            
            {/* Partial radial fill suggesting buildup */}
            <circle
              cx={annCenterX}
              cy={annCenterY}
              r={annThresholdRadius * 0.85}
              fill="#A8F5D0"
              opacity="0.5"
            />
            
            {/* Threshold ring (dashed, INSIDE the neuron) */}
            <circle
              cx={annCenterX}
              cy={annCenterY}
              r={annThresholdRadius}
              fill="none"
              stroke="#FF9E45"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.9"
            />
            
            {/* Σ symbol (summation) */}
            <text
              x={annCenterX}
              y={annCenterY - 5}
              fontSize="24"
              fontWeight="700"
              fill="#333"
              textAnchor="middle"
            >
              Σ
            </text>
            
            {/* Activation threshold label */}
            <text
              x={annCenterX + annThresholdRadius + 8}
              y={annCenterY + 4}
              fontSize="10"
              fill="#FF9E45"
              fontWeight="500"
            >
              activation threshold
            </text>
          </g>

          {/* ANN label */}
          <text
            x={annCenterX}
            y={annCenterY - annNeuronRadius - 15}
            fontSize="12"
            fontWeight="600"
            fill="#333"
            textAnchor="middle"
          >
            Artificial neuron (ANN)
          </text>

          {/* Output connection */}
          <g>
            {/* Output line */}
            <line
              x1={annCenterX + annNeuronRadius}
              y1={annCenterY}
              x2={annCenterX + annNeuronRadius + 50}
              y2={annCenterY}
              stroke="#32D97B"
              strokeWidth="3"
              opacity="0.7"
            />
            
            {/* Output indicator (glowing bar) */}
            <rect
              x={annCenterX + annNeuronRadius + 50}
              y={annCenterY - 8}
              width="20"
              height="16"
              rx="8"
              fill="#32D97B"
              stroke="#1AD05F"
              strokeWidth="2"
              opacity="0.9"
            />
            
            {/* Output label */}
            <text
              x={annCenterX + annNeuronRadius + 60}
              y={annCenterY - 15}
              fontSize="10"
              fill="#666"
              textAnchor="middle"
            >
              output y
            </text>
          </g>
        </g>
      </svg>

      {/* Mapping visualization */}
      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #E2E8F0'
      }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          Biological → Artificial
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '20px 40px',
          fontSize: '12px',
          color: '#666'
        }}>
          {/* Mapping items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#57A5FF'
            }} />
            <span><strong style={{ color: '#333' }}>Dendrites</strong> → Inputs (x1–x4)</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#57A5FF'
            }} />
            <span><strong style={{ color: '#333' }}>Synapses</strong> → Weights</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#57FFB0'
            }} />
            <span><strong style={{ color: '#333' }}>Soma</strong> → Summation (Σ)</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FF9E45'
            }} />
            <span><strong style={{ color: '#333' }}>Threshold potential</strong> → Activation threshold</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#32D97B'
            }} />
            <span><strong style={{ color: '#333' }}>Axon</strong> → Output y</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NeuronBioAnnMapping


