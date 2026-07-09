import { placeTypeOptions } from '../../constants'

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
  addSelectedDocument,
  updateSelectedDocument,
  persistSelectedDocument,
  removeSelectedDocument,
  placeNameById,
  setActiveView,
}) {
  return (
    <section className="entities-layout">
      <article className="card map-bottom-sheet">
        <div className="sheet-handle" />
        <div className="card-header entity-sheet-head">
          <div>
            <h3>Entidades</h3>
            <p className="muted">Gestion centralizada para produccion.</p>
          </div>
          <button
            className="icon-round-button icon-round-button--soft"
            type="button"
            onClick={() => setActiveView('map')}
            aria-label="Volver al mapa"
          >
            <span className="material-symbols-outlined">map</span>
          </button>
        </div>

        <div className="entity-toolbar">
          <div className="entity-tabs">
            <button
              type="button"
              className={`toggle-pill ${mapEntityTab === 'place' ? 'toggle-pill--active' : ''}`}
              onClick={() => setMapEntityTab('place')}
            >
              Lugares
            </button>
            <button
              type="button"
              className={`toggle-pill ${mapEntityTab === 'activity' ? 'toggle-pill--active' : ''}`}
              onClick={() => setMapEntityTab('activity')}
            >
              Actividades
            </button>
            <button
              type="button"
              className={`toggle-pill ${mapEntityTab === 'ticket' ? 'toggle-pill--active' : ''}`}
              onClick={() => setMapEntityTab('ticket')}
            >
              Entradas
            </button>
          </div>

          <div className="entity-filters">
            <input
              className="entity-search-input"
              value={mapEntitySearch}
              placeholder="Filtrar por texto"
              onChange={(event) => setMapEntitySearch(event.target.value)}
            />

            {mapEntityTab === 'place' ? (
              <select
                className="entity-select"
                value={mapPlaceTypeFilter}
                onChange={(event) => setMapPlaceTypeFilter(event.target.value)}
              >
                <option value="all">Todos los tipos</option>
                {placeTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : null}

            {mapEntityTab === 'activity' ? (
              <select
                className="entity-select"
                value={mapActivityStatusFilter}
                onChange={(event) => setMapActivityStatusFilter(event.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="planned">planned</option>
                <option value="reserved">reserved</option>
                <option value="flexible">flexible</option>
                <option value="done">done</option>
                <option value="cancelled">cancelled</option>
              </select>
            ) : null}

            {mapEntityTab === 'ticket' ? (
              <select
                className="entity-select"
                value={mapTicketTypeFilter}
                onChange={(event) => setMapTicketTypeFilter(event.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="entry">entry</option>
                <option value="boarding">boarding</option>
                <option value="reservation">reservation</option>
                <option value="voucher">voucher</option>
                <option value="pass">pass</option>
              </select>
            ) : null}
          </div>
        </div>

        {mapEntityTab === 'place' ? (
          <section className="entity-list-wrap">
            <div className="entity-list-head">
              <h4>Lugares ({filteredPlaceEntities.length})</h4>
              <button className="secondary-pill" type="button" onClick={openCreatePlaceModal}>
                + Lugar
              </button>
            </div>
            <div className="entity-list">
              {filteredPlaceEntities.map((place) => (
                <article key={place.id} className="entity-item">
                  <div className="entity-item-head">
                    <span className="entity-pill">{place.type}</span>
                    <div className="timeline-linked-actions">
                      <button type="button" className="secondary-pill" onClick={() => openEditPlaceModal(place)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => removePlaceEntity(place.id)}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  </div>
                  <div className="entity-grid entity-grid--place">
                    <p><strong>{place.name}</strong></p>
                    <p>{place.address || 'Sin direccion'}</p>
                    <p>Precio medio: {place.averagePrice ?? '--'} {place.currency ?? ''}</p>
                    <p>Tipo: {place.type}</p>
                  </div>
                  <p className="muted">{place.notes || 'Sin notas.'}</p>
                </article>
              ))}
              {!filteredPlaceEntities.length ? <p className="muted">Sin lugares con esos filtros.</p> : null}
            </div>
          </section>
        ) : null}

        {mapEntityTab === 'activity' ? (
          <section className="entity-list-wrap">
            <div className="entity-list-head">
              <h4>Actividades ({filteredActivityEntities.length})</h4>
              <button className="secondary-pill" type="button" onClick={addSelectedActivity}>
                + Actividad
              </button>
            </div>
            <div className="entity-list">
              {filteredActivityEntities.map((activity) => (
                <article key={activity.id} className="entity-item">
                  <div className="entity-item-head">
                    <span className="entity-pill">{activity.status}</span>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => removeSelectedActivity(activity.id)}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="entity-grid entity-grid--activity">
                    <input
                      className="entity-input"
                      value={activity.title}
                      placeholder="Titulo"
                      onChange={(event) => updateSelectedActivity(activity.id, 'title', event.target.value)}
                      onBlur={() => persistSelectedActivity(activity.id)}
                    />
                    <input
                      className="entity-input"
                      value={activity.time}
                      placeholder="Hora"
                      onChange={(event) => updateSelectedActivity(activity.id, 'time', event.target.value)}
                      onBlur={() => persistSelectedActivity(activity.id)}
                    />
                    <input
                      className="entity-input"
                      value={activity.category}
                      placeholder="Categoria"
                      onChange={(event) => updateSelectedActivity(activity.id, 'category', event.target.value)}
                      onBlur={() => persistSelectedActivity(activity.id)}
                    />
                  </div>
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
                  <textarea
                    className="entity-textarea"
                    rows="2"
                    value={activity.note}
                    placeholder="Notas"
                    onChange={(event) => updateSelectedActivity(activity.id, 'note', event.target.value)}
                    onBlur={() => persistSelectedActivity(activity.id)}
                  />
                </article>
              ))}
              {!filteredActivityEntities.length ? <p className="muted">Sin actividades con esos filtros.</p> : null}
            </div>
          </section>
        ) : null}

        {mapEntityTab === 'ticket' ? (
          <section className="entity-list-wrap">
            <div className="entity-list-head">
              <h4>Entradas ({filteredTicketEntities.length})</h4>
              <div className="travel-doc-actions">
                <button
                  className="secondary-pill"
                  type="button"
                  onClick={() => addSelectedDocument('entry')}
                >
                  + Entrada
                </button>
                <button
                  className="secondary-pill"
                  type="button"
                  onClick={() => addSelectedDocument('boarding')}
                >
                  + Embarque
                </button>
              </div>
            </div>
            <div className="entity-list">
              {filteredTicketEntities.map((document) => (
                <article key={document.id} className="entity-item">
                  <div className="entity-item-head">
                    <select
                      className="entity-select"
                      value={document.type}
                      onChange={(event) => updateSelectedDocument(document.id, 'type', event.target.value)}
                      onBlur={() => persistSelectedDocument(document.id)}
                    >
                      <option value="entry">entry</option>
                      <option value="boarding">boarding</option>
                      <option value="reservation">reservation</option>
                      <option value="voucher">voucher</option>
                      <option value="pass">pass</option>
                    </select>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => removeSelectedDocument(document.id)}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="entity-grid entity-grid--ticket">
                    <input
                      className="entity-input"
                      value={document.title}
                      placeholder="Titulo"
                      onChange={(event) => updateSelectedDocument(document.id, 'title', event.target.value)}
                      onBlur={() => persistSelectedDocument(document.id)}
                    />
                    <input
                      className="entity-input"
                      value={document.code}
                      placeholder="Codigo"
                      onChange={(event) => updateSelectedDocument(document.id, 'code', event.target.value)}
                      onBlur={() => persistSelectedDocument(document.id)}
                    />
                    <input
                      className="entity-input"
                      value={document.holder}
                      placeholder="Titular"
                      onChange={(event) => updateSelectedDocument(document.id, 'holder', event.target.value)}
                      onBlur={() => persistSelectedDocument(document.id)}
                    />
                  </div>
                  <textarea
                    className="entity-textarea"
                    rows="2"
                    value={document.note}
                    placeholder="Notas"
                    onChange={(event) => updateSelectedDocument(document.id, 'note', event.target.value)}
                    onBlur={() => persistSelectedDocument(document.id)}
                  />
                </article>
              ))}
              {!filteredTicketEntities.length ? <p className="muted">Sin entradas con esos filtros.</p> : null}
            </div>
          </section>
        ) : null}
      </article>
    </section>
  )
}
