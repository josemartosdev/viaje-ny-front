import { formatTripDate, formatDayLabel } from '../../utils/tripHelpers'

export function HomeView({
  trip,
  tripStartDate,
  tripEndDate,
  daysUntilStart,
  activeCityWeather,
  reservationHighlights,
  statusCounter,
  selectedDay,
  dayRecommendations,
  featuredActivity,
  setActiveView,
  setSelectedDayId,
}) {
  const nextReserved = reservationHighlights[0]
  const upcomingDays = trip.days
    .filter((day) => new Date(day.date) >= new Date(selectedDay.date))
    .slice(0, 3)

  return (
    <>
      <section className="home-pro-hero">
        <div className="home-pro-hero__left">
          <p className="home-pro-kicker">NYC TRIP SYSTEM</p>
          <h2>{trip.tripName}</h2>
          <p className="home-pro-subtitle">{trip.subtitle}</p>
          <div className="home-pro-dates">
            <span>{formatTripDate(tripStartDate, { month: 'short', day: 'numeric' })}</span>
            <span className="home-pro-dot" />
            <span>{formatTripDate(tripEndDate, { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
        <div className="home-pro-hero__right">
          <div className="home-pro-countdown">
            <strong>{daysUntilStart}</strong>
            <span>D</span>
          </div>
          <p>para arrancar viaje</p>
          <button className="home-pro-cta" type="button" onClick={() => setActiveView('itinerary')}>
            Abrir itinerario
          </button>
        </div>
      </section>

      <section className="home-pro-stats" aria-label="Panel de estado">
        <article className="home-pro-stat-card">
          <span className="material-symbols-outlined">verified</span>
          <strong>{statusCounter.reserved}</strong>
          <p>confirmadas</p>
        </article>
        <article className="home-pro-stat-card">
          <span className="material-symbols-outlined">event_note</span>
          <strong>{selectedDay.activities.length}</strong>
          <p>planes hoy</p>
        </article>
        <article className="home-pro-stat-card">
          <span className="material-symbols-outlined">cloudy</span>
          <strong>{activeCityWeather.loading ? '--' : `${activeCityWeather.temperature}°C`}</strong>
          <p>{activeCityWeather.loading ? 'cargando' : activeCityWeather.condition}</p>
        </article>
      </section>

      <section className="home-pro-grid">
        <article className="home-pro-panel home-pro-panel--focus">
          <div className="home-pro-panel-head">
            <p>Siguiente foco</p>
            <button type="button" className="home-pro-link" onClick={() => setActiveView('itinerary')}>
              Ver todo
            </button>
          </div>
          <h3>{featuredActivity?.title ?? selectedDay.title}</h3>
          <div className="home-pro-inline-meta">
            <span>{featuredActivity?.time ?? '--:--'}</span>
            <span>{selectedDay.district}</span>
          </div>
          <p>{featuredActivity?.note ?? selectedDay.summary}</p>
          <div className="home-pro-actions-row">
            <button type="button" onClick={() => setActiveView('itinerary')}>Editar día</button>
            <button type="button" onClick={() => setActiveView('map')}>Ver mapa</button>
          </div>
        </article>

        <article className="home-pro-panel">
          <div className="home-pro-panel-head">
            <p>Hitos clave</p>
          </div>
          <div className="home-pro-list">
            {reservationHighlights.slice(0, 3).map((item) => (
              <div key={item.id} className="home-pro-list-item">
                <strong>D{item.dayIndex + 1}</strong>
                <span>{item.time}</span>
                <p>{item.title}</p>
              </div>
            ))}
            {!reservationHighlights.length ? <p className="muted">Sin hitos reservados.</p> : null}
          </div>
        </article>

        <article className="home-pro-panel">
          <div className="home-pro-panel-head">
            <p>Próximos días</p>
          </div>
          <div className="home-pro-list">
            {upcomingDays.map((day) => (
              <div key={day.id} className="home-pro-list-item">
                <strong>{formatTripDate(new Date(day.date), { weekday: 'short', day: 'numeric' })}</strong>
                <span>{day.activities.length} act.</span>
                <p>{formatDayLabel(day)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="home-pro-panel home-pro-panel--soft">
          <div className="home-pro-panel-head">
            <p>Atajos</p>
          </div>
          <div className="home-pro-shortcuts">
            <button type="button" onClick={() => setActiveView('itinerary')}>
              <span className="material-symbols-outlined">event_note</span>
              Itinerario
            </button>
            <button type="button" onClick={() => setActiveView('map')}>
              <span className="material-symbols-outlined">map</span>
              Mapa
            </button>
            <button type="button" onClick={() => setSelectedDayId(trip.days[0]?.id ?? '')}>
              <span className="material-symbols-outlined">calendar_month</span>
              Día 1
            </button>
            <button type="button" onClick={() => setSelectedDayId(trip.days[trip.days.length - 1]?.id ?? '')}>
              <span className="material-symbols-outlined">flag</span>
              Último día
            </button>
            {nextReserved ? (
              <button type="button" onClick={() => setActiveView('itinerary')}>
                <span className="material-symbols-outlined">verified</span>
                Próxima reserva
              </button>
            ) : null}
            <button type="button" onClick={() => setActiveView('home')}>
              <span className="material-symbols-outlined">dashboard</span>
              Resumen
            </button>
          </div>
        </article>
      </section>

      <section className="home-pro-tip">
        <span className="material-symbols-outlined">lightbulb</span>
        <p>{dayRecommendations[0]}</p>
        <button type="button" onClick={() => setActiveView('map')}>Abrir mapa</button>
      </section>
    </>
  )
}
