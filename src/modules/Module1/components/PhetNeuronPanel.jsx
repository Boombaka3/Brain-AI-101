import PhetNeuronEmbed, {
  PHET_NEURON_REPO_URL,
} from './PhetNeuronEmbed'
import usePhetNeuronController from '../hooks/usePhetNeuronController'

function PhetNeuronPanel({ runToken = 0, isRunning = false, isPrimed = false, isFiring = false, outcome = 'idle' }) {
  const {
    iframeRef,
    bridgeReady,
    handleFrameLoad,
    runtimeLabel,
    runtimeDetail,
    simEventState,
  } = usePhetNeuronController({
    runToken,
    isRunning,
    isPrimed,
    isFiring,
    outcome,
  })

  const shellClassName = [
    'module1-phet-panel',
    'module1-phet-panel--embedded',
    isPrimed ? 'is-primed' : '',
    isFiring ? 'is-firing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClassName}>
      <div className="module1-phet-panel__status-row">
        <span
          className={[
            'module1-phet-panel__status-pill',
            `is-${simEventState}`,
            bridgeReady ? 'is-bridge-ready' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {runtimeLabel}
        </span>
        <span className="module1-phet-panel__status-meta">{runtimeDetail}</span>
      </div>

      <PhetNeuronEmbed iframeRef={iframeRef} onFrameLoad={handleFrameLoad} />

      <p className="module1-phet-panel__attribution">
        Animation based on <a href={PHET_NEURON_REPO_URL} target="_blank" rel="noopener noreferrer">PhET Neuron</a>.
      </p>
    </div>
  )
}

export default PhetNeuronPanel
