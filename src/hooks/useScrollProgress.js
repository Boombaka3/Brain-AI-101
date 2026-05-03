import { useState, useEffect, useRef, useCallback } from 'react'

export default function useScrollProgress(sectionCount) {
  const refs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [visitedIndices, setVisitedIndices] = useState(new Set([0]))

  const setRef = useCallback((i) => (el) => {
    refs.current[i] = el
  }, [])

  useEffect(() => {
    const elements = refs.current.filter(Boolean)
    if (elements.length === 0) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const idx = refs.current.indexOf(entry.target)
        if (idx < 0) return
        setActiveIndex(idx)
        setVisitedIndices(prev => {
          if (prev.has(idx)) return prev
          const next = new Set(prev)
          next.add(idx)
          return next
        })
      })
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 })

    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [sectionCount])

  const scrollTo = useCallback((i) => {
    refs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return { activeIndex, visitedIndices, setRef, scrollTo, refs }
}
