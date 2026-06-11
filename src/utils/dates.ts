const SPAIN_TZ = "Europe/Madrid";

export function formatMatchDateTime(utcDate: string): string {
  return new Date(utcDate).toLocaleString("es-ES", {
    timeZone: SPAIN_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMatchDate(utcDate: string): string {
  return new Date(utcDate).toLocaleDateString("es-ES", {
    timeZone: SPAIN_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatMatchTime(utcDate: string): string {
  return new Date(utcDate).toLocaleTimeString("es-ES", {
    timeZone: SPAIN_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLastUpdated(utcDate: string): string {
  return new Date(utcDate).toLocaleString("es-ES", {
    timeZone: SPAIN_TZ,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
