function renderGridCells(values, type = 'patch') {
  return values.map((value, index) => {
    let className = 'ce-cnn-grid-cell'

    if (type === 'kernel') {
      if (value > 0) className += ' is-kernel-positive'
      else if (value < 0) className += ' is-kernel-negative'
      else className += ' is-kernel-neutral'
    } else if (value > 0) {
      className += ' is-active'
    }

    return (
      <span key={`${type}-${index}`} className={className}>
        {value > 0 && type === 'kernel' ? `+${value}` : value}
      </span>
    )
  })
}

export default function CourseEvaluationCnnVisual({
  visualType,
  visualData,
  revealAnswer = false,
  selectedAnswer,
  correctAnswer,
}) {
  if (visualType === 'cnn-output-size') {
    return (
      <div className="ce-cnn-panel">
        <div className="ce-cnn-copy-card">
          <strong>CNN setup</strong>
          <p>A filter scans the input grid one step at a time, using the same size relationship shown in Module 2’s CNN section.</p>
        </div>

        <div className="ce-cnn-legend">
          <span className="ce-cnn-legend-chip ce-cnn-legend-chip--image">Input 5×5</span>
          <span className="ce-cnn-legend-chip ce-cnn-legend-chip--padding">Filter 3×3</span>
          <span className="ce-cnn-legend-chip ce-cnn-legend-chip--active">Stride 1</span>
        </div>

        <div className="ce-cnn-formula-panel">
          <div className="ce-cnn-formula-grid">
            <div className="ce-cnn-formula-item">
              <span>Input</span>
              <strong>5 × 5</strong>
            </div>
            <div className="ce-cnn-formula-item">
              <span>Filter</span>
              <strong>3 × 3</strong>
            </div>
            <div className="ce-cnn-formula-item">
              <span>Padding</span>
              <strong>0</strong>
            </div>
            <div className="ce-cnn-formula-item">
              <span>Stride</span>
              <strong>1</strong>
            </div>
            <div className="ce-cnn-formula-item ce-cnn-formula-item--question">
              <span>Output</span>
              <strong>{revealAnswer ? '3 × 3' : '? × ?'}</strong>
            </div>
          </div>

          {revealAnswer && (
            <div className="ce-cnn-formula-line">
              <span>Size rule</span>
              <strong>5 - 3 + 1 = 3</strong>
            </div>
          )}

          {revealAnswer && (
            <div className="ce-cnn-reveal">
              <span>Output size</span>
              <strong>3 × 3</strong>
              <p>
                Your answer: <strong>{selectedAnswer || 'No answer'}</strong>
                {' '}| Correct answer: <strong>{correctAnswer}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (visualType === 'cnn-matrix-calculation') {
    return (
      <div className="ce-cnn-panel">
        <div className="ce-cnn-copy-card">
          <strong>Patch and kernel</strong>
          <p>Use the same patch-and-filter comparison pattern from Module 2 Section D. The kernel is applied to one 3×3 image patch.</p>
        </div>

        <div className="ce-cnn-matrix-layout">
          <div>
            <span className="ce-cnn-score-label">Image patch</span>
            <div className="ce-cnn-score-grid">
              {renderGridCells(visualData.patch, 'patch')}
            </div>
          </div>

          <div>
            <span className="ce-cnn-score-label">Kernel</span>
            <div className="ce-cnn-score-grid">
              {renderGridCells(visualData.kernel, 'kernel')}
            </div>
          </div>
        </div>

        {revealAnswer && (
          <div className="ce-cnn-score-breakdown">
            <div className="ce-cnn-score-copy">
              <h3>Completed filter calculation</h3>
              <p>
                This follows the same patch-by-filter multiplication pattern shown in the CNN activity.
              </p>
              <p>
                Your answer: <strong>{selectedAnswer || 'No answer'}</strong>
                {' '}| Correct answer: <strong>{correctAnswer}</strong>
              </p>
            </div>

            <div className="ce-cnn-score-grid-wrap">
              <div>
                <span className="ce-cnn-score-label">Calculation</span>
                <div className="ce-cnn-calc-card">
                  <p>(3×1 + 1×0 + 0×-1)</p>
                  <p>+ (2×1 + 2×0 + 1×-1)</p>
                  <p>+ (0×1 + 1×0 + 3×-1)</p>
                  <strong>= 1</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
