function NeuronResponsePanel({ lastResult, somaInput, maxInput }) {
  if (lastResult === 'no-fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <strong className="module1-sound-neuron__response-title">No fire</strong>
        <p className="module1-sound-neuron__response-line">The input faded before reaching threshold.</p>
      </div>
    )
  }

  if (lastResult === 'alex-fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <strong className="module1-sound-neuron__response-title">Neuron fired</strong>
        <p className="module1-sound-neuron__response-line">The name cue reached threshold immediately.</p>
      </div>
    )
  }

  if (lastResult === 'fire') {
    return (
      <div className="module1-sound-neuron__response-panel">
        <strong className="module1-sound-neuron__response-title">Neuron fired</strong>
        <p className="module1-sound-neuron__response-line">The input reached threshold.</p>
      </div>
    )
  }

  return (
    <div className="module1-sound-neuron__response-panel">
      <strong className="module1-sound-neuron__response-title">Did the input reach threshold?</strong>
      <p className="module1-sound-neuron__response-line">Soma input: {somaInput} / {maxInput}</p>
    </div>
  )
}

export default NeuronResponsePanel
