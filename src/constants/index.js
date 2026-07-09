export const NEW_YORK_COORDS = { latitude: 40.7128, longitude: -74.006 };
export const NEW_YORK_TIME_ZONE = "America/New_York";
export const defaultMapCenter = [
  NEW_YORK_COORDS.latitude,
  NEW_YORK_COORDS.longitude,
];
export const fallbackOffsets = [
  [0.009, 0.006],
  [-0.008, 0.01],
  [0.007, -0.009],
  [-0.006, -0.006],
];
export const routePalette = [
  "#f7b731",
  "#32c2a0",
  "#5f8bff",
  "#ff7a59",
  "#8f6ad7",
];

export const weatherDescriptions = {
  0: "Cielo despejado",
  1: "Principalmente despejado",
  2: "Parcialmente nublado",
  3: "Nublado",
  45: "Niebla",
  48: "Niebla helada",
  51: "Llovizna ligera",
  53: "Llovizna",
  55: "Llovizna intensa",
  61: "Lluvia ligera",
  63: "Lluvia moderada",
  65: "Lluvia fuerte",
  71: "Nieve ligera",
  73: "Nieve",
  75: "Nieve intensa",
  80: "Chubascos",
  81: "Chubascos intensos",
  82: "Chubascos violentos",
  95: "Tormenta",
};

export const activityStatusMeta = {
  planned: { label: "Plan", icon: "event", color: "planned" },
  reserved: { label: "Reservado", icon: "verified", color: "reserved" },
  flexible: { label: "Flexible", icon: "tune", color: "flexible" },
};

export const mapCategoryOptions = [
  { key: "all", label: "Todo", icon: "apps" },
  { key: "food", label: "Food", icon: "restaurant" },
  { key: "culture", label: "Culture", icon: "museum" },
  { key: "walk", label: "Walk", icon: "directions_walk" },
  { key: "shops", label: "Shops", icon: "shopping_bag" },
  { key: "night", label: "Night", icon: "nights_stay" },
];

export const placeTypeOptions = [
  "monument",
  "restaurant",
  "shop",
  "hotel",
  "museum",
  "park",
  "transport",
  "other",
];

export const categoryMeta = {
  all: { icon: "apps", label: "Todo" },
  food: { icon: "restaurant", label: "Food" },
  culture: { icon: "museum", label: "Culture" },
  walk: { icon: "directions_walk", label: "Walk" },
  shops: { icon: "shopping_bag", label: "Shops" },
  night: { icon: "nights_stay", label: "Night" },
  transit: { icon: "subway", label: "Transit" },
  other: { icon: "place", label: "Other" },
};

export const routes = {
  home: "Home",
  itinerary: "Itinerary",
  map: "Map",
  entities: "Entities",
};

export const cityProfiles = {
  ny: {
    key: "ny",
    label: "Nueva York",
    timeZone: "America/New_York",
    latitude: NEW_YORK_COORDS.latitude,
    longitude: NEW_YORK_COORDS.longitude,
  },
  es: {
    key: "es",
    label: "España",
    timeZone: "Europe/Madrid",
    latitude: 40.4168,
    longitude: -3.7038,
  },
};

export const emptyPlaceDraft = {
  name: "",
  type: "other",
  address: "",
  lat: "",
  lng: "",
  priceLevel: "",
  averagePrice: "",
  currency: "USD",
  website: "",
  phone: "",
  notes: "",
};
