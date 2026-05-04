import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import neuronDiagram from '../../../assets/vector-diagram-of-neuron-anatomy.svg'
import neuronZoomDiagram from '../../../assets/complete-neuron-cell-diagram-en.svg'
import './guidedAnatomy.css'

const ZOOM_MIN = 0
const ZOOM_MAX = 170
const ZOOM_DEFAULT = 100

const STEPS = [
  {
    id: 'dendrites',
    label: 'Dendrites',
    desc: 'These branches collect incoming signals from other neurons or sensors.',
    x: '12%',
    y: '35%',
    highlightArea: { left: '0%', top: '5%', width: '28%', height: '90%' },
    zoom: { scale: 2.6, focus: { x: 0.10, y: 0.34 } },
  },
  {
    id: 'soma',
    label: 'Soma',
    desc: 'The decision center — it adds all the incoming signals together.',
    x: '32%',
    y: '48%',
    highlightArea: { left: '22%', top: '20%', width: '22%', height: '55%' },
    zoom: { scale: 2.85, focus: { x: 0.34, y: 0.46 } },
  },
  {
    id: 'axon',
    label: 'Axon',
    desc: 'If the total is strong enough, the signal travels down this highway.',
    x: '62%',
    y: '50%',
    highlightArea: { left: '42%', top: '35%', width: '35%', height: '35%' },
    zoom: { scale: 2.35, focus: { x: 0.64, y: 0.51 } },
  },
  {
    id: 'terminals',
    label: 'Terminals',
    desc: 'The signal reaches the end and passes the message to the next neuron.',
    x: '88%',
    y: '45%',
    highlightArea: { left: '80%', top: '20%', width: '20%', height: '70%' },
    zoom: { scale: 2.7, focus: { x: 0.92, y: 0.44 } },
  },
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export default function GuidedAnatomyOverlay({ onComplete, finishLabel = "Got it — let's experiment" }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [visited, setVisited] = useState(new Set())
  const [zoomPercent, setZoomPercent] = useState(ZOOM_DEFAULT)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 })
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const frameRef = useRef(null)
  const dragStateRef = useRef(null)
  const clampPanRef = useRef((value) => value)
  const isStarted = currentStep >= 0
  const allVisited = visited.size === STEPS.length

  const handleStepClick = (index) => {
    if (index !== currentStep + 1 && !visited.has(index)) return
    setCurrentStep(index)
    setVisited((prev) => new Set([...prev, index]))
  }

  const handleContinue = () => {
    if (currentStep < STEPS.length - 1) {
      const next = currentStep + 1
      setCurrentStep(next)
      setVisited((prev) => new Set([...prev, next]))
    }
  }

  const handleFinish = () => {
    onComplete?.()
  }

  const activeStep = currentStep >= 0 ? STEPS[currentStep] : null

  const getZoomScale = (step, percent) => (
    step ? 1 + (percent / 100) * (step.zoom.scale - 1) : 1
  )

  const getBaseImageSize = () => {
    if (!frameSize.width || !frameSize.height || !imageNaturalSize.width || !imageNaturalSize.height) {
      return null
    }

    const fitScale = Math.min(
      frameSize.width / imageNaturalSize.width,
      frameSize.height / imageNaturalSize.height,
    )

    return {
      width: imageNaturalSize.width * fitScale,
      height: imageNaturalSize.height * fitScale,
    }
  }

  const zoomScale = getZoomScale(activeStep, zoomPercent)
  const baseImageSize = getBaseImageSize()

  const clampPan = (nextPan, scale = zoomScale) => {
    if (!baseImageSize) return { x: 0, y: 0 }

    const maxX = Math.max(0, ((baseImageSize.width * scale) - frameSize.width) / 2)
    const maxY = Math.max(0, ((baseImageSize.height * scale) - frameSize.height) / 2)

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    }
  }

  clampPanRef.current = clampPan

  const getFocusPan = (step, scale = zoomScale) => {
    if (!step || !baseImageSize) return { x: 0, y: 0 }

    return clampPan({
      x: -((step.zoom.focus.x - 0.5) * baseImageSize.width * scale),
      y: -((step.zoom.focus.y - 0.5) * baseImageSize.height * scale),
    }, scale)
  }

  const handleZoomImageLoad = (event) => {
    setImageNaturalSize({
      width: event.currentTarget.naturalWidth,
      height: event.currentTarget.naturalHeight,
    })
  }

  const handleZoomPointerDown = (event) => {
    const isMouseNonPrimary = event.pointerType === 'mouse' && event.button !== 0

    if (!activeStep || zoomScale <= 1 || isMouseNonPrimary) return

    event.preventDefault()
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPan: pan,
    }
    document.body.style.userSelect = 'none'
    setIsDragging(true)
  }

  useEffect(() => {
    const frame = frameRef.current

    if (!frame || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(([entry]) => {
      setFrameSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(frame)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isDragging) return undefined

    const handlePointerMove = (event) => {
      const dragState = dragStateRef.current

      if (!dragState || dragState.pointerId !== event.pointerId) return

      setPan(clampPanRef.current({
        x: dragState.startPan.x + (event.clientX - dragState.startX),
        y: dragState.startPan.y + (event.clientY - dragState.startY),
      }))
    }

    const handlePointerEnd = (event) => {
      const dragState = dragStateRef.current

      if (!dragState || dragState.pointerId !== event.pointerId) return

      dragStateRef.current = null
      document.body.style.userSelect = ''
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  useEffect(() => {
    setZoomPercent(ZOOM_DEFAULT)
    setPan({ x: 0, y: 0 })
    dragStateRef.current = null
    document.body.style.userSelect = ''
    setIsDragging(false)
  }, [currentStep])

  useEffect(() => {
    if (!activeStep || !baseImageSize) return

    setPan(getFocusPan(activeStep, getZoomScale(activeStep, ZOOM_DEFAULT)))
  }, [currentStep, frameSize.width, frameSize.height, imageNaturalSize.width, imageNaturalSize.height])

  useEffect(() => {
    if (!activeStep) return

    setPan((previousPan) => clampPan(previousPan, zoomScale))
  }, [zoomPercent, frameSize.width, frameSize.height, imageNaturalSize.width, imageNaturalSize.height])

  return (
    <div className="ga">
      <div className="ga-diagram">
        <img
          className="ga-diagram-img"
          src={neuronDiagram}
          alt="Biological neuron anatomy"
          draggable={false}
        />

        {isStarted && <div className="ga-dim" />}

        {isStarted && activeStep && (
          <motion.div
            key={activeStep.id}
            className="ga-highlight"
            style={activeStep.highlightArea}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {STEPS.map((step, i) => {
          const isActive = currentStep === i
          const isVisited = visited.has(i)
          const isNext = i === currentStep + 1 || (currentStep === -1 && i === 0)

          return (
            <button
              key={step.id}
              className={`ga-hotspot${isActive ? ' ga-hotspot--active' : ''}${isVisited && !isActive ? ' ga-hotspot--visited' : ''}${isNext && !isVisited ? ' ga-hotspot--next' : ''}`}
              style={{ left: step.x, top: step.y }}
              onClick={() => isNext || isVisited ? handleStepClick(i) : null}
              disabled={!isNext && !isVisited}
            >
              <span className="ga-hotspot-ring" />
              {(isActive || isVisited) && (
                <span className="ga-hotspot-label">{step.label}</span>
              )}
              {isNext && !isVisited && (
                <span className="ga-hotspot-pulse" />
              )}
            </button>
          )
        })}
      </div>

      <div className="ga-footer">
        <AnimatePresence mode="wait">
          {!isStarted ? (
            <motion.div
              key="start"
              className="ga-prompt"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="ga-prompt-text">
                Tap the glowing dot to start exploring the neuron's parts.
              </p>
            </motion.div>
          ) : activeStep ? (
            <motion.div
              key={activeStep.id}
              className="ga-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="ga-info-header">
                <span className="ga-info-step">
                  {currentStep + 1} / {STEPS.length}
                </span>
                <h3 className="ga-info-title">{activeStep.label}</h3>
              </div>
              <p className="ga-info-desc">{activeStep.desc}</p>
              {allVisited ? (
                <button className="shared-btn shared-btn-primary shared-btn-sm" onClick={handleFinish}>
                  {finishLabel}
                </button>
              ) : (
                <button className="shared-btn shared-btn-secondary shared-btn-sm" onClick={handleContinue}>
                  Next part
                </button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="ga-dots">
          {STEPS.map((step, i) => (
            <div
              key={step.id}
              className={`ga-dot${currentStep === i ? ' ga-dot--active' : ''}${visited.has(i) ? ' ga-dot--visited' : ''}`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep?.id ?? 'zoom-idle'}
          className={`ga-zoom-card${activeStep ? '' : ' ga-zoom-card--idle'}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}
        >
          <div className="ga-zoom-header">
            <span className="ga-info-step">{activeStep ? 'Zoom view' : 'Click to zoom'}</span>
            <h4 className="ga-zoom-title">{activeStep ? activeStep.label : 'Pick a neuron part'}</h4>
          </div>
          <div
            ref={frameRef}
            className={`ga-zoom-frame${activeStep && zoomScale > 1 ? ' ga-zoom-frame--draggable' : ''}${isDragging ? ' ga-zoom-frame--dragging' : ''}`}
            onPointerDown={handleZoomPointerDown}
          >
            {activeStep ? (
              <div className="ga-zoom-stage">
                <img
                  className="ga-zoom-image"
                  src={neuronZoomDiagram}
                  alt={`${activeStep.label} zoom view of the neuron diagram`}
                  draggable={false}
                  onLoad={handleZoomImageLoad}
                  style={{
                    width: baseImageSize ? `${baseImageSize.width}px` : '100%',
                    height: baseImageSize ? `${baseImageSize.height}px` : '100%',
                    transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoomScale})`,
                  }}
                />
              </div>
            ) : (
              <div className="ga-zoom-empty">
                Click a glowing hotspot to zoom into that structure.
              </div>
            )}
          </div>
          {activeStep && (
            <label className="ga-zoom-control" htmlFor="ga-zoom-range">
              <span className="ga-zoom-control-label">Zoom level</span>
              <div className="ga-zoom-control-row">
                <span className="ga-zoom-control-min">{ZOOM_MIN}%</span>
                <input
                  id="ga-zoom-range"
                  className="ga-zoom-range"
                  type="range"
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step="5"
                  value={zoomPercent}
                  onChange={(event) => setZoomPercent(Number(event.target.value))}
                />
                <span className="ga-zoom-control-value">{zoomPercent}%</span>
              </div>
            </label>
          )}
          <p className="ga-zoom-caption">
            {activeStep
              ? `${activeStep.label} in close-up. Slide to zoom, and drag the image to pan when zoomed in.`
              : 'The zoom panel updates as you explore each part.'}
          </p>
          <div className="ga-attribution" aria-label="Image attribution">
            <p className="ga-attribution-line">
              Overview image:{' '}
              <a href="https://www.vecteezy.com/free-vector/neuron" target="_blank" rel="noreferrer">
                Neuron Vectors by Vecteezy
              </a>
            </p>
            <p className="ga-attribution-line">
              Zoom image:{' '}
              <a href="https://upload.wikimedia.org/wikipedia/commons/a/a9/Complete_neuron_cell_diagram_en.svg" target="_blank" rel="noreferrer">
                Complete neuron cell diagram (English) via Wikimedia Commons
              </a>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
