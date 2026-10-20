import type { Event } from "../types/event";

export const cities = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ"];
export const dates = ["Hôm nay", "Cuối tuần này", "Tuần này", "Tháng này"];

function matchesDate(startAt: string, filter: string, now: Date) {
  const start = new Date(startAt);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (start < today) return false;
  const nextDay = new Date(today); nextDay.setDate(today.getDate() + 1);
  if (filter === "Hôm nay") return start < nextDay;
  if (filter === "Tháng này") return start.getMonth() === today.getMonth() && start.getFullYear() === today.getFullYear();
  const mondayOffset = (today.getDay() + 6) % 7;
  const nextMonday = new Date(today); nextMonday.setDate(today.getDate() + 7 - mondayOffset);
  if (filter === "Tuần này") return start < nextMonday;
  return start < nextMonday && (start.getDay() === 0 || start.getDay() === 6);
}

export function filterEvents(events: Event[], query: string, filters: string[], now = new Date()) {
  const cityFilters = filters.filter(f => cities.includes(f));
  const dateFilters = filters.filter(f => dates.includes(f));
  const categories = filters.filter(f => !cities.includes(f) && !dates.includes(f));
  return events.filter(event =>
    [event.title, event.description, event.location, event.category].join(" ").toLowerCase().includes(query.trim().toLowerCase()) &&
    (!cityFilters.length || cityFilters.includes(event.city)) &&
    (!dateFilters.length || dateFilters.some(f => matchesDate(event.startAt, f, now))) &&
    (!categories.length || categories.includes(event.category)));
}
