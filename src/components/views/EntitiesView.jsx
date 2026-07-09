import { useState } from "react";
import { placeTypeOptions } from "../../constants";

export function EntitiesView({
  mapEntityTab,
  setMapEntityTab,
  mapEntitySearch,
  setMapEntitySearch,
  mapPlaceTypeFilter,
  setMapPlaceTypeFilter,
  mapActivityStatusFilter,
  setMapActivityStatusFilter,
  mapTicketTypeFilter,
  setMapTicketTypeFilter,
  filteredPlaceEntities,
  filteredActivityEntities,
  filteredTicketEntities,
  openCreatePlaceModal,
  openEditPlaceModal,
  removePlaceEntity,
  addSelectedActivity,
  updateSelectedActivity,
  persistSelectedActivity,
  removeSelectedActivity,
  openActivityPlacePicker,
  openActivityEditModal,
  addSelectedDocument,
  updateSelectedDocument,
  persistSelectedDocument,
  removeSelectedDocument,
  openTicketEditModal,
  placeNameById,
  setActiveView,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) =>
    setExpandedId((current) => (current === id ? null : id));

  return (
    <div className="ent-page">
      {/* ── Cabecera ─────────────────────────────────────────────── */}
      <div className="ent-header">
        <div className="ent-header-left">
          <button
            className="ent-back-btn"
            type="button"
            onClick={() => setActiveView("map")}
            aria-label="Volver al mapa"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="ent-title">Entidades</h2>
            <p className="muted ent-subtitle">Gestion centralizada</p>
          </div>
        </div>
        <div className="ent-header-right">
          <div className="ent-search-wrap">
            <span className="material-symbols-outlined ent-search-icon">
              search
            </span>
            <input
              className="ent-search-input"
              value={mapEntitySearch}
              placeholder="Buscar..."
              onChange={(e) => setMapEntitySearch(e.target.value)}
            />
          </div>
          {mapEntityTab === "place" && (
            <>
              <select
                className="entity-select"
                value={mapPlaceTypeFilter}
                onChange={(e) => setMapPlaceTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {placeTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button
                className="secondary-pill ent-add-btn"
                type="button"
                onClick={openCreatePlaceModal}
              >
                <span className="material-symbols-outlined">add</span> Lugar
              </button>
            </>
          )}
          {mapEntityTab === "activity" && (
            <>
              <select
                className="entity-select"
                value={mapActivityStatusFilter}
                onChange={(e) => setMapActivityStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                {["planned", "reserved", "flexible", "done", "cancelled"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ),
                )}
              </select>
              <button
                className="secondary-pill ent-add-btn"
                type="button"
                onClick={addSelectedActivity}
              >
                <span className="material-symbols-outlined">add</span> Actividad
              </button>
            </>
          )}
          {mapEntityTab === "ticket" && (
            <>
              <select
                className="entity-select"
                value={mapTicketTypeFilter}
                onChange={(e) => setMapTicketTypeFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {["entry", "boarding", "reservation", "voucher", "pass"].map(
                  (t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ),
                )}
              </select>
              <button
                className="secondary-pill ent-add-btn"
                type="button"
                onClick={() => addSelectedDocument("entry")}
              >
                <span className="material-symbols-outlined">add</span> Entrada
              </button>
              <button
                className="secondary-pill ent-add-btn"
                type="button"
                onClick={() => addSelectedDocument("boarding")}
              >
                <span className="material-symbols-outlined">add</span> Embarque
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────── */}
      <div className="ent-tabs">
        {[
          {
            key: "place",
            label: "Lugares",
            icon: "pin_drop",
            count: filteredPlaceEntities.length,
          },
          {
            key: "activity",
            label: "Actividades",
            icon: "event_note",
            count: filteredActivityEntities.length,
          },
          {
            key: "ticket",
            label: "Entradas",
            icon: "airplane_ticket",
            count: filteredTicketEntities.length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`ent-tab ${mapEntityTab === tab.key ? "ent-tab--active" : ""}`}
            onClick={() => {
              setMapEntityTab(tab.key);
              setExpandedId(null);
            }}
          >
            <span className="material-symbols-outlined">{tab.icon}</span>
            {tab.label}
            <span className="ent-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TABLA — desktop
         ══════════════════════════════════════════════════════════════ */}

      {mapEntityTab === "place" && (
        <div className="ent-table-wrap ent-desktop-only">
          {filteredPlaceEntities.length === 0 ? (
            <p className="muted ent-empty">Sin lugares con esos filtros.</p>
          ) : (
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Precio medio</th>
                  <th>Notas</th>
                  <th className="ent-th-actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPlaceEntities.map((place) => (
                  <tr key={place.id} className="ent-row">
                    <td>
                      <span className="ent-type-badge">{place.type}</span>
                    </td>
                    <td className="ent-cell-name">{place.name}</td>
                    <td className="ent-cell-muted">{place.address || "—"}</td>
                    <td className="ent-cell-muted">
                      {place.averagePrice
                        ? `${place.averagePrice} ${place.currency ?? ""}`
                        : "—"}
                    </td>
                    <td className="ent-cell-notes">{place.notes || "—"}</td>
                    <td className="ent-cell-actions">
                      <button
                        type="button"
                        className="ent-action-btn"
                        title="Editar"
                        onClick={() => openEditPlaceModal(place)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="ent-action-btn ent-action-btn--danger"
                        title="Eliminar"
                        onClick={() => removePlaceEntity(place.id)}
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {mapEntityTab === "activity" && (
        <div className="ent-table-wrap ent-desktop-only">
          {filteredActivityEntities.length === 0 ? (
            <p className="muted ent-empty">Sin actividades con esos filtros.</p>
          ) : (
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Hora</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Lugar</th>
                  <th>Notas</th>
                  <th className="ent-th-actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredActivityEntities.map((activity) => (
                  <tr key={activity.id} className="ent-row">
                    <td>
                      <span
                        className={`ent-status-badge ent-status-badge--${activity.status}`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td>
                      <input
                        className="ent-cell-input ent-cell-input--time"
                        value={activity.time}
                        placeholder="--:--"
                        onChange={(e) =>
                          updateSelectedActivity(
                            activity.id,
                            "time",
                            e.target.value,
                          )
                        }
                        onBlur={() => persistSelectedActivity(activity.id)}
                      />
                    </td>
                    <td>
                      <input
                        className="ent-cell-input ent-cell-input--title"
                        value={activity.title}
                        placeholder="Título"
                        onChange={(e) =>
                          updateSelectedActivity(
                            activity.id,
                            "title",
                            e.target.value,
                          )
                        }
                        onBlur={() => persistSelectedActivity(activity.id)}
                      />
                    </td>
                    <td>
                      <input
                        className="ent-cell-input"
                        value={activity.category}
                        placeholder="Categoría"
                        onChange={(e) =>
                          updateSelectedActivity(
                            activity.id,
                            "category",
                            e.target.value,
                          )
                        }
                        onBlur={() => persistSelectedActivity(activity.id)}
                      />
                    </td>
                    <td className="ent-cell-place">
                      <span className="ent-place-name">
                        {activity.placeId ? (
                          (placeNameById[String(activity.placeId)] ??
                          `#${activity.placeId}`)
                        ) : (
                          <em className="ent-no-place">Sin lugar</em>
                        )}
                      </span>
                      <button
                        type="button"
                        className="ent-link-btn"
                        onClick={() => openActivityPlacePicker(activity.id)}
                      >
                        <span className="material-symbols-outlined">
                          {activity.placeId ? "edit_location" : "add_location"}
                        </span>
                      </button>
                    </td>
                    <td>
                      <input
                        className="ent-cell-input"
                        value={activity.note}
                        placeholder="Notas"
                        onChange={(e) =>
                          updateSelectedActivity(
                            activity.id,
                            "note",
                            e.target.value,
                          )
                        }
                        onBlur={() => persistSelectedActivity(activity.id)}
                      />
                    </td>
                    <td className="ent-cell-actions">
                      <button
                        type="button"
                        className="ent-action-btn"
                        title="Editar"
                        onClick={() => openActivityEditModal(activity)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="ent-action-btn ent-action-btn--danger"
                        title="Eliminar"
                        onClick={() => removeSelectedActivity(activity.id)}
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {mapEntityTab === "ticket" && (
        <div className="ent-table-wrap ent-desktop-only">
          {filteredTicketEntities.length === 0 ? (
            <p className="muted ent-empty">Sin entradas con esos filtros.</p>
          ) : (
            <table className="ent-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Título</th>
                  <th>Código</th>
                  <th>Titular</th>
                  <th>Notas</th>
                  <th className="ent-th-actions"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTicketEntities.map((doc) => (
                  <tr key={doc.id} className="ent-row">
                    <td>
                      <select
                        className="ent-type-select"
                        value={doc.type}
                        onChange={(e) =>
                          updateSelectedDocument(doc.id, "type", e.target.value)
                        }
                        onBlur={() => persistSelectedDocument(doc.id)}
                      >
                        {[
                          "entry",
                          "boarding",
                          "reservation",
                          "voucher",
                          "pass",
                        ].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="ent-cell-input ent-cell-input--title"
                        value={doc.title}
                        placeholder="Título"
                        onChange={(e) =>
                          updateSelectedDocument(
                            doc.id,
                            "title",
                            e.target.value,
                          )
                        }
                        onBlur={() => persistSelectedDocument(doc.id)}
                      />
                    </td>
                    <td>
                      <input
                        className="ent-cell-input"
                        value={doc.code}
                        placeholder="Código"
                        onChange={(e) =>
                          updateSelectedDocument(doc.id, "code", e.target.value)
                        }
                        onBlur={() => persistSelectedDocument(doc.id)}
                      />
                    </td>
                    <td>
                      <input
                        className="ent-cell-input"
                        value={doc.holder}
                        placeholder="Titular"
                        onChange={(e) =>
                          updateSelectedDocument(
                            doc.id,
                            "holder",
                            e.target.value,
                          )
                        }
                        onBlur={() => persistSelectedDocument(doc.id)}
                      />
                    </td>
                    <td>
                      <input
                        className="ent-cell-input"
                        value={doc.note}
                        placeholder="Notas"
                        onChange={(e) =>
                          updateSelectedDocument(doc.id, "note", e.target.value)
                        }
                        onBlur={() => persistSelectedDocument(doc.id)}
                      />
                    </td>
                    <td className="ent-cell-actions">
                      <button
                        type="button"
                        className="ent-action-btn"
                        title="Editar"
                        onClick={() => openTicketEditModal(doc)}
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button
                        type="button"
                        className="ent-action-btn ent-action-btn--danger"
                        title="Eliminar"
                        onClick={() => removeSelectedDocument(doc.id)}
                      >
                        <span className="material-symbols-outlined">
                          delete
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LISTA MÓVIL — 3 columnas: badge | nombre | acciones
          Con card expandible inline para ver / editar campos
         ══════════════════════════════════════════════════════════════ */}
      <div className="ent-mobile-list">
        {/* LUGARES */}
        {mapEntityTab === "place" &&
          (filteredPlaceEntities.length === 0 ? (
            <p className="muted ent-empty">Sin lugares.</p>
          ) : (
            filteredPlaceEntities.map((place) => (
              <div key={place.id} className="ent-mob-item">
                <div className="ent-mob-row" onClick={() => toggle(place.id)}>
                  <span className="ent-type-badge">{place.type}</span>
                  <span className="ent-mob-name">{place.name}</span>
                  <div className="ent-mob-actions">
                    <button
                      type="button"
                      className="ent-action-btn"
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPlaceModal(place);
                      }}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      type="button"
                      className="ent-action-btn ent-action-btn--danger"
                      title="Eliminar"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePlaceEntity(place.id);
                      }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                {expandedId === place.id && (
                  <div className="ent-mob-card">
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Dirección</span>
                      <span className="ent-mob-value">
                        {place.address || "—"}
                      </span>
                    </div>
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Precio medio</span>
                      <span className="ent-mob-value">
                        {place.averagePrice
                          ? `${place.averagePrice} ${place.currency ?? ""}`
                          : "—"}
                      </span>
                    </div>
                    {place.notes && (
                      <div className="ent-mob-field ent-mob-field--full">
                        <span className="ent-mob-label">Notas</span>
                        <span className="ent-mob-value">{place.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ))}

        {/* ACTIVIDADES */}
        {mapEntityTab === "activity" &&
          (filteredActivityEntities.length === 0 ? (
            <p className="muted ent-empty">Sin actividades.</p>
          ) : (
            filteredActivityEntities.map((activity) => (
              <div key={activity.id} className="ent-mob-item">
                <div
                  className="ent-mob-row"
                  onClick={() => toggle(activity.id)}
                >
                  <span
                    className={`ent-status-badge ent-status-badge--${activity.status}`}
                  >
                    {activity.status}
                  </span>
                  <span className="ent-mob-name">
                    <strong className="ent-mob-time">{activity.time}</strong>{" "}
                    {activity.title}
                  </span>
                  <div className="ent-mob-actions">
                    <button
                      type="button"
                      className="ent-action-btn"
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        openActivityEditModal(activity);
                      }}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      type="button"
                      className="ent-action-btn ent-action-btn--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedActivity(activity.id);
                      }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                {expandedId === activity.id && (
                  <div className="ent-mob-card">
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Hora</span>
                      <span className="ent-mob-value">{activity.time}</span>
                    </div>
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Categoría</span>
                      <span className="ent-mob-value">{activity.category}</span>
                    </div>
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Estado</span>
                      <span className="ent-mob-value">{activity.status}</span>
                    </div>
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Lugar</span>
                      <span className="ent-mob-value">
                        {activity.placeId
                          ? (placeNameById[String(activity.placeId)] ??
                            `#${activity.placeId}`)
                          : "Sin lugar"}
                      </span>
                    </div>
                    {activity.note && (
                      <div className="ent-mob-field ent-mob-field--full">
                        <span className="ent-mob-label">Notas</span>
                        <span className="ent-mob-value">{activity.note}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ))}

        {/* ENTRADAS */}
        {mapEntityTab === "ticket" &&
          (filteredTicketEntities.length === 0 ? (
            <p className="muted ent-empty">Sin entradas.</p>
          ) : (
            filteredTicketEntities.map((doc) => (
              <div key={doc.id} className="ent-mob-item">
                <div className="ent-mob-row" onClick={() => toggle(doc.id)}>
                  <span className="ent-type-badge">{doc.type}</span>
                  <span className="ent-mob-name">
                    {doc.title || "Sin título"}
                  </span>
                  <div className="ent-mob-actions">
                    <button
                      type="button"
                      className="ent-action-btn"
                      title="Editar"
                      onClick={(e) => {
                        e.stopPropagation();
                        openTicketEditModal(doc);
                      }}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      type="button"
                      className="ent-action-btn ent-action-btn--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedDocument(doc.id);
                      }}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                {expandedId === doc.id && (
                  <div className="ent-mob-card">
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Tipo</span>
                      <span className="ent-mob-value">{doc.type}</span>
                    </div>
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Código</span>
                      <span className="ent-mob-value">{doc.code || "—"}</span>
                    </div>
                    <div className="ent-mob-field">
                      <span className="ent-mob-label">Titular</span>
                      <span className="ent-mob-value">{doc.holder || "—"}</span>
                    </div>
                    {doc.note && (
                      <div className="ent-mob-field ent-mob-field--full">
                        <span className="ent-mob-label">Notas</span>
                        <span className="ent-mob-value">{doc.note}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ))}
      </div>
    </div>
  );
}
