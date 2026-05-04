const RANDOM_POINT_PADDING = 0.08

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function createRandomPoint() {
  return {
    x: RANDOM_POINT_PADDING + Math.random() * (1 - RANDOM_POINT_PADDING * 2),
    y: RANDOM_POINT_PADDING + Math.random() * (1 - RANDOM_POINT_PADDING * 2),
  }
}

export function distance(pointA, pointB) {
  return Math.hypot(pointA.x - pointB.x, pointA.y - pointB.y)
}

export function initializeCentroids(points, clusterCount) {
  if (!points.length) {
    return Array.from({ length: clusterCount }, () => createRandomPoint())
  }

  const shuffled = [...points].sort(() => Math.random() - 0.5)
  const centroids = shuffled.slice(0, clusterCount).map((point) => ({ x: point.x, y: point.y }))

  while (centroids.length < clusterCount) {
    const basePoint = shuffled[centroids.length % shuffled.length]
    const offset = (centroids.length + 1) * 0.025
    centroids.push({
      x: clamp01(basePoint.x + offset),
      y: clamp01(basePoint.y - offset),
    })
  }

  return centroids
}

export function assignPointsToClusters(points, centroids) {
  if (!centroids.length) {
    return points.map((point) => ({ ...point, clusterId: null }))
  }

  return points.map((point) => {
    let nearestClusterId = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    centroids.forEach((centroid, clusterId) => {
      const nextDistance = distance(point, centroid)
      if (nextDistance < nearestDistance) {
        nearestDistance = nextDistance
        nearestClusterId = clusterId
      }
    })

    return { ...point, clusterId: nearestClusterId }
  })
}

export function updateCentroids(points, centroids, clusterCount) {
  return Array.from({ length: clusterCount }, (_, clusterId) => {
    const assignedPoints = points.filter((point) => point.clusterId === clusterId)
    if (!assignedPoints.length) {
      return centroids[clusterId] ?? createRandomPoint()
    }

    const totals = assignedPoints.reduce(
      (accumulator, point) => ({
        x: accumulator.x + point.x,
        y: accumulator.y + point.y,
      }),
      { x: 0, y: 0 },
    )

    return {
      x: totals.x / assignedPoints.length,
      y: totals.y / assignedPoints.length,
    }
  })
}

export function calculateCentroidShift(previousCentroids, nextCentroids) {
  return nextCentroids.reduce((total, centroid, index) => {
    const previousCentroid = previousCentroids[index]
    if (!previousCentroid) return total
    return total + distance(previousCentroid, centroid)
  }, 0)
}

export function hasConverged(previousCentroids, nextCentroids, tolerance = 0.01) {
  if (previousCentroids.length !== nextCentroids.length || !previousCentroids.length) return false
  return calculateCentroidShift(previousCentroids, nextCentroids) <= tolerance
}

export function runIteration(points, centroids, clusterCount) {
  const activeCentroids = centroids.length === clusterCount
    ? centroids
    : initializeCentroids(points, clusterCount)

  const assignedPoints = assignPointsToClusters(points, activeCentroids)
  const nextCentroids = updateCentroids(assignedPoints, activeCentroids, clusterCount)
  const nextPoints = assignPointsToClusters(assignedPoints, nextCentroids)
  const totalShift = calculateCentroidShift(activeCentroids, nextCentroids)

  return {
    points: nextPoints,
    centroids: nextCentroids,
    totalShift,
    converged: hasConverged(activeCentroids, nextCentroids),
  }
}
