const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/";

function buildUrl(path, query = {}) {
  const baseUrl = API_BASE_URL.startsWith("http")
    ? API_BASE_URL
    : window.location.origin;
  const url = new URL(path, baseUrl);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  return url;
}

async function performFetch(path, { method, query, body }) {
  return fetch(buildUrl(path, query), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function request(path, { method = "GET", query, body } = {}) {
  let response;

  try {
    response = await performFetch(path, { method, query, body });

    if (response.status === 404 && path.startsWith("/api/")) {
      response = await performFetch(path.replace(/^\/api/, ""), {
        method,
        query,
        body,
      });
    }
  } catch (error) {
    const networkError = new Error("No se pudo conectar con el backend.");
    networkError.code = "NETWORK_ERROR";
    networkError.cause = error;
    throw networkError;
  }

  const text = await response.text();
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message ?? "API request failed");
    error.code = payload?.code ?? "API_ERROR";
    error.fieldErrors = payload?.fieldErrors ?? null;
    throw error;
  }

  return payload;
}

export function listTrips(query = "") {
  return request("/api/trips", { query: { q: query } });
}

export function createTrip(payload) {
  return request("/api/trips", { method: "POST", body: payload });
}

export function updateTrip(tripId, payload, method = "PATCH") {
  return request(`/api/trips/${tripId}`, { method, body: payload });
}

export function listDays(tripId, query = "") {
  return request("/api/days", { query: { tripId, q: query } });
}

export function createDay(payload) {
  return request("/api/days", { method: "POST", body: payload });
}

export function updateDay(dayId, payload, method = "PATCH") {
  return request(`/api/days/${dayId}`, { method, body: payload });
}

export function listPlaces(filters = {}) {
  return request("/api/places", { query: filters });
}

export function createPlace(payload) {
  return request("/api/places", { method: "POST", body: payload });
}

export function updatePlace(placeId, payload, method = "PATCH") {
  return request(`/api/places/${placeId}`, { method, body: payload });
}

export function deletePlace(placeId) {
  return request(`/api/places/${placeId}`, { method: "DELETE" });
}

export function listActivities(filters = {}) {
  return request("/api/activities", { query: filters });
}

export function createActivity(payload) {
  return request("/api/activities", { method: "POST", body: payload });
}

export function updateActivity(activityId, payload, method = "PATCH") {
  return request(`/api/activities/${activityId}`, { method, body: payload });
}

export function deleteActivity(activityId) {
  return request(`/api/activities/${activityId}`, { method: "DELETE" });
}

export function listTickets(filters = {}) {
  return request("/api/tickets", { query: filters });
}

export function createTicket(payload) {
  return request("/api/tickets", { method: "POST", body: payload });
}

export function updateTicket(ticketId, payload, method = "PATCH") {
  return request(`/api/tickets/${ticketId}`, { method, body: payload });
}

export function deleteTicket(ticketId) {
  return request(`/api/tickets/${ticketId}`, { method: "DELETE" });
}
