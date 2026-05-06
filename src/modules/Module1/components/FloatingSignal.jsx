function FloatingSignal({
  phrase,
  impact,
  strength = 'light',
  isAlexCue = false,
  duration = 900,
  scale = 1,
  laneOffset = 0,
}) {
  return (
    <div
      className={[
        'module1-sound-neuron__floating-signal',
        `is-${strength}`,
        isAlexCue ? 'is-alex' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        '--signal-duration': `${duration}ms`,
        '--signal-scale': scale,
        '--signal-lane-offset': `${laneOffset}px`,
      }}
    >
      <span className="module1-sound-neuron__floating-phrase">{phrase}</span>
      <strong className="module1-sound-neuron__floating-impact">+{impact}</strong>
    </div>
  )
}

export default FloatingSignal
