import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const tempObj = new THREE.Object3D()
const tempColor = new THREE.Color()
const RESTING = new THREE.Color(0.95, 0.78, 0.32)
const FIRE_A = new THREE.Color(1.0, 0.95, 0.55)
const FIRE_B = new THREE.Color(1.0, 0.75, 0.25)

function createNeuronGeometry() {
  const parts = []

  // Soma — central cell body
  const soma = new THREE.SphereGeometry(0.014, 6, 5)
  parts.push(soma)

  // Dendrite branches — 4 thin tapered arms radiating outward
  const branchDirs = [
    [0.6, 0.7, 0.2],
    [-0.5, 0.6, -0.4],
    [-0.3, -0.7, 0.5],
    [0.4, -0.5, -0.6],
  ]

  for (const [dx, dy, dz] of branchDirs) {
    const len = 0.028
    const cyl = new THREE.CylinderGeometry(0.001, 0.003, len, 3, 1)
    const dir = new THREE.Vector3(dx, dy, dz).normalize()
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir,
    )
    cyl.applyQuaternion(quat)
    cyl.translate(dir.x * len * 0.5, dir.y * len * 0.5, dir.z * len * 0.5)
    parts.push(cyl)
  }

  // Axon — one longer output branch
  const axonDir = new THREE.Vector3(0.1, -0.95, 0.15).normalize()
  const axonLen = 0.038
  const axon = new THREE.CylinderGeometry(0.0015, 0.0025, axonLen, 3, 1)
  const axonQuat = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    axonDir,
  )
  axon.applyQuaternion(axonQuat)
  axon.translate(
    axonDir.x * axonLen * 0.5,
    axonDir.y * axonLen * 0.5,
    axonDir.z * axonLen * 0.5,
  )
  parts.push(axon)

  return mergeGeometries(parts, false)
}

function sampleBrain(count) {
  const pos = new Float32Array(count * 3)
  let n = 0, tries = 0
  while (n < count && tries < count * 35) {
    tries++
    const x = (Math.random() - 0.5) * 3.6
    const y = (Math.random() - 0.5) * 3.0
    const z = (Math.random() - 0.5) * 2.4

    const lx = (x + 0.44) / 0.94, ly = y / 0.84, lz = z / 0.68
    const rx = (x - 0.44) / 0.94, ry = y / 0.84, rz = z / 0.68
    const left = Math.sqrt(lx * lx + ly * ly + lz * lz) - 1
    const right = Math.sqrt(rx * rx + ry * ry + rz * rz) - 1
    const d = Math.min(left, right)

    const fold =
      Math.sin(x * 9.2) * 0.062 +
      Math.sin(y * 8.1 + 1.6) * 0.052 +
      Math.sin(z * 10.4 + 2.9) * 0.046

    const trim = y < -0.58 ? (y + 0.58) * 4.8 : 0

    if (d + fold + trim < 0) {
      pos[n * 3] = x
      pos[n * 3 + 1] = y
      pos[n * 3 + 2] = z
      n++
    }
  }
  return pos
}

function buildLines(pos, count) {
  const verts = []
  const DLIM = 0.28 * 0.28
  for (let i = 0; i < count; i++) {
    const xi = pos[i * 3], yi = pos[i * 3 + 1], zi = pos[i * 3 + 2]
    let c = 0
    for (let j = i + 1; j < count && c < 2; j++) {
      const dx = xi - pos[j * 3], dy = yi - pos[j * 3 + 1], dz = zi - pos[j * 3 + 2]
      if (dx * dx + dy * dy + dz * dz < DLIM) {
        verts.push(xi, yi, zi, pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2])
        c++
      }
    }
  }
  return new Float32Array(verts)
}

const BURST = new THREE.Color(1.0, 1.0, 0.85)

