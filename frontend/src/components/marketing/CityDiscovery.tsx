import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";
import { SectionHeader } from "./SectionHeader";

const cities = [
  { name: "Hà Nội", count: 42, theme: "hanoi" },
  { name: "TP.HCM", count: 56, theme: "saigon" },
  { name: "Đà Nẵng", count: 24, theme: "danang" },
  { name: "Đà Lạt", count: 18, theme: "dalat" },
  { name: "Cần Thơ", count: 15, theme: "cantho" },
];

function CityGraphic({ theme }: { theme: string }) {
  return (
    <span className={`ev-city-graphic ev-city-graphic--${theme}`} aria-hidden="true">
      <i className="shape-a" /><i className="shape-b" /><i className="shape-c" /><i className="shape-d" />
    </span>
  );
}

export function CityDiscovery() {
  return (
    <section className="ev-home-section ev-city-section">
      <SectionHeader eyebrow="Đi gần, trải nghiệm sâu" title="Khám phá theo thành phố" />
      <div className="ev-city-bento">
        {cities.map((city) => (
          <Link className={`ev-city-tile ev-city-tile--${city.theme}`} key={city.name} to={`/explore?city=${encodeURIComponent(city.name)}`}>
            <CityGraphic theme={city.theme} />
            <span><small>{city.count} sự kiện</small><strong>{city.name}</strong></span>
            <LineIcon name="arrow-right" />
          </Link>
        ))}
      </div>
    </section>
  );
}
