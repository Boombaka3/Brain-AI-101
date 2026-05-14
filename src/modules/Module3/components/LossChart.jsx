function LossChart({ trainingHistory, epochIndex }) {
  const maxError = Math.max(...trainingHistory.map((step) => step.error))

  return (
    <div className="m3-loss-chart">
      {trainingHistory.map((step, index) => {
        const isVisible = index <= epochIndex
        const barHeight = `${(step.error / maxError) * 100}%`

        return (
          <div
            key={step.epoch}
            className={`m3-loss-chart__column${isVisible ? ' is-visible' : ''}${index === epochIndex ? ' is-current' : ''}`}
          >
            <span className="m3-loss-chart__value">{step.error.toFixed(2)}</span>
            <div className="m3-loss-chart__bar-shell">
              <div
                className="m3-loss-chart__bar"
                style={{ height: barHeight }}
              />
            </div>
            <span className="m3-loss-chart__epoch">Epoch {step.epoch}</span>
          </div>
        )
      })}
    </div>
  )
}

export default LossChart
