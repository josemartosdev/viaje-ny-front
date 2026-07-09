import { NEW_YORK_TIME_ZONE, activityStatusMeta } from "../constants";

export function getNewYorkNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: NEW_YORK_TIME_ZONE }),
  );
}

export function formatTripDate(date, options = {}) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: NEW_YORK_TIME_ZONE,
    weekday: options.weekday ?? "short",
    month: options.month ?? "short",
    day: options.day ?? "numeric",
  }).format(date);
}

export function formatCalendarLabel(date) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: NEW_YORK_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatCompactDate(date) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: NEW_YORK_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
  }).format(date);
}

export function formatClockForZone(date, timeZone) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDayLabel(day) {
  return `${formatTripDate(new Date(day.date), { weekday: "long" })} · ${day.title}`;
}

export function toApiTime(value = "") {
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "00:00:00";
  return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}:00`;
}

export function fromApiTime(value = "") {
  const match = String(value).match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : "--:--";
}

export function getActivityStatusMeta(status) {
  return activityStatusMeta[status] ?? activityStatusMeta.planned;
}

export function normalizeTicketType(type) {
  const allowedTypes = ["entry", "boarding", "reservation", "voucher", "pass"];
  return allowedTypes.includes(type) ? type : "entry";
}

function getTimeSortValue(timeText = "") {
  const match = String(timeText).match(/(\d{1,2}):(\d{2})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 60 + Number(match[2]);
}

function sortActivitiesByTime(activities = []) {
  return [...activities]
    .map((activity, index) => ({ ...activity, _index: index }))
    .sort((a, b) => {
      const diff = getTimeSortValue(a.time) - getTimeSortValue(b.time);
      return diff !== 0 ? diff : a._index - b._index;
    })
    .map(({ _index, ...activity }) => activity);
}

export function sortTripStructure(trip) {
  return {
    ...trip,
    days: [...(trip.days ?? [])]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => ({
        ...day,
        activities: sortActivitiesByTime(day.activities ?? []),
      })),
  };
}

export function inferActivityStatus(activity = {}) {
  const content =
    `${activity.title ?? ""} ${activity.note ?? ""}`.toLowerCase();
  if (
    content.includes("reserv") ||
    content.includes("vuelo") ||
    content.includes("check-in") ||
    content.includes("musical") ||
    content.includes("tour")
  ) {
    return "reserved";
  }
}

export function inferDayDocuments(day = {}) {
  const documents = [];
  for (const activity of day.activities ?? []) {
    const title = activity.title ?? "";
    const note = activity.note ?? "";
    const content = `${title} ${note}`.toLowerCase();
    const reservationMatch = note.match(/reserva\s+([a-z0-9]+)/i);
    const code = reservationMatch?.[1]?.toUpperCase() ?? "";

    if (content.includes("vuelo")) {
      documents.push({
        type: "boarding",
        title,
        time: activity.time ?? "--:--",
        code,
        holder: "Familia",
        note: note || "Tarjeta de embarque pendiente de check-in online.",
      });
      continue;
    }

    if (
      content.includes("musical") ||
      content.includes("tour") ||
      content.includes("ferry") ||
      content.includes("moma") ||
      content.includes("top of the rock")
    ) {
      documents.push({
        type: "entry",
        title,
        time: activity.time ?? "--:--",
        code,
        holder: "Familia",
        note: note || "Entrada digital guardada para acceso rapido.",
      });
    }
  }
  return documents;
}

export function createEmptyTrip() {
  return {
    id: "trip-empty",
    dbId: null,
    tripName: "Trip",
    city: "Nueva York",
    subtitle: "Sin datos cargados desde base de datos.",
    updatedAt: new Date().toISOString(),
    days: [],
  };
}

export function normalizeTrip(rawTrip) {
  const trip = rawTrip ?? createEmptyTrip();
  return sortTripStructure({
    ...trip,
    dbId: trip.dbId ?? null,
    days: (trip.days ?? []).map((day, dayIndex) => ({
      ...day,
      id: String(day.id ?? `day-${dayIndex + 1}`),
      dbId: day.dbId ?? null,
      activities: (day.activities ?? []).map((activity, activityIndex) => ({
        ...activity,
        id: String(
          activity.id ??
            `${day.id ?? `day-${dayIndex + 1}`}-activity-${activityIndex + 1}`,
        ),
        dbId:
          activity.dbId ??
          (typeof activity.id === "number" ? activity.id : null),
        placeId: activity.placeId ?? null,
        status: activity.status ?? inferActivityStatus(activity),
      })),
      documents: (day.documents ?? inferDayDocuments(day)).map(
        (document, documentIndex) => ({
          ...document,
          id: String(
            document.id ??
              `${day.id ?? `day-${dayIndex + 1}`}-doc-${documentIndex + 1}`,
          ),
          dbId:
            document.dbId ??
            (typeof document.id === "number" ? document.id : null),
          type: normalizeTicketType(document.type),
          title: document.title ?? "",
          time: document.time ?? "--:--",
          code: document.code ?? "",
          holder: document.holder ?? "Familia",
          note: document.note ?? "",
        }),
      ),
    })),
  });
}

export function buildTripFromApi(
  tripPayload,
  daysPayload,
  activitiesByDay,
  ticketsByDay,
  placeById,
) {
  const sortedDays = [...daysPayload].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  return normalizeTrip({
    id: `trip-${tripPayload.id}`,
    dbId: tripPayload.id,
    tripName: tripPayload.name,
    city: tripPayload.city,
    subtitle: tripPayload.notes || `${tripPayload.city} travel board`,
    updatedAt: new Date().toISOString(),
    days: sortedDays.map((day) => {
      const activities = (activitiesByDay[day.id] ?? []).map((activity) => {
        const resolvedPlaceId = activity.placeId ?? activity.place?.id ?? null;
        const place = resolvedPlaceId
          ? placeById[String(resolvedPlaceId)]
          : null;
        return {
          id: String(activity.id),
          dbId: activity.id,
          placeId: resolvedPlaceId,
          time: fromApiTime(activity.startTime),
          title: activity.title,
          category: activity.category || "Extra",
          note: activity.notes || "",
          status: activity.status || "planned",
          linkedPlace: place,
        };
      });
      const tickets = ticketsByDay[day.id] ?? [];
      const spots = activities
        .filter((activity) => {
          const lat = Number(activity.linkedPlace?.lat);
          const lng = Number(activity.linkedPlace?.lng);
          // Excluir coordenadas vacías (0,0) y no finitas
          return (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            (Math.abs(lat) > 0.001 || Math.abs(lng) > 0.001)
          );
        })
        .map((activity) => ({
          name: activity.linkedPlace?.name || activity.title,
          type: activity.category || "other",
          walk: "--",
          note: activity.note || "",
          coordinates: [
            Number(activity.linkedPlace.lat),
            Number(activity.linkedPlace.lng),
          ],
        }));

      return {
        id: String(day.id),
        dbId: day.id,
        date: `${day.date}T09:00:00Z`,
        title: day.title,
        summary: day.notes || day.title,
        district: day.district || tripPayload.city || "Nueva York",
        weatherTip: day.weatherTip || "Revisa clima y reserva agua.",
        mapQuery: day.district || day.title,
        spots,
        activities: activities.map(
          ({ linkedPlace: _linkedPlace, ...activity }) => activity,
        ),
        documents: tickets.map((ticket) => ({
          id: String(ticket.id),
          dbId: ticket.id,
          type: normalizeTicketType(ticket.type),
          title: ticket.title || "",
          time: "--:--",
          code: ticket.code || "",
          holder: ticket.holder || "Familia",
          note: ticket.notes || "",
        })),
      };
    }),
  });
}
