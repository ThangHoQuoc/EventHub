import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EventGrid } from "../components/event/EventGrid";
import { EventSearchBar } from "../components/event/EventSearchBar";
import { FilterSidebar } from "../components/event/FilterSidebar";
import { RequestState } from "../components/ui/RequestState";
import { getPublicEvents, mapDtoToEvent } from "../api/events";
import { cities, dates, filterEvents } from "../utils/eventFilters";
import type { Event } from "../types/event";

export function ExploreEventsPage() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("query") ?? "");
  const [filters, setFilters] = useState<string[]>([params.get("filter"), params.get("city"), params.get("date")].filter(Boolean) as string[]);
  const [events, setEvents] = useState<Event[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState("createdAt,desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(""); setEvents([]);
    getPublicEvents({ page, size: 12, sort }).then(res => {
      if (active) { setEvents(res.content.map(dto => mapDtoToEvent(dto))); setTotalPages(res.totalPages); setTotal(res.totalElements); }
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, sort, retry]);
  const visible = useMemo(() => filterEvents(events, query, filters), [events, query, filters]);
  function toggle(value: string) { setFilters(current => current.includes(value) ? current.filter(f => f !== value) : [...current, value]); }
  function group(value: string, values: string[]) { setFilters(current => [...current.filter(f => !values.includes(f)), ...(value ? [value] : [])]); }
  return <div className="ev-editorial-page ev-explore-page">
    <section className="ev-explore-hero"><nav><Link to="/">Trang chủ</Link><span>/</span><strong>Khám phá</strong></nav><h1>Tìm một trải nghiệm đáng nhớ.</h1><p>Khám phá các sự kiện đã được công bố.</p></section>
    <div className="ev-explore-search-wrap"><EventSearchBar compact value={query} onChange={setQuery} city={filters.find(f => cities.includes(f)) ?? ""} date={filters.find(f => dates.includes(f)) ?? ""} onCityChange={value => group(value, cities)} onDateChange={value => group(value, dates)} /></div>
    <section className="ev-explore-layout"><FilterSidebar selected={filters} onToggle={toggle} onClear={() => { setFilters([]); setQuery(""); }} />
      <div className="ev-explore-results"><div className="ev-results-toolbar"><div><strong>{total} sự kiện công khai</strong><p>Bộ lọc áp dụng cho {events.length} sự kiện trên trang này.</p></div>
        <label>Sắp xếp <select value={sort} onChange={e => { setSort(e.target.value); setPage(0); }}><option value="createdAt,desc">Mới công bố</option><option value="startAt,asc">Sắp diễn ra</option></select></label></div>
        <RequestState loading={loading} error={error} onRetry={() => setRetry(n => n + 1)} />
        {!loading && !error && (visible.length ? <EventGrid events={visible} /> : <p role="status">Chưa có sự kiện phù hợp trên trang này.</p>)}
        {!error && totalPages > 1 && <nav className="ev-load-progress" aria-label="Phân trang"><button disabled={loading || page === 0} onClick={() => setPage(n => n - 1)}>Trang trước</button><span>Trang {page + 1} / {totalPages}</span><button disabled={loading || page + 1 >= totalPages} onClick={() => setPage(n => n + 1)}>Trang sau</button></nav>}
      </div></section>
  </div>;
}
