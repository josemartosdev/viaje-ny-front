import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export function MapAutoFit({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return

    if (points.length === 1) {
      map.flyTo(points[0], 14, { duration: 1.1 })
      return
    }

    map.flyTo(points[0], 13, { duration: 0.8 })
    map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 14 })
  }, [map, points])

  return null
}
