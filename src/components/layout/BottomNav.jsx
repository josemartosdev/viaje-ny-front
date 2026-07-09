import { routes } from '../../constants'

const NAV_ICONS = {
  home: 'home',
  itinerary: 'event_note',
  map: 'map',
  entities: 'dataset',
}

export function BottomNav({ activeView, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {Object.entries(routes).map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={`bottom-nav-item ${activeView === key ? 'bottom-nav-item--active' : ''}`}
          aria-label={label}
          onClick={() => onNavigate(key)}
        >
          <span className="material-symbols-outlined">{NAV_ICONS[key]}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
