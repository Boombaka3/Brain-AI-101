import { useEffect, useState } from 'react'
import {
  DEFAULT_KERNEL,
  KERNEL_PRESETS,
  KERNEL_SIZE,
  OUTPUT_SIZE,
  PADDED_SIZE,
  PADDING,
  SAMPLE_IMAGE,
  SOURCE_SIZE,
  STRIDE,
  computeWeightedSum,
  getReceptiveFieldValues,
  padImageGrid,
} from '../module2Config'

const SVG_W = 1260
const SVG_H = 500

function getCellTone(value) {
  if (value > 0) {
    return {
      bg: '#3B82F6',
      border: '#2563EB',
      text: '#FFFFFF',
    }
  }

  return {
    bg: '#F8FAFC',
    border: '#CBD5E1',
    text: '#94A3B8',
  }
}

function getOutputTone(value) {
  if (value > 0) {
    const intensity = Math.min(1, value / 6)
    return {
      bg: `rgba(59, 130, 246, ${0.18 + intensity * 0.38})`,
      border: '#7C3AED',
      text: '#4C1D95',
    }
  }

  if (value < 0) {
    const intensity = Math.min(1, Math.abs(value) / 6)
    return {
      bg: `rgba(248, 113, 113, ${0.16 + intensity * 0.34})`,
      border: '#F97316',
      text: '#9A3412',
    }
  }

  return {
    bg: '#F8FAFC',
    border: '#CBD5E1',
    text: '#64748B',
  }
}

