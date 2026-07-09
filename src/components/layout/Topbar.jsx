import { routes } from '../../constants'

export function Topbar({ onHomeClick }) {
  return (
    <header className="glass-header topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <span className="material-symbols-outlined topbar-brand-icon">flight</span>
          <h1>NYC Trip</h1>
        </div>
        <button className="icon-round-button" type="button" onClick={onHomeClick}>
          <span className="material-symbols-outlined">cloudy</span>
        </button>
      </div>
    </header>
  )
}
