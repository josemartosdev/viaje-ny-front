import { placeTypeOptions } from '../../constants'

export function ActivityModal({
  isOpen,
  draft,
  placeQuery,
  placeType,
  selectedPlaceId,
  filteredPlaces,
  onDraftChange,
  onPlaceQueryChange,
  onPlaceTypeChange,
  onSelectPlace,
  onSave,
  onClose,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Nueva parada"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h3>Nueva parada</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-grid">
          <label>
            <span>Titulo</span>
            <input
              className="entity-input"
              value={draft.title}
              onChange={(event) => onDraftChange('title', event.target.value)}
              placeholder="Ej: Cena en rooftop"
            />
          </label>
          <label>
            <span>Hora</span>
            <input
              className="entity-input"
              value={draft.time}
              onChange={(event) => onDraftChange('time', event.target.value)}
              placeholder="17:00"
            />
          </label>
          <label>
            <span>Categoria</span>
            <input
              className="entity-input"
              value={draft.category}
              onChange={(event) => onDraftChange('category', event.target.value)}
              placeholder="Food, Plan, Evento..."
            />
          </label>
          <label>
            <span>Estado</span>
            <select
              className="entity-select"
              value={draft.status}
              onChange={(event) => onDraftChange('status', event.target.value)}
            >
              <option value="planned">planned</option>
              <option value="booked">booked</option>
              <option value="done">done</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
        </div>

        <label className="modal-textarea-wrap">
          <span>Notas</span>
          <textarea
            className="entity-textarea"
            rows="3"
            value={draft.note}
            onChange={(event) => onDraftChange('note', event.target.value)}
            placeholder="Detalles de la parada..."
          />
        </label>

        <div className="modal-picker-head">
          <h4>Entidad vinculada</h4>
          <div className="entity-filter-grid">
            <input
              className="entity-input"
              placeholder="Buscar entidad..."
              value={placeQuery}
              onChange={(event) => onPlaceQueryChange(event.target.value)}
            />
            <select
              className="entity-select"
              value={placeType}
              onChange={(event) => onPlaceTypeChange(event.target.value)}
            >
              <option value="all">Todos</option>
              {placeTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-picker-list">
          {filteredPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              className={`modal-picker-item ${selectedPlaceId === place.id ? 'modal-picker-item--active' : ''}`}
              onClick={() => onSelectPlace(place.id)}
            >
              <strong>{place.name}</strong>
              <span>{place.type} · {place.address || 'Sin direccion'}</span>
            </button>
          ))}
          {!filteredPlaces.length ? <p className="muted">No hay entidades con esos filtros.</p> : null}
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-pill" onClick={onClose}>Cancelar</button>
          <button type="button" className="primary-pill" onClick={onSave}>Guardar parada</button>
        </div>
      </section>
    </div>
  )
}
