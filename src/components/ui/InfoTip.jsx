import { useState, useRef, useEffect, useId } from 'react'

/**
 * InfoTip - Lightweight tooltip for concept help
 * 
 * Features:
 * - Desktop: hover shows tooltip
 * - Keyboard: tab focus shows tooltip, Esc closes
 * - Mobile: tap toggles tooltip, tap elsewhere closes
 * 
 * Props:
 * - body: string (max ~120 chars)
 * - side: "top" | "right" | "bottom" | "left" (default "top")
 */
export default function InfoTip({ body, side = 'top' }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const tooltipId = useId()
  
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])
  
  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    // Delay to prevent immediate close on mobile tap
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 10)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])
  
  // Position styles based on side
  const getTooltipPosition = () => {
    const base = {
      position: 'absolute',
      zIndex: 50,
      width: 'max-content',
      maxWidth: 'min(560px, calc(100vw - 32px))',
      minWidth: '220px',
      padding: '10px 14px',
      backgroundColor: '#1E293B',
      color: 'white',
      fontSize: '13px',
      lineHeight: '1.5',
      textAlign: 'left',
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: '400',
      whiteSpace: 'normal',
      overflowWrap: 'break-word',
    }
    
    switch (side) {
      case 'right':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: '8px' }
      case 'bottom':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px' }
      case 'left':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: '8px' }
      case 'top':
      default:
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px' }
    }
  }
  
  // Arrow styles
  const getArrowStyle = () => {
    const base = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    }
    
    switch (side) {
      case 'right':
        return { ...base, left: '-6px', top: '50%', transform: 'translateY(-50%)', borderWidth: '6px 6px 6px 0', borderColor: 'transparent #1E293B transparent transparent' }
      case 'bottom':
        return { ...base, top: '-6px', left: '50%', transform: 'translateX(-50%)', borderWidth: '0 6px 6px 6px', borderColor: 'transparent transparent #1E293B transparent' }
      case 'left':
        return { ...base, right: '-6px', top: '50%', transform: 'translateY(-50%)', borderWidth: '6px 0 6px 6px', borderColor: 'transparent transparent transparent #1E293B' }
      case 'top':
      default:
        return { ...base, bottom: '-6px', left: '50%', transform: 'translateX(-50%)', borderWidth: '6px 6px 0 6px', borderColor: '#1E293B transparent transparent transparent' }
    }
  }
  
  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center',
        marginLeft: '4px',
        verticalAlign: 'middle',
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-label="More info"
        aria-expanded={isOpen}
        aria-describedby={isOpen ? tooltipId : undefined}
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          border: '1px solid #CBD5E1',
          backgroundColor: '#F8FAFC',
          color: '#64748B',
          fontSize: '10px',
          fontWeight: '600',
          fontFamily: 'system-ui, sans-serif',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1,
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#E2E8F0'
          e.currentTarget.style.borderColor = '#94A3B8'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#F8FAFC'
          e.currentTarget.style.borderColor = '#CBD5E1'
        }}
      >
        i
      </button>
      
      {isOpen && (
        <span
          id={tooltipId}
          role="tooltip"
          style={getTooltipPosition()}
        >
          <span style={getArrowStyle()} />
          {body}
        </span>
      )}
    </span>
  )
}

