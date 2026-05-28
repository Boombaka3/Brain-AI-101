function NeuronResponsePanel({ lastResult }) {
  if (lastResult === 'no-fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <span className="module1-sound-neuron__response-label">Result</span>
        <strong className="module1-sound-neuron__response-title">The signal did not reach the threshold yet.</strong>
        <span className="module1-sound-neuron__response-label">Why it happened</span>
        <p className="module1-sound-neuron__response-line">The input was not strong enough, so the neuron stayed quiet.</p>
      </div>
    )
  }

  if (lastResult === 'alex-fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <span className="module1-sound-neuron__response-label">Result</span>
        <strong className="module1-sound-neuron__response-title">The signal reached the threshold, so the neuron fired.</strong>
        <span className="module1-sound-neuron__response-label">Why it happened</span>
        <p className="module1-sound-neuron__response-line">The sound added enough input at the soma. Once the total passed the threshold, the neuron sent a signal forward.</p>
      </div>
    )
  }

  if (lastResult === 'fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <span className="module1-sound-neuron__response-label">Result</span>
        <strong className="module1-sound-neuron__response-title">The signal reached the threshold, so the neuron fired.</strong>
        <span className="module1-sound-neuron__response-label">Why it happened</span>
        <p className="module1-sound-neuron__response-line">The sound added enough input at the soma. Once the total passed the threshold, the neuron sent a signal forward.</p>
      </div>
    )
  }

  return (
    <div className="module1-sound-neuron__response-panel">
      <span className="module1-sound-neuron__response-label">Result</span>
      <strong className="module1-sound-neuron__response-title">Build the signal at the soma.</strong>
      <span className="module1-sound-neuron__response-label">Why it happened</span>
      <p className="module1-sound-neuron__response-line">Send a sound to add input. If the total reaches threshold, the neuron will fire automatically.</p>
    </div>
  )
}

export default NeuronResponsePanel
