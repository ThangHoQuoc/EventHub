import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EventGrid } from "../components/event/EventGrid";
import { EventSearchBar } from "../components/event/EventSearchBar";
import { FilterSidebar } from "../components/event/FilterSidebar";
import { RequestState } from "../components/ui/RequestState";
import { LineIcon } from "../components/ui/LineIcon";
import { getPublicEvents, mapDtoToEvent } from "../api/events";
import { cities, dates, filterEvents } from "../utils/eventFilters";
import type { Event } from "../types/event";

export function ExploreEventsPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("query") ?? "");
  const [filters, setFilters] = useState<string[]>(
    [params.get("filter"), params.get("city"), params.get("date")].filter(Boolean) as string[]
  );
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
    setLoading(true);
    setError("");
    setEvents([]);

    getPublicEvents({ page, size: 12, sort })
      .then((res) => {
        if (active) {
          setEvents(res.content.map((dto) => mapDtoToEvent(dto)));
          setTotalPages(res.totalPages);
          setTotal(res.totalElements);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, sort, retry]);

  const visible = useMemo(
    () => filterEvents(events, query, filters),
    [events, query, filters]
  );

  function toggle(value: string) {
    setFilters((current) =>
      current.includes(value) ? current.filter((f) => f !== value) : [...current, value]
    );
  }

  function group(value: string, values: string[]) {
    setFilters((current) => [
      ...current.filter((f) => !values.includes(f)),
      ...(value ? [value] : []),
    ]);
  }

  function clearAllFilters() {
    setFilters([]);
    setQuery("");
    setParams({});
  }

  return (
    <div className="ev-editorial-page ev-explore-page">
      {/* 1. Header Khám phá trang nhã */}
      <section className="ev-explore-hero">
        <nav className="ev-explore-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Khám phá sự kiện</strong>
        </nav>
        <div className="ev-explore-hero-title">
          <span className="ev-explore-pill-tag">
            <LineIcon name="ticket" />
            <span>SỰ KIỆN NỔI BẬT VIỆT NAM</span>
          </span>
          <h1>Tìm kiếm trải nghiệm tiếp theo của bạn.</h1>
          <p>
            Hàng trăm concert âm nhạc, triển lãm nghệ thuật, workshop công nghệ và lễ hội ngoài trời đang diễn ra.
          </p>
        </div>
      </section>

      {/* 2. Thanh tìm kiếm nổi (Floating Search Bar) */}
      <div className="ev-explore-search-wrap">
        <EventSearchBar
          compact
          value={query}
          onChange={setQuery}
          city={filters.find((f) => cities.includes(f)) ?? ""}
          date={filters.find((f) => dates.includes(f)) ?? ""}
          onCityChange={(value) => group(value, cities)}
          onDateChange={(value) => group(value, dates)}
        />
      </div>

      {/* 3. Layout Bộ lọc bên trái & Lưới sự kiện bên phải */}
      <section className="ev-explore-layout">
        <FilterSidebar
          selected={filters}
          onToggle={toggle}
          onClear={clearAllFilters}
        />

        <div className="ev-explore-results">
          {/* Toolbar kết quả & Sắp xếp */}
          <div className="ev-results-toolbar">
            <div className="ev-results-summary">
              <strong>{visible.length} sự kiện phù hợp</strong>
              <small>Tổng số {total} sự kiện công khai trên hệ thống</small>
            </div>

            <div className="ev-results-sort">
              <label htmlFor="sort-select">
                <span>Sắp xếp:</span>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="createdAt,desc">Mới công bố nhất</option>
                  <option value="startAt,asc">Sắp diễn ra</option>
                </select>
              </label>
            </div>
          </div>

          {/* Active Filter Chips (nếu có chọn) */}
          {(filters.length > 0 || query) && (
            <div className="ev-active-filter-chips">
              <span>Đang lọc theo:</span>
              {query && (
                <button
                  type="button"
                  className="ev-chip-item"
                  onClick={() => setQuery("")}
                >
                  <span>Từ khóa: "{query}"</span>
                  <LineIcon name="x" />
                </button>
              )}
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  className="ev-chip-item"
                  onClick={() => toggle(f)}
                >
                  <span>{f}</span>
                  <LineIcon name="x" />
                </button>
              ))}
              <button
                type="button"
                className="ev-chip-clear-all"
                onClick={clearAllFilters}
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Trạng thái tải / lỗi */}
          <RequestState loading={loading} error={error} onRetry={() => setRetry((n) => n + 1)} />

          {/* Lưới sự kiện hoặc Empty State */}
          {!loading && !error && (
            visible.length > 0 ? (
              <EventGrid events={visible} />
            ) : (
              <div className="ev-explore-empty-state" role="status">
                <div className="ev-empty-icon-wrap">
                  <LineIcon name="search" />
                </div>
                <h3>Không tìm thấy sự kiện nào</h3>
                <p>
                  Thử thay đổi từ khóa tìm kiếm hoặc xóa bớt các bộ lọc để xem nhiều sự kiện hơn.
                </p>
                <button
                  type="button"
                  className="ev-empty-reset-btn"
                  onClick={clearAllFilters}
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )
          )}

          {/* Thanh phân trang hiện đại */}
          {!error && totalPages > 1 && (
            <nav className="ev-load-progress" aria-label="Phân trang">
              <button
                className="ev-page-nav-btn"
                disabled={loading || page === 0}
                onClick={() => setPage((n) => n - 1)}
              >
                <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                  <LineIcon name="arrow-right" />
                </span>
                <span>Trang trước</span>
              </button>

              <span className="ev-page-indicator">
                Trang <strong>{page + 1}</strong> / {totalPages}
              </span>

              <button
                className="ev-page-nav-btn"
                disabled={loading || page + 1 >= totalPages}
                onClick={() => setPage((n) => n + 1)}
              >
                <span>Trang sau</span>
                <LineIcon name="arrow-right" />
              </button>
            </nav>
          )}
        </div>
      </section>
    </div>
  );
}
