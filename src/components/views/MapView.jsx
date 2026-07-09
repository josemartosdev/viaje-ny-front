import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"
import { MapViewportController } from "../map/MapViewportController"
import { MapAutoFit } from "../map/MapAutoFit"
import { mapCategoryOptions, routePalette } from "../../constants"
import { buildSpotMarkerIcon, searchMarkerIcon } from "../../utils/mapHelpers"
import { formatDayLabel } from "../../utils/tripHelpers"

function googleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`
}

function googleMapsSearchUrl(lat, lng, label) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}&query_place=${lat},${lng}`
}

function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export function MapView({
  selectedDay, places,
  mapSearchTerm, setMapSearchTerm, mapSearchLoading, mapSearchError,
  handleMapSearchSubmit, geoLoading, geoError, handleUseMyLocation,
  showAllDaysOnMap, setShowAllDaysOnMap,
  activeMapCategory, setActiveMapCategory,
  mapCenter, mapRoutes, visibleMapSpots,
  searchMarker, userLocation, autoFitPoints,
  setActiveView,
}) {
  return (
    <div className="map-page">

      {/* Barra de controles */}
      <div className="map-ctrl-bar">
        <div className="map-ctrl-search-row">
          <form className="map-ctrl-search" onSubmit={handleMapSearchSubmit}>
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Busca calles, lugares o restaurantes..."
              value={mapSearchTerm}
              onChange={(e) => setMapSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className={`map-ctrl-go${mapSearchLoading ? " map-ctrl-go--spin" : ""}`}
              aria-label="Buscar"
            >
              <span className="material-symbols-outlined">north_east</span>
            </button>
          </form>
          <button
            type="button"
            className={`map-ctrl-locate${geoLoading ? " map-ctrl-locate--spin" : ""}`}
            onClick={handleUseMyLocation}
            aria-label="Mi ubicacion"
          >
            <span className="material-symbols-outlined">my_location</span>
            <span className="map-ctrl-locate-label">Mi ubicacion</span>
          </button>
        </div>

        <div className="map-ctrl-filters hide-scrollbar">
          <button type="button"
            className={`map-ctrl-toggle${showAllDaysOnMap ? " map-ctrl-toggle--active" : ""}`}
            onClick={() => setShowAllDaysOnMap(true)}>
            <span className="material-symbols-outlined">calendar_month</span>
            Todos los dias
          </button>
          <button type="button"
            className={`map-ctrl-toggle${!showAllDaysOnMap ? " map-ctrl-toggle--active" : ""}`}
            onClick={() => setShowAllDaysOnMap(false)}>
            <span className="material-symbols-outlined">today</span>
            Solo hoy
          </button>
          <span className="map-ctrl-divider" />
          {mapCategoryOptions.map((chip) => (
            <button key={chip.key} type="button"
              className={`map-ctrl-chip${activeMapCategory === chip.key ? " map-ctrl-chip--active" : ""}`}
              onClick={() => setActiveMapCategory(chip.key)}>
              <span className="material-symbols-outlined">{chip.icon}</span>
              {chip.label}
            </button>
          ))}
        </div>

        {(mapSearchError || geoError) && (
          <p className="map-ctrl-error">
            <span className="material-symbols-outlined">error</span>
            {mapSearchError || geoError}
          </p>
        )}
      </div>

      {/* Mapa */}
      <div className="map-canvas">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom
          style={{ width: "100%", height: "100%" }}
        >
          <MapViewportController center={mapCenter} />
          <MapAutoFit points={autoFitPoints} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {mapRoutes.map((route) => (
            <Polyline key={`route-${route.dayId}`} positions={route.points}
              pathOptions={{
                color: routePalette[route.dayIndex % routePalette.length],
                weight: route.dayId === selectedDay.id ? 5 : 3,
                opacity: route.dayId === selectedDay.id ? 0.9 : 0.45,
                dashArray: route.dayId === selectedDay.id ? undefined : "6 8",
              }}
            />
          ))}

          {visibleMapSpots.map((spot, idx) => {
            const [lat, lng] = spot.coordinates
            const prevSpot = idx > 0 ? visibleMapSpots[idx - 1] : null
            const dist = prevSpot ? haversineKm(prevSpot.coordinates, spot.coordinates) : null
            return (
              <Marker key={`${spot.dayId}-${spot.name}-${idx}`}
                position={spot.coordinates}
                icon={buildSpotMarkerIcon(spot.dayIndex + 1, spot.category, spot.dayId === selectedDay.id)}>
                <Popup>
                  <div className="map-popup-inner">
                    <strong className="map-popup-title">{spot.name}</strong>
                    <span className="map-popup-day">Dia {spot.dayIndex + 1} - {spot.dayTitle}</span>
                    {spot.note ? <p className="map-popup-note">{spot.note}</p> : null}
                    {dist !== null ? (
                      <span className="map-popup-dist">
                        <span className="material-symbols-outlined">directions_walk</span>
                        ~{formatDist(dist)} desde anterior
                      </span>
                    ) : null}
                    <div className="map-popup-actions">
                      <a href={googleMapsDirectionsUrl(lat, lng)}
                        target="_blank" rel="noopener noreferrer"
                        className="map-popup-btn map-popup-btn--primary">
                        <span className="material-symbols-outlined">directions</span>
                        Como llegar
                      </a>
                      <a href={googleMapsSearchUrl(lat, lng, spot.name)}
                        target="_blank" rel="noopener noreferrer"
                        className="map-popup-btn">
                        <span className="material-symbols-outlined">open_in_new</span>
                        Ver en Maps
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {searchMarker ? (
            <Marker position={searchMarker.coordinates} icon={searchMarkerIcon}>
              <Popup>
                <div className="map-popup-inner">
                  <strong className="map-popup-title">{searchMarker.name}</strong>
                  <div className="map-popup-actions">
                    <a href={googleMapsDirectionsUrl(...searchMarker.coordinates)}
                      target="_blank" rel="noopener noreferrer"
                      className="map-popup-btn map-popup-btn--primary">
                      <span className="material-symbols-outlined">directions</span>
                      Como llegar
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null}

          {userLocation ? (
            <Marker position={userLocation.coordinates} icon={searchMarkerIcon}>
              <Popup>
                <div className="map-popup-inner">
                  <strong className="map-popup-title">Tu ubicacion</strong>
                </div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </div>

      {/* Footer */}
      <div className="map-footer">
        <div className="map-footer-left">
          <span className="material-symbols-outlined map-footer-icon">event_note</span>
          <div>
            <p className="map-footer-day">{formatDayLabel(selectedDay)}</p>
            <p className="map-footer-meta">
              {selectedDay.district} · {selectedDay.activities?.length ?? 0} actividades · {places.length} lugares
            </p>
          </div>
        </div>
        <div className="map-footer-actions">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((selectedDay.district ?? "") + " New York")}`}
            target="_blank" rel="noopener noreferrer"
            className="secondary-pill">
            <span className="material-symbols-outlined">map</span>
            Zona en Maps
          </a>
          <button className="secondary-pill" type="button" onClick={() => setActiveView("entities")}>
            <span className="material-symbols-outlined">dataset</span>
            Entidades
          </button>
        </div>
      </div>

    </div>
  )
}