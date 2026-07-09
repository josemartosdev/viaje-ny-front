export function ActivityEditModal({
  isOpen,
  draft,
  onFieldChange,
  placeNameById,
  onPickPlace,
  onSave,
  onClose,
}) {
  if (!isOpen) return null;

  const placeName = draft.placeId
    ? (placeNameById[String(draft.placeId)] ?? `#${draft.placeId}`)
    : "Sin lugar vinculado";

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Editar actividad"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>Editar actividad</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-grid">
          <label>
            <span>Título</span>
            <input
              className="entity-input"
              value={draft.title}
              placeholder="Título"
              onChange={(e) => onFieldChange("title", e.target.value)}
            />
          </label>
          <label>
            <span>Hora</span>
            <input
              className="entity-input"
              value={draft.time}
              placeholder="09:00"
              onChange={(e) => onFieldChange("time", e.target.value)}
            />
          </label>
          <label>
            <span>Categoría</span>
            <input
              className="entity-input"
              value={draft.category}
              placeholder="Food, Plan..."
              onChange={(e) => onFieldChange("category", e.target.value)}
            />
          </label>
          <label>
            <span>Estado</span>
            <select
              className="entity-select"
              value={draft.status}
              onChange={(e) => onFieldChange("status", e.target.value)}
            >
              <option value="planned">planned</option>
              <option value="reserved">reserved</option>
              <option value="flexible">flexible</option>
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
            placeholder="Detalles..."
            onChange={(e) => onFieldChange("note", e.target.value)}
          />
        </label>

        <div className="edit-modal-place-row">
          <span className="material-symbols-outlined">pin_drop</span>
          <span className="edit-modal-place-name">{placeName}</span>
          <button
            type="button"
            className="itin-linked-btn"
            onClick={onPickPlace}
          >
            {draft.placeId ? "Cambiar" : "Vincular"}
          </button>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-pill" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="primary-pill" onClick={onSave}>
            Guardar
          </button>
        </div>
      </section>
    </div>
  );
}
