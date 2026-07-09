import 'leaflet/dist/leaflet.css'
import './App.css'

import { cityProfiles } from './constants'
import { useTripApp } from './hooks/useTripApp'

import { Topbar } from './components/layout/Topbar'
import { BottomNav } from './components/layout/BottomNav'
import { HomeView } from './components/views/HomeView'
import { ItineraryView } from './components/views/ItineraryView'
import { MapView } from './components/views/MapView'
import { EntitiesView } from './components/views/EntitiesView'
import { ActivityModal } from './components/modals/ActivityModal'
import { ActivityPlacePicker } from './components/modals/ActivityPlacePicker'
import { PlaceModal } from './components/modals/PlaceModal'

function App() {
  const {
    trip, selectedDay, selectedDayId, setSelectedDayId,
    apiSync, activeView, setActiveView,
    activeCityKey, setActiveCityKey,
    activeCityWeather, activeCityTime, activeCityDate,
    tripStartDate, tripEndDate, daysUntilStart, featuredActivity,
    reservationHighlights, statusCounter, dayRecommendations, dayFoodSpots,
    placeNameById,
    places, mapCenter, mapRoutes, visibleMapSpots, autoFitPoints,
    activeMapCategory, setActiveMapCategory,
    showAllDaysOnMap, setShowAllDaysOnMap,
    searchMarker, userLocation, geoLoading, geoError,
    mapSearchTerm, setMapSearchTerm, mapSearchLoading, mapSearchError,
    mapEntityTab, setMapEntityTab,
    mapEntitySearch, setMapEntitySearch,
    mapPlaceTypeFilter, setMapPlaceTypeFilter,
    mapActivityStatusFilter, setMapActivityStatusFilter,
    mapTicketTypeFilter, setMapTicketTypeFilter,
    filteredPlaceEntities, filteredActivityEntities, filteredTicketEntities,
    activityModal, setActivityModal,
    activityPlacePicker, setActivityPlacePicker,
    placeModal,
    filteredPlacesForPicker, filteredPlacesForActivityModal,
    addSelectedActivity, closeActivityModal, saveActivityModal,
    updateSelectedActivity, persistSelectedActivity,
    removeSelectedActivity, cycleSelectedActivityStatus,
    updateSelectedDocument, persistSelectedDocument,
    addSelectedDocument, removeSelectedDocument,
    openCreatePlaceModal, openEditPlaceModal, closePlaceModal,
    updatePlaceModalField, savePlaceModal, removePlaceEntity,
    openActivityPlacePicker, closeActivityPlacePicker, assignPlaceToActivity,
    handleMapSearchSubmit, handleUseMyLocation,
  } = useTripApp()

  return (
    <div className="app-shell">
      <Topbar onHomeClick={() => setActiveView('home')} />

      <main className="">
        {apiSync.loading ? <p className="timezone-note">Sincronizando con base de datos...</p> : null}
        {apiSync.error ? <p className="map-search-error">{apiSync.error}</p> : null}

        {activeView === 'home' ? (
          <section className="home-meta">
            <span className="meta-weather">
              <span className="material-symbols-outlined">cloudy</span>
              {activeCityWeather.loading ? '--' : `${activeCityWeather.temperature}°C`}
              <strong className="meta-time">{activeCityTime}</strong>
            </span>
            <span className="meta-date">
              <span className="material-symbols-outlined">calendar_month</span>
              {activeCityDate}
            </span>
            <span className="meta-city-switch" role="tablist" aria-label="Zona horaria">
              {Object.values(cityProfiles).map((city) => (
                <button
                  key={city.key}
                  type="button"
                  className={`meta-city-btn ${activeCityKey === city.key ? 'meta-city-btn--active' : ''}`}
                  onClick={() => setActiveCityKey(city.key)}
                >
                  {city.label}
                </button>
              ))}
            </span>
          </section>
        ) : null}

        {activeView === 'home' && (
          <HomeView
            trip={trip}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
            daysUntilStart={daysUntilStart}
            activeCityWeather={activeCityWeather}
            reservationHighlights={reservationHighlights}
            statusCounter={statusCounter}
            selectedDay={selectedDay}
            dayRecommendations={dayRecommendations}
            featuredActivity={featuredActivity}
            setActiveView={setActiveView}
            setSelectedDayId={setSelectedDayId}
          />
        )}

        {activeView === 'itinerary' && (
          <ItineraryView
            trip={trip}
            selectedDay={selectedDay}
            selectedDayId={selectedDayId}
            setSelectedDayId={setSelectedDayId}
            reservationHighlights={reservationHighlights}
            dayRecommendations={dayRecommendations}
            dayFoodSpots={dayFoodSpots}
            activeCityWeather={activeCityWeather}
            placeNameById={placeNameById}
            tripStartDate={tripStartDate}
            addSelectedActivity={addSelectedActivity}
            cycleSelectedActivityStatus={cycleSelectedActivityStatus}
            updateSelectedActivity={updateSelectedActivity}
            persistSelectedActivity={persistSelectedActivity}
            removeSelectedActivity={removeSelectedActivity}
            openActivityPlacePicker={openActivityPlacePicker}
            addSelectedDocument={addSelectedDocument}
            updateSelectedDocument={updateSelectedDocument}
            persistSelectedDocument={persistSelectedDocument}
            removeSelectedDocument={removeSelectedDocument}
          />
        )}

        {activeView === 'map' && (
          <MapView
            selectedDay={selectedDay}
            places={places}
            mapSearchTerm={mapSearchTerm}
            setMapSearchTerm={setMapSearchTerm}
            mapSearchLoading={mapSearchLoading}
            mapSearchError={mapSearchError}
            handleMapSearchSubmit={handleMapSearchSubmit}
            geoLoading={geoLoading}
            geoError={geoError}
            handleUseMyLocation={handleUseMyLocation}
            showAllDaysOnMap={showAllDaysOnMap}
            setShowAllDaysOnMap={setShowAllDaysOnMap}
            activeMapCategory={activeMapCategory}
            setActiveMapCategory={setActiveMapCategory}
            mapCenter={mapCenter}
            mapRoutes={mapRoutes}
            visibleMapSpots={visibleMapSpots}
            searchMarker={searchMarker}
            userLocation={userLocation}
            autoFitPoints={autoFitPoints}
            setActiveView={setActiveView}
          />
        )}

        {activeView === 'entities' && (
          <EntitiesView
            mapEntityTab={mapEntityTab}
            setMapEntityTab={setMapEntityTab}
            mapEntitySearch={mapEntitySearch}
            setMapEntitySearch={setMapEntitySearch}
            mapPlaceTypeFilter={mapPlaceTypeFilter}
            setMapPlaceTypeFilter={setMapPlaceTypeFilter}
            mapActivityStatusFilter={mapActivityStatusFilter}
            setMapActivityStatusFilter={setMapActivityStatusFilter}
            mapTicketTypeFilter={mapTicketTypeFilter}
            setMapTicketTypeFilter={setMapTicketTypeFilter}
            filteredPlaceEntities={filteredPlaceEntities}
            filteredActivityEntities={filteredActivityEntities}
            filteredTicketEntities={filteredTicketEntities}
            openCreatePlaceModal={openCreatePlaceModal}
            openEditPlaceModal={openEditPlaceModal}
            removePlaceEntity={removePlaceEntity}
            addSelectedActivity={addSelectedActivity}
            updateSelectedActivity={updateSelectedActivity}
            persistSelectedActivity={persistSelectedActivity}
            removeSelectedActivity={removeSelectedActivity}
            openActivityPlacePicker={openActivityPlacePicker}
            addSelectedDocument={addSelectedDocument}
            updateSelectedDocument={updateSelectedDocument}
            persistSelectedDocument={persistSelectedDocument}
            removeSelectedDocument={removeSelectedDocument}
            placeNameById={placeNameById}
            setActiveView={setActiveView}
          />
        )}
      </main>

      <BottomNav activeView={activeView} onNavigate={setActiveView} />

      <button className="fab" type="button" onClick={() => setActiveView('itinerary')}>
        <span className="material-symbols-outlined">add</span>
      </button>

      <ActivityModal
        isOpen={activityModal.isOpen}
        draft={activityModal.draft}
        placeQuery={activityModal.placeQuery}
        placeType={activityModal.placeType}
        selectedPlaceId={activityModal.selectedPlaceId}
        filteredPlaces={filteredPlacesForActivityModal}
        onDraftChange={(field, value) =>
          setActivityModal((c) => ({ ...c, draft: { ...c.draft, [field]: value } }))
        }
        onPlaceQueryChange={(value) => setActivityModal((c) => ({ ...c, placeQuery: value }))}
        onPlaceTypeChange={(value) => setActivityModal((c) => ({ ...c, placeType: value }))}
        onSelectPlace={(id) => setActivityModal((c) => ({ ...c, selectedPlaceId: id }))}
        onSave={saveActivityModal}
        onClose={closeActivityModal}
      />

      <ActivityPlacePicker
        isOpen={activityPlacePicker.isOpen}
        query={activityPlacePicker.query}
        type={activityPlacePicker.type}
        filteredPlaces={filteredPlacesForPicker}
        onQueryChange={(value) => setActivityPlacePicker((c) => ({ ...c, query: value }))}
        onTypeChange={(value) => setActivityPlacePicker((c) => ({ ...c, type: value }))}
        onAssign={assignPlaceToActivity}
        onClose={closeActivityPlacePicker}
      />

      <PlaceModal
        isOpen={placeModal.isOpen}
        mode={placeModal.mode}
        draft={placeModal.draft}
        onFieldChange={updatePlaceModalField}
        onSave={savePlaceModal}
        onClose={closePlaceModal}
      />
    </div>
  )
}

export default App
