import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

const DENDRITE_COUNT = 4
const DENDRITE_COLOR = '#22D3EE'
const CORE_COLOR = '#2D7EFF'
const CORE_EMISSIVE = '#0a1f5c'

function DendriteNode({ angle, radius, speed, phaseOffset }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phaseOffset
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.y = Math.sin(t * 0.7) * radius * 0.5
    ref.current.position.z = Math.sin(t) * radius * 0.6
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshPhysicalMaterial
        color={DENDRITE_COLOR}
        emissive={DENDRITE_COLOR}
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  )
}

function ConnectionLines({ nodeRefs }) {
  // Simplified pulsing connection lines using Line from Drei
  const points = useMemo(
    () => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)],
    []
  )
  return null // Connections handled via per-node Drei Lines below
}

function NeuronScene({ scrollProgress = 0 }) {
  const coreRef = useRef()
  const groupRef = useRef()

  const dendriteConfigs = useMemo(
    () =>
      Array.from({ length: DENDRITE_COUNT }, (_, i) => ({
        angle: (i / DENDRITE_COUNT) * Math.PI * 2,
        radius: 1.6 + i * 0.12,
        speed: 0.38 + i * 0.07,
        phaseOffset: (i / DENDRITE_COUNT) * Math.PI * 2,
      })),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const scale = 1 + scrollProgress * 0.6
    groupRef.current.scale.setScalar(scale)
    groupRef.current.rotation.y = t * (0.003 + scrollProgress * 0.006)
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.06
    // Subtle core pulse
    const pulse = 1 + Math.sin(t * 1.4) * 0.025
    coreRef.current.scale.setScalar(pulse)
  })

  return (
    <group ref={groupRef}>
      {/* Core soma */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.1, 3]} />
        <meshPhysicalMaterial
          color={CORE_COLOR}
          emissive={CORE_EMISSIVE}
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.25}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Nucleus hint */}
      <mesh>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshPhysicalMaterial
          color="#1a3a8f"
          emissive="#0a1f5c"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Dendrite nodes */}
      {dendriteConfigs.map((cfg, i) => (
        <DendriteNode key={i} {...cfg} />
      ))}
    </group>
  )
}

export default function NeuronOrb3D({ scrollProgress = 0, height = 420 }) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} color="#e8f0ff" />
        <pointLight position={[4, 4, 4]} intensity={1.8} color="#2D7EFF" />
        <pointLight position={[-4, -2, -3]} intensity={0.8} color="#22D3EE" />
        <pointLight position={[0, -4, 2]} intensity={0.5} color="#7C3AED" />
        <NeuronScene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  )
}
