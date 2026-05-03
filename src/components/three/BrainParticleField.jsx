import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const BRAIN_URL = import.meta.env.BASE_URL + 'models/Brain.glb'

const POSITION = [-0.94, -4.15, -2.37]
const SCALE = 3.28
const ROTATION = [-0.13, 1.55, 0]

function BrainModel() {
  const { scene } = useGLTF(BRAIN_URL)
  const groupRef = useRef()

  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#b8d8ff'),
        emissive: new THREE.Color('#3a9fff'),
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.78,
        roughness: 0.3,
        metalness: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    }
  })

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissiveIntensity = 0.65 + Math.sin(t * 0.75) * 0.12
        }
      })
    }
  })

  return (
    <group ref={groupRef} position={POSITION} scale={SCALE} rotation={ROTATION}>
      <primitive object={scene} />
    </group>
  )
}

function Scene() {
  return (
    <>
      <BrainModel />
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[2, 4, 4]} intensity={1.0} color="#ffffff" />
      <directionalLight position={[-3, 1, 2]} intensity={0.4} color="#a0d0ff" />
      <pointLight position={[0, 0.5, 2]} intensity={2.0} color="#60b0ff" distance={6} />
    </>
  )
}

export default function BrainParticleField({ scrollProgress = 0 }) {
  return (
    <Suspense fallback={<div style={{ width: '100%', height: '100%' }} />}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 70 }}
        gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </Suspense>
  )
}
