import { useState, useEffect } from 'react'
import {
  SAMPLE_IMAGE, DEFAULT_KERNEL, KERNEL_PRESETS,
  computeWeightedSum, getReceptiveFieldValues
} from '../module2Config'

const SVG_W = 800
const SVG_H = 420

function ScanningSection() {
  const [convImage, setConvImage] = useState([...SAMPLE_IMAGE])
  const [kernel, setKernel] = useState([...DEFAULT_KERNEL])
  const [receptiveFieldPos, setReceptiveFieldPos] = useState({ row: 0, col: 0 })
  const [storedOutputs, setStoredOutputs] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (Object.keys(storedOutputs).length === 0) {
      const field = getReceptiveFieldValues(convImage, 0, 0)
      const sum = computeWeightedSum(field, kernel)
      setStoredOutputs({ '0,0': sum })
    }
  }, [])

  const currentField = getReceptiveFieldValues(convImage, receptiveFieldPos.row, receptiveFieldPos.col)
  const convSum = computeWeightedSum(currentField, kernel)
  const elementProducts = currentField.map((val, i) => ({ input: val, weight: kernel[i], product: val * kernel[i] }))

  const toggleConvCell = (index) => {
    const img = [...convImage]
    img[index] = img[index] === 0 ? 1 : 0
    setConvImage(img)
    const posKey = `${receptiveFieldPos.row},${receptiveFieldPos.col}`
    const field = getReceptiveFieldValues(img, receptiveFieldPos.row, receptiveFieldPos.col)
    const sum = computeWeightedSum(field, kernel)
    setStoredOutputs(prev => ({ ...prev, [posKey]: sum }))
  }

  const updateKernelValue = (index, delta) => {
    const k = [...kernel]
    k[index] = Math.max(-9, Math.min(9, k[index] + delta))
    setKernel(k)
    const posKey = `${receptiveFieldPos.row},${receptiveFieldPos.col}`
    const field = getReceptiveFieldValues(convImage, receptiveFieldPos.row, receptiveFieldPos.col)
    const sum = computeWeightedSum(field, k)
    setStoredOutputs(prev => ({ ...prev, [posKey]: sum }))
  }

  const loadKernelPreset = (name) => {
    const preset = KERNEL_PRESETS[name]
    if (!preset) return
    setKernel([...preset])
    const posKey = `${receptiveFieldPos.row},${receptiveFieldPos.col}`
    const field = getReceptiveFieldValues(convImage, receptiveFieldPos.row, receptiveFieldPos.col)
    const sum = computeWeightedSum(field, preset)
    setStoredOutputs(prev => ({ ...prev, [posKey]: sum }))
  }

  const moveReceptiveField = (row, col) => {
    if (row < 0 || row > 2 || col < 0 || col > 2 || isAnimating) return
    setIsAnimating(true)
    setReceptiveFieldPos({ row, col })
    const posKey = `${row},${col}`
    const field = getReceptiveFieldValues(convImage, row, col)
    const sum = computeWeightedSum(field, kernel)
    setStoredOutputs(prev => ({ ...prev, [posKey]: sum }))
    setTimeout(() => setIsAnimating(false), 300)
  }

  const resetConvolution = () => {
    setReceptiveFieldPos({ row: 0, col: 0 })
    const field = getReceptiveFieldValues(convImage, 0, 0)
    const sum = computeWeightedSum(field, kernel)
    setStoredOutputs({ '0,0': sum })
  }

  // Layout
  const inputGridX = 30, inputGridY = 60, inputCellSz = 34
  const kernelGridX = 250, kernelGridY = 120, kernelCellSz = 44
  const productGridX = 430, productGridY = 120, productCellSz = 44
  const outputGridX = 640, outputGridY = 120, outputCellSz = 50

  return (
    <section className="m2-section">
      <div className="m2-section-heading">
        <p className="m2-eyebrow">D. Scanning</p>
        <h2>Same Weights, Different Locations</h2>
        <p className="m2-section-subtitle">The same kernel (weights) slides across the image — this is scanning.</p>
      </div>

      <div className="m2-section-card">
        <svg width={SVG_W} height={SVG_H} className="m2-svg-block">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#94A3B8" />
            </marker>
          </defs>

          {/* Input image 5×5 */}
          <g>
            <text x={inputGridX + inputCellSz * 2.5} y={inputGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E293B">Input (5×5)</text>
            {convImage.map((val, i) => {
              const row = Math.floor(i / 5), col = i % 5
              const x = inputGridX + col * inputCellSz, y = inputGridY + row * inputCellSz
              const inField = row >= receptiveFieldPos.row && row < receptiveFieldPos.row + 3 && col >= receptiveFieldPos.col && col < receptiveFieldPos.col + 3
              return (
                <g key={i} style={{ cursor: 'pointer' }} onClick={() => toggleConvCell(i)}>
                  <rect x={x} y={y} width={inputCellSz - 2} height={inputCellSz - 2} rx={4} fill={inField ? (val ? '#3B82F6' : '#EFF6FF') : (val ? '#64748B' : '#F8FAFC')} stroke={inField ? '#8B5CF6' : (val ? '#475569' : '#E2E8F0')} strokeWidth={inField ? 2 : 1} />
                  <text x={x + (inputCellSz - 2) / 2} y={y + (inputCellSz - 2) / 2 + 4} textAnchor="middle" fontSize="12" fontWeight={inField ? '700' : '500'} fill={inField ? (val ? 'white' : '#3B82F6') : (val ? 'white' : '#94A3B8')}>{val}</text>
                </g>
              )
            })}
            <rect x={inputGridX + receptiveFieldPos.col * inputCellSz - 3} y={inputGridY + receptiveFieldPos.row * inputCellSz - 3} width={inputCellSz * 3 + 4} height={inputCellSz * 3 + 4} fill="none" stroke="#8B5CF6" strokeWidth={3} rx={6} />
            <text x={inputGridX + inputCellSz * 2.5} y={inputGridY + inputCellSz * 5 + 14} textAnchor="middle" fontSize="9" fill="#94A3B8">click to edit</text>
          </g>

          <text x={kernelGridX - 18} y={kernelGridY + kernelCellSz * 1.5 + 5} textAnchor="middle" fontSize="20" fontWeight="700" fill="#64748B">×</text>

          {/* Kernel 3×3 */}
          <g>
            <text x={kernelGridX + kernelCellSz * 1.5} y={kernelGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#8B5CF6">Weights (3×3)</text>
            {kernel.map((w, i) => {
              const row = Math.floor(i / 3), col = i % 3
              const x = kernelGridX + col * kernelCellSz, y = kernelGridY + row * kernelCellSz
              const bg = w > 0 ? '#DCFCE7' : (w < 0 ? '#FEE2E2' : '#F8FAFC')
              const border = w > 0 ? '#22C55E' : (w < 0 ? '#EF4444' : '#CBD5E1')
              const tc = w > 0 ? '#166534' : (w < 0 ? '#991B1B' : '#64748B')
              return (
                <g key={i}>
                  <rect x={x} y={y} width={kernelCellSz - 2} height={kernelCellSz - 2} rx={5} fill={bg} stroke={border} strokeWidth={2} />
                  <text x={x + (kernelCellSz - 2) / 2} y={y + (kernelCellSz - 2) / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={tc}>{w > 0 ? `+${w}` : w}</text>
                  <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, 1)}>
                    <rect x={x + kernelCellSz - 14} y={y + 2} width={10} height={10} rx={2} fill="#E2E8F0" />
                    <text x={x + kernelCellSz - 9} y={y + 10} textAnchor="middle" fontSize="9" fill="#64748B">+</text>
                  </g>
                  <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, -1)}>
                    <rect x={x + kernelCellSz - 14} y={y + kernelCellSz - 14} width={10} height={10} rx={2} fill="#E2E8F0" />
                    <text x={x + kernelCellSz - 9} y={y + kernelCellSz - 6} textAnchor="middle" fontSize="9" fill="#64748B">−</text>
                  </g>
                </g>
              )
            })}
            <text x={kernelGridX + kernelCellSz * 1.5} y={kernelGridY + kernelCellSz * 3 + 14} textAnchor="middle" fontSize="9" fill="#8B5CF6">click +/− to edit</text>
          </g>

          <text x={productGridX - 18} y={kernelGridY + kernelCellSz * 1.5 + 5} textAnchor="middle" fontSize="20" fontWeight="700" fill="#64748B">=</text>

          {/* Products 3×3 */}
          <g>
            <text x={productGridX + productCellSz * 1.5} y={productGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E293B">Products</text>
            {elementProducts.map(({ input, weight, product }, i) => {
              const row = Math.floor(i / 3), col = i % 3
              const x = productGridX + col * productCellSz, y = productGridY + row * productCellSz
              const bg = product > 0 ? '#DCFCE7' : (product < 0 ? '#FEE2E2' : '#F8FAFC')
              const border = product > 0 ? '#22C55E' : (product < 0 ? '#EF4444' : '#E2E8F0')
              const tc = product > 0 ? '#166534' : (product < 0 ? '#991B1B' : '#94A3B8')
              return (
                <g key={i}>
                  <rect x={x} y={y} width={productCellSz - 2} height={productCellSz - 2} rx={5} fill={bg} stroke={border} strokeWidth={1.5} />
                  <text x={x + (productCellSz - 2) / 2} y={y + 13} textAnchor="middle" fontSize="8" fill="#94A3B8">
                    {input}×{weight >= 0 ? (weight > 0 ? '+' : '') : ''}{weight}
                  </text>
                  <text x={x + (productCellSz - 2) / 2} y={y + (productCellSz - 2) / 2 + 8} textAnchor="middle" fontSize="14" fontWeight="700" fill={tc}>{product > 0 ? `+${product}` : product}</text>
                </g>
              )
            })}
            <rect x={productGridX} y={productGridY + productCellSz * 3 + 8} width={productCellSz * 3 - 2} height={30} rx={6} fill={convSum > 0 ? '#DCFCE7' : (convSum < 0 ? '#FEE2E2' : '#F1F5F9')} stroke={convSum > 0 ? '#22C55E' : (convSum < 0 ? '#EF4444' : '#CBD5E1')} strokeWidth={2} />
            <text x={productGridX + (productCellSz * 3 - 2) / 2} y={productGridY + productCellSz * 3 + 28} textAnchor="middle" fontSize="14" fontWeight="700" fill={convSum > 0 ? '#166534' : (convSum < 0 ? '#991B1B' : '#64748B')}>Σ = {convSum}</text>
          </g>

          {/* Arrow */}
          <path d={`M ${productGridX + productCellSz * 3 + 10} ${productGridY + productCellSz * 1.5} L ${outputGridX - 15} ${productGridY + productCellSz * 1.5}`} fill="none" stroke="#94A3B8" strokeWidth={2} markerEnd="url(#arrowhead)" />

          {/* Output map 3×3 */}
          <g>
            <text x={outputGridX + outputCellSz * 1.5} y={outputGridY - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E293B">Output (3×3)</text>
            {[0, 1, 2].map(row =>
              [0, 1, 2].map(col => {
                const x = outputGridX + col * outputCellSz
                const y = outputGridY + row * outputCellSz
                const posKey = `${row},${col}`
                const isCurrent = row === receptiveFieldPos.row && col === receptiveFieldPos.col
                const stored = storedOutputs[posKey]
                const hasVal = stored !== undefined

                let bg = '#F8FAFC', border = '#E2E8F0', tc = '#CBD5E1'
                if (hasVal) {
                  if (stored > 0) {
                    const int = Math.min(1, stored / 6)
                    bg = `rgba(16, 185, 129, ${0.15 + int * 0.5})`; border = '#10B981'; tc = '#047857'
                  } else if (stored < 0) {
                    const int = Math.min(1, Math.abs(stored) / 6)
                    bg = `rgba(239, 68, 68, ${0.15 + int * 0.5})`; border = '#EF4444'; tc = '#991B1B'
                  } else {
                    bg = '#F1F5F9'; border = '#94A3B8'; tc = '#64748B'
                  }
                }

                return (
                  <g key={posKey} style={{ cursor: 'pointer' }} onClick={() => moveReceptiveField(row, col)}>
                    <rect x={x} y={y} width={outputCellSz - 4} height={outputCellSz - 4} rx={6} fill={bg} stroke={isCurrent ? '#8B5CF6' : border} strokeWidth={isCurrent ? 3 : 1.5} />
                    <text x={x + (outputCellSz - 4) / 2} y={y + (outputCellSz - 4) / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={hasVal ? tc : '#CBD5E1'}>{hasVal ? stored : '?'}</text>
                  </g>
                )
              })
            )}
            <text x={outputGridX + outputCellSz * 1.5} y={outputGridY + outputCellSz * 3 + 14} textAnchor="middle" fontSize="9" fill="#94A3B8">click to move window</text>
          </g>

          <text x={SVG_W / 2} y={SVG_H - 15} textAnchor="middle" fontSize="12" fontWeight="500" fill="#64748B" fontStyle="italic">
            The same neuron is reused at each location.
          </text>
        </svg>

        {/* Kernel presets */}
        <div className="m2-preset-row">
          <span className="m2-preset-label">Kernel:</span>
          {Object.keys(KERNEL_PRESETS).map(name => (
            <button key={name} className="m2-preset-btn" onClick={() => loadKernelPreset(name)}>
              {name.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
          <button className="m2-preset-btn" onClick={resetConvolution}>Reset Map</button>
        </div>

        {/* Observation */}
        <div className="m2-observation m2-observation--purple">
          <p>
            {convSum === 0
              ? <><strong>Output is zero.</strong> The kernel finds no matching structure here.</>
              : convSum > 0
                ? <><strong>Positive output ({convSum}).</strong> The kernel matches the input pattern here.</>
                : <><strong>Negative output ({convSum}).</strong> The input opposes what the kernel expects.</>
            }
          </p>
        </div>

        <p className="m2-hint">
          {Object.keys(storedOutputs).length >= 9
            ? "You've scanned all positions. Try a different kernel!"
            : 'Click output cells to scan with the kernel.'}
        </p>
      </div>
    </section>
  )
}

export default ScanningSection