function Scene({ scrollProgress }) {
  const meshRef = useRef()
  const groupRef = useRef()
  const lineRef = useRef()
  const ready = useRef(false)
  const scrollRef = useRef(0)

  const lowPerf = useMemo(
    () => typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4,
    [],
  )
  const COUNT = lowPerf ? 700 : 1900
  const FIRE_N = 80

  const neuronGeo = useMemo(() => createNeuronGeometry(), [])

  const positions = useMemo(() => sampleBrain(COUNT), [COUNT])

  const rotations = useMemo(() => {
    const eulers = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      eulers[i * 3] = Math.random() * Math.PI * 2
      eulers[i * 3 + 1] = Math.random() * Math.PI * 2
      eulers[i * 3 + 2] = Math.random() * Math.PI * 2
    }
    return eulers
  }, [COUNT])

  const lineGeo = useMemo(() => {
    if (lowPerf) return null
    const sub = Math.min(COUNT, 450)
    const verts = buildLines(positions, sub)
    if (verts.length === 0) return null
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    return geo
  }, [positions, COUNT, lowPerf])

  const firingIdx = useMemo(() => {
    const a = new Uint16Array(FIRE_N)
    for (let i = 0; i < FIRE_N; i++) a[i] = Math.floor(Math.random() * COUNT)
    return a
  }, [COUNT])

  const firingOff = useMemo(() => {
    const a = new Float32Array(FIRE_N)
    for (let i = 0; i < FIRE_N; i++) a[i] = Math.random() * 6
    return a
  }, [])

  useEffect(() => {
    const m = meshRef.current
    if (!m) return
    const euler = new THREE.Euler()
    for (let i = 0; i < COUNT; i++) {
      tempObj.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
      euler.set(rotations[i * 3], rotations[i * 3 + 1], rotations[i * 3 + 2])
      tempObj.rotation.copy(euler)
      tempObj.updateMatrix()
      m.setMatrixAt(i, tempObj.matrix)
      m.setColorAt(i, RESTING)
    }
    m.instanceMatrix.needsUpdate = true
    m.instanceColor.needsUpdate = true
    ready.current = true
  }, [positions, rotations, COUNT])

  useFrame(({ clock, camera }) => {
    if (!ready.current || !meshRef.current || !groupRef.current) return
    const t = clock.getElapsedTime()
    const m = meshRef.current
    const sp = scrollRef.current = scrollRef.current + (scrollProgress - scrollRef.current) * 0.08

    groupRef.current.rotation.y = t * 0.09
    groupRef.current.rotation.x = Math.sin(t * 0.26) * 0.06

    // Scroll-driven zoom: camera pushes from z=5.0 → z=2.0
    camera.position.z = 5.0 - sp * 3.0
    // Slight upward drift as we zoom in
    camera.position.y = 0.05 - sp * 0.3

    // Scale up brain slightly as we zoom
    groupRef.current.scale.setScalar(1 + sp * 0.25)

    // How many neurons fire scales with scroll: 8 at top → all 80 deep in
    const activeFiring = Math.floor(8 + sp * (FIRE_N - 8))
    // Firing speed increases with scroll
    const period = 4.0 - sp * 2.5
    const activeWindow = 0.32 + sp * 0.28

    for (let i = 0; i < FIRE_N; i++) {
      if (i >= activeFiring) {
        m.setColorAt(firingIdx[i], RESTING)
        continue
      }
      const phase = ((t + firingOff[i]) % period) / period
      const intensity = phase < activeWindow ? Math.sin((phase / activeWindow) * Math.PI) : 0
      if (intensity > 0.01) {
        const fireColor = (i % 2 === 0) ? FIRE_A : FIRE_B
        // At high scroll, some neurons burst white-hot
        const target = (sp > 0.6 && i < activeFiring * 0.3) ? BURST : fireColor
        tempColor.lerpColors(RESTING, target, intensity)
        m.setColorAt(firingIdx[i], tempColor)
      } else {
        m.setColorAt(firingIdx[i], RESTING)
      }
    }
    m.instanceColor.needsUpdate = true

    // Connection lines brighten with scroll
    if (lineRef.current) {
      lineRef.current.opacity = 0.5 + sp * 0.4
    }
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[neuronGeo, undefined, COUNT]} frustumCulled={false}>
        <meshBasicMaterial vertexColors />
      </instancedMesh>

      {lineGeo && (
        <lineSegments geometry={lineGeo} frustumCulled={false}>
          <lineBasicMaterial ref={lineRef} color="#e8c95a" transparent opacity={0.5} />
        </lineSegments>
      )}
    </group>
  )
}

function BrainCanvas({ scrollProgress }) {
  return (
    <Canvas
      camera={{ position: [0, 0.05, 5.0], fov: 46 }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}
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
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,168,67,0.15) 0%, transparent 70%)',
      }} />
    }>
      <BrainCanvas scrollProgress={scrollProgress} />
    </Suspense>
  )
}
