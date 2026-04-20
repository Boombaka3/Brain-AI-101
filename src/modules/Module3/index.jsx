import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import ProgressRail from '../../components/ui/ProgressRail'
import TimeIndicator from '../../components/ui/TimeIndicator'
import LossChart from './components/LossChart'
import LearningRateExplorer from './components/LearningRateExplorer'
import DeepLearningBridge from './components/DeepLearningBridge'
import './module3.css'

gsap.registerPlugin(ScrollTrigger)

const NetworkGraph3D = lazy(() => import('../../components/three/NetworkGraph3D'))

const TABS = ['transition', 'types', 'training', 'feedback', 'inference', 'synthesis']
const CFG = {
  transition: { label: 'Start', pageTitle: 'Module 3: Learning to Learn', headline: 'From Fixed Weights to Learning Weights', subtitle: 'Click the steps. Watch what stays the same and what changes.', takeaway: 'Learning starts when feedback changes weights.', guidance: 'Try Step 1, 2, 3. Ask: did the weights change?' },
  types: { label: '3 Ways', pageTitle: 'Module 3: Learning to Learn', headline: 'Three Ways to Learn', subtitle: 'Each lab compares, gets feedback, then changes.', takeaway: 'Same pattern. Different feedback source.', guidance: 'Try all three labs. What is being compared?' },
  training: { label: 'Practice', pageTitle: 'Module 3: Learning to Learn', headline: 'Practice Changes Weights', subtitle: 'Run a step. Misses push weights to adjust.', takeaway: 'Wrong guess -> weight shift -> better next guess.', guidance: 'Click Advance Step and watch which weight moves.' },
  feedback: { label: 'Connections', pageTitle: 'Module 3: Learning to Learn', headline: 'How Connections Adjust', subtitle: 'If response misses the goal, the connection changes.', takeaway: 'Brains and AI both adjust after mismatch.', guidance: 'Step through: Observe, Compare, Feedback, Adjust.' },
  inference: { label: 'Context', pageTitle: 'Module 3: Learning to Learn', headline: 'Feedback During Inference', subtitle: 'Context can change this decision while weights stay fixed.', takeaway: 'Training changes memory. Inference changes this choice.', guidance: 'Keep inputs and weights same. Toggle context.' },
  synthesis: { label: 'Summary', pageTitle: 'Module 3: Learning to Learn', headline: 'What Changes?', subtitle: 'Each panel shows compare -> feedback -> change.', takeaway: 'Feedback makes adaptation possible. It can change the system or just the current decision.', guidance: 'Click a panel and focus on the "Changes" box.' }
}

const TRAINING_THRESHOLD = 5
const TRAINING_INPUTS = [[2, 3, 1], [1, 2, 2], [3, 1, 2], [2, 2, 1]]
const TRAINING_TARGETS = [1, 0, 1, 0]

const calc = (input, w, target) => {
  const c = input.map((v, i) => v * w[i])
  const sum = c.reduce((a, b) => a + b, 0)
  const pred = sum >= TRAINING_THRESHOLD ? 1 : 0
  return { c, sum, pred, mismatch: pred !== target }
}

