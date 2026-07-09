import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createActivity,
  createPlace,
  createTicket,
  deleteActivity,
  deletePlace,
  deleteTicket,
  listActivities,
  listDays,
  listPlaces,
  listTickets,
  listTrips,
  updateActivity,
  updatePlace,
  updateTicket,
} from "../services/backendApi";
import {
  cityProfiles,
  emptyPlaceDraft,
  weatherDescriptions,
  defaultMapCenter,
} from "../constants";
import {
  getNewYorkNow,
  formatClockForZone,
  sortTripStructure,
  normalizeTrip,
  createEmptyTrip,
  buildTripFromApi,
  toApiTime,
} from "../utils/tripHelpers";
import {
  normalizeSpotCategory,
  getDayCenter,
  getFallbackCoordinates,
} from "../utils/mapHelpers";

export function useTripApp() {
  const [trip, setTrip] = useState(() => normalizeTrip(createEmptyTrip()));
  const [selectedDayId, setSelectedDayId] = useState("");
  const [apiSync, setApiSync] = useState({ loading: true, error: "" });
  const [activeView, setActiveView] = useState("home");
  const [mapSearchTerm, setMapSearchTerm] = useState("");
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [mapSearchError, setMapSearchError] = useState("");
  const [searchMarker, setSearchMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);
  const [activeMapCategory, setActiveMapCategory] = useState("all");
  const [places, setPlaces] = useState([]);
  const [mapEntityTab, setMapEntityTab] = useState("place");
  const [mapEntitySearch, setMapEntitySearch] = useState("");
  const [mapPlaceTypeFilter, setMapPlaceTypeFilter] = useState("all");
  const [mapActivityStatusFilter, setMapActivityStatusFilter] = useState("all");
  const [mapTicketTypeFilter, setMapTicketTypeFilter] = useState("all");
  const [placeModal, setPlaceModal] = useState({
    isOpen: false,
    mode: "create",
    placeId: null,
    draft: emptyPlaceDraft,
  });
  const [activityEditModal, setActivityEditModal] = useState({
    isOpen: false,
    draft: {
      id: null,
      dbId: null,
      title: "",
      time: "",
      category: "",
      note: "",
      status: "planned",
      placeId: null,
    },
  });
  const [ticketEditModal, setTicketEditModal] = useState({
    isOpen: false,
    draft: {
      id: null,
      dbId: null,
      type: "entry",
      title: "",
      code: "",
      holder: "",
      note: "",
    },
  });
  const [activityPlacePicker, setActivityPlacePicker] = useState({
    isOpen: false,
    activityId: null,
    query: "",
    type: "all",
  });
  const [activityModal, setActivityModal] = useState({
    isOpen: false,
    draft: {
      title: "Nueva parada",
      category: "Extra",
      time: "17:00",
      note: "",
      status: "planned",
    },
    placeQuery: "",
    placeType: "all",
    selectedPlaceId: null,
  });
  const [showAllDaysOnMap, setShowAllDaysOnMap] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [activeCityKey, setActiveCityKey] = useState("ny");
  const [clockNow, setClockNow] = useState(new Date());
  const [weatherByCity, setWeatherByCity] = useState({
    ny: {
      loading: true,
      temperature: null,
      condition: "Consultando clima",
      wind: null,
    },
    es: {
      loading: true,
      temperature: null,
      condition: "Consultando clima",
      wind: null,
    },
  });

  // ── Derived values ──────────────────────────────────────────────────────────
  const today = getNewYorkNow();

  const selectedDay = useMemo(
    () =>
      trip.days.find((day) => day.id === selectedDayId) ??
      trip.days[0] ?? {
        id: "",
        dbId: null,
        date: clockNow.toISOString(),
        title: "Sin dia seleccionado",
        summary: "No hay datos de itinerario en base de datos.",
        district: trip.city || "Nueva York",
        weatherTip: "Sin recomendaciones disponibles.",
        mapQuery: trip.city || "Nueva York",
        spots: [],
        activities: [],
        documents: [],
      },
    [clockNow, selectedDayId, trip.city, trip.days],
  );

  const tripStartDate = new Date(trip.days[0]?.date ?? today);
  const tripEndDate = new Date(trip.days[trip.days.length - 1]?.date ?? today);
  const featuredActivity = selectedDay?.activities[0];

  const activeCity = cityProfiles[activeCityKey];
  const activeCityWeather = weatherByCity[activeCityKey];
  const activeCityTime = formatClockForZone(clockNow, activeCity.timeZone);
  const activeCityDate = new Intl.DateTimeFormat("es-ES", {
    timeZone: activeCity.timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(clockNow);
  const daysUntilStart = Math.max(
    0,
    Math.round((tripStartDate - today) / (1000 * 60 * 60 * 24)),
  );

  const mapSpotsByDay = useMemo(
    () =>
      trip.days.map((day, dayIndex) => ({
        dayId: day.id,
        dayIndex,
        dayTitle: day.title,
        spots: (day.spots ?? []).map((spot, spotIndex) => ({
          ...spot,
          category: normalizeSpotCategory(spot.type),
          coordinates:
            Array.isArray(spot.coordinates) && spot.coordinates.length === 2
              ? spot.coordinates
              : getFallbackCoordinates(spotIndex + dayIndex),
        })),
      })),
    [trip.days],
  );

  const visibleDayIds = useMemo(
    () =>
      showAllDaysOnMap ? trip.days.map((day) => day.id) : [selectedDay.id],
    [showAllDaysOnMap, trip.days, selectedDay.id],
  );

  const visibleMapSpots = useMemo(
    () =>
      mapSpotsByDay.flatMap((group) => {
        if (!visibleDayIds.includes(group.dayId)) return [];
        return group.spots
          .filter(
            (spot) =>
              activeMapCategory === "all" ||
              spot.category === activeMapCategory,
          )
          .map((spot) => ({
            ...spot,
            dayId: group.dayId,
            dayIndex: group.dayIndex,
            dayTitle: group.dayTitle,
          }));
      }),
    [activeMapCategory, mapSpotsByDay, visibleDayIds],
  );

  const mapRoutes = useMemo(
    () =>
      mapSpotsByDay
        .filter((group) => visibleDayIds.includes(group.dayId))
        .map((group) => ({
          ...group,
          points: group.spots
            .filter(
              (spot) =>
                activeMapCategory === "all" ||
                spot.category === activeMapCategory,
            )
            .map((spot) => spot.coordinates),
        }))
        .filter((group) => group.points.length >= 2),
    [activeMapCategory, mapSpotsByDay, visibleDayIds],
  );

  const autoFitPoints = useMemo(() => {
    const points = visibleMapSpots.map((spot) => spot.coordinates);
    if (searchMarker?.coordinates) points.push(searchMarker.coordinates);
    if (userLocation?.coordinates) points.push(userLocation.coordinates);
    return points;
  }, [visibleMapSpots, searchMarker, userLocation]);

  const reservationHighlights = useMemo(
    () =>
      trip.days.flatMap((day, dayIndex) =>
        (day.activities ?? [])
          .filter((activity) => activity.status === "reserved")
          .map((activity) => ({
            id: `${day.id}-${activity.id}`,
            dayIndex,
            dayTitle: day.title,
            time: activity.time,
            title: activity.title,
          })),
      ),
    [trip.days],
  );

  const statusCounter = useMemo(
    () =>
      trip.days
        .flatMap((day) => day.activities ?? [])
        .reduce(
          (acc, activity) => {
            const key = activity.status ?? "planned";
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
          },
          { planned: 0, reserved: 0, flexible: 0 },
        ),
    [trip.days],
  );

  const dayRecommendations = useMemo(() => {
    const reservedToday = (selectedDay.activities ?? []).find(
      (a) => a.status === "reserved",
    );
    return [
      selectedDay.weatherTip,
      reservedToday
        ? `Prioriza ${reservedToday.time}: ${reservedToday.title}.`
        : "No hay reservas cerradas hoy, deja hueco para improvisar.",
      `Zona objetivo: ${selectedDay.district}.`,
    ];
  }, [selectedDay]);

  const dayFoodSpots = useMemo(() => {
    const spots = (selectedDay.spots ?? []).filter(
      (s) => normalizeSpotCategory(s.type) === "food",
    );
    if (spots.length) return spots.slice(0, 6);
    return (selectedDay.activities ?? [])
      .filter((a) => normalizeSpotCategory(a.category) === "food")
      .slice(0, 6)
      .map((a) => ({ name: a.title, note: a.note, walk: "--" }));
  }, [selectedDay]);

  const placeNameById = useMemo(
    () =>
      Object.fromEntries(places.map((place) => [String(place.id), place.name])),
    [places],
  );

  const filteredPlaceEntities = useMemo(() => {
    const term = mapEntitySearch.trim().toLowerCase();
    return places.filter((p) => {
      const matchesType =
        mapPlaceTypeFilter === "all" || p.type === mapPlaceTypeFilter;
      const matchesSearch =
        !term ||
        `${p.name ?? ""} ${p.address ?? ""} ${p.notes ?? ""}`
          .toLowerCase()
          .includes(term);
      return matchesType && matchesSearch;
    });
  }, [mapEntitySearch, mapPlaceTypeFilter, places]);

  const filteredActivityEntities = useMemo(() => {
    const term = mapEntitySearch.trim().toLowerCase();
    return (selectedDay.activities ?? []).filter((a) => {
      const matchesStatus =
        mapActivityStatusFilter === "all" ||
        a.status === mapActivityStatusFilter;
      const placeLabel = a.placeId
        ? (placeNameById[String(a.placeId)] ?? "")
        : "";
      const matchesSearch =
        !term ||
        `${a.title ?? ""} ${a.category ?? ""} ${a.note ?? ""} ${placeLabel}`
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [
    mapActivityStatusFilter,
    mapEntitySearch,
    selectedDay.activities,
    placeNameById,
  ]);

  const filteredTicketEntities = useMemo(() => {
    const term = mapEntitySearch.trim().toLowerCase();
    return (selectedDay.documents ?? []).filter((d) => {
      const matchesType =
        mapTicketTypeFilter === "all" || d.type === mapTicketTypeFilter;
      const matchesSearch =
        !term ||
        `${d.title ?? ""} ${d.code ?? ""} ${d.note ?? ""}`
          .toLowerCase()
          .includes(term);
      return matchesType && matchesSearch;
    });
  }, [mapEntitySearch, mapTicketTypeFilter, selectedDay.documents]);

  const filteredPlacesForPicker = useMemo(() => {
    const term = activityPlacePicker.query.trim().toLowerCase();
    return places.filter((p) => {
      const matchesType =
        activityPlacePicker.type === "all" ||
        p.type === activityPlacePicker.type;
      const matchesSearch =
        !term ||
        `${p.name ?? ""} ${p.address ?? ""} ${p.notes ?? ""}`
          .toLowerCase()
          .includes(term);
      return matchesType && matchesSearch;
    });
  }, [activityPlacePicker.query, activityPlacePicker.type, places]);

  const filteredPlacesForActivityModal = useMemo(() => {
    const term = activityModal.placeQuery.trim().toLowerCase();
    return places.filter((p) => {
      const matchesType =
        activityModal.placeType === "all" || p.type === activityModal.placeType;
      const matchesSearch =
        !term ||
        `${p.name ?? ""} ${p.address ?? ""} ${p.notes ?? ""}`
          .toLowerCase()
          .includes(term);
      return matchesType && matchesSearch;
    });
  }, [activityModal.placeQuery, activityModal.placeType, places]);

  // ── Effects ─────────────────────────────────────────────────────────────────
  const refreshTripFromBackend = useCallback(async (preferredDayId) => {
    setApiSync((c) => ({ ...c, loading: true, error: "" }));
    try {
      const trips = await listTrips();
      if (!Array.isArray(trips) || trips.length === 0) {
        setTrip(normalizeTrip(createEmptyTrip()));
        setPlaces([]);
        setSelectedDayId("");
        setApiSync({
          loading: false,
          error: "No hay viajes en la base de datos.",
        });
        return;
      }
      const activeTripPayload = trips[0];
      const [daysPayload, placesPayload] = await Promise.all([
        listDays(activeTripPayload.id),
        listPlaces(),
      ]);
      const normalizedPlaces = Array.isArray(placesPayload)
        ? placesPayload
        : [];
      const placeById = Object.fromEntries(
        normalizedPlaces.map((p) => [String(p.id), p]),
      );
      const activityRowsByDay = {};
      const ticketRowsByDay = {};
      await Promise.all(
        (daysPayload ?? []).map(async (day) => {
          const [activities, tickets] = await Promise.all([
            listActivities({ dayId: day.id }),
            listTickets({ dayId: day.id }),
          ]);
          activityRowsByDay[day.id] = activities ?? [];
          ticketRowsByDay[day.id] = tickets ?? [];
        }),
      );
      const nextTrip = buildTripFromApi(
        activeTripPayload,
        daysPayload ?? [],
        activityRowsByDay,
        ticketRowsByDay,
        placeById,
      );
      setTrip(nextTrip);
      setPlaces(normalizedPlaces);
      setSelectedDayId((current) => {
        if (
          preferredDayId &&
          nextTrip.days.some((d) => d.id === String(preferredDayId))
        )
          return String(preferredDayId);
        if (nextTrip.days.some((d) => d.id === current)) return current;
        return nextTrip.days[0]?.id ?? "";
      });
      setApiSync({ loading: false, error: "" });
    } catch (error) {
      setApiSync({
        loading: false,
        error: error?.message || "No se pudo sincronizar con el backend.",
      });
    }
  }, []);

  useEffect(() => {
    refreshTripFromBackend();
  }, [refreshTripFromBackend]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadWeatherForCity(city) {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=${encodeURIComponent(city.timeZone)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        if (!data.current) throw new Error("No data");
        return {
          loading: false,
          temperature: Math.round(data.current.temperature_2m),
          condition:
            weatherDescriptions[data.current.weather_code] ?? "Clima variable",
          wind: Math.round(data.current.wind_speed_10m),
        };
      } catch {
        return {
          loading: false,
          temperature: city.key === "ny" ? 22 : 31,
          condition:
            city.key === "ny"
              ? "Soleado con brisa ligera"
              : "Calor seco de verano",
          wind: 11,
        };
      }
    }
    async function loadBoth() {
      const [ny, es] = await Promise.all([
        loadWeatherForCity(cityProfiles.ny),
        loadWeatherForCity(cityProfiles.es),
      ]);
      setWeatherByCity({ ny, es });
    }
    loadBoth();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setClockNow(new Date()), 1000 * 30);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!trip.days.some((d) => d.id === selectedDayId))
      setSelectedDayId(trip.days[0]?.id ?? "");
  }, [trip, selectedDayId]);

  useEffect(() => {
    if (!selectedDay) return;
    setMapCenter(getDayCenter(selectedDay));
    setMapSearchTerm(selectedDay.mapQuery ?? "");
    setMapSearchError("");
    setSearchMarker(null);
  }, [selectedDayId, selectedDay]);

  // ── Helpers internos ────────────────────────────────────────────────────────
  function updateTripDay(dayId, updater) {
    setTrip((current) =>
      sortTripStructure({
        ...current,
        updatedAt: new Date().toISOString(),
        days: current.days.map((day) =>
          day.id === dayId ? updater(day) : day,
        ),
      }),
    );
  }

  // ── Actividades ─────────────────────────────────────────────────────────────
  function updateSelectedActivity(activityId, field, value) {
    updateTripDay(selectedDay.id, (day) => ({
      ...day,
      activities: day.activities.map((a) =>
        a.id === activityId ? { ...a, [field]: value } : a,
      ),
    }));
  }

  async function persistSelectedActivity(activityId) {
    const day = trip.days.find((d) => d.id === selectedDay.id);
    const activity = (day?.activities ?? []).find((a) => a.id === activityId);
    if (!day?.dbId || !activity?.dbId) return;
    try {
      await updateActivity(activity.dbId, {
        dayId: day.dbId,
        placeId: activity.placeId ? Number(activity.placeId) : null,
        title: activity.title,
        category: activity.category,
        startTime: toApiTime(activity.time),
        endTime: null,
        status: activity.status,
        price: null,
        currency: "USD",
        bookingCode: null,
        notes: activity.note,
      });
      setApiSync((c) => ({ ...c, error: "" }));
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo guardar la actividad.",
      }));
    }
  }

  async function removeSelectedActivity(activityId) {
    const day = trip.days.find((d) => d.id === selectedDay.id);
    const activity = (day?.activities ?? []).find((a) => a.id === activityId);
    if (!activity?.dbId) {
      updateTripDay(selectedDay.id, (d) => ({
        ...d,
        activities: d.activities.filter((a) => a.id !== activityId),
      }));
      return;
    }
    try {
      await deleteActivity(activity.dbId);
      await refreshTripFromBackend(selectedDay.id);
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo eliminar la actividad.",
      }));
    }
  }

  async function cycleSelectedActivityStatus(activityId) {
    const statusOrder = ["planned", "reserved", "flexible"];
    let nextStatus = "planned";
    updateTripDay(selectedDay.id, (day) => ({
      ...day,
      activities: day.activities.map((a) => {
        if (a.id !== activityId) return a;
        const idx = statusOrder.indexOf(a.status ?? "planned");
        nextStatus = statusOrder[(idx + 1) % statusOrder.length];
        return { ...a, status: nextStatus };
      }),
    }));
    const day = trip.days.find((d) => d.id === selectedDay.id);
    const activity = (day?.activities ?? []).find((a) => a.id === activityId);
    if (!day?.dbId || !activity?.dbId) return;
    try {
      await updateActivity(activity.dbId, {
        dayId: day.dbId,
        status: nextStatus,
      });
      setApiSync((c) => ({ ...c, error: "" }));
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo cambiar el estado.",
      }));
    }
  }

  // ── Modal de actividad ───────────────────────────────────────────────────────
  function addSelectedActivity() {
    setActivityModal({
      isOpen: true,
      draft: {
        title: "Nueva parada",
        category: "Extra",
        time: "17:00",
        note: "",
        status: "planned",
      },
      placeQuery: "",
      placeType: "all",
      selectedPlaceId: null,
    });
  }

  function closeActivityModal() {
    setActivityModal((c) => ({ ...c, isOpen: false }));
  }

  async function saveActivityModal() {
    if (!selectedDay?.dbId) return;
    if (!activityModal.selectedPlaceId) {
      setApiSync((c) => ({
        ...c,
        error: "Selecciona una entidad para crear la parada.",
      }));
      return;
    }
    if (!activityModal.draft.title.trim()) {
      setApiSync((c) => ({
        ...c,
        error: "El titulo de la parada es obligatorio.",
      }));
      return;
    }
    try {
      await createActivity({
        dayId: selectedDay.dbId,
        placeId: Number(activityModal.selectedPlaceId),
        title: activityModal.draft.title,
        category: activityModal.draft.category,
        startTime: toApiTime(activityModal.draft.time),
        endTime: null,
        status: activityModal.draft.status,
        price: null,
        currency: "USD",
        bookingCode: null,
        notes: activityModal.draft.note,
      });
      closeActivityModal();
      await refreshTripFromBackend(selectedDay.id);
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo crear la actividad.",
      }));
    }
  }

  // ── Documentos / tickets ─────────────────────────────────────────────────────
  function updateSelectedDocument(documentId, field, value) {
    updateTripDay(selectedDay.id, (day) => ({
      ...day,
      documents: (day.documents ?? []).map((d) =>
        d.id === documentId ? { ...d, [field]: value } : d,
      ),
    }));
  }

  async function persistSelectedDocument(documentId) {
    const day = trip.days.find((d) => d.id === selectedDay.id);
    const doc = (day?.documents ?? []).find((d) => d.id === documentId);
    if (!day?.dbId || !doc?.dbId) return;
    try {
      await updateTicket(doc.dbId, {
        dayId: day.dbId,
        activityId: null,
        type: doc.type,
        title: doc.title,
        provider: null,
        code: doc.code || null,
        holder: doc.holder || null,
        seat: null,
        gate: null,
        price: null,
        currency: "USD",
        documentUrl: null,
        notes: doc.note,
      });
      setApiSync((c) => ({ ...c, error: "" }));
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo guardar el documento.",
      }));
    }
  }

  async function addSelectedDocument(type = "entry") {
    if (!selectedDay?.dbId) return;
    try {
      await createTicket({
        dayId: selectedDay.dbId,
        activityId: null,
        type,
        title: type === "boarding" ? "Tarjeta de embarque" : "Nueva entrada",
        provider: null,
        code: null,
        holder: "Familia",
        seat: null,
        gate: null,
        price: null,
        currency: "USD",
        documentUrl: null,
        notes: "",
      });
      await refreshTripFromBackend(selectedDay.id);
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo crear el documento.",
      }));
    }
  }

  async function removeSelectedDocument(documentId) {
    const day = trip.days.find((d) => d.id === selectedDay.id);
    const doc = (day?.documents ?? []).find((d) => d.id === documentId);
    if (!doc?.dbId) {
      updateTripDay(selectedDay.id, (d) => ({
        ...d,
        documents: (d.documents ?? []).filter((x) => x.id !== documentId),
      }));
      return;
    }
    try {
      await deleteTicket(doc.dbId);
      await refreshTripFromBackend(selectedDay.id);
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo eliminar el documento.",
      }));
    }
  }

  // ── Lugares / entidades ──────────────────────────────────────────────────────
  function openCreatePlaceModal() {
    setPlaceModal({
      isOpen: true,
      mode: "create",
      placeId: null,
      draft: emptyPlaceDraft,
    });
  }

  function openEditPlaceModal(place) {
    setPlaceModal({
      isOpen: true,
      mode: "edit",
      placeId: place.id,
      draft: {
        name: place.name ?? "",
        type: place.type ?? "other",
        address: place.address ?? "",
        lat: place.lat ?? "",
        lng: place.lng ?? "",
        priceLevel: place.priceLevel ?? "",
        averagePrice: place.averagePrice ?? "",
        currency: place.currency ?? "USD",
        website: place.website ?? "",
        phone: place.phone ?? "",
        notes: place.notes ?? "",
      },
    });
  }

  function closePlaceModal() {
    setPlaceModal((c) => ({ ...c, isOpen: false }));
  }

  function updatePlaceModalField(field, value) {
    setPlaceModal((c) => ({ ...c, draft: { ...c.draft, [field]: value } }));
  }

  async function savePlaceModal() {
    const payload = {
      name: placeModal.draft.name,
      type: placeModal.draft.type,
      address: placeModal.draft.address || null,
      lat: placeModal.draft.lat === "" ? null : Number(placeModal.draft.lat),
      lng: placeModal.draft.lng === "" ? null : Number(placeModal.draft.lng),
      priceLevel:
        placeModal.draft.priceLevel === ""
          ? null
          : Number(placeModal.draft.priceLevel),
      averagePrice:
        placeModal.draft.averagePrice === ""
          ? null
          : Number(placeModal.draft.averagePrice),
      currency: placeModal.draft.currency || null,
      website: placeModal.draft.website || null,
      phone: placeModal.draft.phone || null,
      notes: placeModal.draft.notes || null,
    };
    if (!payload.name.trim()) {
      setApiSync((c) => ({
        ...c,
        error: "El nombre de la entidad es obligatorio.",
      }));
      return;
    }
    try {
      if (placeModal.mode === "create") {
        await createPlace(payload);
      } else {
        await updatePlace(placeModal.placeId, payload);
      }
      closePlaceModal();
      setApiSync((c) => ({ ...c, error: "" }));
      await refreshTripFromBackend();
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo guardar la entidad.",
      }));
    }
  }

  async function removePlaceEntity(placeId) {
    try {
      await deletePlace(placeId);
      await refreshTripFromBackend();
      setApiSync((c) => ({ ...c, error: "" }));
    } catch (error) {
      setApiSync((c) => ({
        ...c,
        error: error?.message || "No se pudo eliminar el lugar.",
      }));
    }
  }

  // ── Picker de lugar ──────────────────────────────────────────────────────────
  function openActivityPlacePicker(activityId) {
    setActivityPlacePicker({
      isOpen: true,
      activityId,
      query: "",
      type: "all",
    });
  }

  function closeActivityPlacePicker() {
    setActivityPlacePicker((c) => ({ ...c, isOpen: false }));
  }

  async function assignPlaceToActivity(placeId) {
    if (!activityPlacePicker.activityId) return;
    updateSelectedActivity(activityPlacePicker.activityId, "placeId", placeId);
    await persistSelectedActivity(activityPlacePicker.activityId);
    closeActivityPlacePicker();
  }

  // ── Búsqueda en mapa ─────────────────────────────────────────────────────────
  async function handleMapSearchSubmit(event) {
    event.preventDefault();
    const term = mapSearchTerm.trim();
    if (!term) {
      setMapSearchError("Escribe un lugar para buscar.");
      return;
    }
    setMapSearchLoading(true);
    setMapSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(`${term}, New York`)}`,
      );
      if (!res.ok) throw new Error("No response from geocoder");
      const results = await res.json();
      const first = results?.[0];
      if (!first) {
        setMapSearchError("No encontre resultados para esa busqueda.");
        return;
      }
      const coordinates = [Number(first.lat), Number(first.lon)];
      setMapCenter(coordinates);
      setSearchMarker({ name: first.display_name, coordinates });
    } catch {
      setMapSearchError("No se pudo consultar el mapa ahora mismo.");
    } finally {
      setMapSearchLoading(false);
    }
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setGeoError("Tu navegador no soporta geolocalizacion.");
      return;
    }
    setGeoLoading(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation({ coordinates });
        setMapCenter(coordinates);
        setGeoLoading(false);
      },
      () => {
        setGeoError(
          "No pudimos acceder a tu ubicacion. Revisa permisos del navegador.",
        );
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }

  // ── Return ───────────────────────────────────────────────────────────────────
  return {
    // Estado global
    trip,
    selectedDay,
    selectedDayId,
    setSelectedDayId,
    apiSync,
    activeView,
    setActiveView,
    activeCityKey,
    setActiveCityKey,
    activeCityWeather,
    activeCityTime,
    activeCityDate,
    tripStartDate,
    tripEndDate,
    daysUntilStart,
    featuredActivity,
    // Datos derivados del viaje
    reservationHighlights,
    statusCounter,
    dayRecommendations,
    dayFoodSpots,
    placeNameById,
    // Mapa
    places,
    mapCenter,
    mapRoutes,
    visibleMapSpots,
    autoFitPoints,
    activeMapCategory,
    setActiveMapCategory,
    showAllDaysOnMap,
    setShowAllDaysOnMap,
    searchMarker,
    userLocation,
    geoLoading,
    geoError,
    mapSearchTerm,
    setMapSearchTerm,
    mapSearchLoading,
    mapSearchError,
    // Entidades
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
    // Modales
    activityModal,
    setActivityModal,
    activityPlacePicker,
    setActivityPlacePicker,
    placeModal,
    filteredPlacesForPicker,
    filteredPlacesForActivityModal,
    // Handlers — actividades
    addSelectedActivity,
    closeActivityModal,
    saveActivityModal,
    updateSelectedActivity,
    persistSelectedActivity,
    removeSelectedActivity,
    cycleSelectedActivityStatus,
    // Handlers — documentos
    updateSelectedDocument,
    persistSelectedDocument,
    addSelectedDocument,
    removeSelectedDocument,
    // Handlers — lugares
    openCreatePlaceModal,
    openEditPlaceModal,
    closePlaceModal,
    updatePlaceModalField,
    savePlaceModal,
    removePlaceEntity,
    // Handlers — picker
    openActivityPlacePicker,
    closeActivityPlacePicker,
    assignPlaceToActivity,
    // Handlers — edicion actividad
    activityEditModal,
    setActivityEditModal,
    openActivityEditModal: (activity) =>
      setActivityEditModal({
        isOpen: true,
        draft: {
          id: activity.id,
          dbId: activity.dbId,
          title: activity.title ?? "",
          time: activity.time ?? "",
          category: activity.category ?? "",
          note: activity.note ?? "",
          status: activity.status ?? "planned",
          placeId: activity.placeId ?? null,
        },
      }),
    closeActivityEditModal: () =>
      setActivityEditModal((c) => ({ ...c, isOpen: false })),
    updateActivityEditField: (field, value) =>
      setActivityEditModal((c) => ({
        ...c,
        draft: { ...c.draft, [field]: value },
      })),
    // Handlers — edicion ticket
    ticketEditModal,
    setTicketEditModal,
    openTicketEditModal: (doc) =>
      setTicketEditModal({
        isOpen: true,
        draft: {
          id: doc.id,
          dbId: doc.dbId,
          type: doc.type ?? "entry",
          title: doc.title ?? "",
          code: doc.code ?? "",
          holder: doc.holder ?? "",
          note: doc.note ?? "",
        },
      }),
    closeTicketEditModal: () =>
      setTicketEditModal((c) => ({ ...c, isOpen: false })),
    updateTicketEditField: (field, value) =>
      setTicketEditModal((c) => ({
        ...c,
        draft: { ...c.draft, [field]: value },
      })),
    // Handlers — mapa
    handleMapSearchSubmit,
    handleUseMyLocation,
  };
}
