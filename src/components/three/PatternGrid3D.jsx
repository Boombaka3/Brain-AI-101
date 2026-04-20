import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GRID_SIZE = 5
const CELL_SPACING = 0.58

// Activation pattern — vertical edge detector response
const ACTIVATION_MAP = [
  0.0, 0.1, 0.9, 0.1, 0.0,
  0.0, 0.1, 0.9, 0.1, 0.0,
  0.0, 0.1, 0.9, 0.1, 0.0,
  0.0, 0.1, 0.9, 0.1, 0.0,
  0.0, 0.1, 0.9, 0.1, 0.0,
]

function CubeCell({ x, y, activation, time }) {
  const ref = useRef()
  const baseY = activation * 0.5

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const wave = Math.sin(t * 0.8 + x * 0.7 + y * 0.5) * 0.04 * activation
    ref.current.position.y = baseY + wave
    ref.current.scale.y = 0.3 + activation * 0.7 + wave * 0.5
  })

  const color = activation > 0.5
    ? new THREE.Color('#2D7EFF').lerp(new THREE.Color('#22D3EE'), activation)
    : new THREE.Color('#CBD5E1').lerp(new THREE.Color('#E2E8F0'), 1 - activation)

  return (
    <mesh ref={ref} position={[x * CELL_SPACING, baseY, y * CELL_SPACING]}>
      <boxGeometry args={[0.42, 0.42, 0.42]} />
      <meshPhysicalMaterial
        color={color}
        emissive={activation > 0.5 ? color : '#000'}
        emissiveIntensity={activation * 0.35}
        roughness={0.3}
        metalness={0.1}
        transparent
        opacity={0.6 + activation * 0.4}
      />
    </mesh>
  )
}

function GridScene() {
  const groupRef = useRef()

  const cells = useMemo(() => {
    const result = []
    const offset = ((GRID_SIZE - 1) * CELL_SPACING) / 2
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        result.push({
          x: col - offset / CELL_SPACING,
          y: row - offset / CELL_SPACING,
          activation: ACTIVATION_MAP[row * GRID_SIZE + col],
        })
      }
    }
    return result
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.004
    groupRef.current.rotation.x = Math.sin(t * 0.15) * 0.08 + 0.2
  })

  return (
    <group ref={groupRef}>
      {cells.map((cell, i) => (
        <CubeCell key={i} {...cell} />
      ))}
    </group>
  )
}

export default function PatternGrid3D({ height = 280 }) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 2.5, 4.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} color="#e8f4ff" />
        <pointLight position={[3, 4, 3]} intensity={1.5} color="#2D7EFF" />
        <pointLight position={[-3, -2, 2]} intensity={0.7} color="#22D3EE" />
        <GridScene />
      </Canvas>
    </div>
  )
}
