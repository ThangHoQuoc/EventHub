import { LineIcon } from "../ui/LineIcon";

type EventSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  city?: string;
  date?: string;
  onCityChange?: (value: string) => void;
  onDateChange?: (value: string) => void;
  onSubmit?: () => void;
  compact?: boolean;
};

export function EventSearchBar({
  city = "",
  compact = false,
  date = "",
  onChange,
  onCityChange,
  onDateChange,
  onSubmit,
  value,
}: EventSearchBarProps) {
  return (
    <form className={`ev-search-bar ${compact ? "is-compact" : ""}`} onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }}>
      <label className="ev-search-segment ev-search-keyword">
        <LineIcon name="search" />
        <span><small>Bạn muốn tìm gì?</small><input aria-label="Tên sự kiện hoặc sở thích" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Workshop, concert..." /></span>
      </label>
      <label className="ev-search-segment">
        <LineIcon name="map-pin" />
        <span><small>Thành phố</small><select aria-label="Chọn thành phố" value={city} onChange={(event) => onCityChange?.(event.target.value)}><option value="">Toàn quốc</option><option>TP.HCM</option><option>Hà Nội</option><option>Đà Nẵng</option><option>Cần Thơ</option></select></span>
      </label>
      <label className="ev-search-segment">
        <LineIcon name="calendar" />
        <span><small>Thời gian</small><select aria-label="Chọn thời gian" value={date} onChange={(event) => onDateChange?.(event.target.value)}><option value="">Bất kỳ lúc nào</option><option>Cuối tuần này</option><option>Tuần này</option><option>Tháng này</option></select></span>
      </label>
      <button className="ev-search-submit" type="submit"><LineIcon name="search" /><span>{compact ? "Tìm kiếm" : "Tìm sự kiện"}</span></button>
    </form>
  );
}
