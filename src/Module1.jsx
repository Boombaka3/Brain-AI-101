import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AnnDiagram from './components/AnnDiagram.jsx'
import BiologyDiagram from './BiologyDiagram.jsx'

const INITIAL_INPUTS = [2, 3, 1, 0]
const INITIAL_THRESHOLD = 5

// Pure logic: add inputs and compare with threshold
function calculateTotal(inputs) {
  return inputs.reduce((sum, value) => sum + value, 0)
}

function neuronFires(totalInput, threshold) {
  return totalInput >= threshold
}

// Propagation logic: if Neuron A fires, Neuron B receives +1, else 0
function getNeuronBInput(neuronAFires) {
  return neuronAFires ? 1 : 0
}

// Fixed threshold for Neuron B (non-editable)
const NEURON_B_THRESHOLD = 1

function Module1({ onContinue }) {
  const [inputs, setInputs] = useState(INITIAL_INPUTS)
  const [threshold, setThreshold] = useState(INITIAL_THRESHOLD)
  const [viewMode, setViewMode] = useState('biology')
  const [isSimpleMode, setIsSimpleMode] = useState(true)
  const [attempts, setAttempts] = useState(0)
  const [bestScore, setBestScore] = useState(null)

  // Neuron A calculations (unchanged)
  const neuronATotalInput = calculateTotal(inputs)
  const neuronAFires = neuronFires(neuronATotalInput, threshold)
  
  // Neuron B calculations (propagation from Neuron A)
  const neuronBInput = getNeuronBInput(neuronAFires)
  const neuronBFires = neuronFires(neuronBInput, NEURON_B_THRESHOLD)

  // Track attempts for gamification
  useEffect(() => {
    if (neuronBFires) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      if (!bestScore || neuronATotalInput < bestScore) {
        setBestScore(neuronATotalInput)
      }
    }
  }, [neuronBFires])

  const handleInputChange = (index, newValue) => {
    const updated = inputs.map((value, i) => (i === index ? newValue : value))
    setInputs(updated)
  }

  const handleThresholdChange = (newValue) => {
    setThreshold(newValue)
  }

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  }

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  }

  return (
    <div style={{ backgroundColor: '#F3F6FB', minHeight: '100vh', padding: '32px 0' }}>
      <div style={containerStyle}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#0F172A', margin: '0 0 8px 0' }}>
                Module 1: Meet the Neuron
              </h1>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
                Explore how neurons process information and make decisions
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Simple/Detailed Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#0F172A' }}>
                  {isSimpleMode ? 'Simple' : 'Detailed'}
                </span>
                <button
                  onClick={() => setIsSimpleMode(!isSimpleMode)}
                  style={{
                    width: '44px',
                    height: '24px',
                    backgroundColor: isSimpleMode ? '#CBD5E1' : '#57A5FF',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: isSimpleMode ? '2px' : '22px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </button>
              </div>
              
              {/* View Mode Toggle */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('biology')}
                  style={{
                    ...buttonStyle,
                    backgroundColor: viewMode === 'biology' ? '#57A5FF' : 'transparent',
                    color: viewMode === 'biology' ? 'white' : '#57A5FF',
                    border: '1px solid #57A5FF',
                  }}
                >
                  Biology
                </button>
                <button
                  onClick={() => setViewMode('ann')}
                  style={{
                    ...buttonStyle,
                    backgroundColor: viewMode === 'ann' ? '#57A5FF' : 'transparent',
                    color: viewMode === 'ann' ? 'white' : '#57A5FF',
                    border: '1px solid #57A5FF',
                  }}
                >
                  ANN
                </button>
              </div>
              
              <button
                onClick={onContinue}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#57A5FF',
                  color: 'white',
                }}
              >
                Continue to Module 2
              </button>
            </div>
          </div>
        </motion.div>

        {/* Diagram Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div style={cardStyle}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0F172A', marginBottom: '16px', fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
              {viewMode === 'biology' ? 'Biological Neuron Structure' : 'Artificial Neural Network Structure'}
            </h2>
            
            <AnimatePresence mode="wait">
              {viewMode === 'biology' ? (
                <motion.div
                  key="biology"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <BiologyDiagram
                    inputs={inputs}
                    neuronATotalInput={neuronATotalInput}
                    neuronAThreshold={threshold}
                    neuronAFires={neuronAFires}
                    neuronBInput={neuronBInput}
                    neuronBThreshold={NEURON_B_THRESHOLD}
                    neuronBFires={neuronBFires}
                    isMobile={false}
                    isSimpleMode={isSimpleMode}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="ann"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnnDiagram
                    inputs={inputs}
                    neuronATotalInput={neuronATotalInput}
                    neuronAThreshold={threshold}
                    neuronAFires={neuronAFires}
                    neuronBInput={neuronBInput}
                    neuronBThreshold={NEURON_B_THRESHOLD}
                    neuronBFires={neuronBFires}
                    isMobile={false}
                    isSimpleMode={isSimpleMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Challenge Text */}
            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#F8FBFD', borderRadius: '8px', border: '1px solid #D6E4F0' }}>
              <p style={{ fontSize: isSimpleMode ? '16px' : '14px', color: '#0F172A', fontWeight: '500', margin: 0 }}>
                💡 Challenge: Can you make Neuron B fire with the smallest total input?
              </p>
              {!isSimpleMode && bestScore !== null && (
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#22C55E', color: 'white', borderRadius: '4px' }}>
                    Best: {bestScore}
                  </span>
                  <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#57A5FF', color: 'white', borderRadius: '4px' }}>
                    Attempts: {attempts}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Step 1: Inputs */}
            <div style={{ ...cardStyle, flex: '1', minWidth: '300px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
                <span style={{ color: '#57A5FF', fontWeight: '700', marginRight: '8px' }}>Step 1:</span>
                Neuron A Inputs
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inputs.map((value, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: isSimpleMode ? '16px' : '14px', color: '#0F172A' }}>
                        Input {index + 1}
                      </span>
                      <span style={{ fontSize: isSimpleMode ? '18px' : '16px', fontWeight: '600', color: '#0F172A' }}>
                        {value}
                      </span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="range"
                        value={value}
                        onChange={(e) => handleInputChange(index, Number(e.target.value))}
                        min={0}
                        max={10}
                        step={1}
                        style={{
                          width: '100%',
                          height: isSimpleMode ? '8px' : '6px',
                          borderRadius: '4px',
                          background: `linear-gradient(to right, #57A5FF 0%, #57A5FF ${value * 10}%, #E2E8F0 ${value * 10}%, #E2E8F0 100%)`,
                          outline: 'none',
                          cursor: 'pointer',
                          WebkitAppearance: 'none',
                        }}
                      />
                      {!isSimpleMode && (
                        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }} title={`Weight = 1, so contribution is ${value}`}>
                          w{index + 1} = 1
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                <div style={{ padding: '16px', backgroundColor: '#F8FBFD', borderRadius: '8px', border: '1px solid #D6E4F0', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: isSimpleMode ? '16px' : '14px', fontWeight: '600', color: '#64748B' }}>
                      Total Sum
                    </span>
                    <span style={{ fontSize: isSimpleMode ? '24px' : '20px', fontWeight: '700', color: '#0F172A' }}>
                      {neuronATotalInput}
                    </span>
                  </div>
                  {!isSimpleMode && (
                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', margin: '4px 0 0 0' }}>
                      Σ = {inputs.join(' + ')} = {neuronATotalInput}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Threshold Decision */}
            <div style={{ ...cardStyle, flex: '1', minWidth: '300px', border: '2px solid #D6E4F0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
                <span style={{ color: '#57A5FF', fontWeight: '700', marginRight: '8px' }}>Step 2:</span>
                Threshold Decision
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: isSimpleMode ? '16px' : '14px', color: '#0F172A' }}>
                      Threshold Level
                    </span>
                    <span style={{ fontSize: isSimpleMode ? '18px' : '16px', fontWeight: '600', color: '#0F172A' }}>
                      {threshold}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="range"
                      value={threshold}
                      onChange={(e) => handleThresholdChange(Number(e.target.value))}
                      min={0}
                      max={30}
                      step={1}
                      style={{
                        width: '100%',
                        height: isSimpleMode ? '8px' : '6px',
                        borderRadius: '4px',
                        background: `linear-gradient(to right, #FF9E45 0%, #FF9E45 ${(threshold / 30) * 100}%, #E2E8F0 ${(threshold / 30) * 100}%, #E2E8F0 100%)`,
                        outline: 'none',
                        cursor: 'pointer',
                        WebkitAppearance: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Comparison Display */}
                <motion.div
                  animate={{
                    scale: neuronAFires ? [1, 1.02, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '8px',
                      backgroundColor: neuronAFires ? '#DCFFEC' : '#F8FBFD',
                      border: neuronAFires ? '3px solid #22C55E' : '2px solid #D6E4F0',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px 0' }}>
                      Comparison
                    </p>
                    <p style={{ fontSize: isSimpleMode ? '36px' : '32px', fontWeight: '700', color: neuronAFires ? '#166534' : '#475569', marginBottom: '8px', margin: '0 0 8px 0' }}>
                      {neuronATotalInput} {neuronAFires ? '≥' : '<'} {threshold}
                    </p>
                    <p style={{ fontSize: isSimpleMode ? '16px' : '14px', color: neuronAFires ? '#15803D' : '#64748B', fontWeight: '500', margin: 0 }}>
                      {neuronAFires ? 'Neuron A fires!' : 'Neuron A does not fire'}
                    </p>
                  </div>
                </motion.div>

                {!isSimpleMode && (
                  <div style={{ padding: '16px', backgroundColor: '#F8FBFD', borderRadius: '8px', border: '1px solid #D6E4F0' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '8px', margin: '0 0 8px 0' }}>
                      Propagation Rule:
                    </p>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 4px 0' }}>
                      If Neuron A fires → Neuron B receives 1
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                      If Neuron A does not fire → Neuron B receives 0
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Neuron B */}
            <div style={{ ...cardStyle, flex: '1', minWidth: '300px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0F172A', marginBottom: '16px' }}>
                <span style={{ color: '#57A5FF', fontWeight: '700', marginRight: '8px' }}>Step 3:</span>
                Neuron B
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FBFD', borderRadius: '8px', border: '1px solid #D6E4F0' }}>
                  <p style={{ fontSize: isSimpleMode ? '14px' : '12px', color: '#64748B', marginBottom: '8px', margin: '0 0 8px 0' }}>
                    Input from Neuron A
                  </p>
                  <p style={{ fontSize: isSimpleMode ? '32px' : '28px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                    {neuronBInput}
                  </p>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FBFD', borderRadius: '8px', border: '1px solid #D6E4F0' }}>
                  <p style={{ fontSize: isSimpleMode ? '14px' : '12px', color: '#64748B', marginBottom: '8px', margin: '0 0 8px 0' }}>
                    Threshold: {NEURON_B_THRESHOLD}
                  </p>
                  <p style={{ fontSize: isSimpleMode ? '20px' : '18px', fontWeight: '700', color: neuronBFires ? '#166534' : '#475569', margin: 0 }}>
                    {neuronBInput} {neuronBFires ? '≥' : '<'} {NEURON_B_THRESHOLD}
                  </p>
                </div>

                <motion.div
                  animate={{
                    scale: neuronBFires ? [1, 1.05, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    style={{
                      padding: '24px',
                      borderRadius: '8px',
                      textAlign: 'center',
                      backgroundColor: neuronBFires ? '#22C55E' : '#E2E8F0',
                      color: neuronBFires ? 'white' : '#475569',
                      border: neuronBFires ? '3px solid #166534' : '2px solid #CBD5E1',
                    }}
                  >
                    <p style={{ fontSize: isSimpleMode ? '24px' : '20px', fontWeight: '700', margin: 0 }}>
                      {neuronBFires ? 'FIRES' : 'NO FIRE'}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Module1