function Module3({ onBack }) {
  const [activeTab, setActiveTab] = useState('transition')
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 900)

  const [transitionStep, setTransitionStep] = useState(0)
  const [supWeights, setSupWeights] = useState([1, 1, 1])
  const [supTarget, setSupTarget] = useState(1)
  const [supShowFeedback, setSupShowFeedback] = useState(false)
  const [supChanged, setSupChanged] = useState([false, false, false])
  const [unsupStage, setUnsupStage] = useState(0)
  const [unsupPoints, setUnsupPoints] = useState([
    { id: 1, x: 0.2, y: 0.3, g: null }, { id: 2, x: 0.28, y: 0.39, g: null }, { id: 3, x: 0.68, y: 0.72, g: null }, { id: 4, x: 0.62, y: 0.56, g: null }, { id: 5, x: 0.45, y: 0.58, g: null }
  ])
  const [rlState, setRlState] = useState(1)
  const [rlPrefs, setRlPrefs] = useState({ left: 0.5, up: 0.5, right: 0.5 })
  const [rlReward, setRlReward] = useState(null)
  const [rlLastAction, setRlLastAction] = useState(null)

  const [trainingStep, setTrainingStep] = useState(0)
  const [trainingWeights, setTrainingWeights] = useState([1, 1, 1])
  const [trainingDelta, setTrainingDelta] = useState([0, 0, 0])
  const [trainingRun, setTrainingRun] = useState(0)
  const [trainingHistory, setTrainingHistory] = useState([])

  const [feedbackStep, setFeedbackStep] = useState(0)
  const [inputs, setInputs] = useState([2, 3, 1])
  const [contextOn, setContextOn] = useState(false)
  const [focus, setFocus] = useState('ai')

  const pulseRef = useRef(null)
  const aiSignalRef = useRef(null)
  const brainSignalRef = useRef(null)
  const aiWeightRef = useRef(null)
  const synapseRef = useRef(null)
  const thrRef = useRef(null)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Tab entrance animation
  useEffect(() => {
    gsap.fromTo('.module3-shell, .module3-section-heading', {
      y: 16, opacity: 0,
    }, {
      y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', stagger: 0.06,
    })
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'transition' || !pulseRef.current) return
    gsap.fromTo(pulseRef.current, { scale: 0.96, opacity: 0.85 }, { scale: 1, opacity: 1, duration: 0.26 })
  }, [activeTab, transitionStep])

  useEffect(() => {
    if (activeTab !== 'feedback') return
    if (!aiSignalRef.current || !brainSignalRef.current || !aiWeightRef.current || !synapseRef.current) return
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    gsap.set([aiSignalRef.current, brainSignalRef.current], { opacity: 0, x: 0 })
    if (feedbackStep === 2) {
      tl.fromTo(aiSignalRef.current, { opacity: 0, x: 0 }, { opacity: 1, x: -110, duration: 0.45 }).to(aiSignalRef.current, { opacity: 0, duration: 0.14 })
      tl.fromTo(brainSignalRef.current, { opacity: 0, x: 0 }, { opacity: 1, x: -108, duration: 0.45 }, '<').to(brainSignalRef.current, { opacity: 0, duration: 0.14 })
    }
    tl.to(aiWeightRef.current, { attr: { width: feedbackStep >= 3 ? 132 : 92 }, duration: 0.26 })
      .to(synapseRef.current, { attr: { 'stroke-width': feedbackStep >= 3 ? 12 : 7 }, duration: 0.26 }, '<')
  }, [activeTab, feedbackStep])

  useEffect(() => {
    if (activeTab !== 'inference' || !thrRef.current) return
    gsap.to(thrRef.current, { x: contextOn ? 36 : 0, duration: 0.24 })
  }, [activeTab, contextOn])

  const idx = TABS.indexOf(activeTab)
  const prevTab = idx > 0 ? TABS[idx - 1] : null
  const nextTab = idx < TABS.length - 1 ? TABS[idx + 1] : null
  const cfg = CFG[activeTab]

  const tInput = TRAINING_INPUTS[trainingStep % TRAINING_INPUTS.length]
  const tTarget = TRAINING_TARGETS[trainingStep % TRAINING_TARGETS.length]
  const tCalc = useMemo(() => calc(tInput, trainingWeights, tTarget), [tInput, trainingWeights, tTarget])
  const sCalc = useMemo(() => calc([2, 3, 1], supWeights, supTarget), [supWeights, supTarget])
  const sum = inputs.reduce((a, v, i) => a + v * [1, 1, 1][i], 0)
  const baseThr = 5
  const ctxThr = contextOn ? 6.2 : 5

  // Shared button style (used by inline controls in view functions)
  const btn = { padding: '6px 14px', fontSize: '13px', fontWeight: 500, color: '#475569', backgroundColor: '#F8FAFC', border: '1px solid #D6E2F1', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }
  const pBtn = { padding: '6px 14px', fontSize: '13px', fontWeight: 600, color: '#fff', backgroundColor: '#3B82F6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit' }

  const applySup = () => {
    setSupShowFeedback(true)
    if (!sCalc.mismatch) { setSupChanged([false, false, false]); return }
    const dir = supTarget === 1 ? 1 : -1
    const max = Math.max(...sCalc.c.map((v) => Math.abs(v)), 1)
    const d = sCalc.c.map((v) => Number(((0.08 + (Math.abs(v) / max) * 0.12) * dir).toFixed(2)))
    setSupChanged(d.map((v) => Math.abs(v) > 0))
    setSupWeights((prev) => prev.map((w, i) => Number((w + d[i]).toFixed(2))))
  }

  const act = (dir) => {
    const reward = ({ left: 1, up: 0.4, right: -0.6 }[dir]) ?? 0
    setRlLastAction(dir)
    setRlReward(reward)
    setRlPrefs((p) => ({ ...p, [dir]: Math.max(0, Math.min(1.35, Number((p[dir] + reward * 0.25).toFixed(2)))) }))
    setRlState((s) => (dir === 'left' ? Math.max(0, s - 1) : dir === 'right' ? Math.min(2, s + 1) : s))
  }

  const advanceTraining = () => {
    setTrainingRun((r) => r + 1)
    if (!tCalc.mismatch) {
      const d = [0, 0, 0]
      setTrainingDelta(d)
      setTrainingHistory((h) => [...h.slice(-5), { step: trainingStep + 1, pred: tCalc.pred, target: tTarget, mismatch: false, delta: d }])
      setTrainingStep((s) => s + 1)
      return
    }
    const dir = tTarget === 1 ? 1 : -1
    const max = Math.max(...tCalc.c.map((v) => Math.abs(v)), 1)
    const d = tCalc.c.map((v) => Number(((0.08 + (Math.abs(v) / max) * 0.12) * dir).toFixed(2)))
    setTrainingDelta(d)
    setTrainingHistory((h) => [...h.slice(-5), { step: trainingStep + 1, pred: tCalc.pred, target: tTarget, mismatch: true, delta: d }])
    setTrainingWeights((p) => p.map((w, i) => Number((w + d[i]).toFixed(2))))
    setTrainingStep((s) => s + 1)
  }

  const viewTransition = () => {
    const p = transitionStep >= 1; const f = transitionStep >= 2; const u = transitionStep >= 3
    return <motion.div ref={pulseRef}><svg viewBox='0 0 880 340' style={{ width: '100%' }}><rect x='16' y='16' width='848' height='308' rx='12' fill='#F8FAFC' stroke='#E2E8F0' />
      <g transform='translate(40,42)'><rect x='0' y='0' width='380' height='250' rx='10' fill='#fff' stroke='#DBEAFE' /><text x='20' y='30' fontSize='16' fontWeight='700' fill='#1E40AF'>Fixed Weights</text><text x='20' y='54' fontSize='12' fill='#64748B'>Same weights each run.</text>{[1, 0, 1].map((n, i) => <g key={i} transform={`translate(${20 + i * 42},78)`}><rect width='32' height='32' rx='6' fill='#EFF6FF' stroke='#93C5FD' /><text x='16' y='21' textAnchor='middle' fontSize='14' fontWeight='700' fill='#1E3A8A'>{n}</text></g>)}{[0.4, 0.7, 0.2].map((w, i) => <g key={i} transform={`translate(${20 + i * 46},126)`}><rect width='36' height='30' rx='6' fill='#F8FAFC' stroke='#CBD5E1' /><text x='18' y='20' textAnchor='middle' fontSize='12' fontWeight='700' fill='#334155'>{w}</text></g>)}{p && <g><line x1='194' y1='96' x2='290' y2='96' stroke='#3B82F6' strokeWidth='2' /><rect x='300' y='80' width='62' height='34' rx='8' fill='#DBEAFE' stroke='#60A5FA' /><text x='331' y='101' textAnchor='middle' fontSize='13' fontWeight='700' fill='#1E3A8A'>0.62</text></g>}</g>
      <g transform='translate(458,42)'><rect x='0' y='0' width='380' height='250' rx='10' fill='#fff' stroke='#BBF7D0' /><text x='20' y='30' fontSize='16' fontWeight='700' fill='#166534'>Learning Weights</text><text x='20' y='54' fontSize='12' fill='#64748B'>Feedback changes weights.</text>{[1, 0, 1].map((n, i) => <g key={i} transform={`translate(${20 + i * 42},78)`}><rect width='32' height='32' rx='6' fill='#ECFDF5' stroke='#86EFAC' /><text x='16' y='21' textAnchor='middle' fontSize='14' fontWeight='700' fill='#166534'>{n}</text></g>)}{[0.4, 0.7, u ? 0.35 : 0.2].map((w, i) => <g key={i} transform={`translate(${20 + i * 46},126)`}><rect width='36' height='30' rx='6' fill={u && i === 2 ? '#DCFCE7' : '#F8FAFC'} stroke={u && i === 2 ? '#22C55E' : '#CBD5E1'} /><text x='18' y='20' textAnchor='middle' fontSize='12' fontWeight='700' fill='#334155'>{w}</text></g>)}{p && <g><line x1='194' y1='96' x2='290' y2='96' stroke='#16A34A' strokeWidth='2' /><rect x='300' y='80' width='62' height='34' rx='8' fill='#ECFDF5' stroke='#4ADE80' /><text x='331' y='101' textAnchor='middle' fontSize='13' fontWeight='700' fill='#166534'>{u ? '0.70' : '0.62'}</text></g>}{f && <text x='20' y='184' fontSize='12' fill='#B45309'>Mismatch: weights adjust next.</text>}</g>
    </svg></motion.div>
  }

  const viewTypes = () => {
    const prefMax = Math.max(1, rlPrefs.left, rlPrefs.up, rlPrefs.right)
    const strongest = Object.entries(rlPrefs).sort((a, b) => b[1] - a[1])[0]?.[0]
    return (
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#fff', padding: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Supervised</div>
          <svg viewBox='0 0 300 180' style={{ width: '100%', display: 'block' }}>
            <rect x='6' y='6' width='288' height='168' rx='10' fill='#F8FAFC' stroke='#E2E8F0' />
            {[2, 3, 1].map((v, i) => (
              <g key={i} transform={`translate(${18 + i * 52},28)`}>
                <rect width='44' height='56' rx='8' fill='#fff' stroke={supChanged[i] ? '#60A5FA' : '#CBD5E1'} />
                <text x='22' y='18' textAnchor='middle' fontSize='10' fill='#64748B'>x{i + 1}</text>
                <text x='22' y='34' textAnchor='middle' fontSize='14' fontWeight='700' fill='#1E293B'>{v}</text>
                <text x='22' y='48' textAnchor='middle' fontSize='10' fill='#334155'>w{supWeights[i].toFixed(1)}</text>
              </g>
            ))}
            <rect x='174' y='28' width='54' height='56' rx='8' fill='#fff' stroke='#CBD5E1' />
            <text x='201' y='45' textAnchor='middle' fontSize='10' fill='#64748B'>Target</text>
            <text x='201' y='66' textAnchor='middle' fontSize='16' fontWeight='700' fill='#1E293B'>{supTarget}</text>
            <rect x='236' y='28' width='46' height='56' rx='8' fill='#fff' stroke='#CBD5E1' />
            <text x='259' y='45' textAnchor='middle' fontSize='10' fill='#64748B'>Pred</text>
            <motion.text key={sCalc.pred} x='259' y='66' textAnchor='middle' fontSize='16' fontWeight='700' fill='#1E293B' initial={{ opacity: 0.5, y: 69 }} animate={{ opacity: 1, y: 66 }} transition={{ duration: 0.22 }}>{sCalc.pred}</motion.text>
            {supShowFeedback && (
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <rect x='18' y='100' width='264' height='26' rx='8' fill={sCalc.mismatch ? '#FEF3C7' : '#DCFCE7'} stroke={sCalc.mismatch ? '#F59E0B' : '#22C55E'} />
                <text x='150' y='117' textAnchor='middle' fontSize='11' fontWeight='700' fill={sCalc.mismatch ? '#B45309' : '#166534'}>
                  {sCalc.mismatch ? 'Mismatch shown. Weights changed.' : 'Match. Weights stayed.'}
                </text>
              </motion.g>
            )}
          </svg>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button style={btn} onClick={() => { setSupTarget((t) => (t === 1 ? 0 : 1)); setSupShowFeedback(false); setSupChanged([false, false, false]) }}>Change Target</button>
            <button style={btn} onClick={applySup}>Apply Feedback</button>
            <button style={btn} onClick={() => { setSupWeights([1, 1, 1]); setSupTarget(1); setSupShowFeedback(false); setSupChanged([false, false, false]) }}>Reset</button>
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569' }}>Compare target vs prediction, then update.</div>
        </div>

        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#fff', padding: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Unsupervised</div>
          <svg viewBox='0 0 300 180' style={{ width: '100%', display: 'block' }}>
            <rect x='6' y='6' width='288' height='168' rx='10' fill='#F8FAFC' stroke='#E2E8F0' />
            <rect x='18' y='20' width='264' height='140' rx='8' fill='#fff' stroke='#CBD5E1' />
            {unsupStage >= 1 && unsupStage < 2 && unsupPoints.map((p) => {
              let n = null
              let m = Infinity
              unsupPoints.forEach((q) => {
                if (q.id === p.id) return
                const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2
                if (d < m) { m = d; n = q }
              })
              if (!n) return null
              return <line key={`n-${p.id}`} x1={28 + p.x * 240} y1={30 + p.y * 120} x2={28 + n.x * 240} y2={30 + n.y * 120} stroke='#93C5FD' strokeWidth='2' strokeDasharray='4 3' />
            })}
            {unsupStage >= 2 && <><circle cx='98' cy='82' r='40' fill='none' stroke='#93C5FD' strokeDasharray='5 4' /><circle cx='214' cy='104' r='40' fill='none' stroke='#86EFAC' strokeDasharray='5 4' /></>}
            {unsupPoints.map((p) => (
              <motion.circle key={p.id} cx={28 + p.x * 240} cy={30 + p.y * 120} r='9' fill={p.g === 'A' ? '#3B82F6' : p.g === 'B' ? '#16A34A' : '#94A3B8'} animate={{ cx: 28 + p.x * 240, cy: 30 + p.y * 120 }} transition={{ duration: 0.28 }} />
            ))}
          </svg>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button style={btn} onClick={() => setUnsupStage(1)}>Show Similarity</button>
            <button style={btn} onClick={() => {
              setUnsupStage(2)
              setUnsupPoints((p) => p.map((v) => {
                const g = v.x + v.y > 1.08 ? 'B' : 'A'
                const tx = g === 'A' ? 0.2 + (v.id % 2) * 0.06 : 0.67 + (v.id % 2) * 0.06
                const ty = g === 'A' ? 0.36 + (v.id % 3) * 0.07 : 0.5 + (v.id % 3) * 0.07
                return { ...v, g, x: tx, y: ty }
              }))
            }}>Find Groups</button>
            <button style={btn} onClick={() => {
              setUnsupStage(0)
              setUnsupPoints([{ id: 1, x: 0.2, y: 0.3, g: null }, { id: 2, x: 0.28, y: 0.39, g: null }, { id: 3, x: 0.68, y: 0.72, g: null }, { id: 4, x: 0.62, y: 0.56, g: null }, { id: 5, x: 0.45, y: 0.58, g: null }])
            }}>Reset</button>
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569' }}>No targets. Similar points form groups.</div>
        </div>

        <div style={{ border: '1px solid #E2E8F0', borderRadius: '10px', backgroundColor: '#fff', padding: '8px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Reinforcement</div>
          <svg viewBox='0 0 300 180' style={{ width: '100%', display: 'block' }}>
            <rect x='6' y='6' width='288' height='168' rx='10' fill='#F8FAFC' stroke='#E2E8F0' />
            {[0, 1, 2].map((c) => <rect key={c} x={22 + c * 46} y='40' width='38' height='32' rx='8' fill={c === rlState ? '#DBEAFE' : '#fff'} stroke={c === rlState ? '#60A5FA' : '#CBD5E1'} />)}
            <motion.g key={`${rlLastAction}-${rlReward}`} initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
              <rect x='170' y='32' width='112' height='38' rx='8' fill='#fff' stroke='#CBD5E1' />
              <text x='182' y='49' fontSize='10' fill='#64748B'>Reward</text>
              <text x='182' y='63' fontSize='14' fontWeight='700' fill={rlReward === null ? '#64748B' : rlReward > 0 ? '#166534' : '#B91C1C'}>{rlReward === null ? '--' : rlReward.toFixed(1)}</text>
            </motion.g>
            {['left', 'up', 'right'].map((d, i) => (
              <g key={d} transform={`translate(${18 + i * 92},98)`}>
                <text x='0' y='0' fontSize='10' fill='#64748B'>{d.toUpperCase()}</text>
                <rect x='0' y='8' width='74' height='10' rx='5' fill='#E2E8F0' />
                <motion.rect x='0' y='8' height='10' rx='5' fill={d === strongest ? '#2563EB' : d === 'left' ? '#60A5FA' : d === 'up' ? '#4ADE80' : '#FBBF24'} animate={{ width: (rlPrefs[d] / prefMax) * 74 }} transition={{ duration: 0.25 }} />
                {rlLastAction === d && <rect x='-3' y='5' width='80' height='16' rx='7' fill='none' stroke='#3B82F6' strokeWidth='1.4' />}
              </g>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            <button style={btn} onClick={() => act('left')}>Left</button>
            <button style={btn} onClick={() => act('up')}>Up</button>
            <button style={btn} onClick={() => act('right')}>Right</button>
            <button style={btn} onClick={() => { setRlState(1); setRlPrefs({ left: 0.5, up: 0.5, right: 0.5 }); setRlReward(null); setRlLastAction(null) }}>Reset</button>
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569' }}>Reward shifts action preference.</div>
        </div>
      </div>
    )
  }

  const viewTraining = () => (
    <svg viewBox='0 0 880 340' style={{ width: '100%' }}>
      <rect x='16' y='16' width='848' height='308' rx='12' fill='#F8FAFC' stroke='#E2E8F0' />
      <text x='36' y='42' fontSize='16' fontWeight='700' fill='#1E293B'>AI Training Lab</text>
      <text x='36' y='60' fontSize='12' fill='#64748B'>One flow: run, compare, update.</text>
      <text x='720' y='42' fontSize='11' fill='#64748B'>Example {(trainingStep % TRAINING_INPUTS.length) + 1}</text>

      <text x='38' y='90' fontSize='11' fill='#64748B'>Inputs</text>
      {tInput.map((v, i) => (
        <g key={`in-${i}`} transform={`translate(${36 + i * 52},98)`}>
          <rect width='44' height='44' rx='8' fill='#fff' stroke='#CBD5E1' />
          <text x='22' y='18' textAnchor='middle' fontSize='10' fill='#64748B'>x{i + 1}</text>
          <text x='22' y='33' textAnchor='middle' fontSize='15' fontWeight='700' fill='#1E293B'>{v}</text>
        </g>
      ))}

      <text x='204' y='90' fontSize='11' fill='#64748B'>Weights</text>
      {trainingWeights.map((w, i) => (
        <g key={`w-${i}`} transform={`translate(${202 + i * 58},98)`}>
          <rect width='50' height='44' rx='8' fill={trainingDelta[i] !== 0 ? '#EFF6FF' : '#fff'} stroke={trainingDelta[i] !== 0 ? '#60A5FA' : '#CBD5E1'} />
          <text x='25' y='18' textAnchor='middle' fontSize='10' fill='#64748B'>w{i + 1}</text>
          <motion.text key={`${trainingRun}-${i}-${w}`} x='25' y='34' textAnchor='middle' fontSize='14' fontWeight='700' fill='#1E293B' initial={{ opacity: 0.5, y: 38 }} animate={{ opacity: 1, y: 34 }} transition={{ duration: 0.24 }}>
            {w.toFixed(2)}
          </motion.text>
        </g>
      ))}

      <text x='390' y='90' fontSize='11' fill='#64748B'>Contributions</text>
      {tCalc.c.map((v, i) => (
        <g key={`c-${i}`} transform={`translate(${388 + i * 58},98)`}>
          <rect width='50' height='44' rx='8' fill='#fff' stroke='#CBD5E1' />
          <motion.rect key={`cflash-${trainingRun}-${i}`} width='50' height='44' rx='8' fill='#DBEAFE' initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 0.35, delay: i * 0.08 }} />
          <text x='25' y='18' textAnchor='middle' fontSize='10' fill='#64748B'>c{i + 1}</text>
          <text x='25' y='33' textAnchor='middle' fontSize='13' fontWeight='700' fill='#1E293B'>{v.toFixed(2)}</text>
        </g>
      ))}

      <text x='572' y='90' fontSize='11' fill='#64748B'>Sum</text>
      <rect x='570' y='98' width='62' height='44' rx='8' fill='#fff' stroke='#CBD5E1' />
      <text x='601' y='125' textAnchor='middle' fontSize='15' fontWeight='700' fill='#1E293B'>{tCalc.sum.toFixed(2)}</text>

      <text x='648' y='90' fontSize='11' fill='#64748B'>Prediction</text>
      <rect x='646' y='98' width='62' height='44' rx='8' fill='#fff' stroke='#CBD5E1' />
      <motion.text key={`pred-${trainingRun}-${tCalc.pred}`} x='677' y='125' textAnchor='middle' fontSize='16' fontWeight='700' fill='#1E293B' initial={{ opacity: 0.45, y: 130 }} animate={{ opacity: 1, y: 125 }} transition={{ duration: 0.22 }}>
        {tCalc.pred}
      </motion.text>

      <text x='724' y='90' fontSize='11' fill='#64748B'>Target</text>
      <rect x='722' y='98' width='62' height='44' rx='8' fill='#fff' stroke='#CBD5E1' />
      <text x='753' y='125' textAnchor='middle' fontSize='16' fontWeight='700' fill='#1E293B'>{tTarget}</text>

      <text x='796' y='90' fontSize='11' fill='#64748B'>Update</text>
      <rect x='794' y='98' width='58' height='44' rx='8' fill='#fff' stroke='#CBD5E1' />
      <text x='823' y='126' textAnchor='middle' fontSize='11' fontWeight='700' fill='#334155'>
        {tCalc.mismatch ? 'shift' : 'hold'}
      </text>

      <line x1='170' y1='120' x2='194' y2='120' stroke='#94A3B8' strokeWidth='1.4' markerEnd='url(#tr-arr)' />
      <line x1='358' y1='120' x2='382' y2='120' stroke='#94A3B8' strokeWidth='1.4' markerEnd='url(#tr-arr)' />
      <line x1='546' y1='120' x2='566' y2='120' stroke='#94A3B8' strokeWidth='1.4' markerEnd='url(#tr-arr)' />
      <line x1='634' y1='120' x2='642' y2='120' stroke='#94A3B8' strokeWidth='1.4' markerEnd='url(#tr-arr)' />
      <line x1='710' y1='120' x2='718' y2='120' stroke='#94A3B8' strokeWidth='1.4' markerEnd='url(#tr-arr)' />
      <line x1='786' y1='120' x2='790' y2='120' stroke='#94A3B8' strokeWidth='1.4' markerEnd='url(#tr-arr)' />

      <motion.g key={`mm-${trainingRun}-${tCalc.mismatch}`} animate={tCalc.mismatch ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
        <rect x='36' y='154' width='300' height='30' rx='8' fill={tCalc.mismatch ? '#FEF3C7' : '#DCFCE7'} stroke={tCalc.mismatch ? '#F59E0B' : '#22C55E'} />
        <text x='52' y='173' fontSize='12' fontWeight='700' fill={tCalc.mismatch ? '#B45309' : '#166534'}>
          {tCalc.mismatch ? 'Mismatch: weights update on this step.' : 'Match: no weight update this step.'}
        </text>
      </motion.g>

      <text x='356' y='172' fontSize='11' fill='#64748B'>Weight deltas</text>
      {trainingDelta.map((d, i) => (
        <g key={`d-${i}`} transform={`translate(${436 + i * 84},154)`}>
          <rect width='74' height='30' rx='8' fill={d !== 0 ? '#EFF6FF' : '#fff'} stroke={d !== 0 ? '#93C5FD' : '#CBD5E1'} />
          <text x='37' y='20' textAnchor='middle' fontSize='12' fontWeight='700' fill={d > 0 ? '#1D4ED8' : d < 0 ? '#B45309' : '#64748B'}>
            {d > 0 ? `+${d.toFixed(2)}` : d.toFixed(2)}
          </text>
        </g>
      ))}

      <text x='36' y='216' fontSize='11' fill='#64748B'>Recent history</text>
      {trainingHistory.slice(-6).map((h, i) => (
        <g key={`h-${h.step}-${i}`} transform={`translate(${36 + i * 136},224)`}>
          <rect width='126' height='28' rx='8' fill='#fff' stroke={h.mismatch ? '#FCD34D' : '#BBF7D0'} />
          <text x='8' y='18' fontSize='10' fill='#334155'>
            s{h.step} p{h.pred}/t{h.target} {h.mismatch ? 'mismatch' : 'match'}
          </text>
        </g>
      ))}
      {trainingHistory.slice(-6).map((h, i) => (
        <g key={`hb-${h.step}-${i}`} transform={`translate(${36 + i * 136},260)`}>
          {[0, 1, 2].map((j) => (
            <rect key={j} x={j * 40} y='0' width='34' height='8' rx='4' fill={Math.abs(h.delta[j]) > 0 ? '#60A5FA' : '#E2E8F0'} />
          ))}
        </g>
      ))}

      <defs>
        <marker id='tr-arr' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='5' markerHeight='5' orient='auto-start-reverse'>
          <path d='M 0 0 L 10 5 L 0 10 z' fill='#94A3B8' />
        </marker>
      </defs>
    </svg>
  )

  const viewFeedback = () => {
    const c = feedbackStep >= 1
    const s = feedbackStep >= 2
    const a = feedbackStep >= 3
    const aiInput = [1, 0, 1]
    const aiWeightVals = [0.4, 0.7, a ? 0.35 : 0.2]
    const aiResponse = aiInput.reduce((acc, v, i) => acc + v * aiWeightVals[i], 0)
    const aiPred = aiResponse >= 0.6 ? 1 : 0
    const aiTarget = 1
    const mismatch = c && aiPred !== aiTarget
    const stages = ['Observe', 'Compare', 'Feedback', 'Adjust']
    return (
      <svg viewBox='0 0 880 390' style={{ width: '100%' }}>
        <rect x='16' y='16' width='848' height='358' rx='12' fill='#F8FAFC' stroke='#E2E8F0' />

        <g transform='translate(42,34)'>
          {stages.map((label, i) => (
            <g key={label} transform={`translate(${i * 198},0)`}>
              <motion.rect
                width='182'
                height='28'
                rx='8'
                fill={feedbackStep >= i ? '#DBEAFE' : '#EEF2FF'}
                stroke={feedbackStep >= i ? '#60A5FA' : '#CBD5E1'}
                animate={{ opacity: feedbackStep >= i ? 1 : 0.7 }}
              />
              <text x='91' y='18' textAnchor='middle' fontSize='12' fontWeight='700' fill={feedbackStep >= i ? '#1E3A8A' : '#64748B'}>
                {label}
              </text>
            </g>
          ))}
        </g>

        <g transform='translate(40,76)'>
          <rect x='0' y='0' width='380' height='280' rx='10' fill='#fff' stroke='#BFDBFE' />
          <text x='20' y='28' fontSize='16' fontWeight='700' fill='#1E40AF'>AI Learning</text>

          <text x='20' y='52' fontSize='11' fill='#64748B'>inputs</text>
          {aiInput.map((v, i) => (
            <g key={i} transform={`translate(${20 + i * 38},58)`}>
              <rect width='30' height='28' rx='6' fill='#EFF6FF' stroke='#93C5FD' />
              <text x='15' y='19' textAnchor='middle' fontSize='13' fontWeight='700' fill='#1E3A8A'>{v}</text>
            </g>
          ))}

          <text x='146' y='52' fontSize='11' fill='#64748B'>weights</text>
          {aiWeightVals.map((v, i) => (
            <g key={i} transform={`translate(${146 + i * 42},58)`}>
              <rect width='34' height='28' rx='6' fill={a && i === 2 ? '#DCFCE7' : '#F8FAFC'} stroke={a && i === 2 ? '#22C55E' : '#CBD5E1'} />
              <text x='17' y='18' textAnchor='middle' fontSize='11' fontWeight='700' fill='#334155'>{v.toFixed(2)}</text>
            </g>
          ))}

          <text x='20' y='112' fontSize='11' fill='#64748B'>weighted response</text>
          <rect x='20' y='118' width='112' height='34' rx='8' fill='#fff' stroke='#CBD5E1' />
          <motion.text key={`ai-r-${feedbackStep}-${aiResponse}`} x='76' y='140' textAnchor='middle' fontSize='14' fontWeight='700' fill='#1E293B' initial={{ opacity: 0.45, y: 144 }} animate={{ opacity: 1, y: 140 }} transition={{ duration: 0.2 }}>
            {aiResponse.toFixed(2)}
          </motion.text>

          <rect x='148' y='118' width='84' height='34' rx='8' fill='#fff' stroke='#CBD5E1' />
          <text x='190' y='131' textAnchor='middle' fontSize='10' fill='#64748B'>prediction</text>
          <text x='190' y='145' textAnchor='middle' fontSize='14' fontWeight='700' fill='#1E293B'>{aiPred}</text>

          <rect x='248' y='118' width='84' height='34' rx='8' fill='#fff' stroke='#CBD5E1' />
          <text x='290' y='131' textAnchor='middle' fontSize='10' fill='#64748B'>target</text>
          <text x='290' y='145' textAnchor='middle' fontSize='14' fontWeight='700' fill='#1E293B'>{aiTarget}</text>

          {c && (
            <motion.g animate={mismatch ? { scale: [1, 1.04, 1] } : { scale: 1 }} transition={{ duration: 0.35 }}>
              <rect x='20' y='166' width='312' height='30' rx='8' fill={mismatch ? '#FEF3C7' : '#DCFCE7'} stroke={mismatch ? '#F59E0B' : '#22C55E'} />
              <text x='176' y='185' textAnchor='middle' fontSize='12' fontWeight='700' fill={mismatch ? '#B45309' : '#166534'}>
                {mismatch ? 'Mismatch shown' : 'No mismatch'}
              </text>
            </motion.g>
          )}

          <line x1='332' y1='135' x2='212' y2='222' stroke={s ? '#F59E0B' : '#CBD5E1'} strokeDasharray='5 4' strokeWidth='2' />
          <circle ref={aiSignalRef} cx='332' cy='135' r='7' fill='#F59E0B' opacity='0' />
          {s && <text x='222' y='240' fontSize='12' fill='#B45309'>feedback signal</text>}

          <text x='20' y='255' fontSize='11' fill='#64748B'>changed weight</text>
          <rect x='20' y='262' width='150' height='12' rx='6' fill='#E2E8F0' />
          <rect ref={aiWeightRef} x='20' y='262' width='92' height='12' rx='6' fill='#3B82F6' />
        </g>

        <g transform='translate(458,76)'>
          <rect x='0' y='0' width='380' height='280' rx='10' fill='#fff' stroke='#BBF7D0' />
          <text x='20' y='28' fontSize='16' fontWeight='700' fill='#166534'>Brain Learning</text>

          <circle cx='92' cy='86' r='30' fill='#DBEAFE' stroke='#3B82F6' strokeWidth='2' />
          <text x='92' y='91' textAnchor='middle' fontSize='11' fontWeight='700' fill='#1E40AF'>Pre neuron</text>
          <circle cx='248' cy='86' r='34' fill='#DCFCE7' stroke='#16A34A' strokeWidth='2' />
          <text x='248' y='91' textAnchor='middle' fontSize='11' fontWeight='700' fill='#166534'>Post neuron</text>

          <line ref={synapseRef} x1='124' y1='86' x2='214' y2='86' stroke={c ? '#F59E0B' : '#22C55E'} strokeWidth='7' strokeLinecap='round' />
          <text x='148' y='70' fontSize='10' fill='#64748B'>connection</text>

          <text x='20' y='154' fontSize='12' fill='#334155'>desired response: <tspan fontWeight='700'>1</tspan></text>
          <text x='20' y='176' fontSize='12' fill='#334155'>current response: <tspan fontWeight='700'>{a ? '1' : '0'}</tspan></text>
          {c && <text x='20' y='198' fontSize='12' fill='#B45309'>mismatch: {a ? 'resolved' : 'present'}</text>}

          <line x1='250' y1='176' x2='142' y2='140' stroke={s ? '#F59E0B' : '#CBD5E1'} strokeDasharray='5 4' strokeWidth='2' />
          <circle ref={brainSignalRef} cx='250' cy='176' r='7' fill='#F59E0B' opacity='0' />
          {s && <text x='260' y='196' fontSize='12' fill='#B45309'>feedback signal</text>}

          <text x='20' y='236' fontSize='11' fill='#64748B'>connection strength</text>
          <rect x='20' y='244' width='160' height='12' rx='6' fill='#E2E8F0' />
          <motion.rect x='20' y='244' width={a ? 126 : 84} height='12' rx='6' fill='#22C55E' animate={{ width: a ? 126 : 84 }} transition={{ duration: 0.24 }} />
        </g>
      </svg>
    )
  }

  const viewInference = () => (
    <svg viewBox='0 0 880 340' style={{ width: '100%' }}>
      <rect x='16' y='16' width='848' height='308' rx='12' fill='#F8FAFC' stroke='#E2E8F0' />

      <g transform='translate(40,42)'>
        <rect x='0' y='0' width='380' height='250' rx='10' fill='#fff' stroke='#CBD5E1' />
        <text x='20' y='28' fontSize='16' fontWeight='700' fill='#1E293B'>Without Context</text>
        <text x='20' y='47' fontSize='11' fill='#64748B'>Weights fixed</text>

        <text x='20' y='72' fontSize='10' fill='#94A3B8'>inputs</text>
        {inputs.map((v, i) => (
          <g key={`l-in-${i}`} transform={`translate(${20 + i * 40},78)`}>
            <rect width='32' height='28' rx='6' fill='#EFF6FF' stroke='#93C5FD' />
            <text x='16' y='18' textAnchor='middle' fontSize='12' fontWeight='700' fill='#1E3A8A'>{v}</text>
          </g>
        ))}
        <text x='160' y='72' fontSize='10' fill='#94A3B8'>weights (locked)</text>
        {[1, 1, 1].map((w, i) => (
          <g key={`l-w-${i}`} transform={`translate(${160 + i * 40},78)`}>
            <rect width='32' height='28' rx='6' fill='#F8FAFC' stroke='#CBD5E1' />
            <text x='16' y='18' textAnchor='middle' fontSize='11' fontWeight='700' fill='#64748B'>{w.toFixed(1)}</text>
          </g>
        ))}

        <text x='20' y='131' fontSize='11' fill='#334155'>Score: {sum.toFixed(2)}</text>
        <text x='20' y='148' fontSize='11' fill='#334155'>Threshold: {baseThr.toFixed(1)}</text>
        <rect x='20' y='156' width='250' height='12' rx='6' fill='#E2E8F0' />
        <rect x={20 + baseThr * 30} y='152' width='2' height='20' fill='#64748B' />
        <rect x='20' y='159' width={Math.min(250, sum * 30)} height='6' rx='3' fill='#94A3B8' />

        <rect x='20' y='186' width='250' height='40' rx='8' fill='#F8FAFC' stroke='#CBD5E1' />
        <text x='145' y='212' textAnchor='middle' fontSize='13' fontWeight='700' fill='#1E293B'>
          Decision: {sum >= baseThr ? 'Action A' : 'Action B'}
        </text>
      </g>

      <g transform='translate(458,42)'>
        <rect x='0' y='0' width='380' height='250' rx='10' fill='#fff' stroke='#CBD5E1' />
        <text x='20' y='28' fontSize='16' fontWeight='700' fill='#1E293B'>With Context</text>
        <text x='20' y='47' fontSize='11' fill='#64748B'>Weights fixed</text>

        <text x='20' y='72' fontSize='10' fill='#94A3B8'>inputs</text>
        {inputs.map((v, i) => (
          <g key={`r-in-${i}`} transform={`translate(${20 + i * 40},78)`}>
            <rect width='32' height='28' rx='6' fill='#EFF6FF' stroke='#93C5FD' />
            <text x='16' y='18' textAnchor='middle' fontSize='12' fontWeight='700' fill='#1E3A8A'>{v}</text>
          </g>
        ))}
        <text x='160' y='72' fontSize='10' fill='#94A3B8'>weights (locked)</text>
        {[1, 1, 1].map((w, i) => (
          <g key={`r-w-${i}`} transform={`translate(${160 + i * 40},78)`}>
            <rect width='32' height='28' rx='6' fill='#F8FAFC' stroke='#CBD5E1' />
            <text x='16' y='18' textAnchor='middle' fontSize='11' fontWeight='700' fill='#64748B'>{w.toFixed(1)}</text>
          </g>
        ))}

        <text x='20' y='131' fontSize='11' fill='#334155'>Score: {sum.toFixed(2)}</text>
        <text x='20' y='148' fontSize='11' fill='#334155'>Context threshold: {ctxThr.toFixed(1)}</text>
        <rect x='20' y='156' width='250' height='12' rx='6' fill='#E2E8F0' />
        <rect ref={thrRef} x={20 + baseThr * 30} y='152' width='2' height='20' fill='#8B5CF6' />
        <rect x='20' y='159' width={Math.min(250, sum * 30)} height='6' rx='3' fill={contextOn ? '#8B5CF6' : '#94A3B8'} />

        {contextOn && (
          <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <rect x='282' y='154' width='84' height='22' rx='11' fill='#EEF2FF' stroke='#A78BFA' />
            <text x='324' y='168' textAnchor='middle' fontSize='11' fontWeight='700' fill='#6D28D9'>Context ON</text>
          </motion.g>
        )}

        <rect x='20' y='186' width='250' height='40' rx='8' fill={contextOn ? '#EEF2FF' : '#F8FAFC'} stroke='#CBD5E1' />
        <motion.text key={`ctx-decision-${contextOn}-${sum}-${ctxThr}`} x='145' y='212' textAnchor='middle' fontSize='13' fontWeight='700' fill='#1E293B' initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
          Decision: {sum >= ctxThr ? 'Action A' : 'Action B'}
        </motion.text>
      </g>
    </svg>
  )

  const viewSynthesis = () => (
    <svg viewBox='0 0 880 300' style={{ width: '100%' }}>
      <rect x='16' y='16' width='848' height='268' rx='12' fill='#F8FAFC' stroke='#E2E8F0' />
      <text x='36' y='42' fontSize='16' fontWeight='700' fill='#1E293B'>Quick Recap</text>
      <text x='36' y='60' fontSize='12' fill='#64748B'>Click a panel to see what changes most.</text>

      {[
        { id: 'brain', t: 'Brain', c: 'Current vs goal', f: 'Signal', x: 'Connection strength' },
        { id: 'ai', t: 'AI Training', c: 'Guess vs target', f: 'Error', x: 'Weights' },
        { id: 'inference', t: 'Inference', c: 'Decision vs context', f: 'Context', x: 'Cut line' }
      ].map((p, i) => {
        const active = focus === p.id
        return (
          <g key={p.id} transform={`translate(${36 + i * 270},80)`} onClick={() => setFocus(p.id)} style={{ cursor: 'pointer' }}>
            <motion.rect width='250' height='152' rx='10' fill='#fff' stroke={active ? '#3B82F6' : '#CBD5E1'} animate={{ scale: active ? 1.01 : 1 }} transition={{ duration: 0.2 }} />

            <text x='16' y='28' fontSize='14' fontWeight='700' fill={active ? '#1E3A8A' : '#1E293B'}>{p.t}</text>

            <rect x='16' y='42' width='218' height='28' rx='7' fill={active ? '#EEF2FF' : '#F8FAFC'} stroke={active ? '#A5B4FC' : '#E2E8F0'} />
            <text x='26' y='53' fontSize='10' fill={active ? '#1E3A8A' : '#64748B'}>Compare</text>
            <text x='26' y='64' fontSize='11' fontWeight='700' fill={active ? '#1E3A8A' : '#334155'}>{p.c}</text>

            <rect x='16' y='76' width='218' height='28' rx='7' fill={active ? '#FEF3C7' : '#F8FAFC'} stroke={active ? '#F59E0B' : '#E2E8F0'} />
            <text x='26' y='87' fontSize='10' fill={active ? '#92400E' : '#64748B'}>Feedback</text>
            <text x='26' y='98' fontSize='11' fontWeight='700' fill={active ? '#92400E' : '#334155'}>{p.f}</text>

            <motion.rect
              x='16'
              y='110'
              width='218'
              height='32'
              rx='8'
              fill={active ? '#DBEAFE' : '#F8FAFC'}
              stroke={active ? '#3B82F6' : '#E2E8F0'}
              animate={{ opacity: active ? 1 : 0.84 }}
              transition={{ duration: 0.2 }}
            />
            <text x='26' y='122' fontSize='10' fill={active ? '#1E3A8A' : '#64748B'}>Changes</text>
            <text x='26' y='136' fontSize={active ? '12' : '11'} fontWeight='700' fill={active ? '#1D4ED8' : '#334155'}>{p.x}</text>
          </g>
        )
      })}

      <rect x='36' y='250' width='808' height='24' rx='8' fill='#EAF3FF' stroke='#D4E5FF' />
      <text x='440' y='266' textAnchor='middle' fontSize='12' fontWeight='700' fill='#1E3A8A'>
        Feedback drives adaptation: system change or decision change.
      </text>
    </svg>
  )

  const visual = activeTab === 'transition' ? viewTransition() : activeTab === 'types' ? viewTypes() : activeTab === 'training' ? viewTraining() : activeTab === 'feedback' ? viewFeedback() : activeTab === 'inference' ? viewInference() : viewSynthesis()

  const controls = () => {
    if (activeTab === 'transition') return <><button style={btn} onClick={() => setTransitionStep(1)}>Step 1: Show Prediction</button><button style={btn} onClick={() => setTransitionStep(2)}>Step 2: Show Feedback</button><button style={btn} onClick={() => setTransitionStep(3)}>Step 3: Apply Update</button><button style={btn} onClick={() => setTransitionStep(0)}>Reset</button></>

    if (activeTab === 'types') return null

    if (activeTab === 'training') return <><button style={btn} onClick={advanceTraining}>Advance Step</button><button style={btn} onClick={() => { setTrainingStep(0); setTrainingWeights([1, 1, 1]); setTrainingDelta([0, 0, 0]); setTrainingRun(0); setTrainingHistory([]) }}>Reset</button></>
    if (activeTab === 'feedback') return <><button style={btn} onClick={() => setFeedbackStep((s) => Math.min(3, s + 1))}>Next Step</button><button style={btn} onClick={() => setFeedbackStep(0)}>Reset</button></>
    if (activeTab === 'inference') return <>{inputs.map((v, i) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#fff' }}><span style={{ fontSize: '11px', color: '#64748B', minWidth: '14px' }}>x{i + 1}</span><input type='range' min='0' max='5' value={v} onChange={(e) => setInputs((p) => p.map((n, j) => j === i ? Number(e.target.value) : n))} style={{ width: '86px' }} /><span style={{ fontSize: '11px', color: '#334155', minWidth: '10px' }}>{v}</span></div>)}<button style={{ ...btn, backgroundColor: contextOn ? '#DBEAFE' : '#F8FAFC' }} onClick={() => setContextOn((v) => !v)}>{contextOn ? 'Context ON' : 'Context OFF'}</button><button style={btn} onClick={() => setInputs([2, 2, 2])}>Try Ambiguous Case</button><button style={btn} onClick={() => { setInputs([2, 3, 1]); setContextOn(false) }}>Reset</button></>

    if (activeTab === 'synthesis') return null
    return <><button style={{ ...btn, backgroundColor: focus === 'brain' ? '#DBEAFE' : '#F8FAFC' }} onClick={() => setFocus('brain')}>Brain Learning</button><button style={{ ...btn, backgroundColor: focus === 'ai' ? '#DBEAFE' : '#F8FAFC' }} onClick={() => setFocus('ai')}>AI Training</button><button style={{ ...btn, backgroundColor: focus === 'inference' ? '#DBEAFE' : '#F8FAFC' }} onClick={() => setFocus('inference')}>Inference</button></>
  }

  return (
    <div className="module3-page">
      {/* Header */}
      <header className="module3-header">
        <div className="module3-header-row">
          <div>
            <p className="module3-kicker">Brain-AI-101</p>
            <h1 className="module3-title">
              Module 3: Learning to Learn
              <TimeIndicator minutes={26} label="Learning to Learn" active />
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="shared-btn shared-btn-ghost shared-btn-sm" onClick={() => { if (prevTab) setActiveTab(prevTab); else onBack?.() }}>← Back</button>
            {nextTab && <button className="shared-btn shared-btn-primary shared-btn-sm" onClick={() => setActiveTab(nextTab)}>Next →</button>}
          </div>
        </div>
        <ProgressRail currentModule="module3" />
      </header>

      {/* 3D Hero */}
      <div className="module3-hero">
        <div className="module3-hero-inner">
          <div className="module3-hero-text">
            <p className="shared-eyebrow" style={{ marginBottom: 10 }}>Module 3 · Learning to Learn</p>
            <h2>{cfg.headline}</h2>
            <p>{cfg.subtitle}</p>
            <div style={{ marginTop: 14 }}>
              <span className="shared-chip">Step {idx + 1} of {TABS.length}</span>
            </div>
          </div>
          <Suspense fallback={<div style={{ height: 260, background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius: 16 }} />}>
            <NetworkGraph3D height={260} />
          </Suspense>
        </div>
      </div>

      {/* Tab bar */}
      <div className="module3-tabs-row">
        <div className="module3-tabs">
          {TABS.map((t) => (
            <button key={t} className={`module3-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
              {CFG[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="module3-guidance">💡 {cfg.guidance}</div>

      <main className="module3-main">
        <div className="module3-section-heading">
          <h2>{cfg.headline}</h2>
          <p>{cfg.subtitle}</p>
        </div>

        {/* Loss chart — only on training tab */}
        {activeTab === 'training' && (
          <LossChart trainingStep={trainingStep} mismatch={tCalc.mismatch} />
        )}

        {/* Learning rate explorer — only on training tab */}
        {activeTab === 'training' && <LearningRateExplorer />}

        <div className="module3-shell">{visual}</div>

        <div className="module3-controls">{controls()}</div>

        <p className="module3-takeaway">{cfg.takeaway}</p>

        {/* Deep learning bridge — shown on synthesis tab */}
        {activeTab === 'synthesis' && <DeepLearningBridge />}

        {nextTab && (
          <div style={{ textAlign: 'center' }}>
            <button className="shared-btn shared-btn-primary" onClick={() => setActiveTab(nextTab)}>
              Next: {CFG[nextTab]?.label} →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Module3
