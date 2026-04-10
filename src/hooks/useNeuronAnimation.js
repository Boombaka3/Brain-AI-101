import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * useNeuronAnimation - GSAP-based animation system for neuron visualization
 * 
 * EXTENDED CIRCUIT SUPPORT:
 * - Handles divergent signaling (one neuron to multiple targets)
 * - Single pulse travels to branch point, then splits visually
 * - Both synapses highlight, both targets integrate
 * 
 * ANIMATION NARRATIVE:
 * 1) Integration - fill rises
 * 2) Tension pause
 * 3) Threshold acknowledgment
 * 4) Action potential launches
 * 5) Signal propagates to branch (if extended) or directly to synapse
 * 6) At branch: pulse splits to both paths
 * 7) Synapse B highlights, Synapse C highlights (slight stagger)
 * 8) Neuron B integrates, Neuron C integrates
 * 9) Silence
 */
export function useNeuronAnimation({
  neuronAFires,
  neuronBInput,
  neuronCInput = 0,
  inputValues,
  neuronAThreshold,
  axonStartX,
  axonEndBX,
  axonEndBY,
  axonEndCX,
  axonEndCY,
  branchPointX,
  branchPointY,
  axonY,
  fillTopYA,
  fillHeightA,
  fillTopYB,
  fillHeightB,
  fillTopYC = 0,
  fillHeightC = 0,
  fillOpacityA,
  fillOpacityB,
  fillOpacityC = 0,
  thresholdRingOpacityA,
  thresholdRingOpacityB,
  thresholdRingOpacityC = 0,
  somaFillARef,
  somaFillLineARef,
  somaFillBRef,
  somaFillLineBRef,
  somaFillCRef,
  somaFillLineCRef,
  thresholdRingARef,
  thresholdRingBRef,
  thresholdRingCRef,
  pulseRef,
  pulseBranchRef,
  axonSynapseBRef,
  axonSynapseCRef,
  synapseRefs,
  dendritePathRefs,
  inputPulseRefs,
  setAVisualTotal,
  setBVisualInput,
  setCVisualInput,
  showExtendedCircuit = false,
  currentPhase = 'idle',
  didFire = neuronAFires,
  replaySignal = 0,
  onInteractionLockChange,
}) {
  const prevPhaseRef = useRef(currentPhase)
  const prevInputsRef = useRef([])
  const prevThresholdRef = useRef(neuronAThreshold)
  const fireTimelineRef = useRef(null)
  const receiveTimelineRef = useRef(null)
  const integrateTimelineRef = useRef(null)
  const compareTimelineRef = useRef(null)
  const passTimelineRef = useRef(null)

  // For backwards compatibility
  const axonEndX = axonEndBX
  const axonSynapseRef = axonSynapseBRef

  const killTimeline = (timelineRef) => {
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }
  }

  const killAllTimelines = () => {
    killTimeline(receiveTimelineRef)
    killTimeline(integrateTimelineRef)
    killTimeline(compareTimelineRef)
    killTimeline(fireTimelineRef)
    killTimeline(passTimelineRef)
  }

  const canMeasurePath = (node) =>
    node &&
    typeof node.getTotalLength === 'function' &&
    typeof node.getPointAtLength === 'function'

  // ===== SOMA A FILL ANIMATION =====
  useEffect(() => {
    if (!somaFillARef.current || !somaFillLineARef.current) return
    gsap.to(somaFillARef.current, {
      attr: { y: fillTopYA, height: fillHeightA },
      opacity: fillOpacityA,
      duration: 0.2,
      ease: 'power2.out',
    })
    gsap.to(somaFillLineARef.current, {
      attr: { y1: fillTopYA, y2: fillTopYA },
      opacity: fillOpacityA,
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [fillTopYA, fillHeightA, fillOpacityA, somaFillARef, somaFillLineARef])

  // ===== SOMA B FILL ANIMATION =====
  useEffect(() => {
    if (!somaFillBRef.current || !somaFillLineBRef.current) return
    gsap.to(somaFillBRef.current, {
      attr: { y: fillTopYB, height: fillHeightB },
      opacity: fillOpacityB,
      duration: 0.2,
      ease: 'power2.out',
    })
    gsap.to(somaFillLineBRef.current, {
      attr: { y1: fillTopYB, y2: fillTopYB },
      opacity: fillOpacityB,
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [fillTopYB, fillHeightB, fillOpacityB, somaFillBRef, somaFillLineBRef])

  // ===== SOMA C FILL ANIMATION (extended circuit) =====
  useEffect(() => {
    if (!somaFillCRef?.current || !somaFillLineCRef?.current) return
    gsap.to(somaFillCRef.current, {
      attr: { y: fillTopYC, height: fillHeightC },
      opacity: fillOpacityC,
      duration: 0.2,
      ease: 'power2.out',
    })
    gsap.to(somaFillLineCRef.current, {
      attr: { y1: fillTopYC, y2: fillTopYC },
      opacity: fillOpacityC,
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [fillTopYC, fillHeightC, fillOpacityC, somaFillCRef, somaFillLineCRef])

  // ===== THRESHOLD RING ANIMATIONS =====
  useEffect(() => {
    if (!thresholdRingARef.current) return
    gsap.to(thresholdRingARef.current, {
      opacity: thresholdRingOpacityA,
      duration: 0.25,
      ease: 'power2.out',
    })
  }, [thresholdRingOpacityA, thresholdRingARef])

  useEffect(() => {
    if (!thresholdRingBRef.current) return
    gsap.to(thresholdRingBRef.current, {
      opacity: thresholdRingOpacityB,
      duration: 0.25,
      ease: 'power2.out',
    })
  }, [thresholdRingOpacityB, thresholdRingBRef])

  useEffect(() => {
    if (!thresholdRingCRef?.current) return
    gsap.to(thresholdRingCRef.current, {
      opacity: thresholdRingOpacityC,
      duration: 0.25,
      ease: 'power2.out',
    })
  }, [thresholdRingOpacityC, thresholdRingCRef])

  // ===== THRESHOLD CHANGE FEEDBACK =====
  useEffect(() => {
    if (!thresholdRingARef.current) return
    if (prevThresholdRef.current === neuronAThreshold) return
    prevThresholdRef.current = neuronAThreshold
    gsap.to(thresholdRingARef.current, {
      opacity: 0.9,
      duration: 0.1,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }, [neuronAThreshold, thresholdRingARef])

  // ===== INPUT SYNAPSE RESPONSE =====
  useEffect(() => {
    const prevInputs = prevInputsRef.current || []
    let changedIndex = -1
    for (let i = 0; i < inputValues.length; i++) {
      if (inputValues[i] !== prevInputs[i]) {
        changedIndex = i
        break
      }
    }
    prevInputsRef.current = [...inputValues]
    if (changedIndex === -1) return
    const synapseNode = synapseRefs.current[changedIndex]
    if (!synapseNode) return
    gsap.to(synapseNode, {
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }, [inputValues, synapseRefs])

  // ===== MAIN FIRING SEQUENCE =====
  useEffect(() => {
    try {
      const previousPhase = prevPhaseRef.current
      const enteringReceivePhase = previousPhase !== 'receive' && currentPhase === 'receive'
      const enteringIntegratePhase = previousPhase !== 'integrate' && currentPhase === 'integrate'
      const enteringComparePhase = previousPhase !== 'compare' && currentPhase === 'compare'
      const enteringFirePhase = previousPhase !== 'fire' && currentPhase === 'fire'
      const enteringPassPhase = previousPhase !== 'pass-on' && currentPhase === 'pass-on'
      const resettingToIdle = currentPhase === 'idle'

      if (resettingToIdle) {
        killAllTimelines()
        if (pulseRef.current) {
          gsap.set(pulseRef.current, {
            opacity: 0,
            attr: { cx: axonStartX, cy: axonY },
          })
        }
        if (pulseBranchRef?.current) {
          gsap.set(pulseBranchRef.current, {
            opacity: 0,
            attr: { cx: branchPointX, cy: branchPointY },
          })
        }
        inputPulseRefs.current.forEach((node, index) => {
          if (!node) return
          const path = dendritePathRefs.current[index]
          if (!canMeasurePath(path)) return
          const startPoint = path.getPointAtLength(0)
          gsap.set(node, {
            opacity: 0,
            attr: { cx: startPoint.x, cy: startPoint.y },
          })
        })
        if (setAVisualTotal) setAVisualTotal(0)
        if (setBVisualInput) setBVisualInput(0)
        if (setCVisualInput) setCVisualInput(0)
        if (onInteractionLockChange) {
          onInteractionLockChange(false)
        }
      }

      if (enteringReceivePhase) {
        killTimeline(receiveTimelineRef)
        const tl = gsap.timeline()
        receiveTimelineRef.current = tl

        inputValues.forEach((inputValue, index) => {
          const pulseNode = inputPulseRefs.current[index]
          const pathNode = dendritePathRefs.current[index]
          if (!pulseNode || !canMeasurePath(pathNode) || inputValue <= 0) return

          const tracker = { progress: 0 }
          const pathLength = pathNode.getTotalLength()
          const startDelay = index * 0.16

          tl.set(pulseNode, { opacity: 0 }, startDelay)
          tl.to(
            pulseNode,
            { opacity: 1, duration: 0.08, ease: 'power1.out' },
            startDelay,
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
            startDelay,
          )
          tl.call(
            () => {
              const synapseNode = synapseRefs.current[index]
              if (synapseNode) {
                gsap.to(synapseNode, {
                  opacity: 1,
                  duration: 0.12,
                  ease: 'power2.out',
                  yoyo: true,
                  repeat: 1,
                })
              }
            },
            null,
            startDelay + 0.34,
          )
          tl.to(
            pulseNode,
            { opacity: 0, duration: 0.08, ease: 'power1.in' },
            startDelay + 0.32,
          )
        })
      }

      if (enteringIntegratePhase) {
        killTimeline(integrateTimelineRef)
        const tl = gsap.timeline()
        integrateTimelineRef.current = tl
        const cumulativeInputs = inputValues.reduce((acc, value) => {
          const previous = acc.length > 0 ? acc[acc.length - 1] : 0
          acc.push(previous + value)
          return acc
        }, [])
        const activeSteps = cumulativeInputs.filter((value, index) => inputValues[index] > 0)

        if (setAVisualTotal) {
          tl.call(() => setAVisualTotal(0))
          activeSteps.forEach((value, index) => {
            tl.call(() => setAVisualTotal(value), null, index * 0.18 + 0.06)
          })
        }
      }

      if (enteringComparePhase) {
        killTimeline(compareTimelineRef)
        const tl = gsap.timeline()
        compareTimelineRef.current = tl
        if (thresholdRingARef.current) {
          tl.to(thresholdRingARef.current, {
            opacity: didFire ? 1 : 0.95,
            duration: 0.18,
            ease: 'power2.out',
          })
          tl.to({}, { duration: 0.22 })
          tl.to(thresholdRingARef.current, {
            opacity: didFire ? 0.82 : 0.92,
            duration: 0.22,
            ease: 'power2.out',
          })
        }
      }

      if (enteringFirePhase && neuronAFires) {
        killTimeline(fireTimelineRef)

        if (onInteractionLockChange) {
          onInteractionLockChange(true)
        }

        const tl = gsap.timeline({
          onComplete: () => {
            if (onInteractionLockChange) {
              onInteractionLockChange(false)
            }
          },
        })
        fireTimelineRef.current = tl

        tl.set(pulseRef.current, {
          opacity: 0,
          attr: { cx: axonStartX, cy: axonY },
        })

        if (showExtendedCircuit && pulseBranchRef?.current) {
          tl.set(pulseBranchRef.current, {
            opacity: 0,
            attr: { cx: branchPointX, cy: branchPointY },
          })
        }

        tl.to(pulseRef.current, {
          opacity: 1,
          duration: 0.08,
          ease: 'power2.out',
        }, '-=0.05')

        if (showExtendedCircuit) {
          tl.to(pulseRef.current, {
            attr: { cx: branchPointX, cy: branchPointY },
            duration: 0.4,
            ease: 'power2.inOut',
          })

          tl.call(() => {
            if (pulseBranchRef?.current) {
              gsap.set(pulseBranchRef.current, { opacity: 1 })
            }
          })

          tl.to(pulseRef.current, {
            attr: { cx: axonEndBX, cy: axonEndBY },
            duration: 0.35,
            ease: 'power2.inOut',
          })

          if (pulseBranchRef?.current) {
            tl.to(pulseBranchRef.current, {
              attr: { cx: axonEndCX, cy: axonEndCY },
              duration: 0.35,
              ease: 'power2.inOut',
            }, '<')
          }

          tl.to({}, { duration: 0.06 })

        } else {
          tl.to(pulseRef.current, {
            attr: { cx: axonEndX, cy: axonY },
            duration: 0.7,
            ease: 'power2.inOut',
          })
        }
      }

      if (enteringPassPhase && neuronAFires) {
        killTimeline(passTimelineRef)
        const tl = gsap.timeline()
        passTimelineRef.current = tl

        if (showExtendedCircuit) {
          tl.call(() => {
            if (axonSynapseBRef?.current) {
              gsap.to(axonSynapseBRef.current, {
                opacity: 1,
                duration: 0.16,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1,
              })
            }
            if (axonSynapseCRef?.current) {
              gsap.to(axonSynapseCRef.current, {
                opacity: 1,
                duration: 0.16,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1,
              })
            }
          })
          tl.call(() => {
            if (setBVisualInput) setBVisualInput(neuronBInput)
            if (setCVisualInput) setCVisualInput(neuronCInput)
          }, null, '+=0.05')
          tl.to(pulseBranchRef.current, {
            opacity: 0,
            duration: 0.14,
            ease: 'power2.in',
          }, '<')
        } else {
          tl.call(() => {
            if (axonSynapseRef?.current) {
              gsap.to(axonSynapseRef.current, {
                opacity: 1,
                duration: 0.16,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1,
              })
            }
          })
          tl.call(() => {
            if (setBVisualInput) setBVisualInput(neuronBInput)
          }, null, '+=0.06')
        }

        tl.to(pulseRef.current, {
          opacity: 0,
          duration: 0.14,
          ease: 'power2.in',
        })
      }

      prevPhaseRef.current = currentPhase

      return () => {
        if (onInteractionLockChange && (currentPhase === 'fire' || currentPhase === 'idle')) {
          onInteractionLockChange(false)
        }
      }
    } catch (error) {
      console.error('Neuron animation effect failed', error)
      killAllTimelines()
      if (onInteractionLockChange) {
        onInteractionLockChange(false)
      }
      return undefined
    }
  }, [
    currentPhase,
    neuronAFires,
    neuronBInput,
    neuronCInput,
    axonStartX,
    axonEndX,
    axonEndBX,
    axonEndBY,
    axonEndCX,
    axonEndCY,
    branchPointX,
    branchPointY,
    axonY,
    showExtendedCircuit,
    replaySignal,
    didFire,
    pulseRef,
    pulseBranchRef,
    thresholdRingARef,
    axonSynapseRef,
    axonSynapseBRef,
    axonSynapseCRef,
    dendritePathRefs,
    inputPulseRefs,
    onInteractionLockChange,
    setAVisualTotal,
    setBVisualInput,
    setCVisualInput,
  ])
}
