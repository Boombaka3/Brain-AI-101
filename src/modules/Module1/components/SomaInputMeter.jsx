function SomaInputMeter({ value, maxInput, threshold, isFiring }) {
  const fillPercent = Math.max(0, Math.min(100, (value / maxInput) * 100))
  const thresholdPercent = (threshold / maxInput) * 100

  return (
    <div className="module1-sound-neuron__meter">
      <div className="module1-sound-neuron__meter-header">
        <span className="module1-sound-neuron__meter-label">SOMA INPUT</span>
        <strong>{value} / {maxInput}</strong>
      </div>

      <div
        className={`module1-sound-neuron__meter-track ${isFiring ? 'is-firing' : ''}`}
        aria-label="Soma input meter"
        aria-valuemin={0}
        aria-valuemax={maxInput}
        aria-valuenow={value}
        role="meter"
      >
        <div className="module1-sound-neuron__meter-fill" style={{ width: `${fillPercent}%` }} />
        <div className="module1-sound-neuron__meter-threshold" style={{ left: `${thresholdPercent}%` }}>
          <span>Threshold 70</span>
        </div>
      </div>
    </div>
  )
}

export default SomaInputMeter
