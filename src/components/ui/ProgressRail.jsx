import { motion, AnimatePresence } from 'framer-motion'
import '../../styles/shared.css'

const MODULES = [
  { id: 'module1', label: 'Module 1', time: '~12 min' },
  { id: 'module2', label: 'Module 2', time: '~22 min' },
  { id: 'module3', label: 'Module 3', time: '~26 min' },
]

export default function ProgressRail({ currentModule }) {
  const currentIndex = MODULES.findIndex((m) => m.id === currentModule)

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 6,
        padding: '0 0 2px',
        width: '100%',
      }}
      aria-label="Course progress"
    >
      {MODULES.map((mod, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div
            key={mod.id}
            style={{ alignItems: 'center', display: 'flex', flex: 1, flexDirection: 'column', gap: 4 }}
          >
            <div
              style={{
                borderRadius: 999,
                height: 4,
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
                background: '#e2edf8',
              }}
            >
              <motion.div
                layout
                style={{
                  background: done
                    ? '#10b981'
                    : active
                    ? 'linear-gradient(90deg, #2563eb, #3b82f6)'
                    : 'transparent',
                  borderRadius: 999,
                  height: '100%',
                  width: done || active ? '100%' : '0%',
                }}
                animate={{ width: done || active ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span
              style={{
                color: active ? '#2563eb' : done ? '#10b981' : '#94a3b8',
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.04em',
                transition: 'color 0.3s',
                whiteSpace: 'nowrap',
              }}
            >
              {mod.label} · {mod.time}
            </span>
          </div>
        )
      })}
    </div>
  )
}
