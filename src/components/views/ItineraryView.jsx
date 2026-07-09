import {
  formatTripDate,
  formatCompactDate,
  formatDayLabel,
  getActivityStatusMeta,
} from "../../utils/tripHelpers";
import { getCategoryMeta, getActivityCategory } from "../../utils/mapHelpers";

export function ItineraryView({
  trip, selectedDay, selectedDayId, setSelectedDayId,
  reservationHighlights, dayRecommendations, dayFoodSpots,
  activeCityWeather, placeNameById, tripStartDate,
  addSelectedActivity, cycleSelectedActivityStatus,
  updateSelectedActivity, persistSelectedActivity, removeSelectedActivity,
  openActivityPlacePicker, addSelectedDocument,
  updateSelectedDocument, persistSelectedDocument, removeSelectedDocument,
}) {
  const dayIndex = trip.days.findIndex((d) => d.id === selectedDay.id);

  return (
    <div className="itin-page">

      {/* Selector de dias */}
      <div className="itin-day-rail hide-scrollbar">
        {trip.days.map((day, i) => (
          <button
            key={day.id}
            type="button"
            className={`itin-day-btn ${day.id === selectedDay.id ? "itin-day-btn--active" : ""}`}
            onClick={() => setSelectedDayId(day.id)}
          >
            <span className="itin-day-num">D{i + 1}</span>
            <span className="itin-day-label">{formatCompactDate(new Date(day.date))}</span>
          </button>
        ))}
      </div>

      {/* Cuerpo */}
      <div className="itin-body">

        {/* Columna principal */}
        <div className="itin-main">
          <header className="itin-hero-bar card">
            <div className="itin-hero-left">
              <span className="itin-day-badge">Dia {dayIndex + 1}</span>
              <div>
                <h2 className="itin-hero-title">{formatDayLabel(selectedDay)}</h2>
                <p className="itin-hero-meta">
                  <span className="material-symbols-outlined">location_on</span>
                  {selectedDay.district}
                  <span className="itin-hero-sep">·</span>
                  {formatTripDate(new Date(selectedDay.date), { month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <button className="secondary-pill" type="button" onClick={addSelectedActivity}>
              <span className="material-symbols-outlined">add</span>
              Añadir parada
            </button>
          </header>

          <div className="itin-timeline-wrap card">
            {selectedDay.activities.length === 0 && (
              <p className="muted itin-empty">Sin paradas para este dia.</p>
            )}
            <div className="timeline-list">
              {selectedDay.activities.map((activity, index) => (
                <div key={activity.id} className="timeline-item">
                  <div className="timeline-dot-column">
                    <span className="timeline-dot" />
                    {index < selectedDay.activities.length - 1 && <span className="timeline-line" />}
                  </div>
                  <div className="timeline-content glass-card">
                    <div className="timeline-head">
                      <button
                        className={`activity-status activity-status--${getActivityStatusMeta(activity.status).color}`}
                        type="button"
                        onClick={() => cycleSelectedActivityStatus(activity.id)}
                        title="Cambiar estado"
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
                        onChange={(e) => updateSelectedActivity(activity.id, "time", e.target.value)}
                        onBlur={() => persistSelectedActivity(activity.id)}
                      />
                      <span className="tag">{activity.category}</span>
                      <button className="icon-button" type="button"
                        onClick={() => removeSelectedActivity(activity.id)} aria-label="Eliminar">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <input className="timeline-title-input" value={activity.title}
                      onChange={(e) => updateSelectedActivity(activity.id, "title", e.target.value)}
                      onBlur={() => persistSelectedActivity(activity.id)} />
                    <textarea className="timeline-note-input" rows="2" value={activity.note}
                      onChange={(e) => updateSelectedActivity(activity.id, "note", e.target.value)}
                      onBlur={() => persistSelectedActivity(activity.id)} />
                    <div className="itin-linked-row">
                      <span className="material-symbols-outlined itin-linked-icon">pin_drop</span>
                      <span className="itin-linked-name">
                        {activity.placeId
                          ? (placeNameById[String(activity.placeId)] ?? `#${activity.placeId}`)
                          : "Sin lugar vinculado"}
                      </span>
                      <button type="button" className="itin-linked-btn"
                        onClick={() => openActivityPlacePicker(activity.id)}>
                        {activity.placeId ? "Cambiar" : "Vincular"}
                      </button>
                      {activity.placeId && (
                        <button type="button" className="itin-linked-btn itin-linked-btn--remove"
                          onClick={async () => {
                            updateSelectedActivity(activity.id, "placeId", null);
                            await persistSelectedActivity(activity.id);
                          }}>
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="itin-sidebar">
          <div className="itin-side-card itin-side-card--weather">
            <p className="eyebrow">Clima NY</p>
            <strong>{activeCityWeather.loading ? "--" : `${activeCityWeather.temperature}°C`}</strong>
            <p>{activeCityWeather.loading ? "..." : activeCityWeather.condition}</p>
          </div>

          <div className="itin-side-card">
            <p className="eyebrow">Reservas clave</p>
            {reservationHighlights.length
              ? reservationHighlights.slice(0, 4).map((item) => (
                  <div key={item.id} className="itin-reserve-item">
                    <span className="itin-reserve-day">D{item.dayIndex + 1}</span>
                    <span className="itin-reserve-time">{item.time}</span>
                    <p className="itin-reserve-title">{item.title}</p>
                  </div>
                ))
              : <p className="muted">Sin reservas.</p>}
          </div>

          <div className="itin-side-card">
            <p className="eyebrow">Tips del dia</p>
            {dayRecommendations.map((tip) => (
              <p key={tip} className="itin-tip-item">
                <span className="material-symbols-outlined">tips_and_updates</span>
                {tip}
              </p>
            ))}
          </div>

          {dayFoodSpots.length > 0 && (
            <div className="itin-side-card">
              <p className="eyebrow">Donde comer</p>
              {dayFoodSpots.slice(0, 3).map((spot) => (
                <div key={spot.name} className="itin-food-item">
                  <strong>{spot.name}</strong>
                  {spot.note && <p>{spot.note}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="itin-side-card itin-side-card--docs">
            <div className="itin-side-head">
              <p className="eyebrow">Documentos</p>
              <div className="itin-doc-actions">
                <button className="itin-doc-btn" type="button" onClick={() => addSelectedDocument("entry")}>+ Entrada</button>
                <button className="itin-doc-btn" type="button" onClick={() => addSelectedDocument("boarding")}>+ Embarque</button>
              </div>
            </div>
            {(selectedDay.documents ?? []).map((doc) => (
              <div key={doc.id} className="itin-doc-item">
                <div className="itin-doc-item-head">
                  <span className={`travel-doc-type travel-doc-type--${doc.type}`}>
                    <span className="material-symbols-outlined">
                      {doc.type === "boarding" ? "flight_takeoff" : "confirmation_number"}
                    </span>
                    {doc.type === "boarding" ? "Embarque" : "Entrada"}
                  </span>
                  <button className="icon-button" type="button" onClick={() => removeSelectedDocument(doc.id)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <input className="travel-doc-title-input" value={doc.title} placeholder="Titulo"
                  onChange={(e) => updateSelectedDocument(doc.id, "title", e.target.value)}
                  onBlur={() => persistSelectedDocument(doc.id)} />
                <div className="travel-doc-meta-row">
                  <input className="travel-doc-input" value={doc.time} placeholder="Hora"
                    onChange={(e) => updateSelectedDocument(doc.id, "time", e.target.value)}
                    onBlur={() => persistSelectedDocument(doc.id)} />
                  <input className="travel-doc-input" value={doc.code} placeholder="Codigo"
                    onChange={(e) => updateSelectedDocument(doc.id, "code", e.target.value)}
                    onBlur={() => persistSelectedDocument(doc.id)} />
                  <input className="travel-doc-input" value={doc.holder} placeholder="Titular"
                    onChange={(e) => updateSelectedDocument(doc.id, "holder", e.target.value)}
                    onBlur={() => persistSelectedDocument(doc.id)} />
                </div>
              </div>
            ))}
            {!selectedDay.documents?.length && <p className="muted">Sin documentos.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
