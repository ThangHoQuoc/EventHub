import { Link } from "react-router-dom";
import { LineIcon } from "../ui/LineIcon";
import { SectionHeader } from "./SectionHeader";

const cities = [
  {
    name: "TP.HCM",
    count: "120+ sự kiện",
    tagline: "Nhịp sống sôi động, âm nhạc & tech",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
    featured: true,
  },
  {
    name: "Hà Nội",
    count: "95+ sự kiện",
    tagline: "Văn hóa, nghệ thuật & workshop",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    featured: true,
  },
  {
    name: "Đà Nẵng",
    count: "60+ sự kiện",
    tagline: "Festival biển, startup & networking",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    name: "Đà Lạt",
    count: "45+ sự kiện",
    tagline: "Acoustic chill, mây ngàn & trail run",
    image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
  {
    name: "Cần Thơ",
    count: "30+ sự kiện",
    tagline: "Lễ hội sông nước miền Tây",
    image: "https://images.unsplash.com/photo-1627993070624-9b2f2d93e11f?auto=format&fit=crop&w=800&q=80",
    featured: false,
  },
];

export function CityDiscovery() {
  return (
    <section className="ev-home-section ev-modern-city-section">
      <SectionHeader
        eyebrow="Khắp mọi miền đất nước"
        title="Khám phá sự kiện theo thành phố"
        description="Chọn điểm đến yêu thích của bạn và hòa mình vào những trải nghiệm đáng nhớ nhất."
        action={{ label: "Xem tất cả thành phố", to: "/explore" }}
      />

      <div className="ev-city-grid-modern">
        {cities.map((city) => (
          <Link
            className={`ev-city-card-modern ${city.featured ? "is-featured" : ""}`}
            key={city.name}
            to={`/explore?city=${encodeURIComponent(city.name)}`}
          >
            <div className="ev-city-img-wrap">
              <img src={city.image} alt={city.name} loading="lazy" />
              <div className="ev-city-overlay" />
            </div>

            <div className="ev-city-meta">
              <span className="ev-city-pill">{city.count}</span>
              <div className="ev-city-headings">
                <h3>{city.name}</h3>
                <p>{city.tagline}</p>
              </div>
              <div className="ev-city-arrow">
                <LineIcon name="arrow-right" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
