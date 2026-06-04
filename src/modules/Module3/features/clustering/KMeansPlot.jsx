const CLUSTER_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b']
const PLOT_LEFT = 40
const PLOT_TOP = 34
const PLOT_WIDTH = 480
const PLOT_HEIGHT = 280

function plotX(value) {
  return PLOT_LEFT + value * PLOT_WIDTH
}

function plotY(value) {
  return PLOT_TOP + value * PLOT_HEIGHT
}

function KMeansPlot({ points, centroids, onAddPoint }) {
  const handleSvgClick = (event) => {
    const svg = event.currentTarget
    const point = svg.createSVGPoint()
    point.x = event.clientX
    point.y = event.clientY

    const ctm = svg.getScreenCTM()
    if (!ctm) return

    const svgPoint = point.matrixTransform(ctm.inverse())
    const x = (svgPoint.x - PLOT_LEFT) / PLOT_WIDTH
    const y = (svgPoint.y - PLOT_TOP) / PLOT_HEIGHT

    if (x < 0 || x > 1 || y < 0 || y > 1) return
    onAddPoint(x, y)
  }

  return (
    <svg viewBox="0 0 560 360" className="m3-svg-block m3-kmeans-plot" onClick={handleSvgClick} role="img" aria-label="Interactive k-means clustering plot">
      <rect x={PLOT_LEFT} y={PLOT_TOP} width={PLOT_WIDTH} height={PLOT_HEIGHT} rx="18" className="m3-kmeans-plot-surface" />

      {[0.25, 0.5, 0.75].map((tick) => (
        <g key={`v-${tick}`}>
          <line x1={plotX(tick)} y1={PLOT_TOP} x2={plotX(tick)} y2={PLOT_TOP + PLOT_HEIGHT} stroke="#edf2f7" strokeDasharray="4 6" />
          <line x1={PLOT_LEFT} y1={plotY(tick)} x2={PLOT_LEFT + PLOT_WIDTH} y2={plotY(tick)} stroke="#edf2f7" strokeDasharray="4 6" />
        </g>
      ))}

      <text x={PLOT_LEFT} y="26" className="m3-kmeans-plot-label">feature space</text>
      <text x="40" y="332" className="m3-kmeans-plot-caption">Add points to see clusters emerge.</text>

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
