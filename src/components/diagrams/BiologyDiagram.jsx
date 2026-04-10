import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useNeuronAnimation } from '../../hooks/useNeuronAnimation'

/**
 * BiologyDiagram - Authoritative biological neuron visualization
 * 
 * EXTENDED CIRCUIT (optional):
 * - Neuron A can connect to both Neuron B and Neuron C
 * - Demonstrates divergent signaling ("one neuron affects many")
 * - Axon branches at terminal to reach both targets
 */
function BiologyDiagram({
  inputs = [],
  neuronATotalInput,
  neuronAThreshold,
  neuronAFires,
  neuronBInput,
  neuronBThreshold,
  neuronBFires,
  neuronCInput = 0,
  neuronCThreshold = 1,
  neuronCFires = false,
  showExtendedCircuit = false,
  isMobile = false,
  isSimpleMode = true,
  currentPhase = 'idle',
  didFire = neuronAFires,
  replaySignal = 0,
  onInteractionLockChange
}) {
  const [aVisualTotal, setAVisualTotal] = useState(0)
  const [bVisualInput, setBVisualInput] = useState(0)
  const [cVisualInput, setCVisualInput] = useState(0)
  
  // Refs for Neuron A
  const somaFillARef = useRef(null)
  const somaFillLineARef = useRef(null)
  const triggerZoneARef = useRef(null)
  const axonPulseRef = useRef(null)
  const dendriteContactRefs = useRef([])
  const dendritePathRefs = useRef([])
  const inputPulseRefs = useRef([])
  const dendriteBranchRefs = useRef([])
  const somaGroupARef = useRef(null)
  const nucleusARef = useRef(null)
  const hillockARef = useRef(null)
  const initialSegmentARef = useRef(null)
  const routeRefs = useRef({
    axonMain: null,
    hillockToAxon: null,
    axonBranchB: null,
    axonBranchC: null,
  })
  const terminalBranchRefs = useRef({
    B: {},
    C: {},
  })
  const boutonRefs = useRef({
    B: {},
    C: {},
  })
  const futureEffectsRef = useRef(null)
  const receiveTimelineRef = useRef(null)
  const integrateTimelineRef = useRef(null)
  const compareTimelineRef = useRef(null)
  const fireTimelineRef = useRef(null)
  const passTimelineRef = useRef(null)
  const completeTimelineRef = useRef(null)
  
  // Refs for Neuron B
  const somaFillBRef = useRef(null)
  const somaFillLineBRef = useRef(null)
  const thresholdRingBRef = useRef(null)
  
  // Refs for Neuron C (extended circuit)
  const somaFillCRef = useRef(null)
  const somaFillLineCRef = useRef(null)
  const thresholdRingCRef = useRef(null)
  const axonBranchPulseRef = useRef(null)

  // === DIMENSIONS ===
  const svgWidth = isMobile && typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 800
  const svgHeight = showExtendedCircuit ? 380 : 300

  const stagePaddingX = 20
  const stagePaddingY = 20
  const stageWidth = svgWidth - stagePaddingX * 2
  const stageHeight = svgHeight - stagePaddingY * 2

  // === NEURON POSITIONING ===
  const neuronACenterX = stageWidth * 0.32
  const neuronACenterY = stageHeight / 2
  const neuronASomaRadius = 52
  const neuronAThresholdRadius = neuronASomaRadius * 0.72
  const axonHillockLength = 14

  // Neuron B position (upper when extended, centered otherwise)
  const neuronBCenterX = stageWidth * 0.72
  const neuronBCenterY = showExtendedCircuit ? stageHeight * 0.35 : stageHeight / 2
  const neuronBSomaRadius = 52
  const neuronBThresholdRadius = neuronBSomaRadius * 0.72

  // Neuron C position (lower, only when extended)
  const neuronCCenterX = stageWidth * 0.72
  const neuronCCenterY = stageHeight * 0.65
  const neuronCSomaRadius = 52
  const neuronCThresholdRadius = neuronCSomaRadius * 0.72

  // === AXON PATHS ===
  const axonStartX = neuronACenterX + neuronASomaRadius + axonHillockLength
  const synapticGap = 20
  
  // Branch point (where axon splits)
  const branchPointX = showExtendedCircuit ? stageWidth * 0.52 : neuronBCenterX - neuronBSomaRadius - synapticGap
  const branchPointY = neuronACenterY
  
  // Axon endpoints
  const axonEndBX = neuronBCenterX - neuronBSomaRadius - synapticGap
  const axonEndBY = neuronBCenterY
  const axonEndCX = neuronCCenterX - neuronCSomaRadius - synapticGap
  const axonEndCY = neuronCCenterY

  // === INPUT CONFIGURATION ===
  const numInputs = inputs.length > 0 ? inputs.length : 4
  const inputValues = inputs.length > 0 ? inputs : Array.from({ length: numInputs }, () => 0)
  const inputMax = Math.max(...inputValues, 1)

  // === FILL CALCULATIONS ===
  const somaDiameterA = neuronASomaRadius * 2
  
  const calculateFillHeight = (totalInput, threshold, somaRadius, thresholdRadius) => {
    const somaDiameter = somaRadius * 2
    const thresholdHeight = thresholdRadius * 2
    if (totalInput <= 0) return 0
    const ratio = totalInput / Math.max(threshold, 1)
    if (ratio <= 1) {
      return thresholdHeight * ratio
    } else {
      const excessRatio = ratio - 1
      const maxExcess = (somaDiameter - thresholdHeight) * 0.85
      const dampedExcess = maxExcess * (1 - Math.exp(-excessRatio * 0.8))
      return thresholdHeight + dampedExcess
    }
  }
  
  const showIntegratedTotal =
    currentPhase === 'integrate' ||
    currentPhase === 'compare' ||
    currentPhase === 'fire' ||
    currentPhase === 'pass-on' ||
    currentPhase === 'complete'
  const showDownstreamSignal =
    didFire && (currentPhase === 'pass-on' || currentPhase === 'complete')
  const visibleNeuronBInput = showDownstreamSignal ? neuronBInput : 0

  const fillHeightA = calculateFillHeight(aVisualTotal, neuronAThreshold, neuronASomaRadius, neuronAThresholdRadius)
  const fillHeightB = calculateFillHeight(visibleNeuronBInput, neuronBThreshold, neuronBSomaRadius, neuronBThresholdRadius)
  const fillHeightC = calculateFillHeight(cVisualInput, neuronCThreshold, neuronCSomaRadius, neuronCThresholdRadius)
  
  const fillTopYA = neuronACenterY + neuronASomaRadius - fillHeightA
  const fillTopYB = neuronBCenterY + neuronBSomaRadius - fillHeightB
  const fillTopYC = neuronCCenterY + neuronCSomaRadius - fillHeightC

  // Ratios for visual state
  const ratioA = aVisualTotal / Math.max(neuronAThreshold, 1)
  const ratioB = visibleNeuronBInput / Math.max(neuronBThreshold, 1)
  const ratioC = cVisualInput / Math.max(neuronCThreshold, 1)
  const nearThresholdA = ratioA >= 0.85 && ratioA < 1
  const nearThresholdB = ratioB >= 0.85 && ratioB < 1
  const nearThresholdC = ratioC >= 0.85 && ratioC < 1
  const visualBFires = bVisualInput > 0 ? neuronBFires : false
  const visualCFires = cVisualInput > 0 ? neuronCFires : false

  // === VISUAL STATES ===
  const thresholdRingStroke = '#D97706'
  const thresholdRingDash = '6 4'
  const thresholdRingWidth = 2
  const thresholdRingOpacityA = neuronAFires ? 0.35 : nearThresholdA ? 0.85 : 0.55
  const thresholdRingOpacityB = visualBFires ? 0.35 : nearThresholdB ? 0.85 : 0.55
  const thresholdRingOpacityC = visualCFires ? 0.35 : nearThresholdC ? 0.85 : 0.55
  const fillOpacityA = neuronAFires ? 0.88 : nearThresholdA ? 0.82 : 0.72
  const fillOpacityB = visualBFires ? 0.88 : nearThresholdB ? 0.82 : 0.72
  const fillOpacityC = visualCFires ? 0.88 : nearThresholdC ? 0.82 : 0.72

  const showDetailed = !isSimpleMode

  const emphasisByPhase = {
    ready: { dendrites: 0.68, somaA: 0.82, threshold: 0.7, axon: 0.5, synapse: 0.45, somaB: 0.58 },
    idle: { dendrites: 0.46, somaA: 0.52, threshold: 0.34, axon: 0.24, synapse: 0.22, somaB: 0.3 },
    receive: { dendrites: 1, somaA: 0.78, threshold: 0.55, axon: 0.35, synapse: 0.3, somaB: 0.42 },
    integrate: { dendrites: 0.72, somaA: 1, threshold: 0.7, axon: 0.38, synapse: 0.32, somaB: 0.45 },
    compare: { dendrites: 0.58, somaA: 0.92, threshold: 1, axon: 0.42, synapse: 0.38, somaB: 0.48 },
    fire: { dendrites: 0.46, somaA: 1, threshold: 0.82, axon: 1, synapse: 0.82, somaB: 0.54 },
    'pass-on': { dendrites: 0.4, somaA: 0.78, threshold: 0.6, axon: 0.96, synapse: 1, somaB: 1 },
    complete: didFire
      ? { dendrites: 0.34, somaA: 0.7, threshold: 0.5, axon: 0.76, synapse: 0.9, somaB: 1 }
      : { dendrites: 0.32, somaA: 0.7, threshold: 0.92, axon: 0.2, synapse: 0.18, somaB: 0.28 },
  }
  const phaseEmphasis = emphasisByPhase[currentPhase] ?? emphasisByPhase.ready

  // === COLORS ===
  const dendriteColor = '#5B9BD5'
  const dendriteActiveColor = '#3B82F6'
  const somaFillBase = '#D1FAE5'
  const somaFillActive = '#34D399'
  const somaFillFiring = '#10B981'
  const somaStroke = '#065F46'
  const synapseColor = '#059669'
  const axonColor = '#5B9BD5'
  const signalBeadColor = '#3B82F6'
  const labelColor = '#4B5563'
  const compareGlowColor = '#F59E0B'
  const nucleusFill = '#0F766E'
  const nucleusCoreFill = '#115E59'
  const hookPhase = 'idle'

  const timelineRefs = [
    receiveTimelineRef,
    integrateTimelineRef,
    compareTimelineRef,
    fireTimelineRef,
    passTimelineRef,
    completeTimelineRef,
  ]

  const killTimeline = (timelineRef) => {
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }
  }

  const killActiveTimelines = () => {
    timelineRefs.forEach(killTimeline)
  }

  const canMeasurePath = (node) =>
    node &&
    typeof node.getTotalLength === 'function' &&
    typeof node.getPointAtLength === 'function'

  const setPulseToPathProgress = (pulseNode, pathNode, progress) => {
    if (!pulseNode || !canMeasurePath(pathNode)) return
    const point = pathNode.getPointAtLength(pathNode.getTotalLength() * progress)
    gsap.set(pulseNode, { attr: { cx: point.x, cy: point.y } })
  }

  const animatePulseAlongPath = (timeline, pulseNode, pathNode, startAt, duration) => {
    if (!pulseNode || !canMeasurePath(pathNode)) return startAt
    const tracker = { progress: 0 }
    const pathLength = pathNode.getTotalLength()

    timeline.to(
      tracker,
      {
        progress: 1,
        duration,
        ease: 'power2.inOut',
        onUpdate: () => {
          const point = pathNode.getPointAtLength(pathLength * tracker.progress)
          gsap.set(pulseNode, { attr: { cx: point.x, cy: point.y } })
        },
      },
      startAt,
    )

    return startAt + duration
  }

  const getAnimationTargets = () => ([
    ...inputPulseRefs.current,
    ...dendriteContactRefs.current,
    ...Object.values(dendriteBranchRefs.current),
    somaFillARef.current,
    somaFillLineARef.current,
    somaFillBRef.current,
    somaFillLineBRef.current,
    somaFillCRef.current,
    somaFillLineCRef.current,
    somaGroupARef.current,
    nucleusARef.current,
    hillockARef.current,
    initialSegmentARef.current,
    triggerZoneARef.current,
    axonPulseRef.current,
    axonBranchPulseRef.current,
    futureEffectsRef.current,
    ...Object.values(routeRefs.current),
    ...Object.values(terminalBranchRefs.current.B),
    ...Object.values(terminalBranchRefs.current.C),
    ...Object.values(boutonRefs.current.B),
    ...Object.values(boutonRefs.current.C),
  ].filter(Boolean))

  const killActiveTweens = () => {
    const targets = getAnimationTargets()
    if (targets.length > 0) {
      gsap.killTweensOf(targets)
    }
  }

  const resetAnimatedVisualState = ({ unlockInteraction = true } = {}) => {
    killActiveTimelines()
    killActiveTweens()

    inputPulseRefs.current.forEach((node, index) => {
      if (!node) return
      const path = dendritePathRefs.current[index]
      if (!canMeasurePath(path)) {
        gsap.set(node, { opacity: 0, scale: 1, clearProps: 'filter' })
        return
      }
      const startPoint = path.getPointAtLength(0)
      gsap.set(node, {
        opacity: 0,
        scale: 1,
        attr: { cx: startPoint.x, cy: startPoint.y },
        clearProps: 'filter',
        transformOrigin: 'center center',
      })
    })

    dendriteContactRefs.current.forEach((node) => {
      if (!node) return
      gsap.set(node, {
        opacity: '',
        scale: 1,
        clearProps: 'filter',
        transformOrigin: 'center center',
      })
    })

    Object.values(dendriteBranchRefs.current).forEach((node) => {
      if (!node) return
      gsap.set(node, { clearProps: 'opacity,scale,filter', transformOrigin: 'center center' })
    })

    ;[
      somaFillARef.current,
      somaFillLineARef.current,
      somaFillBRef.current,
      somaFillLineBRef.current,
      somaFillCRef.current,
      somaFillLineCRef.current,
    ].forEach((node) => {
      if (!node) return
      gsap.set(node, { clearProps: 'opacity,scale,filter' })
    })

    Object.values(terminalBranchRefs.current.B).forEach((node) => {
      if (!node) return
      gsap.set(node, { clearProps: 'opacity,scale,filter', transformOrigin: 'center center' })
    })
    Object.values(terminalBranchRefs.current.C).forEach((node) => {
      if (!node) return
      gsap.set(node, { clearProps: 'opacity,scale,filter', transformOrigin: 'center center' })
    })

    Object.values(boutonRefs.current.B).forEach((node) => {
      if (!node) return
      gsap.set(node, { clearProps: 'opacity,scale,filter', transformOrigin: 'center center' })
    })
    Object.values(boutonRefs.current.C).forEach((node) => {
      if (!node) return
      gsap.set(node, { clearProps: 'opacity,scale,filter', transformOrigin: 'center center' })
    })

    if (somaGroupARef.current) {
      gsap.set(somaGroupARef.current, {
        scale: 1,
        transformOrigin: `${neuronACenterX}px ${neuronACenterY}px`,
      })
    }

    if (nucleusARef.current) {
      gsap.set(nucleusARef.current, {
        scale: 1,
        opacity: 1,
        transformOrigin: `${neuronACenterX}px ${neuronACenterY}px`,
      })
    }

    if (hillockARef.current) {
      gsap.set(hillockARef.current, { clearProps: 'opacity,filter' })
    }

    if (initialSegmentARef.current) {
      gsap.set(initialSegmentARef.current, {
        scale: 1,
        opacity: '',
        clearProps: 'filter',
        transformOrigin: `${axonStartX - 10}px ${neuronACenterY}px`,
      })
    }

    if (triggerZoneARef.current) {
      gsap.set(triggerZoneARef.current, {
        clearProps: 'opacity,strokeWidth,filter',
      })
    }

    if (axonPulseRef.current) {
      gsap.set(axonPulseRef.current, {
        opacity: 0,
        scale: 1,
        attr: { cx: axonStartX, cy: neuronACenterY },
        transformOrigin: 'center center',
      })
    }

    if (axonBranchPulseRef.current) {
      gsap.set(axonBranchPulseRef.current, {
        opacity: 0,
        scale: 1,
        attr: { cx: branchPointX, cy: branchPointY },
        transformOrigin: 'center center',
      })
    }

    if (futureEffectsRef.current) {
      gsap.set(futureEffectsRef.current, { clearProps: 'opacity,filter' })
    }

    Object.values(routeRefs.current).forEach((node) => {
      if (!node) return
      gsap.set(node, { clearProps: 'opacity,scale,strokeWidth,filter' })
    })

    setAVisualTotal(0)
    setBVisualInput(0)
    setCVisualInput(0)

    if (unlockInteraction && onInteractionLockChange) {
      onInteractionLockChange(false)
    }
  }

  useNeuronAnimation({
    neuronAFires,
    neuronBInput,
    neuronCInput,
    inputValues,
    neuronAThreshold,
    axonStartX,
    axonEndBX,
    axonEndBY,
    axonEndCX,
    axonEndCY,
    branchPointX,
    branchPointY,
    axonY: neuronACenterY,
    fillTopYA,
    fillHeightA,
    fillTopYB,
    fillHeightB,
    fillTopYC,
    fillHeightC,
    fillOpacityA,
    fillOpacityB,
    fillOpacityC,
    thresholdRingOpacityA,
    thresholdRingOpacityB,
    thresholdRingOpacityC,
    somaFillARef,
    somaFillLineARef,
    somaFillBRef,
    somaFillLineBRef,
    somaFillCRef,
    somaFillLineCRef,
    thresholdRingARef: triggerZoneARef,
    thresholdRingBRef,
    thresholdRingCRef,
    pulseRef: axonPulseRef,
    pulseBranchRef: axonBranchPulseRef,
    axonSynapseBRef: { current: boutonRefs.current.B.root ?? null },
    axonSynapseCRef: { current: boutonRefs.current.C.root ?? null },
    synapseRefs: dendriteContactRefs,
    dendritePathRefs,
    inputPulseRefs,
    setAVisualTotal,
    setBVisualInput,
    setCVisualInput,
    showExtendedCircuit,
    currentPhase: hookPhase,
    didFire,
    replaySignal,
    onInteractionLockChange,
  })

  useEffect(() => {
    if (!showIntegratedTotal) {
      const frame = requestAnimationFrame(() => setAVisualTotal(0))
      return () => cancelAnimationFrame(frame)
    }
    if (currentPhase === 'compare' || currentPhase === 'fire' || currentPhase === 'pass-on' || currentPhase === 'complete') {
      const frame = requestAnimationFrame(() => setAVisualTotal(neuronATotalInput))
      return () => cancelAnimationFrame(frame)
    }
  }, [currentPhase, neuronATotalInput, showIntegratedTotal])

  useEffect(() => {
    if (!showDownstreamSignal || neuronBInput <= 0) {
      const frame = requestAnimationFrame(() => setBVisualInput(0))
      return () => cancelAnimationFrame(frame)
    }
    const frame = requestAnimationFrame(() => setBVisualInput(neuronBInput))
    return () => cancelAnimationFrame(frame)
  }, [showDownstreamSignal, neuronBInput])

  useEffect(() => {
    if (!neuronAFires || neuronCInput <= 0) {
      const frame = requestAnimationFrame(() => setCVisualInput(0))
      return () => cancelAnimationFrame(frame)
    }
  }, [neuronAFires, neuronCInput])

  useEffect(() => {
    if (currentPhase === 'idle') {
      resetAnimatedVisualState()
    }
  }, [currentPhase, neuronACenterX, neuronACenterY, axonStartX, branchPointX, branchPointY, onInteractionLockChange, phaseEmphasis.threshold, thresholdRingOpacityA])

  useEffect(() => {
    if (!replaySignal) return

    resetAnimatedVisualState()
  }, [replaySignal, neuronACenterX, neuronACenterY, axonStartX, branchPointX, branchPointY, onInteractionLockChange, phaseEmphasis.threshold, thresholdRingOpacityA])

  useEffect(() => {
    if (currentPhase !== 'receive') return

    killTimeline(receiveTimelineRef)
    const tl = gsap.timeline()
    receiveTimelineRef.current = tl

    const activeRoutes = inputValues
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value > 0)
      .slice(0, 4)

    if (activeRoutes.length === 0) return () => killTimeline(receiveTimelineRef)

    activeRoutes.forEach(({ index }, routeIndex) => {
      const pulseNode = inputPulseRefs.current[index]
      const pathNode = dendritePathRefs.current[index]
      const contactNode = dendriteContactRefs.current[index]
      const branchNode = dendriteBranchRefs.current[`${index}-0`]
      if (!pulseNode || !canMeasurePath(pathNode)) return

      const tracker = { progress: 0 }
      const pathLength = pathNode.getTotalLength()
      const startDelay = routeIndex * 0.12 + (index % 2) * 0.04
      const travelDuration = Math.min(0.62, 0.34 + pathLength / 420)

      tl.set(
        pulseNode,
        {
          opacity: 0,
          scale: 0.72,
          transformOrigin: 'center center',
        },
        startDelay,
      )

      if (branchNode) {
        tl.to(
          branchNode,
          {
            opacity: '+=0.12',
            duration: 0.18,
            ease: 'power1.out',
            yoyo: true,
            repeat: 1,
          },
          startDelay,
        )
      }

      tl.to(
        pulseNode,
        {
          opacity: 1,
          scale: 1,
          duration: 0.12,
          ease: 'power1.out',
        },
        startDelay + 0.02,
      )

      tl.to(
        tracker,
        {
          progress: 1,
          duration: travelDuration,
          ease: 'power1.inOut',
          onUpdate: () => {
            const point = pathNode.getPointAtLength(pathLength * tracker.progress)
            gsap.set(pulseNode, { attr: { cx: point.x, cy: point.y } })
          },
        },
        startDelay + 0.02,
      )

      if (contactNode) {
        tl.to(
          contactNode,
          {
            opacity: 1,
            scale: 1.08,
            transformOrigin: 'center center',
            duration: 0.18,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          },
          startDelay + Math.max(0.24, travelDuration - 0.08),
        )
      }

      tl.to(
        pulseNode,
        {
          opacity: 0,
          duration: 0.1,
          ease: 'power1.in',
        },
        startDelay + travelDuration - 0.02,
      )
    })

    return () => killTimeline(receiveTimelineRef)
  }, [currentPhase, inputValues, replaySignal])

  useEffect(() => {
    if (currentPhase !== 'integrate') return

    killTimeline(integrateTimelineRef)
    const tl = gsap.timeline()
    integrateTimelineRef.current = tl

    const cumulativeInputs = inputValues.reduce((acc, value) => {
      const previous = acc.length > 0 ? acc[acc.length - 1] : 0
      acc.push(previous + value)
      return acc
    }, [])
    const activeSteps = cumulativeInputs.filter((value, index) => inputValues[index] > 0)

    tl.call(() => setAVisualTotal(0))

    if (somaGroupARef.current) {
      tl.to(
        somaGroupARef.current,
        {
          scale: 1.008,
          transformOrigin: `${neuronACenterX}px ${neuronACenterY}px`,
          duration: 0.28,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        0,
      )
    }

    if (nucleusARef.current) {
      tl.to(
        nucleusARef.current,
        {
          opacity: 0.96,
          duration: 0.24,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        0.06,
      )
    }

    if (somaFillARef.current) {
      tl.to(
        somaFillARef.current,
        {
          opacity: Math.min(0.96, fillOpacityA + 0.12),
          duration: 0.24,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        0.02,
      )
    }

    if (somaFillLineARef.current) {
      tl.to(
        somaFillLineARef.current,
        {
          opacity: Math.min(0.98, fillOpacityA + 0.18),
          duration: 0.2,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        0.06,
      )
    }

    if (hillockARef.current) {
      tl.to(
        hillockARef.current,
        {
          opacity: Math.min(1, phaseEmphasis.somaA + 0.08),
          duration: 0.18,
          ease: 'power2.out',
        },
        0.1,
      )
    }

    activeSteps.forEach((value, index) => {
      tl.call(() => setAVisualTotal(value), null, 0.14 + index * 0.2)
    })

    return () => killTimeline(integrateTimelineRef)
  }, [currentPhase, inputValues, neuronACenterX, neuronACenterY, phaseEmphasis.somaA, fillOpacityA, replaySignal])

  useEffect(() => {
    if (currentPhase !== 'compare') return

    killTimeline(compareTimelineRef)
    const tl = gsap.timeline()
    compareTimelineRef.current = tl

    if (triggerZoneARef.current) {
      tl.to(triggerZoneARef.current, {
        opacity: 1,
        strokeWidth: thresholdRingWidth + 0.8,
        duration: 0.18,
        ease: 'power2.out',
      })
      tl.to({}, { duration: 0.1 })
      tl.to(triggerZoneARef.current, {
        opacity: Math.min(1, thresholdRingOpacityA + 0.12),
        strokeWidth: thresholdRingWidth,
        duration: 0.14,
        ease: 'power2.out',
      })
    }

    if (hillockARef.current) {
      tl.to(
        hillockARef.current,
        {
          opacity: Math.min(1, phaseEmphasis.threshold + 0.16),
          duration: 0.18,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        0.04,
      )
    }

    return () => killTimeline(compareTimelineRef)
  }, [currentPhase, thresholdRingOpacityA, phaseEmphasis.threshold, thresholdRingWidth, replaySignal])

  useEffect(() => {
    if (currentPhase !== 'fire' || !didFire) return

    killTimeline(fireTimelineRef)
    const tl = gsap.timeline({
      onStart: () => {
        if (onInteractionLockChange) onInteractionLockChange(true)
      },
    })
    fireTimelineRef.current = tl

    const hillockRoute = routeRefs.current.hillockToAxon
    const axonMainRoute = routeRefs.current.axonMain
    const branchBRoute = routeRefs.current.axonBranchB
    const branchCRoute = routeRefs.current.axonBranchC

    tl.set(axonPulseRef.current, {
      opacity: 0,
      scale: 0.86,
      transformOrigin: 'center center',
    })
    setPulseToPathProgress(axonPulseRef.current, hillockRoute, 0)

    if (showExtendedCircuit && axonBranchPulseRef.current) {
      tl.set(axonBranchPulseRef.current, {
        opacity: 0,
        scale: 0.82,
        transformOrigin: 'center center',
      })
      setPulseToPathProgress(axonBranchPulseRef.current, branchCRoute, 0)
    }

    tl.to(
      axonPulseRef.current,
      {
        opacity: 1,
        scale: 1,
        duration: 0.08,
        ease: 'power2.out',
      },
      0,
    )

    if (hillockARef.current) {
      tl.to(
        hillockARef.current,
        {
          opacity: Math.min(1, phaseEmphasis.axon + 0.18),
          duration: 0.08,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        0,
      )
    }

    if (initialSegmentARef.current) {
      tl.to(
        initialSegmentARef.current,
        {
          opacity: 1,
          scale: 1.04,
          transformOrigin: `${axonStartX - 10}px ${neuronACenterY}px`,
          duration: 0.08,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
        },
        0.01,
      )
    }

    let cursor = 0.08
    cursor = animatePulseAlongPath(tl, axonPulseRef.current, hillockRoute, cursor, 0.18)
    cursor = animatePulseAlongPath(tl, axonPulseRef.current, axonMainRoute, cursor, showExtendedCircuit ? 0.4 : 0.44)

    if (showExtendedCircuit) {
      tl.to(
        axonBranchPulseRef.current,
        {
          opacity: 1,
          scale: 0.96,
          duration: 0.06,
          ease: 'power2.out',
        },
        cursor - 0.04,
      )

      animatePulseAlongPath(tl, axonPulseRef.current, branchBRoute, cursor - 0.02, 0.28)
      animatePulseAlongPath(tl, axonBranchPulseRef.current, branchCRoute, cursor - 0.02, 0.3)
    }

    return () => killTimeline(fireTimelineRef)
  }, [currentPhase, didFire, showExtendedCircuit, onInteractionLockChange, replaySignal])

  useEffect(() => {
    if (currentPhase !== 'pass-on' || !didFire) return

    killTimeline(passTimelineRef)
    const tl = gsap.timeline({
      onComplete: () => {
        if (showExtendedCircuit) {
          setBVisualInput(neuronBInput)
          setCVisualInput(neuronCInput)
        } else {
          setBVisualInput(neuronBInput)
        }
      },
    })
    passTimelineRef.current = tl

    const activateTerminal = (target, offset = 0) => {
      const branches = terminalBranchRefs.current[target]
      const boutons = boutonRefs.current[target]
      const orderedBranchKeys = ['primary', 'up', 'down', 'forward']
      const orderedBoutonKeys = ['root', 'mid', 'up', 'down', 'forward']
      const primaryBranch = branches.primary
      const rootBouton = boutons.root

      if (primaryBranch) {
        tl.to(
          primaryBranch,
          {
            opacity: 1,
            scale: 1.04,
            transformOrigin: 'center center',
            duration: 0.16,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          },
          offset,
        )
      }

      if (rootBouton) {
        tl.to(
          rootBouton,
          {
            opacity: 1,
            scale: 1.22,
            transformOrigin: 'center center',
            duration: 0.1,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          },
          offset + 0.02,
        )
      }

      tl.to({}, { duration: 0.08 }, offset + 0.08)

      orderedBranchKeys.slice(1).forEach((key, index) => {
        const node = branches[key]
        if (!node) return
        tl.to(
          node,
          {
            opacity: 1,
            scale: 1.03,
            transformOrigin: 'center center',
            duration: 0.14,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          },
          offset + 0.16 + index * 0.07,
        )
      })

      orderedBoutonKeys.slice(1).forEach((key, index) => {
        const node = boutons[key]
        if (!node) return
        tl.to(
          node,
          {
            opacity: 1,
            scale: 1.1,
            transformOrigin: 'center center',
            duration: 0.1,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
          },
          offset + 0.2 + index * 0.06,
        )
      })
    }

    if (showExtendedCircuit) {
      activateTerminal('B', 0)
      activateTerminal('C', 0.08)
      tl.to(
        [axonPulseRef.current, axonBranchPulseRef.current],
        {
          opacity: 0,
          duration: 0.14,
          ease: 'power2.in',
        },
        0.02,
      )
    } else {
      activateTerminal('B', 0)
      tl.to(
        axonPulseRef.current,
        {
          opacity: 0,
          duration: 0.14,
          ease: 'power2.in',
        },
        0.02,
      )
    }

    return () => killTimeline(passTimelineRef)
  }, [currentPhase, didFire, showExtendedCircuit, neuronBInput, neuronCInput, replaySignal])

  useEffect(() => {
    if (currentPhase !== 'complete') return

    killTimeline(completeTimelineRef)
    const tl = gsap.timeline({
      onComplete: () => {
        if (onInteractionLockChange) onInteractionLockChange(false)
      },
    })
    completeTimelineRef.current = tl

    tl.to(
      Object.values(boutonRefs.current.B).filter(Boolean),
      {
        opacity: phaseEmphasis.synapse * 0.92,
        scale: 1,
        duration: 0.18,
        ease: 'power2.out',
        stagger: 0.02,
      },
      0,
    )

    if (showExtendedCircuit) {
      tl.to(
        Object.values(boutonRefs.current.C).filter(Boolean),
        {
          opacity: phaseEmphasis.synapse * 0.9,
          scale: 1,
          duration: 0.18,
          ease: 'power2.out',
          stagger: 0.02,
        },
        0,
      )
    }

    return () => killTimeline(completeTimelineRef)
  }, [currentPhase, showExtendedCircuit, phaseEmphasis.synapse, onInteractionLockChange, replaySignal])

  const buildOrganicSomaPath = (centerX, centerY, radius, hillockScale = 1) => {
    const hillockX = radius * 0.24 * hillockScale
    const hillockY = radius * 0.14 * hillockScale
    return `
      M ${centerX - radius * 0.88} ${centerY - radius * 0.08}
      C ${centerX - radius * 1.02} ${centerY - radius * 0.68}, ${centerX - radius * 0.52} ${centerY - radius * 1.02}, ${centerX + radius * 0.02} ${centerY - radius * 0.98}
      C ${centerX + radius * 0.5} ${centerY - radius * 0.94}, ${centerX + radius * 0.86} ${centerY - radius * 0.5}, ${centerX + radius * 0.96 + hillockX} ${centerY - hillockY}
      C ${centerX + radius * 1.04 + hillockX} ${centerY + radius * 0.04}, ${centerX + radius * 0.98 + hillockX} ${centerY + radius * 0.24}, ${centerX + radius * 0.84} ${centerY + radius * 0.46}
      C ${centerX + radius * 0.6} ${centerY + radius * 0.82}, ${centerX + radius * 0.1} ${centerY + radius * 1.04}, ${centerX - radius * 0.32} ${centerY + radius * 0.98}
      C ${centerX - radius * 0.74} ${centerY + radius * 0.9}, ${centerX - radius * 1.02} ${centerY + radius * 0.34}, ${centerX - radius * 0.9} ${centerY - radius * 0.04}
      Z
    `.replace(/\s+/g, ' ').trim()
  }

  const buildHillockPath = (centerX, centerY, radius) => `
    M ${centerX + radius * 0.74} ${centerY - radius * 0.12}
    C ${centerX + radius * 0.94} ${centerY - radius * 0.14}, ${centerX + radius * 1.1} ${centerY - 7}, ${axonStartX - 1} ${centerY}
    C ${centerX + radius * 1.1} ${centerY + 7}, ${centerX + radius * 0.96} ${centerY + radius * 0.18}, ${centerX + radius * 0.72} ${centerY + radius * 0.16}
    Z
  `.replace(/\s+/g, ' ').trim()

  const buildPrimaryDendritePath = (startX, startY, c1x, c1y, c2x, c2y, endX, endY) => `
    M ${startX} ${startY}
    C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}
  `.replace(/\s+/g, ' ').trim()

  const buildTerminalBranchPath = (startX, startY, branchX, branchY, endX, endY) => `
    M ${startX} ${startY}
    Q ${branchX} ${branchY}, ${endX} ${endY}
  `.replace(/\s+/g, ' ').trim()

  const dendriteTemplates = [
    {
      startX: neuronACenterX - 214,
      startY: neuronACenterY - 118,
      c1x: neuronACenterX - 198,
      c1y: neuronACenterY - 154,
      c2x: neuronACenterX - 126,
      c2y: neuronACenterY - 82,
      endX: neuronACenterX - neuronASomaRadius + 14,
      endY: neuronACenterY - 44,
      branches: [
        { startX: neuronACenterX - 186, startY: neuronACenterY - 138, c1x: neuronACenterX - 206, c1y: neuronACenterY - 168, endX: neuronACenterX - 224, endY: neuronACenterY - 186 },
        { startX: neuronACenterX - 150, startY: neuronACenterY - 106, c1x: neuronACenterX - 166, c1y: neuronACenterY - 134, endX: neuronACenterX - 180, endY: neuronACenterY - 152 },
        { startX: neuronACenterX - 126, startY: neuronACenterY - 88, c1x: neuronACenterX - 142, c1y: neuronACenterY - 72, endX: neuronACenterX - 156, endY: neuronACenterY - 58 },
      ],
    },
    {
      startX: neuronACenterX - 226,
      startY: neuronACenterY - 28,
      c1x: neuronACenterX - 190,
      c1y: neuronACenterY - 48,
      c2x: neuronACenterX - 120,
      c2y: neuronACenterY - 18,
      endX: neuronACenterX - neuronASomaRadius + 8,
      endY: neuronACenterY - 12,
      branches: [
        { startX: neuronACenterX - 192, startY: neuronACenterY - 42, c1x: neuronACenterX - 214, c1y: neuronACenterY - 60, endX: neuronACenterX - 232, endY: neuronACenterY - 64 },
        { startX: neuronACenterX - 150, startY: neuronACenterY - 30, c1x: neuronACenterX - 166, c1y: neuronACenterY - 10, endX: neuronACenterX - 182, endY: neuronACenterY + 4 },
      ],
    },
    {
      startX: neuronACenterX - 204,
      startY: neuronACenterY + 24,
      c1x: neuronACenterX - 182,
      c1y: neuronACenterY + 2,
      c2x: neuronACenterX - 132,
      c2y: neuronACenterY + 22,
      endX: neuronACenterX - neuronASomaRadius + 6,
      endY: neuronACenterY + 8,
      branches: [
        { startX: neuronACenterX - 166, startY: neuronACenterY + 12, c1x: neuronACenterX - 190, c1y: neuronACenterY - 4, endX: neuronACenterX - 202, endY: neuronACenterY - 8 },
        { startX: neuronACenterX - 128, startY: neuronACenterY + 22, c1x: neuronACenterX - 144, c1y: neuronACenterY + 42, endX: neuronACenterX - 166, endY: neuronACenterY + 58 },
      ],
    },
    {
      startX: neuronACenterX - 188,
      startY: neuronACenterY + 106,
      c1x: neuronACenterX - 188,
      c1y: neuronACenterY + 138,
      c2x: neuronACenterX - 118,
      c2y: neuronACenterY + 90,
      endX: neuronACenterX - neuronASomaRadius + 18,
      endY: neuronACenterY + 42,
      branches: [
        { startX: neuronACenterX - 166, startY: neuronACenterY + 122, c1x: neuronACenterX - 184, c1y: neuronACenterY + 152, endX: neuronACenterX - 206, endY: neuronACenterY + 178 },
        { startX: neuronACenterX - 124, startY: neuronACenterY + 90, c1x: neuronACenterX - 136, c1y: neuronACenterY + 116, endX: neuronACenterX - 148, endY: neuronACenterY + 136 },
      ],
    },
    {
      startX: neuronACenterX - 134,
      startY: neuronACenterY - 132,
      c1x: neuronACenterX - 130,
      c1y: neuronACenterY - 140,
      c2x: neuronACenterX - 88,
      c2y: neuronACenterY - 96,
      endX: neuronACenterX - 18,
      endY: neuronACenterY - 48,
      branches: [
        { startX: neuronACenterX - 116, startY: neuronACenterY - 126, c1x: neuronACenterX - 122, c1y: neuronACenterY - 150, endX: neuronACenterX - 124, endY: neuronACenterY - 166 },
      ],
    },
    {
      startX: neuronACenterX - 118,
      startY: neuronACenterY + 138,
      c1x: neuronACenterX - 122,
      c1y: neuronACenterY + 148,
      c2x: neuronACenterX - 92,
      c2y: neuronACenterY + 104,
      endX: neuronACenterX - 14,
      endY: neuronACenterY + 56,
      branches: [
        { startX: neuronACenterX - 104, startY: neuronACenterY + 134, c1x: neuronACenterX - 112, c1y: neuronACenterY + 156, endX: neuronACenterX - 114, endY: neuronACenterY + 172 },
      ],
    },
  ]

  const dendriteConfigs = Array.from({ length: numInputs }, (_, index) => {
    const template = dendriteTemplates[index % dendriteTemplates.length]
    const repeatBand = Math.floor(index / dendriteTemplates.length)
    const yShift = repeatBand * 18
    const shiftedBranches = template.branches.map((branch, branchIndex) => ({
      ...branch,
      startY: branch.startY + yShift + branchIndex * 2,
      c1y: branch.c1y + yShift + branchIndex * 2,
      endY: branch.endY + yShift + branchIndex * 2,
    }))

    return {
      ...template,
      startY: template.startY + yShift,
      c1y: template.c1y + yShift,
      c2y: template.c2y + yShift,
      endY: template.endY + yShift,
      branches: shiftedBranches,
      path: buildPrimaryDendritePath(
        template.startX,
        template.startY + yShift,
        template.c1x,
        template.c1y + yShift,
        template.c2x,
        template.c2y + yShift,
        template.endX,
        template.endY + yShift,
      ),
      index,
    }
  })

  const primaryLabelAnchor = dendriteConfigs[0] ?? {
    startX: neuronACenterX - 176,
    startY: neuronACenterY - 72,
  }

  const initialSegmentStartX = axonStartX - 26
  const initialSegmentPath = `
    M ${initialSegmentStartX} ${neuronACenterY - 6.5}
    C ${axonStartX - 18} ${neuronACenterY - 8.5}, ${axonStartX - 8} ${neuronACenterY - 5.2}, ${axonStartX + 1} ${neuronACenterY - 3.2}
    L ${axonStartX + 1} ${neuronACenterY + 3.2}
    C ${axonStartX - 8} ${neuronACenterY + 5.2}, ${axonStartX - 18} ${neuronACenterY + 8.5}, ${initialSegmentStartX} ${neuronACenterY + 6.5}
    Z
  `.replace(/\s+/g, ' ').trim()
  const axonPathMain = showExtendedCircuit
    ? `M ${axonStartX} ${neuronACenterY} C ${axonStartX + 48} ${neuronACenterY - 6}, ${branchPointX - 66} ${branchPointY + 4}, ${branchPointX} ${branchPointY}`
    : `M ${axonStartX} ${neuronACenterY} C ${axonStartX + 62} ${neuronACenterY - 8}, ${axonEndBX - 94} ${axonEndBY + 7}, ${axonEndBX - 6} ${axonEndBY}`
  const axonBranchPathB = `M ${branchPointX} ${branchPointY} C ${branchPointX + 24} ${branchPointY - 8}, ${axonEndBX - 34} ${axonEndBY - 1}, ${axonEndBX} ${axonEndBY}`
  const axonBranchPathC = `M ${branchPointX} ${branchPointY} C ${branchPointX + 22} ${branchPointY + 10}, ${axonEndCX - 36} ${axonEndCY + 3}, ${axonEndCX} ${axonEndCY}`

  // Render a neuron (reusable for B and C)
  const renderNeuron = (id, centerX, centerY, somaRadius, thresholdRadius, fillHeight, fillTopY, fillOpacity, thresholdOpacity, fires, gradientId, clipId, somaFillRef, somaFillLineRef, thresholdRingRef) => {
    const somaDiameter = somaRadius * 2
    const somaPath = buildOrganicSomaPath(centerX, centerY, somaRadius, 0.72)
    const thresholdPath = buildOrganicSomaPath(centerX, centerY, thresholdRadius, 0.5)
    return (
      <g id={id}>
        <path
          d={somaPath}
          fill={`url(#${gradientId})`}
          stroke={fires ? '#047857' : somaStroke}
          strokeWidth={fires ? 3.5 : 2.5}
          opacity={phaseEmphasis.somaB}
        />
        <path
          d={buildOrganicSomaPath(centerX, centerY, somaRadius - 4, 0.5)}
          fill="none"
          stroke="#A7F3D0"
          strokeWidth={1}
          opacity={0.5 * phaseEmphasis.somaB}
        />
        <ellipse
          cx={centerX - somaRadius * 0.08}
          cy={centerY + somaRadius * 0.04}
          rx={somaRadius * 0.24}
          ry={somaRadius * 0.2}
          fill={nucleusFill}
          opacity={0.78 * phaseEmphasis.somaB}
        />
        <circle
          cx={centerX - somaRadius * 0.02}
          cy={centerY + somaRadius * 0.02}
          r={somaRadius * 0.08}
          fill={nucleusCoreFill}
          opacity={0.88 * phaseEmphasis.somaB}
        />
        {fillHeight > 0 && (
          <>
            <rect
              x={centerX - somaRadius - 18}
              y={fillTopY}
              width={somaDiameter + 36}
              height={fillHeight}
              fill={fires ? somaFillFiring : somaFillActive}
              clipPath={`url(#${clipId})`}
              opacity={fillOpacity * phaseEmphasis.somaB}
              ref={somaFillRef}
            />
            <line
              x1={centerX - somaRadius + 6}
              x2={centerX + somaRadius + 8}
              y1={fillTopY}
              y2={fillTopY}
              stroke="#059669"
              strokeWidth={1.5}
              clipPath={`url(#${clipId})`}
              opacity={fillOpacity * 0.8 * phaseEmphasis.somaB}
              ref={somaFillLineRef}
            />
          </>
        )}
        <path
          d={thresholdPath}
          fill="none"
          stroke={thresholdRingStroke}
          strokeWidth={thresholdRingWidth}
          strokeDasharray={thresholdRingDash}
          strokeLinecap="round"
          opacity={Math.min(1, thresholdOpacity * phaseEmphasis.somaB)}
          ref={thresholdRingRef}
        />
      </g>
    )
  }

  const setRouteRef = (key) => (node) => {
    routeRefs.current[key] = node
  }

  const setTerminalBranchRef = (target, key) => (node) => {
    terminalBranchRefs.current[target][key] = node
  }

  const setBoutonRef = (target, key) => (node) => {
    boutonRefs.current[target][key] = node
  }

  const renderPrimaryDendrites = () => (
    <g
      data-part="dendrites"
      className="biology-diagram__dendrites"
      data-neuron="A"
    >
      {dendriteConfigs.map((config, index) => {
        const inputValue = inputValues[index] ?? 0
        const inputOpacity = Math.min(1, Math.max(0.2, inputValue / inputMax))
        const weightNorm = Math.min(1, Math.max(0, inputValue / inputMax))
        const bulbRadius = 4 + weightNorm * 2
        const synapseOpacity = 0.3 + weightNorm * 0.6

        return (
          <g
            key={index}
            className="biology-diagram__dendrite-arm"
            data-arm-index={index}
            data-input-active={inputValue > 0 ? 'true' : 'false'}
          >
            {/* Dendrite pulse animation route */}
            <path
              d={config.path}
              className="biology-diagram__dendrite biology-diagram__dendrite--primary"
              data-role="primary-branch"
              data-route={`dendrite-${index}`}
              stroke={inputValue > 0 ? dendriteActiveColor : dendriteColor}
              strokeWidth={4.15 - index * 0.28 + weightNorm * 0.58}
              strokeLinecap="round"
              fill="none"
              opacity={(0.3 + inputOpacity * 0.5) * phaseEmphasis.dendrites}
              ref={(node) => { dendritePathRefs.current[index] = node }}
            />
            {config.branches.map((branch, branchIndex) => (
              <path
                key={`${index}-${branchIndex}`}
                d={buildTerminalBranchPath(branch.startX, branch.startY, branch.c1x, branch.c1y, branch.endX, branch.endY)}
                className="biology-diagram__dendrite biology-diagram__dendrite--secondary"
                data-role="secondary-branch"
                data-branch-index={branchIndex}
                data-parent-route={`dendrite-${index}`}
                stroke={inputValue > 0 ? dendriteActiveColor : dendriteColor}
                strokeWidth={branchIndex === 0 ? 1.85 : 1.2}
                strokeLinecap="round"
                fill="none"
                opacity={(0.18 + inputOpacity * 0.34) * phaseEmphasis.dendrites}
                ref={(node) => {
                  dendriteBranchRefs.current[`${index}-${branchIndex}`] = node
                }}
              />
            ))}
            <circle
              cx={config.startX}
              cy={config.startY}
              r={3.5}
              className="biology-diagram__input-node"
              data-role="input-origin"
              fill={dendriteActiveColor}
              opacity={inputOpacity * 0.75 * phaseEmphasis.dendrites}
            />
            <circle
              cx={config.endX - 2 + index * 0.6}
              cy={config.endY + (index % 2 === 0 ? -1.5 : 1.5)}
              r={Math.max(2.8, bulbRadius - 1.4)}
              className="biology-diagram__dendrite-contact"
              data-role="dendrite-contact"
              fill={synapseColor}
              opacity={(synapseOpacity - 0.16) * phaseEmphasis.dendrites}
              ref={(node) => { dendriteContactRefs.current[index] = node }}
            />
            <circle
              cx={config.startX}
              cy={config.startY}
              r={4.5}
              className="biology-diagram__input-pulse"
              data-role="input-pulse"
              fill="#60A5FA"
              opacity={0}
              ref={(node) => { inputPulseRefs.current[index] = node }}
            />
          </g>
        )
      })}
    </g>
  )

  const renderPrimaryNeuron = () => (
    <g
      id="neuronA"
      className="biology-diagram__cell biology-diagram__cell--primary"
      data-cell="primary"
    >
      {renderPrimaryDendrites()}

      <g
        data-part="soma"
        className="biology-diagram__soma"
        data-neuron="A"
        ref={somaGroupARef}
      >
        <path
          d={buildOrganicSomaPath(neuronACenterX, neuronACenterY, neuronASomaRadius, 1)}
          className="biology-diagram__soma-outline"
          data-role="soma-body"
          fill="url(#somaGradientA)"
          stroke={neuronAFires ? '#047857' : somaStroke}
          strokeWidth={neuronAFires ? 3.5 : 2.5}
          opacity={phaseEmphasis.somaA}
        />
        <path
          d={buildOrganicSomaPath(neuronACenterX, neuronACenterY, neuronASomaRadius - 4, 0.72)}
          className="biology-diagram__soma-contour"
          data-role="soma-contour"
          fill="none"
          stroke="#A7F3D0"
          strokeWidth={1}
          opacity={0.5 * phaseEmphasis.somaA}
        />
        {fillHeightA > 0 && (
          <>
            {/* Soma accumulation */}
            <rect
              x={neuronACenterX - neuronASomaRadius - 18}
              y={fillTopYA}
              width={somaDiameterA + 36}
              height={fillHeightA}
              className="biology-diagram__soma-fill"
              data-role="soma-fill"
              fill={neuronAFires ? somaFillFiring : somaFillActive}
              clipPath="url(#somaClipA)"
              opacity={fillOpacityA * phaseEmphasis.somaA}
              ref={somaFillARef}
            />
            {/* Soma accumulation */}
            <line
              x1={neuronACenterX - neuronASomaRadius + 6}
              x2={neuronACenterX + neuronASomaRadius + 8}
              y1={fillTopYA}
              y2={fillTopYA}
              className="biology-diagram__soma-fill-line"
              data-role="fill-line"
              stroke="#059669"
              strokeWidth={1.5}
              clipPath="url(#somaClipA)"
              opacity={fillOpacityA * 0.8 * phaseEmphasis.somaA}
              ref={somaFillLineARef}
            />
          </>
        )}
        {/* Hillock compare emphasis */}
        <path
          d={buildOrganicSomaPath(neuronACenterX, neuronACenterY, neuronAThresholdRadius, 0.6)}
          className="biology-diagram__threshold"
          data-role="trigger-zone"
          fill="none"
          stroke={thresholdRingStroke}
          strokeWidth={thresholdRingWidth}
          strokeDasharray={thresholdRingDash}
          strokeLinecap="round"
          opacity={Math.min(1, thresholdRingOpacityA * phaseEmphasis.threshold)}
          ref={triggerZoneARef}
        />
        {currentPhase === 'compare' && (
          <path
            d={buildOrganicSomaPath(neuronACenterX, neuronACenterY, neuronAThresholdRadius + 9, 0.7)}
            className="biology-diagram__threshold-glow"
            data-role="threshold-glow"
            fill="none"
            stroke={compareGlowColor}
            strokeWidth={3}
            opacity={0.18}
          />
        )}
      </g>

      <g
        data-part="nucleus"
        className="biology-diagram__nucleus"
        data-neuron="A"
        ref={nucleusARef}
      >
        <ellipse
          cx={neuronACenterX - 11}
          cy={neuronACenterY + 7}
          rx={14}
          ry={10}
          className="biology-diagram__nucleus-body"
          data-role="nucleus"
          fill={nucleusFill}
          opacity={0.8 * phaseEmphasis.somaA}
        />
        <circle
          cx={neuronACenterX - 6}
          cy={neuronACenterY + 6}
          r={4}
          className="biology-diagram__nucleolus"
          data-role="nucleolus"
          fill={nucleusCoreFill}
          opacity={0.9 * phaseEmphasis.somaA}
        />
      </g>

      <g
        data-part="hillock"
        className="biology-diagram__hillock"
        data-neuron="A"
        ref={hillockARef}
      >
        {/* Hillock compare emphasis */}
        <path
          d={buildHillockPath(neuronACenterX, neuronACenterY, neuronASomaRadius)}
          className="biology-diagram__hillock-shape"
          data-role="axon-hillock"
          fill="#B7E4D7"
          stroke={neuronAFires ? '#047857' : somaStroke}
          strokeWidth={1.8}
          opacity={0.9 * phaseEmphasis.somaA}
        />
        {/* Hillock compare emphasis */}
        <path
          d={initialSegmentPath}
          className="biology-diagram__initial-segment"
          data-role="initial-segment"
          data-route="hillock-to-axon"
          fill="#9FD7C7"
          stroke={neuronAFires ? '#047857' : somaStroke}
          strokeWidth={1.2}
          opacity={0.88 * phaseEmphasis.axon}
          ref={(node) => {
            initialSegmentARef.current = node
            routeRefs.current.hillockToAxon = node
          }}
        />
      </g>
    </g>
  )

  const renderAxonGroup = () => (
    <g
      id="axon"
      data-part="axon"
      className="biology-diagram__axon"
      data-neuron="A"
    >
      {showExtendedCircuit ? (
        <>
          {/* Axon pulse travel */}
          <path
            d={axonPathMain}
            className="biology-diagram__axon-shaft"
            data-role="axon-shaft"
            data-route="axon-main"
            stroke={axonColor}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
            opacity={(neuronAFires ? 0.9 : 0.5) * phaseEmphasis.axon}
            ref={setRouteRef('axonMain')}
          />
          <path
            d={axonBranchPathB}
            className="biology-diagram__axon-branch biology-diagram__axon-branch--b"
            data-role="axon-branch"
            data-target="B"
            data-route="axon-branch-b"
            stroke={axonColor}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
            opacity={(neuronAFires ? 0.9 : 0.5) * phaseEmphasis.axon}
            ref={setRouteRef('axonBranchB')}
          />
          <path
            d={axonBranchPathC}
            className="biology-diagram__axon-branch biology-diagram__axon-branch--c"
            data-role="axon-branch"
            data-target="C"
            data-route="axon-branch-c"
            stroke={axonColor}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
            opacity={(neuronAFires ? 0.9 : 0.5) * phaseEmphasis.axon}
            ref={setRouteRef('axonBranchC')}
          />
          <circle
            cx={branchPointX}
            cy={branchPointY}
            r={4}
            className="biology-diagram__axon-branch-point"
            data-role="branch-point"
            fill={axonColor}
            opacity={0.7 * phaseEmphasis.axon}
          />
        </>
      ) : (
        <>
          {/* Axon pulse travel */}
          <path
            d={axonPathMain}
            className="biology-diagram__axon-shaft"
            data-role="axon-shaft"
            data-route="axon-main"
            stroke={axonColor}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
            opacity={(neuronAFires ? 0.9 : 0.5) * phaseEmphasis.axon}
            ref={setRouteRef('axonMain')}
          />
        </>
      )}

      <ellipse
        cx={axonStartX}
        cy={neuronACenterY}
        rx={8}
        ry={5}
        fill={signalBeadColor}
        stroke="#1D4ED8"
        strokeWidth={1.5}
        opacity={0}
        ref={axonPulseRef}
      />

      {showExtendedCircuit && (
        <ellipse
          cx={branchPointX}
          cy={branchPointY}
          rx={8}
          ry={5}
          fill={signalBeadColor}
          stroke="#1D4ED8"
          strokeWidth={1.5}
          opacity={0}
          ref={axonBranchPulseRef}
        />
      )}
    </g>
  )

  const renderTerminalArbor = (target, endX, endY, rootRef) => {
    const branchDefs = target === 'B'
      ? [
          { key: 'primary', d: buildTerminalBranchPath(endX - 8, endY, endX + 8, endY - 1, endX + 24, endY), width: 2.05, opacity: 0.48, type: 'primary' },
          { key: 'up', d: buildTerminalBranchPath(endX + 8, endY - 1, endX + 14, endY - 13, endX + 28, endY - 21), width: 1.45, opacity: 0.4, type: 'secondary' },
          { key: 'down', d: buildTerminalBranchPath(endX + 10, endY + 1, endX + 17, endY + 11, endX + 28, endY + 17), width: 1.38, opacity: 0.38, type: 'secondary' },
          { key: 'forward', d: buildTerminalBranchPath(endX + 14, endY, endX + 21, endY + 3, endX + 33, endY + 2), width: 1.12, opacity: 0.31, type: 'secondary' },
        ]
      : [
          { key: 'primary', d: buildTerminalBranchPath(endX - 7, endY, endX + 8, endY + 3, endX + 22, endY + 6), width: 1.95, opacity: 0.46, type: 'primary' },
          { key: 'up', d: buildTerminalBranchPath(endX + 8, endY + 1, endX + 14, endY - 8, endX + 24, endY - 16), width: 1.28, opacity: 0.35, type: 'secondary' },
          { key: 'down', d: buildTerminalBranchPath(endX + 10, endY + 4, endX + 17, endY + 17, endX + 30, endY + 24), width: 1.42, opacity: 0.4, type: 'secondary' },
          { key: 'forward', d: buildTerminalBranchPath(endX + 14, endY + 4, endX + 21, endY + 2, endX + 34, endY), width: 1.04, opacity: 0.29, type: 'secondary' },
        ]

    const boutonDefs = target === 'B'
      ? [
          { key: 'root', cx: endX + 10, cy: endY, r: 3.9, opacity: 0.34 },
          { key: 'mid', cx: endX + 24, cy: endY, r: 2.9, opacity: 0.42 },
          { key: 'up', cx: endX + 28, cy: endY - 21, r: 2.7, opacity: 0.36 },
          { key: 'down', cx: endX + 28, cy: endY + 17, r: 3.1, opacity: 0.39 },
          { key: 'forward', cx: endX + 33, cy: endY + 2, r: 2.4, opacity: 0.3 },
        ]
      : [
          { key: 'root', cx: endX + 10, cy: endY + 3, r: 3.8, opacity: 0.32 },
          { key: 'mid', cx: endX + 22, cy: endY + 6, r: 3, opacity: 0.38 },
          { key: 'up', cx: endX + 24, cy: endY - 16, r: 2.5, opacity: 0.31 },
          { key: 'down', cx: endX + 30, cy: endY + 24, r: 3.2, opacity: 0.41 },
          { key: 'forward', cx: endX + 34, cy: endY, r: 2.25, opacity: 0.28 },
        ]

    return (
      <g
        id={`axonTerminal${target}`}
        className={`biology-diagram__terminal-arbor biology-diagram__terminal-arbor--${target.toLowerCase()}`}
        data-target={target}
      >
        {branchDefs.map((branch) => (
          <path
            key={branch.key}
            d={branch.d}
            className={`biology-diagram__terminal-branch biology-diagram__terminal-branch--${branch.type}`}
            data-role="terminal-branch"
            data-branch={`terminal-${target.toLowerCase()}-${branch.key}`}
            stroke={axonColor}
            strokeWidth={branch.width}
            strokeLinecap="round"
            fill="none"
            opacity={branch.opacity * phaseEmphasis.synapse}
            ref={setTerminalBranchRef(target, branch.key)}
          />
        ))}
        {boutonDefs.map((bouton) => (
          <circle
            key={bouton.key}
            cx={bouton.cx}
            cy={bouton.cy}
            r={bouton.r}
            className={`biology-diagram__bouton${bouton.key === 'root' ? ' biology-diagram__bouton--root' : ''}`}
            data-role="bouton"
            data-bouton={`terminal-${target.toLowerCase()}-${bouton.key}`}
            fill={synapseColor}
            opacity={bouton.opacity * phaseEmphasis.synapse}
            ref={bouton.key === 'root' ? rootRef : setBoutonRef(target, bouton.key)}
          />
        ))}
      </g>
    )
  }

  const renderTerminalGroup = () => (
    <g
      data-part="terminal"
      className="biology-diagram__terminal"
      data-neuron="A"
    >
      {/* Terminal activation */}
      {renderTerminalArbor('B', axonEndBX, axonEndBY, setBoutonRef('B', 'root'))}
      {showExtendedCircuit && (
        <>
          {/* Terminal activation */}
          {renderTerminalArbor('C', axonEndCX, axonEndCY, setBoutonRef('C', 'root'))}
        </>
      )}
    </g>
  )

  return (
    <div style={{
      backgroundColor: '#FAFCFE',
      border: '1px solid #E5E7EB',
      borderRadius: '16px',
      padding: '12px',
      boxShadow: currentPhase === 'compare' ? '0 0 0 1px rgba(245, 158, 11, 0.28), 0 20px 40px rgba(15, 23, 42, 0.06)' : '0 18px 36px rgba(15, 23, 42, 0.04)',
      transition: 'box-shadow 220ms ease',
    }}>
      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block' }}
      >
        <defs>
          <radialGradient id="somaGradientA" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="70%" stopColor={somaFillBase} />
            <stop offset="100%" stopColor="#A7F3D0" />
          </radialGradient>
          <radialGradient id="somaGradientB" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="70%" stopColor={somaFillBase} />
            <stop offset="100%" stopColor="#A7F3D0" />
          </radialGradient>
          <radialGradient id="somaGradientC" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="70%" stopColor={somaFillBase} />
            <stop offset="100%" stopColor="#A7F3D0" />
          </radialGradient>
          
          <clipPath id="somaClipA">
            <path d={buildOrganicSomaPath(neuronACenterX, neuronACenterY, neuronASomaRadius - 2, 1)} />
          </clipPath>
          <clipPath id="somaClipB">
            <path d={buildOrganicSomaPath(neuronBCenterX, neuronBCenterY, neuronBSomaRadius - 2, 0.72)} />
          </clipPath>
          <clipPath id="somaClipC">
            <path d={buildOrganicSomaPath(neuronCCenterX, neuronCCenterY, neuronCSomaRadius - 2, 0.72)} />
          </clipPath>
        </defs>

        <g transform={`translate(${stagePaddingX}, ${stagePaddingY})`}>
          {renderPrimaryNeuron()}
          {renderAxonGroup()}
          {renderTerminalGroup()}

          <g
            data-layer="future-effects"
            className="biology-diagram__future-effects"
            data-phase={currentPhase}
            ref={futureEffectsRef}
          />

          {/* ===== SYNAPTIC GAP TO B ===== */}
          <g id="synapticGapB">
            <circle cx={axonEndBX + synapticGap * 0.3} cy={axonEndBY} r={2} fill={synapseColor} opacity={0.3} />
            <circle cx={axonEndBX + synapticGap * 0.6} cy={axonEndBY} r={2} fill={synapseColor} opacity={0.3} />
          </g>

          {/* ===== SYNAPTIC GAP TO C (when extended) ===== */}
          {showExtendedCircuit && (
            <g id="synapticGapC">
              <circle cx={axonEndCX + synapticGap * 0.3} cy={axonEndCY} r={2} fill={synapseColor} opacity={0.3} />
              <circle cx={axonEndCX + synapticGap * 0.6} cy={axonEndCY} r={2} fill={synapseColor} opacity={0.3} />
            </g>
          )}

          {/* ===== NEURON B ===== */}
          <g id="neuronB">
            <path
              d={`M ${neuronBCenterX - neuronBSomaRadius} ${neuronBCenterY} 
                  Q ${neuronBCenterX - neuronBSomaRadius - 12} ${neuronBCenterY - 8},
                    ${neuronBCenterX - neuronBSomaRadius - 18} ${neuronBCenterY - 16}`}
              stroke={dendriteColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
              opacity={0.5 * phaseEmphasis.somaB}
            />
            <path
              d={`M ${neuronBCenterX - neuronBSomaRadius} ${neuronBCenterY} 
                  Q ${neuronBCenterX - neuronBSomaRadius - 12} ${neuronBCenterY + 8},
                    ${neuronBCenterX - neuronBSomaRadius - 18} ${neuronBCenterY + 16}`}
              stroke={dendriteColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="none"
              opacity={0.5 * phaseEmphasis.somaB}
            />
            <circle
              cx={neuronBCenterX - neuronBSomaRadius}
              cy={neuronBCenterY}
              r={5}
              fill={synapseColor}
              opacity={0.4 * phaseEmphasis.somaB}
            />
            {renderNeuron('neuronBSoma', neuronBCenterX, neuronBCenterY, neuronBSomaRadius, neuronBThresholdRadius, fillHeightB, fillTopYB, fillOpacityB, thresholdRingOpacityB, visualBFires, 'somaGradientB', 'somaClipB', somaFillBRef, somaFillLineBRef, thresholdRingBRef)}
          </g>

          {/* ===== NEURON C (only when extended) ===== */}
          {showExtendedCircuit && (
            <g id="neuronC">
              <path
                d={`M ${neuronCCenterX - neuronCSomaRadius} ${neuronCCenterY} 
                    Q ${neuronCCenterX - neuronCSomaRadius - 12} ${neuronCCenterY - 8},
                      ${neuronCCenterX - neuronCSomaRadius - 18} ${neuronCCenterY - 16}`}
                stroke={dendriteColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
                opacity={0.5}
              />
              <path
                d={`M ${neuronCCenterX - neuronCSomaRadius} ${neuronCCenterY} 
                    Q ${neuronCCenterX - neuronCSomaRadius - 12} ${neuronCCenterY + 8},
                      ${neuronCCenterX - neuronCSomaRadius - 18} ${neuronCCenterY + 16}`}
                stroke={dendriteColor}
                strokeWidth={2.5}
                strokeLinecap="round"
                fill="none"
                opacity={0.5}
              />
              <circle
                cx={neuronCCenterX - neuronCSomaRadius}
                cy={neuronCCenterY}
                r={5}
                fill={synapseColor}
                opacity={0.4}
              />
              {renderNeuron('neuronCSoma', neuronCCenterX, neuronCCenterY, neuronCSomaRadius, neuronCThresholdRadius, fillHeightC, fillTopYC, fillOpacityC, thresholdRingOpacityC, visualCFires, 'somaGradientC', 'somaClipC', somaFillCRef, somaFillLineCRef, thresholdRingCRef)}
            </g>
          )}

          {/* ===== LABELS ===== */}
          {showDetailed && (
            <g id="labels" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <text x={primaryLabelAnchor.startX - 8} y={primaryLabelAnchor.startY - 18} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="start">
                dendrites
              </text>
              <text x={neuronACenterX} y={neuronACenterY + neuronASomaRadius + 20} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                soma + nucleus
              </text>
              <text x={axonStartX + 46} y={neuronACenterY - 12} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                axon
              </text>
              {showExtendedCircuit && (
                <>
                  <text x={branchPointX} y={branchPointY - 14} fontSize="10" fontWeight="500" fill={labelColor} textAnchor="middle">
                    branch
                  </text>
                  <text x={neuronBCenterX} y={neuronBCenterY - neuronBSomaRadius - 8} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                    B
                  </text>
                  <text x={neuronCCenterX} y={neuronCCenterY + neuronCSomaRadius + 16} fontSize="11" fontWeight="500" fill={labelColor} textAnchor="middle">
                    C
                  </text>
                </>
              )}
            </g>
          )}

        </g>
      </svg>
    </div>
  )
}

export default BiologyDiagram
