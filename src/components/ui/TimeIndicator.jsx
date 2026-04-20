import '../../styles/shared.css'

export default function TimeIndicator({ minutes, label, active = false }) {
  return (
    <span
      className="shared-time-pill"
      style={active ? {
        background: '#eff6ff',
        borderColor: '#93c5fd',
        color: '#1d4ed8',
      } : {
        background: '#f8fafc',
        borderColor: '#e2e8f0',
        color: '#64748b',
      }}
      title={label}
    >
      ~{minutes} min
    </span>
  )
}
