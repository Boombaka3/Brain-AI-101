function FloatingSignal({
  phrase,
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
      <span className="module1-sound-neuron__floating-word-track">
        <span className="module1-sound-neuron__floating-word">{phrase}</span>
      </span>
      <span className="module1-sound-neuron__floating-trail module1-sound-neuron__floating-trail--one" />
      <span className="module1-sound-neuron__floating-trail module1-sound-neuron__floating-trail--two" />
      <span className="module1-sound-neuron__floating-trail module1-sound-neuron__floating-trail--three" />
    </div>
  )
}

export default FloatingSignal
