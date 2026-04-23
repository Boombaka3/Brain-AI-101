import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const GOLD = new THREE.Color(0.92, 0.72, 0.25)
const BRIGHT = new THREE.Color(1.0, 0.92, 0.5)

function buildNeuronModel() {
  const parts = []

  const soma = new THREE.SphereGeometry(0.32, 24, 18)
  parts.push(soma)

  const branches = [
    { dir: [0.5, 0.8, 0.1], len: 1.1, r0: 0.04, r1: 0.015, children: [
      { dir: [0.3, 0.9, 0.2], len: 0.6, r0: 0.015, r1: 0.006 },
      { dir: [0.8, 0.5, -0.2], len: 0.5, r0: 0.012, r1: 0.005 },
    ]},
    { dir: [-0.6, 0.7, -0.2], len: 0.95, r0: 0.035, r1: 0.012, children: [
      { dir: [-0.4, 0.85, 0.1], len: 0.55, r0: 0.012, r1: 0.005 },
      { dir: [-0.9, 0.3, -0.15], len: 0.45, r0: 0.01, r1: 0.004 },
    ]},
    { dir: [-0.3, 0.6, 0.6], len: 0.85, r0: 0.03, r1: 0.012, children: [
      { dir: [-0.1, 0.7, 0.7], len: 0.5, r0: 0.01, r1: 0.004 },
    ]},
    { dir: [0.4, 0.5, -0.65], len: 0.9, r0: 0.03, r1: 0.012, children: [
      { dir: [0.6, 0.3, -0.7], len: 0.45, r0: 0.01, r1: 0.004 },
    ]},
    { dir: [0.7, 0.3, 0.5], len: 0.7, r0: 0.025, r1: 0.01 },
    { dir: [-0.7, 0.2, 0.5], len: 0.65, r0: 0.025, r1: 0.01 },
  ]

  function addBranch(origin, spec) {
    const dir = new THREE.Vector3(...spec.dir).normalize()
    const cyl = new THREE.CylinderGeometry(spec.r1, spec.r0, spec.len, 8, 1)
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    cyl.applyQuaternion(quat)
    const mid = dir.clone().multiplyScalar(spec.len * 0.5).add(origin)
    cyl.translate(mid.x, mid.y, mid.z)
    parts.push(cyl)

    const tip = dir.clone().multiplyScalar(spec.len).add(origin)
    const bulb = new THREE.SphereGeometry(spec.r1 * 1.8, 6, 5)
    bulb.translate(tip.x, tip.y, tip.z)
    parts.push(bulb)

    if (spec.children) {
      for (const child of spec.children) {
        addBranch(tip, child)
      }
    }
  }

  const origin = new THREE.Vector3(0, 0, 0)
  for (const b of branches) addBranch(origin, b)

  // Axon — long downward branch
  const axonDir = new THREE.Vector3(0.05, -1, 0.05).normalize()
  const axonLen = 2.2
  const axon = new THREE.CylinderGeometry(0.02, 0.035, axonLen, 8, 1)
  const axonQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axonDir)
  axon.applyQuaternion(axonQuat)
  axon.translate(axonDir.x * axonLen * 0.5, axonDir.y * axonLen * 0.5, axonDir.z * axonLen * 0.5)
  parts.push(axon)

  // Axon terminal branches
  const axonTip = axonDir.clone().multiplyScalar(axonLen)
  const terminals = [
    [0.3, -0.6, 0.2], [-0.3, -0.7, -0.1], [0.1, -0.5, -0.4], [-0.2, -0.6, 0.3],
  ]
  for (const t of terminals) {
    const td = new THREE.Vector3(...t).normalize()
    const tLen = 0.35
    const tc = new THREE.CylinderGeometry(0.004, 0.012, tLen, 6, 1)
    const tq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), td)
    tc.applyQuaternion(tq)
    const tmid = td.clone().multiplyScalar(tLen * 0.5).add(axonTip)
    tc.translate(tmid.x, tmid.y, tmid.z)
    parts.push(tc)
    const ttip = td.clone().multiplyScalar(tLen).add(axonTip)
    const tb = new THREE.SphereGeometry(0.025, 6, 5)
    tb.translate(ttip.x, ttip.y, ttip.z)
    parts.push(tb)
  }

  return mergeGeometries(parts, false)
}

function NeuronMesh() {
  const meshRef = useRef()
  const geo = useMemo(() => buildNeuronModel(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.rotation.y = t * 0.15
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.08
  })

  return (
    <mesh ref={meshRef} geometry={geo}>
      <meshStandardMaterial color={GOLD} emissive={BRIGHT} emissiveIntensity={0.15} roughness={0.5} metalness={0.3} />
    </mesh>
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
        camera={{ position: [0, 0, 4.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <directionalLight position={[-2, -1, 3]} intensity={0.4} />
        <NeuronMesh />
      </Canvas>
    </Suspense>
  )
}
