import { useState } from "react";
import { LineIcon } from "../ui/LineIcon";

const filters: Array<{ group: string; items: Array<{ label: string; count: number }> }> = [
  { group: "Thành phố", items: [{ label: "TP.HCM", count: 48 }, { label: "Hà Nội", count: 32 }, { label: "Đà Nẵng", count: 18 }, { label: "Cần Thơ", count: 12 }] },
  { group: "Ngày tổ chức", items: [{ label: "Hôm nay", count: 8 }, { label: "Cuối tuần này", count: 24 }, { label: "Tuần này", count: 36 }, { label: "Tháng này", count: 82 }] },
  { group: "Loại sự kiện", items: [{ label: "Công nghệ", count: 28 }, { label: "Âm nhạc", count: 24 }, { label: "Workshop", count: 19 }, { label: "Kinh doanh", count: 15 }, { label: "Nghệ thuật", count: 12 }] },
];

type FilterSidebarProps = {
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
};

export function FilterSidebar({ selected, onToggle, onClear }: FilterSidebarProps) {
  const [collapsed, setCollapsed] = useState<string[]>([]);

  function toggleGroup(group: string) {
    setCollapsed((current) => current.includes(group) ? current.filter((item) => item !== group) : [...current, group]);
  }

  return (
    <aside className="ev-filter-sidebar" aria-label="Bộ lọc sự kiện">
      <div className="ev-filter-title"><div><LineIcon name="ticket" /><h2>Bộ lọc</h2></div><button disabled={!selected.length} onClick={onClear} type="button">Xóa tất cả</button></div>
      {filters.map(({ group, items }) => {
        const isCollapsed = collapsed.includes(group);
        return (
          <section className="ev-filter-group" key={group}>
            <button aria-expanded={!isCollapsed} className="ev-filter-group-toggle" onClick={() => toggleGroup(group)} type="button"><span>{group}</span><LineIcon name="chevron-down" /></button>
            {!isCollapsed ? (
              <div className="ev-filter-options">
                {items.map((item) => {
                  const active = selected.includes(item.label);
                  return (
                    <label className={active ? "is-selected" : ""} key={item.label}>
                      <input checked={active} onChange={() => onToggle(item.label)} type="checkbox" />
                      <span aria-hidden="true"><LineIcon name="check" /></span>
                      <em>{item.label}</em>
                    </label>
                  );
                })}
              </div>
            ) : null}
          </section>
        );
      })}
    </aside>
  );
}
