import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";
import { SectionHeader } from "./SectionHeader";

const cities = [
  { name: "Hà Nội", theme: "hanoi" },
  { name: "TP.HCM", theme: "saigon" },
  { name: "Đà Nẵng", theme: "danang" },
  { name: "Đà Lạt", theme: "dalat" },
  { name: "Cần Thơ", theme: "cantho" },
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
            <span><small>Khám phá sự kiện</small><strong>{city.name}</strong></span>
            <LineIcon name="arrow-right" />
          </Link>
        ))}
      </div>
    </section>
  );
}
