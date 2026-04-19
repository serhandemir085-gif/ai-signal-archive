export function toDisplayDate(value: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options
  }).format(new Date(value));
}

export function toIsoDay(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function isWithinDays(value: string, reference: string, days: number) {
  const date = new Date(value).getTime();
  const end = new Date(reference).getTime();
  const start = end - days * 24 * 60 * 60 * 1000;
  return date >= start && date <= end;
}

export function formatArchiveParts(value: string) {
  const [year, month, day] = toIsoDay(value).split("-");
  return { year, month, day };
}

export function compareDesc(a: string, b: string) {
  return new Date(b).getTime() - new Date(a).getTime();
}
