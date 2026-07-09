import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function MapViewportController({ center, zoom = 13 }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 })
  }, [map, center, zoom])

  return null
}
