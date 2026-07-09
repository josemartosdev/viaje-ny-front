import { cityProfiles } from "../../constants";

export function Topbar({
  onHomeClick,
  activeCityWeather,
  activeCityTime,
  activeCityDate,
  activeCityKey,
  setActiveCityKey,
}) {
  return (
    <header className="glass-header topbar">
      <div className="topbar-inner">
        <div className="topbar-left" onClick={onHomeClick}>
          <span className="material-symbols-outlined topbar-brand-icon">
            flight
          </span>
          <h1>NYC Trip</h1>
        </div>
        <section className="home-meta">
          <span className="meta-weather">
            <span className="material-symbols-outlined">cloudy</span>
            {activeCityWeather.loading
              ? "--"
              : `${activeCityWeather.temperature}°C`}
            <strong className="meta-time">{activeCityTime}</strong>
          </span>
          <span className="meta-date">
            <span className="material-symbols-outlined">calendar_month</span>
            {activeCityDate}
          </span>
          <span
            className="meta-city-switch"
            role="tablist"
            aria-label="Zona horaria"
          >
            {Object.values(cityProfiles).map((city) => (
              <button
                key={city.key}
                type="button"
                className={`meta-city-btn ${activeCityKey === city.key ? "meta-city-btn--active" : ""}`}
                onClick={() => setActiveCityKey(city.key)}
              >
                {city.label}
              </button>
            ))}
          </span>
        </section>
      </div>
    </header>
  );
}
