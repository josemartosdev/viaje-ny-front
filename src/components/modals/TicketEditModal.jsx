export function TicketEditModal({
  isOpen,
  draft,
  onFieldChange,
  onSave,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Editar entrada"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3>Editar entrada</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-grid">
          <label>
            <span>Tipo</span>
            <select
              className="entity-select"
              value={draft.type}
              onChange={(e) => onFieldChange("type", e.target.value)}
            >
              {["entry", "boarding", "reservation", "voucher", "pass"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </label>
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
            <span>Código</span>
            <input
              className="entity-input"
              value={draft.code}
              placeholder="ABC123"
              onChange={(e) => onFieldChange("code", e.target.value)}
            />
          </label>
          <label>
            <span>Titular</span>
            <input
              className="entity-input"
              value={draft.holder}
              placeholder="Familia"
              onChange={(e) => onFieldChange("holder", e.target.value)}
            />
          </label>
        </div>

        <label className="modal-textarea-wrap">
          <span>Notas</span>
          <textarea
            className="entity-textarea"
            rows="3"
            value={draft.note}
            placeholder="Notas..."
            onChange={(e) => onFieldChange("note", e.target.value)}
          />
        </label>

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
