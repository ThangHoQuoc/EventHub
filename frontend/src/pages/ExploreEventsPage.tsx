import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EventGrid } from "../components/event/EventGrid";
import { EventSearchBar } from "../components/event/EventSearchBar";
import { ExploreInterruption } from "../components/event/ExploreInterruption";
import { FilterSidebar } from "../components/event/FilterSidebar";
import { LineIcon } from "../components/ui/LineIcon";
import { mockEvents } from "../data/mockEvents";
import { getPublicEvents, mapDtoToEvent } from "../api/events";
import type { Event } from "../types/event";

const quickCategories = [
  ["Dành cho bạn", ""], ["Cuối tuần này", "Cuối tuần này"], ["Âm nhạc", "Âm nhạc"],
  ["Công nghệ", "Công nghệ"], ["Workshop", "Workshop"], ["Nghệ thuật", "Nghệ thuật"], ["Miễn phí", "Miễn phí"],
] as const;

const cityFilters = ["TP.HCM", "Hà Nội", "Đà Nẵng", "Cần Thơ"];
const dateFilters = ["Cuối tuần này", "Tuần này", "Tháng này"];

export function ExploreEventsPage() {
  const [searchParams] = useSearchParams();
  const initialFilters = [searchParams.get("filter"), searchParams.get("city"), searchParams.get("date")].filter(Boolean) as string[];
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(initialFilters);
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [realEvents, setRealEvents] = useState<Event[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getPublicEvents()
      .then((res) => {
        if (!isMounted) return;
        if (res.content && res.content.length > 0) {
          const mapped = res.content.map((dto) => mapDtoToEvent(dto, 180000));
          setRealEvents(mapped);
        } else {
          setRealEvents(null);
        }
      })
      .catch(() => {
        if (isMounted) setRealEvents(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleFilter(value: string) {
    if (!value) {
      setSelectedFilters([]);
      return;
    }
    setSelectedFilters((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function setGroupedFilter(value: string, group: string[], update: (value: string) => void) {
    update(value);
    setSelectedFilters((current) => [...current.filter((item) => !group.includes(item)), ...(value ? [value] : [])]);
  }

  const baseEvents = useMemo(() => {
    return realEvents && realEvents.length > 0 ? realEvents : mockEvents;
  }, [realEvents]);

  const events = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return baseEvents.filter((event) => {
      const matchesQuery = !normalizedQuery || [event.title, event.description, event.city, event.category, ...event.tags].join(" ").toLowerCase().includes(normalizedQuery);
      const matchesFilter = selectedFilters.length === 0 || selectedFilters.some((filter) => [event.city, event.category, ...event.tags].includes(filter));
      return matchesQuery && matchesFilter;
    });
  }, [baseEvents, query, selectedFilters]);

  function clearFilters() {
    setSelectedFilters([]);
    setCity("");
    setDate("");
    setQuery("");
  }

  return (
    <div className="ev-editorial-page ev-explore-page">
      <section className="ev-explore-hero">
        <nav aria-label="Breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><strong>Khám phá</strong></nav>
        <h1>Tìm một trải nghiệm đáng nhớ.</h1>
        <p>Từ đêm nhạc thân mật đến workshop cuối tuần — chọn điều hợp với bạn.</p>
      </section>

      <div className="ev-explore-search-wrap">
        <EventSearchBar compact city={city} date={date} onChange={setQuery} onCityChange={(value) => setGroupedFilter(value, cityFilters, setCity)} onDateChange={(value) => setGroupedFilter(value, dateFilters, setDate)} value={query} />
      </div>

      <section className="ev-discovery-row" aria-label="Khám phá nhanh">
        {quickCategories.map(([label, value]) => {
          const active = value ? selectedFilters.includes(value) : selectedFilters.length === 0;
          return <button aria-pressed={active} key={label} onClick={() => toggleFilter(value)} type="button"><LineIcon name={label === "Dành cho bạn" ? "sparkles" : label === "Cuối tuần này" ? "calendar" : label === "Miễn phí" ? "ticket" : "trending"} />{label}</button>;
        })}
      </section>

      <section className="ev-explore-layout">
        <FilterSidebar onClear={clearFilters} onToggle={toggleFilter} selected={selectedFilters} />
        <div className="ev-explore-results">
          <div className="ev-results-toolbar">
            <div aria-live="polite"><strong>{events.length} sự kiện phù hợp</strong>{selectedFilters.length ? <div className="ev-active-filters">{selectedFilters.map((filter) => <button key={filter} onClick={() => toggleFilter(filter)} type="button">{filter}<LineIcon name="x" /></button>)}<button onClick={clearFilters} type="button">Xóa tất cả</button></div> : <small>Được chọn lọc cho trải nghiệm của bạn</small>}</div>
            <label><span>Sắp xếp</span><select aria-label="Sắp xếp sự kiện"><option>Phù hợp nhất</option><option>Sắp diễn ra</option><option>Giá thấp nhất</option><option>Được quan tâm</option></select></label>
          </div>

          {events.length ? (
            <>
              <EventGrid events={events.slice(0, 3)} />
              <ExploreInterruption />
              {events.length > 3 ? <EventGrid events={events.slice(3)} /> : null}
              <div className="ev-load-progress"><span>Đang hiển thị {events.length} / {events.length} sự kiện</span><i><b /></i><button disabled type="button">Đã hiển thị tất cả</button></div>
            </>
          ) : (
            <div className="ev-empty-state" role="status">
              <div className="ev-empty-ticket" aria-hidden="true"><LineIcon name="calendar" /><i /><i /></div>
              <h2>Chưa tìm thấy sự kiện phù hợp.</h2>
              <p>Thử bỏ bớt bộ lọc hoặc mở rộng khoảng thời gian.</p>
              <div><button onClick={clearFilters} type="button">Xóa bộ lọc</button><Link to="/eventmatch">Thử EventMatch</Link></div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
