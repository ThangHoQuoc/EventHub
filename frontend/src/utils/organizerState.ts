import type { EventDto } from "../api/events";
import type { CreateEventPayload } from "../api/organizer";

export function eventUpdatePayload(event: EventDto, form: CreateEventPayload): Partial<CreateEventPayload> {
  if (event.status === "PUBLISHED") return { title:form.title, description:form.description, location:form.location };
  if (event.status !== "DRAFT") throw new Error("Sự kiện đã đóng và không thể chỉnh sửa.");
  return form;
}
export function toLocalDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0,16);
}
export function rememberEvent(userId: string, eventId: string) {
  try { localStorage.setItem(`eventhub_recent_events_${userId}`,JSON.stringify([eventId,...recentEvents(userId).filter(id => id !== eventId)].slice(0,20))); }
  catch { /* Lưu bookmark không ảnh hưởng kết quả tạo sự kiện trên server. */ }
}
export function recentEvents(userId: string): string[] {
  try {
    const ids: unknown = JSON.parse(localStorage.getItem(`eventhub_recent_events_${userId}`) ?? "[]");
    return Array.isArray(ids) ? ids.filter(id => typeof id === "string").slice(0,20) : [];
  } catch { return []; }
}
