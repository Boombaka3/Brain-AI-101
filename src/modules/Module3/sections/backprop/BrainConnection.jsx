import { useEffect, useRef, useState } from 'react'

const NEUROCORRELATION_ARTICLE_URL = 'https://axelwickman.com/articles/neurocorrelation?utm_source=gh_neurocorrelation'
const NEUROCORRELATION_EMBED_URL = `${NEUROCORRELATION_ARTICLE_URL}#:~:text=Live%20App`
const LOCAL_NEUROCORRELATION_MODULE_PATH = `${import.meta.env.BASE_URL}vendor/neurocorrelation/index.mjs`
const NEUROCORRELATION_REPO_URL = 'https://github.com/Axelwickm/NeuroCorrelation'


function NeuroCorrelationPreview() {
  const canvasRef = useRef(null)
  const viewerRef = useRef(null)
  const mountedAppRef = useRef(null)
  const resizeObserverRef = useRef(null)
  const [availability, setAvailability] = useState('checking')
  const [state, setState] = useState('idle')

  useEffect(() => {
    let cancelled = false

    const checkLocalBuild = async () => {
      try {
        // Step 1 — fetch index.mjs and verify it is a real JS module
        const indexResponse = await fetch(LOCAL_NEUROCORRELATION_MODULE_PATH, {
          cache: 'no-store',
        })
        if (cancelled) return

        if (!indexResponse.ok) {
          setAvailability('live')
          setState('embedded-live')
          return
        }

        const indexBody = await indexResponse.text()
        if (cancelled) return

        const isRealModule = indexBody.includes('mountNeuroCorrelation')
          && indexBody.includes('neurocorrelation.mjs')
          && indexBody.length > 100

        if (!isRealModule) {
          // Got a response but it's the SPA fallback HTML, not the real module
          setAvailability('live')
          setState('embedded-live')
          return
        }

        // Step 2 — GET dist/neurocorrelation.mjs and verify it is real JS
        // HEAD is not sufficient — Vite SPA fallback returns 200 for all paths
        const distPath = LOCAL_NEUROCORRELATION_MODULE_PATH
          .replace('index.mjs', 'dist/neurocorrelation.mjs')

        const distResponse = await fetch(distPath, { cache: 'no-store' })
        if (cancelled) return

        if (!distResponse.ok) {
          setAvailability('live')
          setState('embedded-live')
          return
        }

        const distBody = await distResponse.text()
        if (cancelled) return

        // SPA fallback returns HTML — real dist file is JS
        // Check for JS content and minimum size (real wasm loader is >10KB)
        const distIsReal = (
          !distBody.trimStart().startsWith('<!') &&
          !distBody.trimStart().startsWith('<html') &&
          distBody.length > 10000
        )

        if (distIsReal) {
          setAvailability('local')
          return
        }

        // dist file is missing or is SPA HTML fallback
        setAvailability('live')
        setState('embedded-live')

      } catch (error) {
        if (cancelled) return
        console.error('NeuroCorrelation local availability check failed:', error)
        setAvailability('live')
        setState('embedded-live')
      }
    }

    checkLocalBuild()

    return () => {
      cancelled = true
      resizeObserverRef.current?.disconnect()
      mountedAppRef.current?.destroy?.()
    }
  }, [])

  const syncCanvasSize = () => {
    const canvas = canvasRef.current
    const viewer = viewerRef.current
    if (!canvas || !viewer) return

    const width = viewer.clientWidth
    const height = viewer.clientHeight
    if (width === 0 || height === 0) return

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
  }

  const handleStart = async () => {
    if (state === 'starting' || state === 'ready' || state === 'embedded-live') return

    if (availability !== 'local') {
      setState('embedded-live')
      return
    }

    try {
      setState('starting')

      const module = await import(/* @vite-ignore */ LOCAL_NEUROCORRELATION_MODULE_PATH)
      const mountNeuroCorrelation = module.default || module.mountNeuroCorrelation

      if (typeof mountNeuroCorrelation !== 'function') {
        throw new Error('Local NeuroCorrelation module does not export a mount function.')
      }

      syncCanvasSize()

      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = new ResizeObserver(syncCanvasSize)
      if (viewerRef.current) {
        resizeObserverRef.current.observe(viewerRef.current)
      }

      mountedAppRef.current?.destroy?.()
      mountedAppRef.current = await mountNeuroCorrelation({
        canvas: canvasRef.current,
        preset: 'STANDARD',
        print: (text) => console.log(text),
        printErr: (text) => console.error(text),
      })

      setState('ready')
    } catch (error) {
      console.error('NeuroCorrelation local mount failed:', error)
      setAvailability('live')
      setState('embedded-live')
    }
  }

  const showCanvas = state === 'ready'
  const showLiveFrame = state === 'embedded-live'
  const description = availability === 'local'
    ? 'A local browser build was detected, so this preview can start directly inside Module 3.'
    : 'The live NeuroCorrelation app is embedded below so you can explore the simulation without leaving Module 3.'
  const buttonCopy = 'Launch the local NeuroCorrelation simulation in this page.'

  return (
    <div className="m3-brain-feedback__viewer" ref={viewerRef}>
      <canvas
        ref={canvasRef}
        className={`m3-brain-feedback__canvas${showCanvas ? ' is-active' : ''}`}
        aria-label="NeuroCorrelation simulation canvas"
      />

      {showLiveFrame ? (
        <div className="m3-brain-feedback__linkout">
          <div className="m3-brain-feedback__linkout-body">
            <p className="m3-brain-feedback__fallback-tag">Interactive simulation</p>
            <h4>NeuroCorrelation runs in its own tab</h4>
            <p>
              The simulation uses WebGL and shared memory that require a dedicated
              browser context. Click below to open it — it loads in about 5 seconds.
            </p>
            <ul className="m3-brain-feedback__fallback-list">
              <li>Neurons that fire together strengthen their connection over time.</li>
              <li>Uncorrelated activity weakens those links.</li>
              <li>Watch the 3D network reorganize itself in real time.</li>
            </ul>
          </div>
          <a
            href={NEUROCORRELATION_ARTICLE_URL}
            target="_blank"
            rel="noreferrer"
            className="m3-brain-feedback__linkout-btn"
          >
            Open NeuroCorrelation simulation ↗
          </a>
        </div>
      ) : null}

      {!showCanvas && !showLiveFrame ? (
        <div className="m3-brain-feedback__fallback" aria-label="NeuroCorrelation preview unavailable">
          <p className="m3-brain-feedback__fallback-tag">Simulation preview</p>
          <h4>{availability === 'checking' ? 'Preparing the preview' : 'Interactive simulation ready to launch'}</h4>
          <p>{availability === 'checking' ? 'Checking how this simulation can be launched on this machine.' : description}</p>
          <ul className="m3-brain-feedback__fallback-list">
            <li>Neurons that fire together strengthen their connection over time.</li>
            <li>Uncorrelated activity weakens those links.</li>
            <li>This gives a more biological contrast to backpropagation in AI.</li>
          </ul>

        </div>
      ) : null}

      <div className="m3-brain-feedback__control-dock">
        {availability === 'local' ? (
          <button
            type="button"
            className="m3-brain-feedback__launch"
            onClick={handleStart}
            disabled={state === 'starting' || state === 'ready'}
          >
            <span className="m3-brain-feedback__launch-label">
              {state === 'starting' ? 'Starting…' : 'Start Local App'}
            </span>
            <span className="m3-brain-feedback__launch-copy">{buttonCopy}</span>
          </button>
        ) : availability === 'checking' ? (
          <div className="m3-brain-feedback__launch is-static">
            <span className="m3-brain-feedback__launch-label">Checking app mode</span>
            <span className="m3-brain-feedback__launch-copy">Looking for a local browser build before enabling the section controls.</span>
          </div>
        ) : null}

        <a
          className="m3-btn"
          href={NEUROCORRELATION_ARTICLE_URL}
          target="_blank"
          rel="noreferrer"
        >
          Open Full Article
        </a>
      </div>
    </div>
  )
}

