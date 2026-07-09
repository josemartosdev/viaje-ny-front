import { placeTypeOptions } from '../../constants'

export function ActivityPlacePicker({
  isOpen,
  query,
  type,
  filteredPlaces,
  onQueryChange,
  onTypeChange,
  onAssign,
  onClose,
}) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Seleccionar entidad"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h3>Seleccionar entidad</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="entity-filter-grid">
          <input
            className="entity-input"
            placeholder="Buscar nombre, direccion o notas..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <select
            className="entity-select"
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <option value="all">Todos</option>
            {placeTypeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="modal-picker-list">
          {filteredPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              className="modal-picker-item"
              onClick={() => onAssign(place.id)}
            >
              <strong>{place.name}</strong>
              <span>{place.type} · {place.address || 'Sin direccion'}</span>
            </button>
          ))}
          {!filteredPlaces.length ? <p className="muted">No hay entidades con esos filtros.</p> : null}
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-pill" onClick={onClose}>Cerrar</button>
        </div>
      </section>
    </div>
  )
}
