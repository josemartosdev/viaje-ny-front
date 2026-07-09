import {
  formatTripDate,
  formatCompactDate,
  formatCalendarLabel,
  formatDayLabel,
  getActivityStatusMeta,
} from '../../utils/tripHelpers'
import { getCategoryMeta, getActivityCategory } from '../../utils/mapHelpers'

export function ItineraryView({
  trip,
  selectedDay,
  selectedDayId,
  setSelectedDayId,
  reservationHighlights,
  dayRecommendations,
  dayFoodSpots,
  activeCityWeather,
  placeNameById,
  tripStartDate,
  addSelectedActivity,
  cycleSelectedActivityStatus,
  updateSelectedActivity,
  persistSelectedActivity,
  removeSelectedActivity,
  openActivityPlacePicker,
  addSelectedDocument,
  updateSelectedDocument,
  persistSelectedDocument,
  removeSelectedDocument,
}) {
  return (
    <section className="itinerary-layout">
      <div className="itinerary-main">
        <article className="card itinerary-hero">
          <div className="itinerary-hero__icons">
            <span className="material-symbols-outlined">event_note</span>
            <span className="material-symbols-outlined">map</span>
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <p className="eyebrow">Day {trip.days.findIndex((day) => day.id === selectedDay.id) + 1}</p>
          <h2>{formatDayLabel(selectedDay)}</h2>
          <p className="hero-subcopy">{selectedDay.summary}</p>
          <div className="meta-row">
            <span>{formatTripDate(new Date(selectedDay.date), { month: 'long', day: 'numeric' })}</span>
            <span>{selectedDay.district}</span>
          </div>
        </article>

        <article className="card timeline-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Editable itinerary</p>
              <h3>Paradas del día</h3>
              <p className="muted timeline-sync-note">
                {selectedDay?.dbId
                  ? 'Sincronizado con Symfony/MySQL. Los cambios se guardan en BD.'
                  : 'Vista local sin sincronizar con BD.'}
              </p>
            </div>
            <div className="timeline-add-controls">
              <button className="secondary-pill" type="button" onClick={addSelectedActivity}>
                + Añadir parada
              </button>
            </div>
          </div>

          <p className="timezone-note">Hora local actividades: Nueva York (America/New_York)</p>

          <div className="day-strip horizontal-scroll hide-scrollbar">
            {trip.days.map((day) => (
              <button
                key={day.id}
                type="button"
                className={`day-pill ${day.id === selectedDay.id ? 'day-pill--active' : ''}`}
                onClick={() => setSelectedDayId(day.id)}
              >
                <strong>{formatCompactDate(new Date(day.date))}</strong>
                <span>{day.title}</span>
              </button>
            ))}
          </div>

          <div className="timeline-list">
            {selectedDay.activities.map((activity, index) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-dot-column">
                  <span className="timeline-dot" />
                  {index < selectedDay.activities.length - 1 ? <span className="timeline-line" /> : null}
                </div>
                <div className="timeline-content glass-card">
                  <div className="timeline-head">
                    <button
                      className={`activity-status activity-status--${getActivityStatusMeta(activity.status).color}`}
                      type="button"
                      onClick={() => cycleSelectedActivityStatus(activity.id)}
                      aria-label="Cambiar estado de actividad"
                      title="Pulsa para cambiar estado"
                    >
                      <span className="material-symbols-outlined">{getActivityStatusMeta(activity.status).icon}</span>
                      {getActivityStatusMeta(activity.status).label}
                    </button>
                    <span className="activity-category-icon" aria-hidden="true">
                      <span className="material-symbols-outlined">
                        {getCategoryMeta(getActivityCategory(activity.category)).icon}
                      </span>
                    </span>
                    <input
                      className="timeline-time-input"
                      value={activity.time}
                      onChange={(event) => updateSelectedActivity(activity.id, 'time', event.target.value)}
                      onBlur={() => persistSelectedActivity(activity.id)}
                    />
                    <span className="tag">{activity.category}</span>
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => removeSelectedActivity(activity.id)}
                      aria-label="Eliminar parada"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="timeline-db-badge-row">
                    <span className="entity-pill entity-pill--db">BD</span>
                    <span className="muted">{activity.dbId ? `ID ${activity.dbId}` : 'Pendiente de guardar'}</span>
                  </div>
                  <input
                    className="timeline-title-input"
                    value={activity.title}
                    onChange={(event) => updateSelectedActivity(activity.id, 'title', event.target.value)}
                    onBlur={() => persistSelectedActivity(activity.id)}
                  />
                  <textarea
                    className="timeline-note-input"
                    rows="3"
                    value={activity.note}
                    onChange={(event) => updateSelectedActivity(activity.id, 'note', event.target.value)}
                    onBlur={() => persistSelectedActivity(activity.id)}
                  />
                  <div className="timeline-linked-entity">
                    <span>
                      Entidad vinculada:{' '}
                      {activity.placeId
                        ? (placeNameById[String(activity.placeId)] ?? `#${activity.placeId}`)
                        : 'Sin entidad'}
                    </span>
                    <div className="timeline-linked-actions">
                      <button
                        type="button"
                        className="secondary-pill"
                        onClick={() => openActivityPlacePicker(activity.id)}
                      >
                        Seleccionar entidad
                      </button>
                      {activity.placeId ? (
                        <button
                          type="button"
                          className="secondary-pill"
                          onClick={async () => {
                            updateSelectedActivity(activity.id, 'placeId', null)
                            await persistSelectedActivity(activity.id)
                          }}
                        >
                          Quitar
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="card mini-stack">
        <div className="mini-card mini-card--module mini-card--dates">
          <div className="module-head">
            <span className="material-symbols-outlined">calendar_month</span>
            <p className="eyebrow">Trip dates</p>
          </div>
          <h3>{formatCalendarLabel(new Date())}</h3>
          <p>{formatTripDate(tripStartDate, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>

        <div className="mini-card mini-card--module mini-card--weather">
          <div className="module-head">
            <span className="material-symbols-outlined">wb_sunny</span>
            <p className="eyebrow">Weather</p>
          </div>
          <h3>{activeCityWeather.loading ? '--' : `${activeCityWeather.temperature}°C`}</h3>
          <p>{activeCityWeather.loading ? 'Loading...' : activeCityWeather.condition}</p>
        </div>

        <div className="mini-card mini-card--module mini-card--reservations">
          <div className="module-head">
            <span className="material-symbols-outlined">verified</span>
            <p className="eyebrow">Reservas clave</p>
          </div>
          <div className="reservation-list">
            {reservationHighlights.slice(0, 4).map((item) => (
              <div key={item.id} className="reservation-item">
                <strong>D{item.dayIndex + 1}</strong>
                <span>{item.time}</span>
                <p>{item.title}</p>
              </div>
            ))}
            {!reservationHighlights.length ? <p className="muted">Sin reservas marcadas.</p> : null}
          </div>
        </div>

        <div className="mini-card mini-card--module mini-card--tips">
          <div className="module-head">
            <span className="material-symbols-outlined">tips_and_updates</span>
            <p className="eyebrow">Recomendaciones</p>
          </div>
          <div className="insight-list">
            {dayRecommendations.map((tip) => (
              <div key={tip} className="insight-item">
                <span className="material-symbols-outlined">tips_and_updates</span>
                <p>{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mini-card mini-card--module mini-card--food">
          <div className="module-head">
            <span className="material-symbols-outlined">restaurant</span>
            <p className="eyebrow">Dónde comer</p>
          </div>
          <div className="food-spot-list">
            {dayFoodSpots.slice(0, 4).map((spot) => (
              <div key={spot.name} className="food-spot-item">
                <strong>{spot.name}</strong>
                <span>{spot.walk ? `${spot.walk} a pie` : '--'}</span>
                <p>{spot.note}</p>
              </div>
            ))}
            {!dayFoodSpots.length ? <p className="muted">Sin paradas de comida para hoy.</p> : null}
          </div>
        </div>

        <div className="mini-card mini-card--module mini-card--documents">
          <div className="card-header travel-docs-head">
            <div className="module-head">
              <span className="material-symbols-outlined">airplane_ticket</span>
              <p className="eyebrow">Entradas y embarque</p>
            </div>
            <div className="travel-doc-actions">
              <button className="secondary-pill" type="button" onClick={() => addSelectedDocument('entry')}>
                + Entrada
              </button>
              <button className="secondary-pill" type="button" onClick={() => addSelectedDocument('boarding')}>
                + Embarque
              </button>
            </div>
          </div>

          <div className="travel-doc-list">
            {(selectedDay.documents ?? []).map((document) => (
              <div key={document.id} className="travel-doc-item">
                <div className="travel-doc-top">
                  <span className={`travel-doc-type travel-doc-type--${document.type}`}>
                    <span className="material-symbols-outlined">
                      {document.type === 'boarding' ? 'flight_takeoff' : 'confirmation_number'}
                    </span>
                    {document.type === 'boarding' ? 'Embarque' : 'Entrada'}
                  </span>
                  <button
                    className="icon-button"
                    type="button"
                    aria-label="Eliminar documento"
                    onClick={() => removeSelectedDocument(document.id)}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <input
                  className="travel-doc-title-input"
                  value={document.title}
                  placeholder="Titulo"
                  onChange={(event) => updateSelectedDocument(document.id, 'title', event.target.value)}
                  onBlur={() => persistSelectedDocument(document.id)}
                />

                <div className="travel-doc-meta-row">
                  <input
                    className="travel-doc-input"
                    value={document.time}
                    placeholder="Hora"
                    onChange={(event) => updateSelectedDocument(document.id, 'time', event.target.value)}
                    onBlur={() => persistSelectedDocument(document.id)}
                  />
                  <input
                    className="travel-doc-input"
                    value={document.code}
                    placeholder="Codigo"
                    onChange={(event) => updateSelectedDocument(document.id, 'code', event.target.value)}
                    onBlur={() => persistSelectedDocument(document.id)}
                  />
                  <input
                    className="travel-doc-input"
                    value={document.holder}
                    placeholder="Titular"
                    onChange={(event) => updateSelectedDocument(document.id, 'holder', event.target.value)}
                    onBlur={() => persistSelectedDocument(document.id)}
                  />
                </div>

                <textarea
                  className="travel-doc-note-input"
                  rows="2"
                  value={document.note}
                  placeholder="Notas"
                  onChange={(event) => updateSelectedDocument(document.id, 'note', event.target.value)}
                  onBlur={() => persistSelectedDocument(document.id)}
                />
              </div>
            ))}
            {!selectedDay.documents?.length ? <p className="muted">Sin documentos para este dia.</p> : null}
          </div>
        </div>
      </article>
    </section>
  )
}
