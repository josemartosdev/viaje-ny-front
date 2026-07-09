import { placeTypeOptions } from '../../constants'

export function PlaceModal({ isOpen, mode, draft, onFieldChange, onSave, onClose }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Entidad"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <h3>{mode === 'edit' ? 'Editar entidad' : 'Nueva entidad'}</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-grid">
          <label>
            <span>Nombre</span>
            <input
              className="entity-input"
              value={draft.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              placeholder="Nombre del lugar"
            />
          </label>
          <label>
            <span>Tipo</span>
            <select
              className="entity-select"
              value={draft.type}
              onChange={(event) => onFieldChange('type', event.target.value)}
            >
              {placeTypeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Direccion</span>
            <input
              className="entity-input"
              value={draft.address}
              onChange={(event) => onFieldChange('address', event.target.value)}
              placeholder="Direccion"
            />
          </label>
          <label>
            <span>Precio medio</span>
            <input
              className="entity-input"
              type="number"
              value={draft.averagePrice}
              onChange={(event) => onFieldChange('averagePrice', event.target.value)}
              placeholder="0"
            />
          </label>
        </div>

        <label className="modal-textarea-wrap">
          <span>Notas</span>
          <textarea
            className="entity-textarea"
            rows="3"
            value={draft.notes}
            onChange={(event) => onFieldChange('notes', event.target.value)}
            placeholder="Notas del lugar..."
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="secondary-pill" onClick={onClose}>Cancelar</button>
          <button type="button" className="primary-pill" onClick={onSave}>
            {mode === 'edit' ? 'Guardar cambios' : 'Crear entidad'}
          </button>
        </div>
      </section>
    </div>
  )
}
