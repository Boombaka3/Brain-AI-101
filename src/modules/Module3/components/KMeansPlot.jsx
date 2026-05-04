const CLUSTER_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b']

function plotX(value) {
  return 40 + value * 480
}

function plotY(value) {
  return 34 + value * 280
}

function KMeansPlot({ points, centroids, onAddPoint }) {
  const handleSvgClick = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left - 40) / 480
    const y = (event.clientY - bounds.top - 34) / 280
    if (x < 0 || x > 1 || y < 0 || y > 1) return
    onAddPoint(x, y)
  }

  return (
    <svg viewBox="0 0 560 360" className="m3-svg-block m3-kmeans-plot" onClick={handleSvgClick} role="img" aria-label="Interactive k-means clustering plot">
      <rect x="10" y="10" width="540" height="340" rx="22" fill="#f8fafc" stroke="#e2e8f0" />
      <rect x="40" y="34" width="480" height="280" rx="18" fill="#ffffff" stroke="#dbe5f0" />

      {[0.25, 0.5, 0.75].map((tick) => (
        <g key={`v-${tick}`}>
          <line x1={plotX(tick)} y1="34" x2={plotX(tick)} y2="314" stroke="#edf2f7" strokeDasharray="4 6" />
          <line x1="40" y1={plotY(tick)} x2="520" y2={plotY(tick)} stroke="#edf2f7" strokeDasharray="4 6" />
        </g>
      ))}

      <text x="40" y="26" className="m3-kmeans-plot-label">feature space</text>
      <text x="400" y="334" className="m3-kmeans-plot-caption">click inside the white box to add points</text>

      {points.map((point) => {
        const centroid = point.clusterId != null ? centroids[point.clusterId] : null
        if (!centroid) return null
        return (
          <line
            key={`line-${point.id}`}
            x1={plotX(point.x)}
            y1={plotY(point.y)}
            x2={plotX(centroid.x)}
            y2={plotY(centroid.y)}
            stroke={CLUSTER_COLORS[point.clusterId % CLUSTER_COLORS.length]}
            strokeOpacity="0.22"
            strokeWidth="2"
          />
        )
      })}

      {points.map((point) => (
        <circle
          key={point.id}
          cx={plotX(point.x)}
          cy={plotY(point.y)}
          r="9"
          fill={point.clusterId == null ? '#94a3b8' : CLUSTER_COLORS[point.clusterId % CLUSTER_COLORS.length]}
          stroke="#ffffff"
          strokeWidth="3"
        />
      ))}

      {centroids.map((centroid, index) => (
        <g key={`centroid-${index}`}>
          <circle cx={plotX(centroid.x)} cy={plotY(centroid.y)} r="18" fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]} fillOpacity="0.12" />
          <circle cx={plotX(centroid.x)} cy={plotY(centroid.y)} r="10" fill="#ffffff" stroke={CLUSTER_COLORS[index % CLUSTER_COLORS.length]} strokeWidth="4" />
          <path
            d={`M ${plotX(centroid.x) - 7} ${plotY(centroid.y)} H ${plotX(centroid.x) + 7} M ${plotX(centroid.x)} ${plotY(centroid.y) - 7} V ${plotY(centroid.y) + 7}`}
            stroke={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text x={plotX(centroid.x)} y={plotY(centroid.y) - 16} textAnchor="middle" className="m3-kmeans-centroid-label">C{index + 1}</text>
        </g>
      ))}

      {points.length === 0 && (
        <g>
          <text x="280" y="160" textAnchor="middle" className="m3-kmeans-empty-title">No points yet</text>
          <text x="280" y="186" textAnchor="middle" className="m3-kmeans-empty-copy">Click to place data and watch similar points settle into clusters.</text>
        </g>
      )}
    </svg>
  )
}

export { CLUSTER_COLORS }
export default KMeansPlot
