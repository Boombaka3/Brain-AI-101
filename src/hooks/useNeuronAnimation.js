import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const SIGNAL_PULSE_COLOR = '#3B82F6'
const TERMINAL_GLOW_COLOR = '#60A5FA'

const canMeasurePath = (node) =>
  node &&
  typeof node.getTotalLength === 'function' &&
  typeof node.getPointAtLength === 'function'

export function useNeuronAnimation({
  weightedInputs,
  totalInput,
  threshold,
  didFire,
  replaySignal,
  currentPhase,
  dendritePathRefs,
  inputPulseRefs,
  somaFillRef,
  somaFillLineRef,
  somaGlowRef,
  thresholdRingRef,
  axonPathRef,
  axonPulseRef,
  terminalBranchRefs,
  boutonRefs,
  onPhaseChange,
  onComplete,
  restingSomaY,
  restingSomaHeight,
  activeSomaY,
  activeSomaHeight,
}) {
  const timelineRef = useRef(null)

  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  useEffect(() => {
    if (!replaySignal) return

    timelineRef.current?.kill()

    const tl = gsap.timeline({
      onComplete: () => {
        onPhaseChange?.('complete')
        onComplete?.()
      },
    })

    timelineRef.current = tl

    const activeInputIndexes = weightedInputs
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value > 0)

    gsap.set(inputPulseRefs.current.filter(Boolean), { opacity: 0, scale: 0.65 })
    if (axonPulseRef.current) {
      gsap.set(axonPulseRef.current, { opacity: 0, scale: 0.7 })
    }
    if (somaFillRef.current) {
      gsap.set(somaFillRef.current, {
        attr: { y: restingSomaY, height: restingSomaHeight },
        opacity: 0.2,
      })
    }
    if (somaFillLineRef.current) {
      gsap.set(somaFillLineRef.current, {
        attr: { y1: restingSomaY, y2: restingSomaY },
        opacity: 0.18,
      })
    }
    if (somaGlowRef.current) {
      gsap.set(somaGlowRef.current, { opacity: 0 })
    }
    if (thresholdRingRef.current) {
      gsap.set(thresholdRingRef.current, { opacity: 0.32, scale: 1 })
    }
    terminalBranchRefs.current.filter(Boolean).forEach((node) => {
      gsap.set(node, { opacity: 0.72, stroke: '' })
    })
    boutonRefs.current.filter(Boolean).forEach((node) => {
      gsap.set(node, {
        opacity: 0.9,
        scale: 1,
        transformOrigin: 'center center',
      })
    })

    tl.call(() => onPhaseChange?.('receive'))

    activeInputIndexes.forEach(({ index }, order) => {
      const pulseNode = inputPulseRefs.current[index]
      const pathNode = dendritePathRefs.current[index]
      if (!pulseNode || !canMeasurePath(pathNode)) return

      const pathLength = pathNode.getTotalLength()
      const tracker = { progress: 0 }
      const startPoint = pathNode.getPointAtLength(0)

      tl.set(
        pulseNode,
        {
          opacity: 0,
          scale: 0.65,
          attr: { cx: startPoint.x, cy: startPoint.y },
        },
        order === 0 ? '>' : '>-0.08',
      )
      tl.to(
        pulseNode,
        {
          opacity: 1,
          scale: 1,
          duration: 0.08,
          ease: 'power1.out',
        },
        '<',
      )
      tl.to(
        tracker,
        {
          progress: 1,
          duration: 0.34,
          ease: 'power1.inOut',
          onUpdate: () => {
            const point = pathNode.getPointAtLength(pathLength * tracker.progress)
            gsap.set(pulseNode, { attr: { cx: point.x, cy: point.y } })
          },
        },
        '<',
      )
      tl.to(
        pulseNode,
        {
          opacity: 0,
          duration: 0.08,
          ease: 'power1.in',
        },
        '>-0.1',
      )
    })

    tl.call(() => onPhaseChange?.('integrate'))
    if (somaFillRef.current && somaFillLineRef.current) {
      tl.to(
        somaFillRef.current,
        {
          attr: { y: activeSomaY, height: activeSomaHeight },
          opacity: 0.82,
          duration: 0.42,
          ease: 'power2.out',
        },
        '>',
      )
      tl.to(
        somaFillLineRef.current,
        {
          attr: { y1: activeSomaY, y2: activeSomaY },
          opacity: 0.64,
          duration: 0.42,
          ease: 'power2.out',
        },
        '<',
      )
    }
    if (somaGlowRef.current) {
      tl.to(
        somaGlowRef.current,
        {
          opacity: 0.55,
          duration: 0.24,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        '<+0.08',
      )
    }

    tl.call(() => onPhaseChange?.('compare'))
    if (thresholdRingRef.current) {
      tl.to(
        thresholdRingRef.current,
        {
          opacity: didFire ? 1 : 0.82,
          scale: didFire ? 1.06 : 1.03,
          duration: 0.2,
          ease: 'power2.out',
        },
        '>',
      )
      tl.to(
        thresholdRingRef.current,
        {
          opacity: didFire ? 0.86 : 0.58,
          scale: 1,
          duration: 0.22,
          ease: 'power2.out',
        },
        '>',
      )
    }

    if (!didFire) {
      tl.call(() => onComplete?.())
      return () => tl.kill()
    }

    tl.call(() => onPhaseChange?.('fire'))
    if (axonPulseRef.current && canMeasurePath(axonPathRef.current)) {
      const pathLength = axonPathRef.current.getTotalLength()
      const tracker = { progress: 0 }
      const startPoint = axonPathRef.current.getPointAtLength(0)

      tl.set(
        axonPulseRef.current,
        {
          opacity: 0,
          scale: 0.72,
          attr: { cx: startPoint.x, cy: startPoint.y },
          fill: SIGNAL_PULSE_COLOR,
        },
        '>',
      )
      tl.to(
        axonPulseRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.08,
          ease: 'power1.out',
        },
        '<',
      )
      tl.to(
        tracker,
        {
          progress: 1,
          duration: 0.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            const point = axonPathRef.current.getPointAtLength(pathLength * tracker.progress)
            gsap.set(axonPulseRef.current, { attr: { cx: point.x, cy: point.y } })
          },
        },
        '<',
      )
    }

    tl.call(() => onPhaseChange?.('terminal'))
    terminalBranchRefs.current.filter(Boolean).forEach((node, index) => {
      tl.to(
        node,
        {
          opacity: 1,
          stroke: TERMINAL_GLOW_COLOR,
          duration: 0.14,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        index === 0 ? '>' : '<+0.04',
      )
    })

    tl.call(() => onPhaseChange?.('boutons'))
    boutonRefs.current.filter(Boolean).forEach((node, index) => {
      tl.to(
        node,
        {
          opacity: 1,
          scale: 1.22,
          duration: 0.12,
          ease: 'back.out(2.2)',
          fill: SIGNAL_PULSE_COLOR,
          yoyo: true,
          repeat: 1,
        },
        index === 0 ? '>' : '<+0.03',
      )
    })

    if (axonPulseRef.current) {
      tl.to(
        axonPulseRef.current,
        {
          opacity: 0,
          duration: 0.14,
          ease: 'power2.in',
        },
        '<+0.1',
      )
    }

    return () => tl.kill()
  }, [
    activeSomaHeight,
    activeSomaY,
    axonPathRef,
    axonPulseRef,
    boutonRefs,
    currentPhase,
    dendritePathRefs,
    didFire,
    inputPulseRefs,
    onComplete,
    onPhaseChange,
    replaySignal,
    restingSomaHeight,
    restingSomaY,
    somaFillLineRef,
    somaFillRef,
    somaGlowRef,
    terminalBranchRefs,
    threshold,
    thresholdRingRef,
    totalInput,
    weightedInputs,
  ])
}