function ScanningSection() {
  const [convImage, setConvImage] = useState([...SAMPLE_IMAGE])
  const [kernel, setKernel] = useState([...DEFAULT_KERNEL])
  const [receptiveFieldPos, setReceptiveFieldPos] = useState({ row: 0, col: 0 })
  const [storedOutputs, setStoredOutputs] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)

  const paddedImage = padImageGrid(convImage, SOURCE_SIZE, PADDING)

  useEffect(() => {
    if (Object.keys(storedOutputs).length === 0) {
      const field = getReceptiveFieldValues(paddedImage, 0, 0, PADDED_SIZE)
      const sum = computeWeightedSum(field, kernel)
      setStoredOutputs({ '0,0': sum })
    }
  }, [kernel, paddedImage, storedOutputs])

  const currentField = getReceptiveFieldValues(
    paddedImage,
    receptiveFieldPos.row,
    receptiveFieldPos.col,
    PADDED_SIZE
  )
  const convSum = computeWeightedSum(currentField, kernel)
  const scoreParts = currentField.map((val, i) => ({ input: val, weight: kernel[i], product: val * kernel[i] }))

  const updateStoredValue = (image, nextKernel, row, col, resetMap = false) => {
    const posKey = `${row},${col}`
    const field = getReceptiveFieldValues(image, row, col, PADDED_SIZE)
    const sum = computeWeightedSum(field, nextKernel)
    setStoredOutputs(prev => (resetMap ? { [posKey]: sum } : { ...prev, [posKey]: sum }))
  }

  const toggleConvCell = (index) => {
    const img = [...convImage]
    img[index] = img[index] === 0 ? 1 : 0
    setConvImage(img)
    const padded = padImageGrid(img, SOURCE_SIZE, PADDING)
    updateStoredValue(padded, kernel, receptiveFieldPos.row, receptiveFieldPos.col, true)
  }

  const updateKernelValue = (index, delta) => {
    const nextKernel = [...kernel]
    nextKernel[index] = Math.max(-9, Math.min(9, nextKernel[index] + delta))
    setKernel(nextKernel)
    updateStoredValue(paddedImage, nextKernel, receptiveFieldPos.row, receptiveFieldPos.col, true)
  }

  const loadKernelPreset = (name) => {
    const preset = KERNEL_PRESETS[name]
    if (!preset) return
    setKernel([...preset])
    updateStoredValue(paddedImage, preset, receptiveFieldPos.row, receptiveFieldPos.col, true)
  }

  const moveReceptiveField = (row, col) => {
    if (row < 0 || row >= OUTPUT_SIZE || col < 0 || col >= OUTPUT_SIZE || isAnimating) return
    setIsAnimating(true)
    setReceptiveFieldPos({ row, col })
    updateStoredValue(paddedImage, kernel, row, col)
    setTimeout(() => setIsAnimating(false), 240)
  }

  const resetConvolution = () => {
    setReceptiveFieldPos({ row: 0, col: 0 })
    const field = getReceptiveFieldValues(paddedImage, 0, 0, PADDED_SIZE)
    const sum = computeWeightedSum(field, kernel)
    setStoredOutputs({ '0,0': sum })
  }

  const baselineY = 132
  const sourceCell = 58
  const paddedCell = 38
  const kernelCell = 64
  const kernelBox = 42
  const outputCell = 58

  const sourceX = 44
  const paddedX = 324
  const kernelX = 648
  const outputX = 948

  const sourceY = baselineY + (PADDED_SIZE * paddedCell - SOURCE_SIZE * sourceCell) / 2
  const paddedY = baselineY
  const kernelY = baselineY + (PADDED_SIZE * paddedCell - KERNEL_SIZE * kernelCell) / 2
  const outputY = baselineY + (PADDED_SIZE * paddedCell - OUTPUT_SIZE * outputCell) / 2

  const paddedWindowX = paddedX + receptiveFieldPos.col * paddedCell - 4
  const paddedWindowY = paddedY + receptiveFieldPos.row * paddedCell - 4
  const paddedWindowSize = KERNEL_SIZE * paddedCell + 8
  const sourceRight = sourceX + SOURCE_SIZE * sourceCell - 4
  const paddedCenterX = paddedX + paddedCell * 2.5
  const sourceToPaddedMidX = (sourceRight + paddedX) / 2
  const paddedToKernelMidX = (paddedX + paddedCell * 5 + kernelX) / 2
  const kernelToOutputMidX = (kernelX + kernelCell * 3 + outputX) / 2
  const sourceNoteY = sourceY + sourceCell * 3 + 30
  const paddedNoteY = paddedY + paddedCell * 5 + 22
  const kernelNoteY = kernelY + kernelCell * 3 + 30
  const outputNoteY = outputY + outputCell * 3 + 30

  const scannedCount = Object.keys(storedOutputs).length

  return (
    <section className="m2-section">
      <div className="m2-section-card m2-cnn-card">
        <div className="m2-section-heading m2-canvas-heading">
          <p className="m2-eyebrow">D. CNNs</p>
          <h2>Seeing in Patches</h2>
          <p className="m2-section-subtitle">
            A CNN looks at small parts of an image one step at a time. It uses a filter, a small
            pattern detector, to check each patch.
          </p>
        </div>

        <div className="m2-cnn-copy-grid">
          <div className="m2-cnn-copy-card">
            <strong>Padding</strong>
            <p>
              Start with a 3×3 image. Add a padding border around it, making it 5×5. Padding lets
              the filter check the edge pixels too. The output stays 3×3, matching the original
              image.
            </p>
          </div>
          <div className="m2-cnn-copy-card">
            <strong>Stride</strong>
            <p>Here, the filter moves one step at a time. That step size is called stride.</p>
          </div>
          <div className="m2-cnn-copy-card">
            <strong>Kernel</strong>
            <p>In CNNs, this filter is also called a kernel.</p>
          </div>
        </div>

        <div className="m2-cnn-legend">
          <span className="m2-cnn-legend-chip m2-cnn-legend-chip--image">Original 3×3</span>
          <span className="m2-cnn-legend-chip m2-cnn-legend-chip--padding">Padding</span>
          <span className="m2-cnn-legend-chip m2-cnn-legend-chip--active">Active filter window</span>
        </div>

        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="m2-svg-block m2-cnn-svg"
        >
          <defs>
            <marker id="m2-cnn-arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
              <path d="M0,0 L10,4 L0,8 Z" fill="#C4B5FD" />
            </marker>
          </defs>

          <g>
            <text x={sourceX + sourceCell * 1.5} y={86} className="m2-cnn-svg-label" textAnchor="middle">
              Original 3×3
            </text>
            {convImage.map((val, i) => {
              const row = Math.floor(i / SOURCE_SIZE)
              const col = i % SOURCE_SIZE
              const x = sourceX + col * sourceCell
              const y = sourceY + row * sourceCell
              const tone = getCellTone(val)

              return (
                <g key={`source-${i}`} style={{ cursor: 'pointer' }} onClick={() => toggleConvCell(i)}>
                  <rect
                    x={x}
                    y={y}
                    width={sourceCell - 4}
                    height={sourceCell - 4}
                    rx={12}
                    fill={tone.bg}
                    stroke="#DDD6FE"
                    strokeWidth={1.4}
                  />
                  <text
                    x={x + (sourceCell - 4) / 2}
                    y={y + (sourceCell - 4) / 2 + 7}
                    textAnchor="middle"
                    className="m2-cnn-svg-value"
                    fill={tone.text}
                  >
                    {val}
                  </text>
                </g>
              )
            })}
            <text x={sourceX + sourceCell * 1.5} y={sourceNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              Click cells to edit the image.
            </text>
          </g>

          <g>
            <text x={paddedCenterX} y={86} className="m2-cnn-svg-label" textAnchor="middle">
              Padded 5×5
            </text>
            {paddedImage.map((val, i) => {
              const row = Math.floor(i / PADDED_SIZE)
              const col = i % PADDED_SIZE
              const x = paddedX + col * paddedCell
              const y = paddedY + row * paddedCell
              const isPadding = row === 0 || row === PADDED_SIZE - 1 || col === 0 || col === PADDED_SIZE - 1
              const inField =
                row >= receptiveFieldPos.row &&
                row < receptiveFieldPos.row + KERNEL_SIZE &&
                col >= receptiveFieldPos.col &&
                col < receptiveFieldPos.col + KERNEL_SIZE

              const tone = isPadding
                ? { bg: '#F5F3FF', border: '#D8B4FE', text: '#8B5CF6' }
                : getCellTone(val)

              return (
                <g key={`padded-${i}`}>
                  <rect
                    x={x}
                    y={y}
                    width={paddedCell - 4}
                    height={paddedCell - 4}
                    rx={10}
                    fill={tone.bg}
                    stroke={inField ? '#7C3AED' : tone.border}
                    strokeWidth={inField ? 2.3 : 1.3}
                  />
                  <text
                    x={x + (paddedCell - 4) / 2}
                    y={y + (paddedCell - 4) / 2 + 5}
                    textAnchor="middle"
                    className="m2-cnn-svg-small-value"
                    fill={tone.text}
                  >
                    {val}
                  </text>
                </g>
              )
            })}
            <rect
              x={paddedWindowX}
              y={paddedWindowY}
              width={paddedWindowSize}
              height={paddedWindowSize}
              rx={16}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="4"
            />
            <text x={paddedCenterX} y={paddedNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              <tspan x={paddedCenterX} dy="0">Purple cells are padding.</tspan>
              <tspan x={paddedCenterX} dy="15">The filter scans this 5×5 view.</tspan>
            </text>
          </g>

          <path
            d={`M ${sourceRight + 24} ${baselineY + 95} L ${paddedX - 32} ${baselineY + 95}`}
            fill="none"
            stroke="#C4B5FD"
            strokeWidth="2.5"
            markerEnd="url(#m2-cnn-arrowhead)"
          />
          <text x={sourceToPaddedMidX} y={baselineY + 70} className="m2-cnn-svg-step" textAnchor="middle">
            add
          </text>
          <text x={sourceToPaddedMidX} y={baselineY + 92} className="m2-cnn-svg-step" textAnchor="middle">
            Padding
          </text>

          <path
            d={`M ${paddedX + paddedCell * 5 + 24} ${baselineY + 95} L ${kernelX - 28} ${baselineY + 95}`}
            fill="none"
            stroke="#C4B5FD"
            strokeWidth="2.5"
            markerEnd="url(#m2-cnn-arrowhead)"
          />
          <text x={paddedToKernelMidX} y={baselineY + 80} className="m2-cnn-svg-step" textAnchor="middle">
            scan with filter
          </text>

          <g>
            <text x={kernelX + kernelCell * 1.5} y={74} className="m2-cnn-svg-label" textAnchor="middle">
              Filter 3×3
            </text>
            {kernel.map((weight, i) => {
              const row = Math.floor(i / KERNEL_SIZE)
              const col = i % KERNEL_SIZE
              const x = kernelX + col * kernelCell
              const y = kernelY + row * kernelCell
              const boxX = x + (kernelCell - kernelBox) / 2
              const boxY = y
              const positive = weight > 0
              const negative = weight < 0

              return (
                <g key={`kernel-${i}`}>
                  <rect
                    x={boxX}
                    y={boxY}
                    width={kernelBox}
                    height={kernelBox}
                    rx={12}
                    fill={positive ? '#EEF2FF' : negative ? '#FFF7ED' : '#FFFFFF'}
                    stroke={positive ? '#A78BFA' : negative ? '#FDBA74' : '#DDD6FE'}
                    strokeWidth="1.5"
                  />
                  <text
                    x={boxX + kernelBox / 2}
                    y={boxY + kernelBox / 2 + 7}
                    textAnchor="middle"
                    className="m2-cnn-svg-value"
                    fill={positive ? '#6D28D9' : negative ? '#C2410C' : '#64748B'}
                  >
                    {weight > 0 ? `+${weight}` : weight}
                  </text>
                  <g transform={`translate(${x + kernelCell / 2}, ${y + kernelBox + 16})`}>
                    <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, 1)}>
                      <rect x={-18} y={0} width={16} height={16} rx={5} fill="#EDE9FE" />
                      <text x={-10} y={12} textAnchor="middle" className="m2-cnn-svg-mini-btn">+</text>
                    </g>
                    <g style={{ cursor: 'pointer' }} onClick={() => updateKernelValue(i, -1)}>
                      <rect x={2} y={0} width={16} height={16} rx={5} fill="#EDE9FE" />
                      <text x={10} y={12} textAnchor="middle" className="m2-cnn-svg-mini-btn">−</text>
                    </g>
                  </g>
                </g>
              )
            })}
            <text x={kernelX + kernelCell * 1.5} y={kernelNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              Same filter, reused at every patch.
            </text>
          </g>

          <path
            d={`M ${kernelX + kernelCell * 3 + 24} ${baselineY + 95} L ${outputX - 28} ${baselineY + 95}`}
            fill="none"
            stroke="#C4B5FD"
            strokeWidth="2.5"
            markerEnd="url(#m2-cnn-arrowhead)"
          />
          <text x={kernelToOutputMidX} y={baselineY + 76} className="m2-cnn-svg-step" textAnchor="middle">
            stride
          </text>
          <text x={kernelToOutputMidX} y={baselineY + 96} className="m2-cnn-svg-step" textAnchor="middle">
            {STRIDE}
          </text>

          <g>
            <text x={outputX + outputCell * 1.5} y={86} className="m2-cnn-svg-label" textAnchor="middle">
              Output 3×3
            </text>
            {[0, 1, 2].map(row =>
              [0, 1, 2].map(col => {
                const x = outputX + col * outputCell
                const y = outputY + row * outputCell
                const posKey = `${row},${col}`
                const stored = storedOutputs[posKey]
                const hasValue = stored !== undefined
                const isCurrent = row === receptiveFieldPos.row && col === receptiveFieldPos.col
                const tone = hasValue ? getOutputTone(stored) : { bg: '#F8FAFC', border: '#E2E8F0', text: '#CBD5E1' }

                return (
                  <g key={posKey} style={{ cursor: 'pointer' }} onClick={() => moveReceptiveField(row, col)}>
                    <rect
                      x={x}
                      y={y}
                      width={outputCell - 4}
                      height={outputCell - 4}
                      rx={12}
                      fill={tone.bg}
                      stroke={isCurrent ? '#7C3AED' : tone.border}
                      strokeWidth={isCurrent ? 3 : 1.5}
                    />
                    <text
                      x={x + (outputCell - 4) / 2}
                      y={y + (outputCell - 4) / 2 + 7}
                      textAnchor="middle"
                      className="m2-cnn-svg-value"
                      fill={tone.text}
                    >
                      {hasValue ? stored : '?'}
                    </text>
                  </g>
                )
              })
            )}
            <text x={outputX + outputCell * 1.5} y={outputNoteY} className="m2-cnn-svg-note" textAnchor="middle">
              <tspan x={outputX + outputCell * 1.5} dy="0">Click a square to move</tspan>
              <tspan x={outputX + outputCell * 1.5} dy="15">the filter one step.</tspan>
            </text>
          </g>
        </svg>

        <div className="m2-preset-row">
          <span className="m2-preset-label">Filter presets:</span>
          {Object.keys(KERNEL_PRESETS).map(name => (
            <button key={name} className="m2-preset-btn" onClick={() => loadKernelPreset(name)}>
              {name.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
          <button className="m2-preset-btn" onClick={resetConvolution}>Reset Map</button>
        </div>

        <div className="m2-observation m2-observation--purple">
          <p><strong>Padding lets the filter check the edges without shrinking the output.</strong></p>
        </div>

        <p className="m2-hint">
          {scannedCount >= OUTPUT_SIZE * OUTPUT_SIZE
            ? 'You have scanned every patch. Try a different filter preset.'
            : 'The output stays 3×3 because the padded 5×5 image lines up with the original 3×3 scan positions.'}
        </p>

        <div className="m2-cnn-score-panel">
          <button
            type="button"
            className="m2-cnn-score-toggle"
            onClick={() => setShowScoreBreakdown(prev => !prev)}
          >
            {showScoreBreakdown ? 'Hide score details' : 'How the score is made'}
          </button>

          {showScoreBreakdown && (
            <div className="m2-cnn-score-breakdown">
              <div className="m2-cnn-score-copy">
                <h3>Current patch score</h3>
                <p>
                  This output square uses one 3×3 patch from the padded image and one 3×3 filter.
                  Matching parts push the score up. Non-matching parts push it down.
                </p>
                <p>
                  Current scan position: row {receptiveFieldPos.row + 1}, column {receptiveFieldPos.col + 1}. Current score: <strong>{convSum}</strong>.
                </p>
              </div>

              <div className="m2-cnn-score-grid-wrap">
                <div>
                  <span className="m2-cnn-score-label">Patch</span>
                  <div className="m2-cnn-score-grid">
                    {currentField.map((value, index) => {
                      const tone = getCellTone(value)
                      return (
                        <span key={`patch-${index}`} style={{ background: tone.bg, color: tone.text, borderColor: '#DDD6FE' }}>
                          {value}
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <span className="m2-cnn-score-label">Filter</span>
                  <div className="m2-cnn-score-grid">
                    {kernel.map((value, index) => (
                      <span key={`filter-${index}`} className="m2-cnn-score-grid--filter">
                        {value > 0 ? `+${value}` : value}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="m2-cnn-score-label">Score pieces</span>
                  <div className="m2-cnn-score-grid">
                    {scoreParts.map(({ product }, index) => (
                      <span
                        key={`product-${index}`}
                        className={product > 0 ? 'is-positive' : product < 0 ? 'is-negative' : ''}
                      >
                        {product > 0 ? `+${product}` : product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ScanningSection
