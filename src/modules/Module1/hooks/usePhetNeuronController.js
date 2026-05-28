import { useEffect, useMemo, useRef, useState } from 'react'
import { PHET_NEURON_LOCAL_BUILD_URL, PHET_NEURON_SIM_URL } from '../sections/interaction/PhetNeuronEmbed'
import { PHET_MESSAGE_TYPES, PHET_SPEED_VALUES, isPhetMessageType } from '../logic/phetMessageProtocol'

function postToFrame(iframeRef, payload) {
  try {
    iframeRef.current?.contentWindow?.postMessage(payload, '*')
  }
  catch {
    // The live PhET page does not expose a bridge yet; keep this no-op until the local build does.
  }
}

function isLocalNeuronBuild(url) {
  if (!url) {
    return false
  }

  if (url.startsWith(PHET_NEURON_LOCAL_BUILD_URL) || url.includes('/vendor/phet/neuron/')) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  return url.startsWith(`${window.location.origin}/vendor/phet/neuron/`)
}

const initialRuntimeState = {
  simEventState: 'loading',
  speed: PHET_SPEED_VALUES.NORMAL,
  allIons: false,
  charges: false,
  concentrations: false,
  potentialChart: false,
  canPlay: false,
  canPause: false,
  canStepBackward: false,
  canStepForward: false,
  canReset: false,
  canStimulate: false,
}

function usePhetNeuronController() {
  const iframeRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [bridgeReady, setBridgeReady] = useState(false)
  const [runtimeState, setRuntimeState] = useState(initialRuntimeState)

  const isLocalBuildTarget = useMemo(() => isLocalNeuronBuild(PHET_NEURON_SIM_URL), [])

  useEffect(() => {
    const handleMessage = (event) => {
      if (iframeRef.current?.contentWindow && event.source !== iframeRef.current.contentWindow) {
        return
      }

      const messageType = event.data?.type
      if (!isPhetMessageType(messageType)) {
        return
      }

      if (messageType === PHET_MESSAGE_TYPES.READY) {
        setBridgeReady(true)
        setRuntimeState((currentState) => ({
          ...currentState,
          simEventState: 'ready',
        }))
      }

      if (messageType === PHET_MESSAGE_TYPES.SPIKE_STARTED) {
        setRuntimeState((currentState) => ({
          ...currentState,
          simEventState: 'firing',
        }))
      }

      if (messageType === PHET_MESSAGE_TYPES.SPIKE_FINISHED) {
        setRuntimeState((currentState) => ({
          ...currentState,
          simEventState: 'recovering',
        }))
      }

      if (messageType === PHET_MESSAGE_TYPES.STATE && event.data?.payload) {
        setRuntimeState((currentState) => ({
          ...currentState,
          ...event.data.payload,
        }))
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  function send(type, payload = {}) {
    postToFrame(iframeRef, { type, payload })
  }

  function updateRuntimeState(patch) {
    setRuntimeState((currentState) => ({
      ...currentState,
      ...patch,
    }))
  }

  function handlePlay() {
    send(PHET_MESSAGE_TYPES.PLAY)
    updateRuntimeState({ simEventState: 'running' })
  }

  function handlePause() {
    send(PHET_MESSAGE_TYPES.PAUSE)
    updateRuntimeState({ simEventState: 'paused' })
  }

  function handleStepBackward() {
    send(PHET_MESSAGE_TYPES.STEP_BACKWARD)
    updateRuntimeState({ simEventState: 'paused' })
  }

  function handleStepForward() {
    send(PHET_MESSAGE_TYPES.STEP_FORWARD)
    updateRuntimeState({ simEventState: 'paused' })
  }

  function handleReset() {
    send(PHET_MESSAGE_TYPES.RESET)
    updateRuntimeState({ simEventState: 'ready' })
  }

  function handleStimulate() {
    send(PHET_MESSAGE_TYPES.STIMULATE)
    updateRuntimeState({ simEventState: 'firing' })
  }

  function handleSpeedSlow() {
    send(PHET_MESSAGE_TYPES.SPEED, { speed: PHET_SPEED_VALUES.SLOW })
    updateRuntimeState({ speed: PHET_SPEED_VALUES.SLOW })
  }

  function handleSpeedNormal() {
    send(PHET_MESSAGE_TYPES.SPEED, { speed: PHET_SPEED_VALUES.NORMAL })
    updateRuntimeState({ speed: PHET_SPEED_VALUES.NORMAL })
  }

  function handleSpeedFast() {
    send(PHET_MESSAGE_TYPES.SPEED, { speed: PHET_SPEED_VALUES.FAST })
    updateRuntimeState({ speed: PHET_SPEED_VALUES.FAST })
  }

  function handleSetAllIons(value) {
    send(PHET_MESSAGE_TYPES.SET_ALL_IONS, { value })
    updateRuntimeState({ allIons: value })
  }

  function handleSetCharges(value) {
    send(PHET_MESSAGE_TYPES.SET_CHARGES, { value })
    updateRuntimeState({ charges: value })
  }

  function handleSetConcentrations(value) {
    send(PHET_MESSAGE_TYPES.SET_CONCENTRATIONS, { value })
    updateRuntimeState({ concentrations: value })
  }

  function handleSetPotentialChart(value) {
    send(PHET_MESSAGE_TYPES.SET_POTENTIAL_CHART, { value })
    updateRuntimeState({ potentialChart: value })
  }

  const runtimeLabel = useMemo(() => {
    if (!isLoaded) {
      return 'Loading'
    }

    if (runtimeState.simEventState === 'firing') {
      return 'Firing'
    }

    if (runtimeState.simEventState === 'paused') {
      return 'Paused'
    }

    if (runtimeState.simEventState === 'running') {
      return 'Running'
    }

    if (runtimeState.simEventState === 'recovering') {
      return 'Recovering'
    }

    if (runtimeState.simEventState === 'leaked') {
      return 'No spike'
    }

    return 'Ready'
  }, [isLoaded, runtimeState.simEventState])

  const runtimeDetail = useMemo(() => {
    if (!isLoaded) {
      return 'Loading the neuron animation.'
    }

    if (bridgeReady) {
      return 'Use the page controls to drive the animation without clicking inside the simulator.'
    }

    if (isLocalBuildTarget) {
      return 'The local shell is ready to control the neuron build directly.'
    }

    return 'Waiting for the iframe shell to connect to the local neuron build.'
  }, [bridgeReady, isLoaded, isLocalBuildTarget])

  return {
    iframeRef,
    isLoaded,
    bridgeReady,
    runtimeState,
    handleFrameLoad: () => {
      setIsLoaded(true)
      updateRuntimeState({ simEventState: 'ready' })
    },
    isLocalBuildTarget,
    runtimeLabel,
    runtimeDetail,
    simEventState: runtimeState.simEventState,
    handlePlay,
    handlePause,
    handleStepBackward,
    handleStepForward,
    handleReset,
    handleStimulate,
    handleSpeedSlow,
    handleSpeedNormal,
    handleSpeedFast,
    handleSetAllIons,
    handleSetCharges,
    handleSetConcentrations,
    handleSetPotentialChart,
  }
}

export default usePhetNeuronController
