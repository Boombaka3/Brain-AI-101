import { useEffect, useMemo, useState } from 'react'
import { assignPointsToClusters, runIteration } from './kmeans'

const SAMPLE_POINTS = [
  { x: 0.16, y: 0.22 }, { x: 0.2, y: 0.3 }, { x: 0.24, y: 0.37 }, { x: 0.31, y: 0.29 },
  { x: 0.61, y: 0.18 }, { x: 0.67, y: 0.22 }, { x: 0.73, y: 0.15 }, { x: 0.77, y: 0.24 },
  { x: 0.45, y: 0.65 }, { x: 0.51, y: 0.74 }, { x: 0.58, y: 0.69 }, { x: 0.39, y: 0.76 },
]

const MAX_POINTS = 36

function clearAssignments(points) {
  return points.map((point) => ({ ...point, clusterId: null }))
}

function createPoint(point, id) {
  return { id, x: point.x, y: point.y, clusterId: null }
}

export default function useKMeansDemo() {
  const [points, setPoints] = useState([])
  const [centroids, setCentroids] = useState([])
  const [clusterCount, setClusterCount] = useState(3)
  const [isRunning, setIsRunning] = useState(false)
  const [speed, setSpeed] = useState(700)
  const [iteration, setIteration] = useState(0)
  const [converged, setConverged] = useState(false)
  const [lastShift, setLastShift] = useState(0)
  const [pointId, setPointId] = useState(1)

  const clusterSizes = useMemo(() => (
    Array.from({ length: clusterCount }, (_, clusterId) => (
      points.filter((point) => point.clusterId === clusterId).length
    ))
  ), [clusterCount, points])

  const resetCentroids = () => {
    setIsRunning(false)
    setCentroids([])
    setPoints((currentPoints) => clearAssignments(currentPoints))
    setIteration(0)
    setConverged(false)
    setLastShift(0)
  }

  const step = () => {
    if (!points.length) return

    const result = runIteration(points, centroids, clusterCount)
    setPoints(result.points)
    setCentroids(result.centroids)
    setIteration((value) => value + 1)
    setConverged(result.converged)
    setLastShift(result.totalShift)

    if (result.converged) {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    if (!isRunning || converged || !points.length) return undefined
    const intervalId = window.setInterval(step, speed)
    return () => window.clearInterval(intervalId)
  }, [centroids, clusterCount, converged, isRunning, points, speed])

  const addPoint = (x, y) => {
    if (points.length >= MAX_POINTS) return
    const nextPoint = createPoint({ x, y }, pointId)
    setPointId((value) => value + 1)
    setPoints((currentPoints) => [...clearAssignments(currentPoints), nextPoint])
    setCentroids([])
    setIsRunning(false)
    setIteration(0)
    setConverged(false)
    setLastShift(0)
  }

  const addSamplePoints = () => {
    setPoints(SAMPLE_POINTS.map((point, index) => createPoint(point, index + 1)))
    setPointId(SAMPLE_POINTS.length + 1)
    setCentroids([])
    setIsRunning(false)
    setIteration(0)
    setConverged(false)
    setLastShift(0)
  }

  const clearPoints = () => {
    setPoints([])
    setCentroids([])
    setIsRunning(false)
    setIteration(0)
    setConverged(false)
    setLastShift(0)
    setPointId(1)
  }

  const handleClusterCountChange = (value) => {
    setClusterCount(value)
    setIsRunning(false)
    setCentroids([])
    setPoints((currentPoints) => clearAssignments(currentPoints))
    setIteration(0)
    setConverged(false)
    setLastShift(0)
  }

  const statusCopy = useMemo(() => {
    if (!points.length) return 'Add a few points to the plot, then let k-means search for natural groups.'
    if (!centroids.length) return 'Choose how many clusters you want, then start. The first step places centroids and assigns every point to the nearest one.'
    if (converged) return 'The centroids have mostly stopped moving, so the grouping has stabilized for this dataset.'
    return 'Each round alternates between assigning every point to its nearest centroid and moving each centroid to the average of its cluster.'
  }, [centroids.length, converged, points.length])

  const annotatedPoints = useMemo(() => (
    centroids.length ? assignPointsToClusters(points, centroids) : points
  ), [centroids, points])

  return {
    clusterCount,
    clusterSizes,
    converged,
    centroids,
    isRunning,
    iteration,
    lastShift,
    maxPoints: MAX_POINTS,
    points: annotatedPoints,
    speed,
    statusCopy,
    addPoint,
    addSamplePoints,
    clearPoints,
    handleClusterCountChange,
    resetCentroids,
    setIsRunning,
    setSpeed,
    step,
  }
}
