import { useEffect, useState } from "react";
import { LandingHero } from "../components/marketing/LandingHero";
import { FeaturedEditorial } from "../components/marketing/FeaturedEditorial";
import { EventMatchShowcase } from "../components/marketing/EventMatchShowcase";
import { CityDiscovery } from "../components/marketing/CityDiscovery";
import { WaitlistShowcase } from "../components/marketing/WaitlistShowcase";
import { TicketBanner } from "../components/marketing/TicketBanner";
import { RequestState } from "../components/ui/RequestState";
import { getPublicEvents, mapDtoToEvent } from "../api/events";
import type { Event } from "../types/event";

export function LandingPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getPublicEvents({ size: 12 })
      .then((res) => {
        if (active) {
          setEvents(res.content.map((dto) => mapDtoToEvent(dto)));
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
  }, [retry]);

  return (
    <div className="ev-editorial-page ev-home-page">
      {/* 1. Hero Section cuốn hút */}
      <LandingHero event={events[0]} />

      {/* Trạng thái tải / lỗi */}
      <RequestState
        loading={loading}
        error={error}
        onRetry={() => setRetry((n) => n + 1)}
      />

      {/* 2. Sự kiện nổi bật đang được quan tâm */}
      {events.length > 0 && <FeaturedEditorial events={events} />}

      {/* 3. Điểm nhấn Trợ lý AI EventMatch (Quiz tương tác tìm gu) */}
      {events.length > 0 && <EventMatchShowcase events={events} />}

      {/* 4. Khám phá thành phố với hình ảnh sắc nét */}
      <CityDiscovery />

      {/* 5. Tính năng Smart Waitlist độc quyền */}
      <WaitlistShowcase />

      {/* 6. Banner kêu gọi hành động cuối trang */}
      <TicketBanner />
    </div>
  );
}
