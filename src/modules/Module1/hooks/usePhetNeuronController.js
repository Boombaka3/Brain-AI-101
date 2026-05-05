import { useEffect, useMemo, useRef, useState } from 'react'
import { PHET_NEURON_LOCAL_BUILD_URL, PHET_NEURON_SIM_URL } from '../components/PhetNeuronEmbed'

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

function usePhetNeuronController({ runToken, isRunning, isPrimed, isFiring, outcome }) {
  const iframeRef = useRef(null)
  const wasFiringRef = useRef(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [bridgeReady, setBridgeReady] = useState(false)
  const [simEventState, setSimEventState] = useState('idle')

  const isLocalBuildTarget = useMemo(() => isLocalNeuronBuild(PHET_NEURON_SIM_URL), [])

  useEffect(() => {
    const handleMessage = (event) => {
      if (iframeRef.current?.contentWindow && event.source !== iframeRef.current.contentWindow) {
        return
      }

      const messageType = event.data?.type

      if (messageType === 'AIWEB_READY') {
        setBridgeReady(true)
        setSimEventState('ready')
      }

      if (messageType === 'AIWEB_SPIKE_STARTED') {
        setSimEventState('firing')
      }

      if (messageType === 'AIWEB_SPIKE_FINISHED') {
        setSimEventState('recovering')
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    postToFrame(iframeRef, { type: 'AIWEB_RESET', payload: { runToken } })
    setSimEventState(isRunning ? 'running' : 'ready')
  }, [isLoaded, isRunning, runToken])

  useEffect(() => {
    if (!isLoaded || !isRunning || isFiring) {
      return
    }

    if (isPrimed) {
      postToFrame(iframeRef, { type: 'AIWEB_PREPARE_THRESHOLD', payload: { runToken } })
      setSimEventState('primed')
      return
    }

    postToFrame(iframeRef, { type: 'AIWEB_RUNNING', payload: { runToken } })
    setSimEventState('running')
  }, [isFiring, isLoaded, isPrimed, isRunning, runToken])

  useEffect(() => {
    if (!isLoaded || outcome !== 'leaked') {
      return
    }

    postToFrame(iframeRef, { type: 'AIWEB_LEAKED', payload: { runToken } })
    setSimEventState('leaked')
  }, [isLoaded, outcome, runToken])

  useEffect(() => {
    if (!isLoaded) {
      wasFiringRef.current = isFiring
      return
    }

    if (isFiring && !wasFiringRef.current) {
      postToFrame(iframeRef, { type: 'AIWEB_STIMULATE', payload: { runToken } })
      setSimEventState('firing')
    }

    if (!isFiring && wasFiringRef.current) {
      setSimEventState('recovering')
    }

    wasFiringRef.current = isFiring
  }, [isFiring, isLoaded, runToken])

  const runtimeLabel = useMemo(() => {
    if (!isLoaded) {
      return 'Loading'
    }

    if (isFiring) {
      return 'Firing'
    }

    if (isPrimed) {
      return 'Near threshold'
    }

    if (isRunning) {
      return 'Building'
    }

    if (outcome === 'leaked') {
      return 'No spike'
    }

    return 'Ready'
  }, [isFiring, isLoaded, isPrimed, isRunning, outcome])

  const runtimeDetail = useMemo(() => {
    if (!isLoaded) {
      return 'Loading the neuron view.'
    }

    if (bridgeReady) {
      return 'The neuron view is following the same timing as the sound signals on the left.'
    }

    if (isLocalBuildTarget) {
      return 'Watch the input build, approach threshold, and trigger a spike.'
    }

    return 'Watch the input build toward threshold and see whether the neuron spikes.'
  }, [bridgeReady, isLoaded, isLocalBuildTarget])

  return {
    iframeRef,
    isLoaded,
    bridgeReady,
    handleFrameLoad: () => {
      setIsLoaded(true)
      setSimEventState('ready')
    },
    isLocalBuildTarget,
    runtimeLabel,
    runtimeDetail,
    simEventState,
  }
}

export default usePhetNeuronController
