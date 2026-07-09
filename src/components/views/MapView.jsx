import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { MapViewportController } from '../map/MapViewportController'
import { MapAutoFit } from '../map/MapAutoFit'
import { mapCategoryOptions, routePalette } from '../../constants'
import { buildSpotMarkerIcon, searchMarkerIcon } from '../../utils/mapHelpers'
import { formatDayLabel } from '../../utils/tripHelpers'

export function MapView({
  selectedDay,
  places,
  mapSearchTerm,
  setMapSearchTerm,
  mapSearchLoading,
  mapSearchError,
  handleMapSearchSubmit,
  geoLoading,
  geoError,
  handleUseMyLocation,
  showAllDaysOnMap,
  setShowAllDaysOnMap,
  activeMapCategory,
  setActiveMapCategory,
  mapCenter,
  mapRoutes,
  visibleMapSpots,
  searchMarker,
  userLocation,
  autoFitPoints,
  setActiveView,
}) {
  return (
    <section className="map-layout">
      <article className="map-shell">
        <div className="map-modules">
          <div className="map-module map-module--search">
            <form className="map-search" onSubmit={handleMapSearchSubmit}>
              <span className="material-symbols-outlined">search</span>
              <input
                placeholder="Busca calles, landmarks o restaurantes..."
                type="text"
                value={mapSearchTerm}
                onChange={(event) => setMapSearchTerm(event.target.value)}
              />
              <button
                className={`map-search-button ${mapSearchLoading ? 'map-search-button--loading' : ''}`}
                type="submit"
                aria-label="Buscar en el mapa"
              >
                <span className="material-symbols-outlined">north_east</span>
              </button>
            </form>

            <button
              className={`location-button ${geoLoading ? 'location-button--loading' : ''}`}
              type="button"
              onClick={handleUseMyLocation}
              aria-label="Usar mi ubicacion"
            >
              <span className="material-symbols-outlined">my_location</span>
              Mi ubicacion
            </button>
          </div>

          <div className="map-module map-module--toggles">
            <div className="map-day-toggle">
              <button
                type="button"
                className={`toggle-pill ${showAllDaysOnMap ? 'toggle-pill--active' : ''}`}
                onClick={() => setShowAllDaysOnMap(true)}
              >
                Todos los dias
              </button>
              <button
                type="button"
                className={`toggle-pill ${!showAllDaysOnMap ? 'toggle-pill--active' : ''}`}
                onClick={() => setShowAllDaysOnMap(false)}
              >
                Solo dia actual
              </button>
            </div>
          </div>

          <div className="map-module map-module--chips">
            <div className="chip-scroller hide-scrollbar">
              {mapCategoryOptions.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className={`chip-filter ${activeMapCategory === chip.key ? 'chip-filter--active' : ''}`}
                  onClick={() => setActiveMapCategory(chip.key)}
                >
                  <span className="material-symbols-outlined">{chip.icon}</span>
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {mapSearchError || geoError ? (
            <div className="map-module map-module--alerts">
              {mapSearchError ? <p className="map-search-error">{mapSearchError}</p> : null}
              {geoError ? <p className="map-search-error">{geoError}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="map-visual map-visual--immersive">
          <MapContainer className="leaflet-map" center={mapCenter} zoom={13} scrollWheelZoom>
            <MapViewportController center={mapCenter} />
            <MapAutoFit points={autoFitPoints} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {mapRoutes.map((route) => (
              <Polyline
                key={`route-${route.dayId}`}
                positions={route.points}
                pathOptions={{
                  color: routePalette[route.dayIndex % routePalette.length],
                  weight: route.dayId === selectedDay.id ? 5 : 3,
                  opacity: route.dayId === selectedDay.id ? 0.9 : 0.5,
                  dashArray: route.dayId === selectedDay.id ? undefined : '8 8',
                }}
              />
            ))}

            {visibleMapSpots.map((spot) => (
              <Marker
                key={`${spot.dayId}-${spot.name}`}
                position={spot.coordinates}
                icon={buildSpotMarkerIcon(spot.dayIndex + 1, spot.category, spot.dayId === selectedDay.id)}
              >
                <Popup>
                  <strong>{spot.name}</strong>
                  <p>Dia {spot.dayIndex + 1}: {spot.dayTitle}</p>
                  <p>{spot.note}</p>
                  <span>{spot.walk} a pie</span>
                </Popup>
              </Marker>
            ))}

            {searchMarker ? (
              <Marker position={searchMarker.coordinates} icon={searchMarkerIcon}>
                <Popup>
                  <strong>Resultado</strong>
                  <p>{searchMarker.name}</p>
                </Popup>
              </Marker>
            ) : null}

            {userLocation ? (
              <Marker position={userLocation.coordinates} icon={searchMarkerIcon}>
                <Popup>
                  <strong>Tu ubicacion</strong>
                  <p>Punto actual detectado por el navegador.</p>
                </Popup>
              </Marker>
            ) : null}
          </MapContainer>
        </div>
      </article>

      <article className="card map-bottom-sheet">
        <div className="sheet-handle" />
        <div className="card-header">
          <div>
            <h3>Mapa Operativo</h3>
            <p className="muted">
              Dia activo: {formatDayLabel(selectedDay)} · Zona: {selectedDay.district}
            </p>
          </div>
          <button className="secondary-pill" type="button" onClick={() => setActiveView('entities')}>
            Gestionar entidades
          </button>
        </div>
        <div className="kpi-row">
          <article className="mini-card mini-card--module">
            <p className="eyebrow">Lugares cargados</p>
            <h3>{places.length}</h3>
          </article>
          <article className="mini-card mini-card--module">
            <p className="eyebrow">Actividades del dia</p>
            <h3>{selectedDay.activities?.length ?? 0}</h3>
          </article>
          <article className="mini-card mini-card--module">
            <p className="eyebrow">Entradas del dia</p>
            <h3>{selectedDay.documents?.length ?? 0}</h3>
          </article>
        </div>
      </article>
    </section>
  )
}
