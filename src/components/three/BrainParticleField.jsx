import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const tempObj = new THREE.Object3D()
const tempColor = new THREE.Color()
const RESTING = new THREE.Color(0.3, 0.7, 1.0)
const FIRE = new THREE.Color(1.0, 0.95, 0.4)

function insideBrain(x, y, z) {
  const lx = (x + 0.22) / 0.48, ly = y / 0.46, lz = z / 0.38
  const rx = (x - 0.22) / 0.48, ry = y / 0.46, rz = z / 0.38
  const left = lx * lx + ly * ly + lz * lz
  const right = rx * rx + ry * ry + rz * rz
  const d = Math.min(left, right)
  const trim = y < -0.3 ? (y + 0.3) * 8 : 0
  return d + trim < 0.85
}

function sampleBrainVolume(count) {
  const pos = []
  let tries = 0
  while (pos.length < count * 3 && tries < count * 100) {
    tries++
    const x = (Math.random() - 0.5) * 1.2
    const y = (Math.random() - 0.5) * 1.0
    const z = (Math.random() - 0.5) * 0.8
    if (insideBrain(x, y, z)) {
      pos.push(x, y, z)
    }
  }
  return new Float32Array(pos.slice(0, count * 3))
}

function buildConnections(positions, count, maxDist) {
  const verts = []
  const dLim = maxDist * maxDist
  for (let i = 0; i < count; i++) {
    const xi = positions[i * 3], yi = positions[i * 3 + 1], zi = positions[i * 3 + 2]
    let c = 0
    for (let j = i + 1; j < count && c < 2; j++) {
      const dx = xi - positions[j * 3], dy = yi - positions[j * 3 + 1], dz = zi - positions[j * 3 + 2]
      if (dx * dx + dy * dy + dz * dz < dLim) {
        verts.push(xi, yi, zi, positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])
        c++
      }
    }
  }
  return new Float32Array(verts)
}

function Scene({ scrollProgress }) {
  const neuronsRef = useRef()
  const lineRef = useRef()
  const ready = useRef(false)
  const scrollRef = useRef(0)

  const lowPerf = useMemo(
    () => typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4, [],
  )
  const COUNT = lowPerf ? 350 : 700
  const FIRE_N = 50

  const positions = useMemo(() => sampleBrainVolume(COUNT), [COUNT])

  const neuronGeo = useMemo(() => new THREE.SphereGeometry(0.012, 6, 4), [])

  const lineGeo = useMemo(() => {
    const verts = buildConnections(positions, Math.min(COUNT, 350), 0.14)
    if (verts.length === 0) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    return geo
  }, [positions, COUNT])

  const firingIdx = useMemo(() => {
    const a = new Uint16Array(FIRE_N)
    for (let i = 0; i < FIRE_N; i++) a[i] = Math.floor(Math.random() * COUNT)
    return a
  }, [COUNT])

  const firingOff = useMemo(() => {
    const a = new Float32Array(FIRE_N)
    for (let i = 0; i < FIRE_N; i++) a[i] = Math.random() * 8
    return a
  }, [])

  useEffect(() => {
    const m = neuronsRef.current
    if (!m) return
    for (let i = 0; i < COUNT; i++) {
      tempObj.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      tempObj.scale.setScalar(0.5 + Math.random() * 0.8)
      tempObj.updateMatrix()
      m.setMatrixAt(i, tempObj.matrix)
      m.setColorAt(i, RESTING)
    }
    m.instanceMatrix.needsUpdate = true
    m.instanceColor.needsUpdate = true
    ready.current = true
  }, [positions, COUNT])

  useFrame(({ clock }) => {
    if (!ready.current || !neuronsRef.current) return
    const t = clock.getElapsedTime()
    const m = neuronsRef.current
    const sp = scrollRef.current = scrollRef.current + (scrollProgress - scrollRef.current) * 0.08

    const activeFiring = Math.floor(6 + sp * (FIRE_N - 6))
    const period = 4.5 - sp * 2.0

    for (let i = 0; i < FIRE_N; i++) {
      if (i >= activeFiring) {
        m.setColorAt(firingIdx[i], RESTING)
        continue
      }
      const phase = ((t + firingOff[i]) % period) / period
      const intensity = phase < 0.3 ? Math.sin((phase / 0.3) * Math.PI) : 0
      if (intensity > 0.01) {
        tempColor.lerpColors(RESTING, FIRE, intensity)
        m.setColorAt(firingIdx[i], tempColor)
      } else {
        m.setColorAt(firingIdx[i], RESTING)
      }
    }
    m.instanceColor.needsUpdate = true

    if (lineRef.current) lineRef.current.opacity = 0.18 + sp * 0.2
  })

  return (
    <group>
      <instancedMesh ref={neuronsRef} args={[neuronGeo, undefined, COUNT]} frustumCulled={false}>
        <meshBasicMaterial vertexColors transparent opacity={0.9} />
      </instancedMesh>

      {lineGeo && (
        <lineSegments geometry={lineGeo} frustumCulled={false}>
          <lineBasicMaterial ref={lineRef} color="#5aabee" transparent opacity={0.18} />
        </lineSegments>
      )}

      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 3, 5]} intensity={0.5} color="#ffffff" />
    </group>
  )
}

function BrainCanvas({ scrollProgress }) {
  return (
    <Canvas
      camera={{ position: [0, 0.05, 2.2], fov: 38 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Scene scrollProgress={scrollProgress} />
    </Canvas>
  )
}

export default function BrainParticleField({ scrollProgress = 0 }) {
  return (
    <Suspense fallback={
      <div style={{
        width: '100%', height: '100%',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(100,160,220,0.08) 0%, transparent 70%)',
      }} />
    }>
      <BrainCanvas scrollProgress={scrollProgress} />
    </Suspense>
  )
}
