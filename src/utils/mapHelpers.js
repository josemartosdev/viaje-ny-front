import L from "leaflet";
import { categoryMeta, defaultMapCenter, fallbackOffsets } from "../constants";

export function normalizeSpotCategory(rawType = "") {
  const type = rawType.toLowerCase();
  if (
    type.includes("food") ||
    type.includes("breakfast") ||
    type.includes("dinner") ||
    type.includes("brunch")
  ) {
    return "food";
  }
  if (type.includes("museum") || type.includes("culture")) return "culture";
  if (type.includes("shop")) return "shops";
  if (type.includes("night") || type.includes("bar")) return "night";
  if (
    type.includes("transit") ||
    type.includes("subway") ||
    type.includes("train")
  )
    return "transit";
  if (
    type.includes("walk") ||
    type.includes("park") ||
    type.includes("landmark") ||
    type.includes("view") ||
    type.includes("sight") ||
    type.includes("memorial")
  ) {
    return "walk";
  }
  return "other";
}

export function getCategoryMeta(categoryKey) {
  return categoryMeta[categoryKey] ?? categoryMeta.other;
}

export function getActivityCategory(activityCategory = "") {
  return normalizeSpotCategory(activityCategory);
}

export function getFallbackCoordinates(index = 0) {
  const offset = fallbackOffsets[index % fallbackOffsets.length];
  return [defaultMapCenter[0] + offset[0], defaultMapCenter[1] + offset[1]];
}

export function getDayCenter(day) {
  const firstSpot = day?.spots?.[0];
  if (!firstSpot) return defaultMapCenter;
  return firstSpot.coordinates ?? getFallbackCoordinates(0);
}

export function buildSpotMarkerIcon(dayNumber, categoryKey, isSelectedDay) {
  const { icon } = getCategoryMeta(categoryKey);
  const selectedClass = isSelectedDay ? " map-marker--active-day" : "";
  return L.divIcon({
    className: `map-marker map-marker--spot${selectedClass}`,
    html: `<span class="material-symbols-outlined">${icon}</span><em>${dayNumber}</em>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -34],
  });
}

export const searchMarkerIcon = L.divIcon({
  className: "map-marker map-marker--search",
  html: '<span class="material-symbols-outlined">my_location</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});
