import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'

const LAYER_CONFIG = [
  { count: 3, x: -1.8, color: '#2D7EFF' },
  { count: 4, x: 0,    color: '#7C3AED' },
  { count: 2, x: 1.8,  color: '#22D3EE' },
]
const NODE_RADIUS = 0.14

function NetworkScene() {
  const groupRef = useRef()
  const pulseRef = useRef(0)

  const nodePositions = useMemo(() => {
    return LAYER_CONFIG.map(({ count, x }) => {
      const positions = []
      for (let i = 0; i < count; i++) {
        const y = (i - (count - 1) / 2) * 0.75
        positions.push(new THREE.Vector3(x, y, 0))
      }
      return positions
    })
  }, [])

  const edges = useMemo(() => {
    const result = []
    for (let l = 0; l < nodePositions.length - 1; l++) {
      for (const a of nodePositions[l]) {
        for (const b of nodePositions[l + 1]) {
          result.push({ from: a, to: b })
        }
      }
    }
    return result
  }, [nodePositions])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.15) * 0.3
    groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.08
    pulseRef.current = t
  })

  return (
    <group ref={groupRef}>
      {/* Edges */}
      {edges.map((e, i) => (
        <Line
          key={i}
          points={[e.from, e.to]}
          color="#93c5fd"
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}

      {/* Nodes */}
      {nodePositions.map((layer, li) =>
        layer.map((pos, ni) => (
          <mesh key={`${li}-${ni}`} position={pos}>
            <sphereGeometry args={[NODE_RADIUS, 14, 14]} />
            <meshPhysicalMaterial
              color={LAYER_CONFIG[li].color}
              emissive={LAYER_CONFIG[li].color}
              emissiveIntensity={0.5}
              roughness={0.15}
              metalness={0.2}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

export default function NetworkGraph3D({ height = 260 }) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} color="#e8f0ff" />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#2D7EFF" />
        <pointLight position={[-3, -2, 2]} intensity={0.7} color="#7C3AED" />
        <NetworkScene />
      </Canvas>
    </div>
  )
}