function BrainConnection() {
  return (
    <section className="m3-section">
      <div className="m3-section-heading">
        <p className="m3-eyebrow">E. BRAIN × AI FEEDBACK</p>
        <h2>A More Brain-Like Way to Learn</h2>
        <p className="m3-section-subtitle">
          In the brain, nearby neurons update their connection based on timing —
          not a global error signal. This simulation shows what that looks like.
        </p>
      </div>

      <div className="m3-section-card m3-brain-feedback">

        <div className="m3-brain-feedback__compare">
          <div className="m3-brain-feedback__compare-card">
            <p className="m3-brain-feedback__mini-label">AI model (backprop)</p>
            <strong>Error signal sent backward</strong>
            <span>Global. Requires knowing the correct answer.</span>
          </div>
          <div className="m3-brain-feedback__compare-card">
            <p className="m3-brain-feedback__mini-label">Brain-inspired model</p>
            <strong>Local spike timing between neighbors</strong>
            <span>No teacher. Neurons update from their own activity.</span>
          </div>
        </div>

        <div className="m3-brain-feedback__visual">
          <div className="m3-brain-feedback__shell">
            <div className="m3-brain-feedback__shell-bar">
              <span /><span /><span />
              <p>NeuroCorrelation 3D simulation</p>
            </div>
            <NeuroCorrelationPreview />
          </div>
          <p className="m3-source-note">
            Simulation by <a href={NEUROCORRELATION_REPO_URL} target="_blank" rel="noreferrer">Axel Wickman</a> —
            <a href={NEUROCORRELATION_ARTICLE_URL} target="_blank" rel="noreferrer"> full article</a>
          </p>
        </div>

      </div>
    </section>
  )
}

export default BrainConnection
