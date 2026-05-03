import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const NEURON_URL = import.meta.env.BASE_URL + 'models/Neuron01.glb'

function NeuronModel() {
  const { scene } = useGLTF(NEURON_URL)
  const groupRef = useRef()

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffe8a0'),
        emissive: new THREE.Color('#ffaa00'),
        emissiveIntensity: 0.25,
        roughness: 0.4,
        metalness: 0.1,
      })
    }
  })

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.18
    groupRef.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.3) * 0.06
  })

  return (
    <group ref={groupRef} scale={0.03}>
      <primitive object={scene} />
    </group>
  )
}

export default function NeuronShowcase() {
  return (
    <Suspense fallback={
      <div style={{
        width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.1) 0%, transparent 70%)',
      }} />
    }>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-2, -1, 3]} intensity={0.4} />
        <NeuronModel />
      </Canvas>
    </Suspense>
  )
}
